import { readFile } from "node:fs/promises";
import {
  buildBands,
  buildTimeMachineComparison,
  filterObjects,
  normalizeObject,
  scoreObjects,
  simulateLaunchImpact,
  summarize
} from "../../src/engines/orbitguard-core.js";
import {
  buildArticleFactCheck,
  findTopic,
  generateEncyclopediaArticle,
  loadEncyclopediaTopics
} from "../../src/engines/encyclopedia-core.js";
import {
  getGroundStationNetwork,
  getGroundStationWeather,
  getSpaceWeather
} from "../../src/engines/weather-core.js";
import { buildCatalogStatusFromSatcat, fetchSatcatCsv } from "../../src/engines/catalog-core.js";

let catalogCache = null;
const CATALOG_DATA_URL = new URL("../../data/orbitguard-data.json", import.meta.url);
const TOPICS_DATA_URL = new URL("../../data/encyclopedia-topics.json", import.meta.url);

async function loadCatalog() {
  if (catalogCache) {
    return catalogCache;
  }

  const payload = JSON.parse(await readFile(CATALOG_DATA_URL, "utf8"));
  const generatedDate = new Date(payload.metadata.generatedAt);
  const currentYear = generatedDate.getUTCFullYear();
  const objects = scoreObjects(payload.objects.map((object) => normalizeObject(object, currentYear)));
  catalogCache = {
    metadata: payload.metadata,
    objects
  };

  return catalogCache;
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return req.body ? JSON.parse(req.body) : {};
  }

  let body = "";

  for await (const chunk of req) {
    body += chunk;

    if (body.length > 100_000) {
      throw new Error("Request body too large");
    }
  }

  return body ? JSON.parse(body) : {};
}

function searchParamsToObject(searchParams) {
  return Object.fromEntries(searchParams.entries());
}

