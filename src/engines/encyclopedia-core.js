import { readFile } from "node:fs/promises";
import { buildBands, summarize } from "./orbitguard-core.js";
import { getSpaceWeather } from "./weather-core.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

const CATEGORY_CONTEXT = {
  "Orbital Mechanics":
    "connect the topic to orbital prediction, altitude bands, collision avoidance, and long-term debris stability",
  "Historical Incidents":
    "explain the event sequence, debris consequences, tracking lessons, and why the incident changed how operators think about risk",
  "Satellite Constellations":
    "explain architecture, operational altitude, sustainability tradeoffs, collision avoidance, and public policy concerns",
  "Space Agencies and Policy":
    "connect the organization or rule to debris mitigation, post-mission disposal, launch licensing, and international coordination",
  Technologies:
    "explain the engineering principle, what problem it solves, current maturity, and the sustainability tradeoff",
  "Orbital Regimes":
    "define the orbit class, its common uses, congestion patterns, debris persistence, and disposal concerns",
  "Future Scenarios":
    "frame the scenario as a systems problem involving operators, regulators, economics, and technical mitigation",
  "Physics and Science":
    "explain the underlying physical mechanism and how it affects spacecraft design, tracking, survivability, or lifetime",
  "Economics and Business":
    "connect market incentives, insurance, operator behavior, and debris responsibility to space sustainability",
  "People and Organizations":
    "summarize the person or organization, their role in space situational awareness, and their connection to sustainability"
};

const SOURCE_SUGGESTIONS = [
  "NASA Orbital Debris Program Office",
  "CelesTrak SATCAT",
  "NOAA Space Weather Prediction Center",
  "ESA Space Debris Office",
  "Secure World Foundation"
];

let topicsCache = null;

export function encyclopediaSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function wordsFromTitle(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !["the", "and", "for", "with", "from"].includes(word));
}