function endpointList() {
  return [
    "GET /api/v1/health",
    "GET /api/v1/summary",
    "GET /api/v1/catalog/live-status",
    "GET /api/v1/objects?band=500-600&type=debris",
    "GET /api/v1/bands?size=100",
    "GET /api/v1/time-machine?year=2005",
    "GET /api/v1/encyclopedia/topics",
    "GET /api/v1/encyclopedia/article?id=kessler-syndrome",
    "POST /api/v1/encyclopedia/fact-check",
    "GET /api/v1/weather/space",
    "GET /api/v1/weather/ground?station=goldstone",
    "GET /api/v1/weather/ground?station=all",
    "GET /api/v1/sustainability?satellites=24&altitude=550&inclination=53",
    "POST /api/v1/simulate"
  ];
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  try {
    const url = new URL(req.url || "/", `https://${req.headers?.host || "orbitguard.vercel.app"}`);

    const catalog = await loadCatalog();

    if (url.pathname === "/api/v1/catalog/live-status") {
      const { csv, sourceLastModified } = await fetchSatcatCsv();
      const liveStatus = buildCatalogStatusFromSatcat(csv, new Date(), sourceLastModified);
      const localCount = catalog.objects.length;
      const liveCount = liveStatus.earthOrbitingObjects;
      const countDelta = liveCount - localCount;

      sendJson(res, 200, {
        ...liveStatus,
        localGeneratedAt: catalog.metadata.generatedAt,
        localEarthOrbitingObjects: localCount,
        liveEarthOrbitingObjects: liveCount,
        countDelta,
        freshness: Math.abs(countDelta) <= 5 ? "near-current" : "needs-refresh",
        message: Math.abs(countDelta) <= 5
          ? "Bundled OrbitGuard catalog is within five records of the live CelesTrak SATCAT filter."
          : "Live CelesTrak SATCAT count differs from the bundled OrbitGuard catalog; run the update workflow to refresh the snapshot."
      });
      return;
    }

    if (url.pathname === "/api/v1/health") {
      sendJson(res, 200, {
        ok: true,
        service: "OrbitGuard API",
        objects: catalog.objects.length,
        generatedAt: catalog.metadata.generatedAt
      });
      return;
    }

    if (url.pathname === "/api/v1/summary") {
      sendJson(res, 200, {
        metadata: catalog.metadata,
        summary: summarize(catalog.objects),
        topBands: buildBands(catalog.objects, 100).slice(0, 12)
      });
      return;
    }

    if (url.pathname === "/api/v1/objects") {
      const filters = searchParamsToObject(url.searchParams);
      const limit = Math.min(500, Math.max(1, Number(filters.limit || 100)));
      const objects = filterObjects(catalog.objects, filters)
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, limit);

      sendJson(res, 200, {
        count: objects.length,
        filters,
        objects
      });
      return;
    }

    if (url.pathname === "/api/v1/bands") {
      const size = Math.min(1000, Math.max(50, Number(url.searchParams.get("size") || 100)));

      sendJson(res, 200, {
        sizeKm: size,
        count: buildBands(catalog.objects, size).length,
        bands: buildBands(catalog.objects, size)
      });
      return;
    }

    if (url.pathname === "/api/v1/time-machine") {
      const generatedYear = new Date(catalog.metadata.generatedAt).getUTCFullYear();
      sendJson(res, 200, {
        metadata: catalog.metadata,
        ...buildTimeMachineComparison(catalog.objects, url.searchParams.get("year"), generatedYear)
      });
      return;
    }

    if (url.pathname === "/api/v1/encyclopedia/topics") {
      sendJson(res, 200, await loadEncyclopediaTopics(TOPICS_DATA_URL));
      return;
    }

    if (url.pathname === "/api/v1/encyclopedia/article" && req.method === "GET") {
      const topicCatalog = await loadEncyclopediaTopics(TOPICS_DATA_URL);
      const topic = findTopic(topicCatalog, url.searchParams.get("id"));

      if (!topic) {
        sendJson(res, 404, { error: "Unknown encyclopedia topic" });
        return;
      }

      sendJson(res, 200, await generateEncyclopediaArticle(topic, catalog.objects));
      return;
    }

    if (url.pathname === "/api/v1/encyclopedia/fact-check") {
      const topicCatalog = await loadEncyclopediaTopics(TOPICS_DATA_URL);
      const body = req.method === "POST" ? await readJsonBody(req) : {};
      const id = body.id || url.searchParams.get("id");
      const topic = findTopic(topicCatalog, id);

      if (!topic) {
        sendJson(res, 404, { error: "Unknown encyclopedia topic" });
        return;
      }

      sendJson(res, 200, await buildArticleFactCheck(topic, body.articleText || "", catalog.objects));
      return;
    }

    if (url.pathname === "/api/v1/weather/space") {
      sendJson(res, 200, await getSpaceWeather());
      return;
    }

    if (url.pathname === "/api/v1/weather/ground") {
      const query = searchParamsToObject(url.searchParams);
      const payload = String(query.station || "").toLowerCase() === "all"
        ? await getGroundStationNetwork()
        : await getGroundStationWeather(query);
      sendJson(res, 200, payload);
      return;
    }

    if (url.pathname === "/api/v1/sustainability" && req.method === "GET") {
      const impact = simulateLaunchImpact(catalog.objects, searchParamsToObject(url.searchParams));
      sendJson(res, 200, {
        impact,
        methodology: "Educational launch-impact score using catalog crowding, altitude persistence, lifetime, debris/rocket-body presence, and deorbit planning."
      });
      return;
    }

    if (url.pathname === "/api/v1/simulate" && req.method === "POST") {
      const body = await readJsonBody(req);
      const impact = simulateLaunchImpact(catalog.objects, body);
      sendJson(res, 200, {
        impact,
        methodology: "Educational launch-impact score using catalog crowding, altitude persistence, lifetime, debris/rocket-body presence, and deorbit planning."
      });
      return;
    }

    if (url.pathname === "/api/v1/conjunction") {
      sendJson(res, 501, {
        error: "Conjunction API requires the planned SGP4/TLE propagation engine.",
        nextStep: "Add satellite.js or another SGP4 implementation, ingest TLE/GP data, propagate both NORAD objects, find closest approach, then estimate Pc with a documented covariance model.",
        honestyNote: "SATCAT apogee/perigee data alone is not enough to compute real conjunction probability."
      });
      return;
    }

    sendJson(res, 404, {
      error: "Unknown OrbitGuard API endpoint",
      endpoints: endpointList()
    });
  } catch (error) {
    sendJson(res, 502, {
      ok: false,
      error: "OrbitGuard API failed",
      detail: error.message
    });
  }
}