function relatedTopics(allTopics, topic) {
  const words = new Set(wordsFromTitle(topic.title));
  const sameCategory = allTopics.filter((candidate) => candidate.category === topic.category && candidate.id !== topic.id);
  const scored = allTopics
    .filter((candidate) => candidate.id !== topic.id)
    .map((candidate) => {
      const candidateWords = wordsFromTitle(candidate.title);
      const score = candidateWords.reduce((sum, word) => sum + (words.has(word) ? 2 : 0), 0) + (candidate.category === topic.category ? 1 : 0);
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  return [...scored.filter((item) => item.score > 0).map((item) => item.candidate.id), ...sameCategory.map((candidate) => candidate.id)]
    .filter((id, index, list) => list.indexOf(id) === index)
    .slice(0, 5);
}

function enrichTopics(payload) {
  const bareTopics = payload.categories.flatMap((category) =>
    category.topics.map((title, index) => ({
      id: encyclopediaSlug(title),
      title,
      category: category.name,
      categoryIndex: payload.categories.findIndex((item) => item.name === category.name),
      order: index,
      tags: wordsFromTitle(`${category.name} ${title}`).slice(0, 6),
      depth: /covariance|probability|nrlmsise|kessler|conjunction|policy|liability|economics|hypervelocity/i.test(title)
        ? "advanced"
        : "detailed",
      promptContext: `${CATEGORY_CONTEXT[category.name] || "explain the technical and sustainability relevance"}. Include specific dates, organizations, physical quantities, and current sustainability implications when they are relevant.`
    }))
  );
  const enriched = bareTopics.map((topic) => ({
    ...topic,
    related: relatedTopics(bareTopics, topic)
  }));

  return {
    metadata: {
      ...payload.metadata,
      generatedAt: new Date().toISOString(),
      topicCount: enriched.length,
      categoryCount: payload.categories.length
    },
    categories: payload.categories.map((category) => ({
      name: category.name,
      count: category.topics.length,
      description: CATEGORY_CONTEXT[category.name] || "space sustainability reference topics"
    })),
    topics: enriched
  };
}

export async function loadEncyclopediaTopics(dataPath) {
  if (topicsCache) {
    return topicsCache;
  }

  const payload = JSON.parse(await readFile(dataPath, "utf8"));
  topicsCache = enrichTopics(payload);
  return topicsCache;
}

export function findTopic(topicCatalog, id) {
  return topicCatalog.topics.find((topic) => topic.id === id || topic.title.toLowerCase() === String(id).toLowerCase());
}

function wordCount(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function articlePrompt(topic, catalogSummary = null) {
  const catalogLine = catalogSummary
    ? `Current OrbitGuard catalog context: ${catalogSummary.total} tracked objects, ${catalogSummary.active} active payloads, ${catalogSummary.debris} debris objects, and ${catalogSummary.rocketBodies} rocket bodies.`
    : "Current catalog context unavailable.";

  return `Write an OrbitGuard Space Encyclopedia article titled "${topic.title}" for the ${topic.category} section.
Topic context: ${topic.promptContext}
Related topics to naturally mention: ${topic.related.join(", ")}.
${catalogLine}
Write 280-340 words in flowing prose, no section headers, no preamble. Be technical, specific, and clear. End with one sentence about why the topic matters for future space sustainability.`;
}

async function generateWithAnthropic(topic, catalogSummary) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 1000,
      system:
        "You are the lead editor of the OrbitGuard Space Sustainability Encyclopedia. Write accurate, careful educational reference articles for aerospace students, engineers, and policy researchers. Do not invent citations or claim operational certainty.",
      messages: [{ role: "user", content: articlePrompt(topic, catalogSummary) }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API returned ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || null;
}

function fallbackArticle(topic, catalogSummary) {
  const total = catalogSummary?.total || 0;
  const active = catalogSummary?.active || 0;
  const debris = catalogSummary?.debris || 0;
  const rocketBodies = catalogSummary?.rocketBodies || 0;
  const crowdedBand = catalogSummary?.crowdedBand || "LEO";
  const categoryContext = CATEGORY_CONTEXT[topic.category] || "connect the subject to space sustainability";

  return `${topic.title} is an important reference topic in the OrbitGuard Space Encyclopedia because it connects technical aerospace decisions to the long-term health of Earth orbit. In the ${topic.category} category, the subject is best understood through how it changes object lifetime, tracking uncertainty, collision exposure, operator responsibility, or the economics of keeping orbital regions usable.

For OrbitGuard users, the practical question is not only what ${topic.title.toLowerCase()} means, but how it changes decisions. ${categoryContext}. Current OrbitGuard catalog data gives the discussion a live baseline: ${total.toLocaleString()} tracked orbital objects, including ${active.toLocaleString()} active payloads, ${debris.toLocaleString()} debris objects, and ${rocketBodies.toLocaleString()} rocket bodies. Those numbers turn the topic from an abstract spaceflight concept into an engineering constraint.

The sustainability importance depends on scale and persistence. Objects in low Earth orbit can be removed naturally by atmospheric drag if they fly low enough, but higher-altitude LEO, MEO, GEO, and highly elliptical regions can preserve nonfunctional hardware for years, decades, or longer. When a mission adds objects to a crowded shell such as ${crowdedBand}, every additional payload, upper stage, or fragment increases the need for tracking, coordination, and reliable disposal planning.

The strongest way to evaluate ${topic.title.toLowerCase()} is to compare it with related ideas such as ${topic.related.slice(0, 3).join(", ")} and then test the claims against live catalog data. OrbitGuard uses that approach by combining generated explanations with fact checks from its satellite catalog and weather systems, so each article becomes a starting point for analysis rather than a static essay.

This topic matters for the future of space sustainability because durable access to orbit depends on turning aerospace knowledge into measurable, transparent decisions before congestion becomes harder to reverse.`;
}

export async function generateEncyclopediaArticle(topic, objects = []) {
  const summary = objects.length ? summarize(objects) : null;
  const bands = objects.length ? buildBands(objects, 100).slice(0, 1) : [];
  const catalogSummary = summary
    ? {
        ...summary,
        crowdedBand: bands[0] ? `${bands[0].band} km` : "LEO"
      }
    : null;
  let content = null;
  let generationMode = "local-template";

  try {
    content = await generateWithAnthropic(topic, catalogSummary);
    if (content) {
      generationMode = "anthropic";
    }
  } catch (error) {
    content = `${fallbackArticle(topic, catalogSummary)}\n\nGeneration note: the live AI article service was unavailable, so OrbitGuard used its local educational article generator.`;
  }

  if (!content) {
    content = fallbackArticle(topic, catalogSummary);
  }

  return {
    id: topic.id,
    topic,
    content,
    wordCount: wordCount(content),
    readingMinutes: Math.max(1, Math.ceil(wordCount(content) / 220)),
    generatedAt: new Date().toISOString(),
    generationMode,
    cacheKey: `orbitguard_article_${topic.id}`,
    sourceSuggestions: SOURCE_SUGGESTIONS,
    transparencyNote:
      "Article text is generated and cached for educational use. Use the fact checker and source suggestions before citing it in formal work."
  };
}

function staticIncidentChecks(title) {
  const normalized = title.toLowerCase();

  if (normalized.includes("iridium 33") || normalized.includes("cosmos 2251")) {
    return [
      { label: "Incident year", value: "2009", status: "reference", source: "NASA/ODPO historical incident literature" },
      { label: "Relative velocity", value: "about 10 km/s", status: "reference", source: "published conjunction summaries" },
      { label: "Trackable debris", value: "2,000+ fragments", status: "reference", source: "public debris summaries" }
    ];
  }

  if (normalized.includes("fengyun")) {
    return [
      { label: "Incident year", value: "2007", status: "reference", source: "NASA/ODPO historical incident literature" },
      { label: "Event type", value: "Chinese ASAT test", status: "reference", source: "public debris summaries" }
    ];
  }

  if (normalized.includes("starlink") && normalized.includes("storm")) {
    return [
      { label: "Launch date", value: "2022-02-03", status: "reference", source: "NOAA/SpaceX public summaries" },
      { label: "Satellites launched", value: "49", status: "reference", source: "public mission summaries" },
      { label: "Satellites reentered", value: "38", status: "reference", source: "public mission summaries" }
    ];
  }

  return [];
}

export async function buildArticleFactCheck(topic, articleText, objects = []) {
  const summary = objects.length ? summarize(objects) : null;
  const bands = objects.length ? buildBands(objects, 100).slice(0, 3) : [];
  const numbers = [...String(articleText || "").matchAll(/\b\d{2,6}(?:,\d{3})*(?:\.\d+)?\b/g)]
    .map((match) => match[0])
    .slice(0, 12);
  const checks = [];

  if (summary) {
    checks.push(
      {
        label: "Tracked objects",
        value: summary.total.toLocaleString(),
        status: "live",
        source: "OrbitGuard CelesTrak SATCAT dataset"
      },
      {
        label: "Active payloads",
        value: summary.active.toLocaleString(),
        status: "live",
        source: "OrbitGuard catalog classification"
      },
      {
        label: "Debris objects",
        value: summary.debris.toLocaleString(),
        status: "live",
        source: "OrbitGuard catalog classification"
      },
      {
        label: "Rocket bodies",
        value: summary.rocketBodies.toLocaleString(),
        status: "live",
        source: "OrbitGuard catalog classification"
      }
    );
  }

  if (bands[0]) {
    checks.push({
      label: "Most crowded altitude band",
      value: `${bands[0].band} km (${bands[0].count.toLocaleString()} objects)`,
      status: "live",
      source: "OrbitGuard altitude-band analysis"
    });
  }

  if (/weather|solar|kp|f10\.7|drag|starlink/i.test(`${topic.title} ${topic.tags.join(" ")}`)) {
    try {
      const weather = await getSpaceWeather();
      checks.push(
        {
          label: "Current Kp index",
          value: Number(weather.kp.value).toFixed(1),
          status: "live",
          source: "NOAA SWPC"
        },
        {
          label: "Current F10.7 flux",
          value: `${Math.round(weather.f107.flux)} sfu`,
          status: "live",
          source: "NOAA SWPC"
        }
      );
    } catch {
      checks.push({
        label: "NOAA space weather",
        value: "temporarily unavailable",
        status: "warning",
        source: "NOAA SWPC"
      });
    }
  }

  checks.push(...staticIncidentChecks(topic.title));

  return {
    topicId: topic.id,
    generatedAt: new Date().toISOString(),
    numbersFoundInArticle: numbers,
    checks,
    methodology:
      "Fact Checker compares generated article claims against OrbitGuard live catalog summaries, NOAA space-weather feeds when relevant, and a small set of static historical incident facts. It is a review aid, not a formal citation engine."
  };
}
