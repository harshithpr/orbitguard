const DATA_URL = "data/orbitguard-data.json";
const THREE_URL = "https://unpkg.com/three@0.165.0/build/three.module.js";
const CREATOR = {
  name: "Harshith Pranav Praveen",
  bio:
    "Aerospace engineering student interested in hands-on engineering, design, manufacturing, mathematics, 3D modeling, Python, and future aerospace work with companies such as Boeing, Lockheed Martin, and other organizations building flight and space systems.",
  school: "James Clemens High School",
  engineeringStartYear: 2024,
  certifications: [
    {
      name: "Python credential",
      year: 2025,
      url: "https://www.credly.com/badges/d74e2ecb-c57e-44fd-87ad-6acd2b58008c/public_url"
    }
  ]
};
const ACTIVE_STATUS_CODES = new Set(["+", "P", "B", "S", "X"]);
const TYPE_COLORS = {
  PAY: "#58c7bd",
  DEB: "#f27667",
  "R/B": "#e9b95f",
  other: "#b78cff",
  launch: "#8fd17f"
};

const state = {
  objects: [],
  filtered: [],
  metadata: null,
  filters: {
    orbit: "all",
    type: "all",
    status: "all",
    owner: "all",
    minRisk: 0
  },
  scenario: {
    deorbitCompliance: 65,
    fragments: 0
  },
  launch: {
    name: "Example rideshare mission",
    satellites: 24,
    altitude: 550,
    inclination: 53,
    lifetime: 5,
    fragments: 0,
    rocketBodyRemains: true,
    deorbitPlan: true
  },
  impact: null,
  three: {
    THREE: null,
    renderer: null,
    scene: null,
    camera: null,
    root: null,
    objectPoints: null,
    launchPoints: null,
    animationId: null,
    ready: false,
    fallback: false
  }
};

const elements = {
  dataSource: document.querySelector("#dataSource"),
  modeTabs: document.querySelectorAll(".mode-tab"),
  modePanels: document.querySelectorAll(".mode-panel"),
  orbitFilter: document.querySelector("#orbitFilter"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  ownerFilter: document.querySelector("#ownerFilter"),
  riskFilter: document.querySelector("#riskFilter"),
  riskFilterValue: document.querySelector("#riskFilterValue"),
  resetFilters: document.querySelector("#resetFilters"),
  exportCsv: document.querySelector("#exportCsv"),
  downloadOrbitJson: document.querySelector("#downloadOrbitJson"),
  metricObjects: document.querySelector("#metricObjects"),
  metricActive: document.querySelector("#metricActive"),
  metricDebris: document.querySelector("#metricDebris"),
  metricRocketBodies: document.querySelector("#metricRocketBodies"),
  metricRisk: document.querySelector("#metricRisk"),
  orbitScene: document.querySelector("#orbitScene"),
  orbitCanvas: document.querySelector("#orbitCanvas"),
  deorbitSlider: document.querySelector("#deorbitSlider"),
  deorbitValue: document.querySelector("#deorbitValue"),
  fragmentInput: document.querySelector("#fragmentInput"),
  scenarioIndex: document.querySelector("#scenarioIndex"),
  scenarioDelta: document.querySelector("#scenarioDelta"),
  orbitBars: document.querySelector("#orbitBars"),
  typeBars: document.querySelector("#typeBars"),
  altitudeHistogram: document.querySelector("#altitudeHistogram"),
  timelineChart: document.querySelector("#timelineChart"),
  timelinePeak: document.querySelector("#timelinePeak"),
  hotspotRows: document.querySelector("#hotspotRows"),
  objectRows: document.querySelector("#objectRows"),
  launchName: document.querySelector("#launchName"),
  launchSatellites: document.querySelector("#launchSatellites"),
  launchAltitude: document.querySelector("#launchAltitude"),
  launchInclination: document.querySelector("#launchInclination"),
  launchLifetime: document.querySelector("#launchLifetime"),
  launchFragments: document.querySelector("#launchFragments"),
  rocketBodyRemains: document.querySelector("#rocketBodyRemains"),
  deorbitPlan: document.querySelector("#deorbitPlan"),
  launchRiskChip: document.querySelector("#launchRiskChip"),
  launchSummary: document.querySelector("#launchSummary"),
  launchObjectsAdded: document.querySelector("#launchObjectsAdded"),
  launchBand: document.querySelector("#launchBand"),
  launchBandIncrease: document.querySelector("#launchBandIncrease"),
  launchRating: document.querySelector("#launchRating"),
  scoreCompare: document.querySelector("#scoreCompare"),
  downloadSimulationJson: document.querySelector("#downloadSimulationJson"),
  downloadSimulationCsv: document.querySelector("#downloadSimulationCsv"),
  reportGrade: document.querySelector("#reportGrade"),
  reportBody: document.querySelector("#reportBody"),
  downloadReport: document.querySelector("#downloadReport"),
  recommendations: document.querySelector("#recommendations")
};

function numberFormat(value) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function decimal(value, digits = 1) {
  return Number(value).toFixed(digits);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function downloadJSON(filename, data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(filename, rows) {
  if (!rows.length) {
    downloadJSON(filename.replace(/\.csv$/i, ".json"), []);
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function percent(value) {
  return `${Math.round(value)}%`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function median(values) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function classifyOrbit(object) {
  const altitude = object.altitude;
  const eccentricSpan = object.apogee - object.perigee;

  if (object.perigee < 2000 && object.apogee > 8000) {
    return "HEO";
  }

  if (altitude <= 2000) {
    return "LEO";
  }

  if (altitude >= 33000 && altitude <= 41000 && object.inclination <= 30) {
    return "GEO";
  }

  if (altitude < 33000 && eccentricSpan < 10000) {
    return "MEO";
  }

  return "HEO";
}

function typeLabel(type) {
  if (type === "PAY") {
    return "Payload";
  }

  if (type === "DEB") {
    return "Debris";
  }

  if (type === "R/B") {
    return "Rocket body";
  }

  return "Other";
}

function isDebrisLike(object) {
  return object.type === "DEB" || object.type === "R/B" || object.type === "UNK";
}

function normalizeObject(raw, currentYear) {
  const apogee = Number(raw.apogee);
  const perigee = Number(raw.perigee);
  const launchYear = raw.launchDate ? Number(raw.launchDate.slice(0, 4)) : null;
  const altitude = (apogee + perigee) / 2;
  const type = raw.type || "other";
  const status = raw.status || "";
  const object = {
    ...raw,
    type,
    status,
    apogee,
    perigee,
    period: Number(raw.period || 0),
    inclination: Number(raw.inclination || 0),
    rcs: Number(raw.rcs || 0),
    altitude,
    launchYear,
    age: launchYear ? Math.max(0, currentYear - launchYear) : 0
  };

  object.orbitClass = classifyOrbit(object);
  object.activePayload = object.type === "PAY" && ACTIVE_STATUS_CODES.has(object.status);
  object.nonfunctional = !object.activePayload;

  return object;
}

function objectHazard(object) {
  if (object.type === "DEB") {
    return 1;
  }

  if (object.type === "R/B") {
    return 0.88;
  }

  if (object.type !== "PAY") {
    return 0.72;
  }

  return object.activePayload ? 0.24 : 0.58;
}

function persistenceScore(object) {
  const altitude = object.altitude;

  if (object.orbitClass === "GEO") {
    return object.activePayload ? 0.62 : 0.82;
  }

  if (object.orbitClass === "HEO") {
    return 0.68;
  }

  if (altitude < 300) {
    return 0.18;
  }

  if (altitude < 600) {
    return 0.38;
  }

  if (altitude < 1200) {
    return 0.96;
  }

  if (altitude <= 2000) {
    return 0.82;
  }

  return 0.6;
}

function altitudeBand(object, size = 200) {
  if (!Number.isFinite(object.altitude)) {
    return "Unknown";
  }

  const start = Math.floor(object.altitude / size) * size;
  return `${start}-${start + size}`;
}

function bandSizeForAltitude(altitude) {
  if (altitude <= 2000) {
    return 100;
  }

  if (altitude >= 33000 && altitude <= 41000) {
    return 500;
  }

  return 1000;
}

function scoreObjects(objects) {
  const binCounts = new Map();

  for (const object of objects) {
    const key = altitudeBand(object, 100);
    binCounts.set(key, (binCounts.get(key) || 0) + 1);
  }

  const maxBinCount = Math.max(1, ...binCounts.values());

  return objects.map((object) => {
    const congestion = (binCounts.get(altitudeBand(object, 100)) || 0) / maxBinCount;
    const age = clamp(object.age / 30, 0, 1);
    const score = clamp(
      100 * (0.34 * objectHazard(object) + 0.34 * persistenceScore(object) + 0.22 * congestion + 0.1 * age),
      0,
      100
    );

    return { ...object, riskScore: score };
  });
}

function applyFilters() {
  state.filtered = state.objects.filter((object) => {
    if (state.filters.orbit !== "all" && object.orbitClass !== state.filters.orbit) {
      return false;
    }

    if (state.filters.type === "other" && ["PAY", "DEB", "R/B"].includes(object.type)) {
      return false;
    }

    if (state.filters.type !== "all" && state.filters.type !== "other" && object.type !== state.filters.type) {
      return false;
    }

    if (state.filters.status === "active" && !object.activePayload) {
      return false;
    }

    if (state.filters.status === "nonfunctional" && !object.nonfunctional) {
      return false;
    }

    if (state.filters.owner !== "all" && object.owner !== state.filters.owner) {
      return false;
    }

    return object.riskScore >= state.filters.minRisk;
  });
}

function riskColor(score) {
  if (score >= 68) {
    return "#f27667";
  }

  if (score >= 35) {
    return "#e9b95f";
  }

  return "#8fd17f";
}

function riskLevel(score) {
  if (score >= 68) {
    return "High";
  }

  if (score >= 35) {
    return "Medium";
  }

  return "Low";
}

function sustainabilityGrade(score) {
  if (score < 30) {
    return "A";
  }

  if (score < 45) {
    return "B";
  }

  if (score < 60) {
    return "C";
  }

  if (score < 75) {
    return "D";
  }

  return "F";
}

function summarize(objects) {
  const total = objects.length;
  const active = objects.filter((object) => object.activePayload).length;
  const debris = objects.filter((object) => object.type === "DEB").length;
  const rocketBodies = objects.filter((object) => object.type === "R/B").length;
  const medianAltitude = median(objects.map((object) => object.altitude).filter(Number.isFinite));
  const averageRisk = total
    ? objects.reduce((sum, object) => sum + object.riskScore, 0) / total
    : 0;

  return {
    total,
    active,
    debris,
    rocketBodies,
    nonfunctional: total - active,
    nonfunctionalShare: total ? ((total - active) / total) * 100 : 0,
    medianAltitude,
    averageRisk
  };
}

function scenarioProjection(objects, baseRisk) {
  if (objects.length === 0) {
    return { projected: 0, delta: 0 };
  }

  const removableRisk = objects
    .filter((object) => object.nonfunctional && object.orbitClass === "LEO" && object.altitude < 1200)
    .reduce((sum, object) => sum + object.riskScore, 0);
  const removableAverage = removableRisk / objects.length;
  const disposalReduction = removableAverage * (state.scenario.deorbitCompliance / 100) * 0.72;
  const fragmentPenalty = Math.min(30, (state.scenario.fragments / Math.max(750, objects.length)) * 100 * 0.58);
  const projected = clamp(baseRisk - disposalReduction + fragmentPenalty, 0, 100);

  return {
    projected,
    delta: projected - baseRisk
  };
}

function groupCounts(objects, keyFn) {
  const counts = new Map();

  for (const object of objects) {
    const key = keyFn(object);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function ownerLeader(objects) {
  const [leader] = groupCounts(objects, (object) => object.owner || "Unknown");
  return leader ? leader[0] : "Unknown";
}

function maxBandCount(size) {
  const counts = new Map();

  for (const object of state.objects) {
    const key = altitudeBand(object, size);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Math.max(1, ...counts.values());
}

function simulateLaunchImpact() {
  const launch = state.launch;
  const size = bandSizeForAltitude(launch.altitude);
  const band = altitudeBand({ altitude: launch.altitude }, size);
  const [bandStart, bandEnd] = band.split("-").map(Number);
  const bandObjects = state.objects.filter((object) => object.altitude >= bandStart && object.altitude < bandEnd);
  const payloads = launch.satellites;
  const rocketBodies = launch.rocketBodyRemains ? 1 : 0;
  const debris = launch.fragments;
  const addedObjects = payloads + rocketBodies + debris;
  const total = state.objects.length;
  const oldBandCount = bandObjects.length;
  const newBandCount = oldBandCount + addedObjects;
  const oldShare = total ? (oldBandCount / total) * 100 : 0;
  const newShare = total + addedObjects ? (newBandCount / (total + addedObjects)) * 100 : 0;
  const bandIncrease = oldBandCount ? ((newBandCount - oldBandCount) / oldBandCount) * 100 : 100;
  const orbitClass = classifyOrbit({
    altitude: launch.altitude,
    apogee: launch.altitude,
    perigee: launch.altitude,
    inclination: launch.inclination
  });
  const crowdingScale = maxBandCount(size);
  const oldCongestion = clamp((oldBandCount / crowdingScale) * 100, 0, 100);
  const newCongestion = clamp((newBandCount / Math.max(crowdingScale, newBandCount)) * 100, 0, 100);
  const simulatedObject = {
    type: launch.rocketBodyRemains ? "R/B" : "PAY",
    activePayload: true,
    orbitClass,
    altitude: launch.altitude
  };
  const persistence = persistenceScore(simulatedObject) * 100;
  const lifetimePenalty = clamp((launch.lifetime / 25) * 100, 8, 100);
  const debrisMix = addedObjects ? ((debris + rocketBodies) / addedObjects) * 100 : 0;
  const bandSharePressure = clamp(newShare * 3.5, 0, 100);
  const deorbitCredit = launch.deorbitPlan ? 4 : 0;
  const riskIndex = clamp(
    0.38 * newCongestion +
      0.22 * persistence +
      0.18 * lifetimePenalty +
      0.14 * debrisMix +
      0.12 * bandSharePressure -
      deorbitCredit,
    0,
    100
  );

  return {
    ...launch,
    band,
    bandStart,
    bandEnd,
    orbitClass,
    payloads,
    rocketBodies,
    debris,
    addedObjects,
    oldBandCount,
    newBandCount,
    oldShare,
    newShare,
    bandIncrease,
    oldCongestion,
    newCongestion,
    riskIndex,
    riskLevel: riskLevel(riskIndex),
    grade: sustainabilityGrade(riskIndex)
  };
}

function readLaunchInputs() {
  state.launch = {
    name: elements.launchName.value.trim() || "Untitled mission",
    satellites: clamp(Number(elements.launchSatellites.value || 1), 1, 500),
    altitude: clamp(Number(elements.launchAltitude.value || 550), 160, 42000),
    inclination: clamp(Number(elements.launchInclination.value || 0), 0, 180),
    lifetime: clamp(Number(elements.launchLifetime.value || 1), 1, 50),
    fragments: clamp(Number(elements.launchFragments.value || 0), 0, 1000),
    rocketBodyRemains: elements.rocketBodyRemains.checked,
    deorbitPlan: elements.deorbitPlan.checked
  };
}

function renderMetrics() {
  const summary = summarize(state.filtered);
  const scenario = scenarioProjection(state.filtered, summary.averageRisk);

  elements.metricObjects.textContent = numberFormat(summary.total);
  elements.metricActive.textContent = numberFormat(summary.active);
  elements.metricDebris.textContent = numberFormat(summary.debris);
  elements.metricRocketBodies.textContent = numberFormat(summary.rocketBodies);
  elements.metricRisk.textContent = Math.round(summary.averageRisk);
  elements.scenarioIndex.textContent = Math.round(scenario.projected);
  elements.scenarioDelta.textContent = `${scenario.delta >= 0 ? "+" : ""}${scenario.delta.toFixed(1)} vs current filter`;
  elements.scenarioDelta.style.color = scenario.delta > 0 ? "#f27667" : "#8fd17f";
}

function renderLaunchImpact() {
  const impact = simulateLaunchImpact();
  state.impact = impact;

  elements.launchRiskChip.textContent = impact.riskLevel;
  elements.launchRiskChip.style.setProperty("--chip-color", riskColor(impact.riskIndex));
  elements.launchObjectsAdded.textContent = numberFormat(impact.addedObjects);
  elements.launchBand.textContent = `${impact.band} km`;
  elements.launchBandIncrease.textContent = `${impact.bandIncrease >= 0 ? "+" : ""}${decimal(impact.bandIncrease)}%`;
  elements.launchRating.textContent = impact.grade;
  elements.launchSummary.textContent = `${impact.name} adds ${numberFormat(impact.addedObjects)} objects into ${impact.orbitClass}. The ${impact.band} km band changes from ${numberFormat(impact.oldBandCount)} to ${numberFormat(impact.newBandCount)} objects, raising local band share from ${decimal(impact.oldShare)}% to ${decimal(impact.newShare)}% and moving the launch impact rating to ${impact.riskLevel}.`;

  renderScoreCompare(impact);
  renderReport();
  renderOrbitScene();
}

function renderScoreCompare(impact) {
  const rows = [
    ["Old share", impact.oldShare, "#58c7bd"],
    ["New share", impact.newShare, "#8fd17f"],
    ["Old crowding", impact.oldCongestion, "#e9b95f"],
    ["New crowding", impact.newCongestion, riskColor(impact.riskIndex)],
    ["Launch risk", impact.riskIndex, riskColor(impact.riskIndex)]
  ];

  elements.scoreCompare.innerHTML = rows
    .map(
      ([label, value, color]) => `
        <div class="compare-row">
          <span>${label}</span>
          <div class="compare-track"><div class="compare-fill" style="--value: ${clamp(value, 0, 100)}%; --bar-color: ${color}"></div></div>
          <strong>${decimal(value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderReport() {
  if (!state.impact) {
    return;
  }

  const impact = state.impact;
  const summary = summarize(state.objects);
  const reportColor = riskColor(impact.riskIndex);
  elements.reportGrade.textContent = `Grade ${impact.grade}`;
  elements.reportGrade.style.setProperty("--chip-color", reportColor);
  elements.reportBody.innerHTML = `
    <section class="report-section">
      <h3>Project framing</h3>
      <p>OrbitGuard was built by ${CREATOR.name} as a space sustainability analyzer that uses public orbital catalog data to evaluate how satellite launches affect congestion, debris exposure, and long-term safety in Earth orbit.</p>
    </section>
    <section class="report-section">
      <h3>Current orbital environment</h3>
      <p>The current catalog includes ${numberFormat(summary.total)} Earth-orbiting objects, including ${numberFormat(summary.active)} active satellites, ${numberFormat(summary.debris)} debris objects, and ${numberFormat(summary.rocketBodies)} rocket bodies. The average catalog risk index is ${Math.round(summary.averageRisk)}.</p>
    </section>
    <section class="report-section">
      <h3>Launch impact</h3>
      <p>${impact.name} adds ${numberFormat(impact.payloads)} payloads${impact.rocketBodies ? ", 1 rocket body" : ""}${impact.debris ? `, and ${numberFormat(impact.debris)} fragments` : ""} near ${numberFormat(impact.altitude)} km at ${decimal(impact.inclination)} degrees inclination. The ${impact.band} km band increases by ${decimal(impact.bandIncrease)}%, with a ${impact.riskLevel.toLowerCase()} launch risk score of ${Math.round(impact.riskIndex)}.</p>
    </section>
    <section class="report-section">
      <h3>Sustainability conclusion</h3>
      <p>This mission is more sustainable if it avoids the most crowded altitude bands, includes reliable deorbit capability, limits mission lifetime, and prevents leftover rocket hardware from staying in orbit.</p>
    </section>
  `;

  const recommendations = buildRecommendations(impact);
  elements.recommendations.innerHTML = recommendations
    .map(
      (item, index) => `
        <div class="recommendation">
          <span>${index + 1}</span>
          <div><strong>${item.title}</strong><br>${item.body}</div>
        </div>
      `
    )
    .join("");
}

function buildRecommendations(impact) {
  const items = [];

  if (impact.newCongestion >= 72) {
    items.push({
      title: "Reconsider target altitude",
      body: `The ${impact.band} km band is already crowded. A nearby lower-density orbit would reduce the local congestion increase.`
    });
  }

  if (impact.rocketBodies > 0) {
    items.push({
      title: "Dispose of the upper stage",
      body: "Leaving a rocket body in orbit adds a large, nonfunctional object that can persist for years or decades."
    });
  }

  if (!impact.deorbitPlan) {
    items.push({
      title: "Add a deorbit plan",
      body: "A planned disposal strategy lowers long-term debris exposure after the mission stops operating."
    });
  }

  if (impact.lifetime > 5) {
    items.push({
      title: "Shorten orbital lifetime",
      body: "A shorter post-mission lifetime reduces how long the spacecraft contributes to orbital crowding."
    });
  }

  if (impact.debris > 0) {
    items.push({
      title: "Reduce deployment fragments",
      body: "Small fragments are difficult to track and can still damage spacecraft at orbital velocities."
    });
  }

  if (items.length < 3) {
    items.push({
      title: "Keep passivation in the mission plan",
      body: "Removing stored energy from tanks and batteries reduces the chance of breakup events."
    });
    items.push({
      title: "Publish orbital data promptly",
      body: "Accurate tracking data helps operators avoid close approaches and improves shared space safety."
    });
  }

  return items.slice(0, 5);
}

function buildReportPayload() {
  const impact = state.impact || simulateLaunchImpact();
  const summary = summarize(state.objects);
  const recommendations = buildRecommendations(impact);

  return {
    project: "OrbitGuard",
    mission: "Space Sustainability Analyzer",
    creator: CREATOR,
    generatedAt: new Date().toISOString(),
    dataSource: state.metadata?.source || DATA_URL,
    catalog: {
      generatedAt: state.metadata?.generatedAt,
      trackedObjects: summary.total,
      activeSatellites: summary.active,
      debrisObjects: summary.debris,
      rocketBodies: summary.rocketBodies,
      riskIndex: Math.round(summary.averageRisk)
    },
    launchImpact: impact,
    recommendations,
    methodology:
      "Educational screening model using catalog crowding, orbit band, object type, orbital persistence, mission lifetime, fragments, rocket-body disposal, and deorbit planning.",
    limitation:
      "This is not operational conjunction assessment. Real collision probability requires TLE/GP data, SGP4 propagation, covariance assumptions, and validated Pc methodology."
  };
}

function currentOrbitRows() {
  return state.filtered.map((object) => ({
    name: object.name,
    norad: object.norad,
    type: typeLabel(object.type),
    orbit: object.orbitClass,
    owner: object.owner || "Unknown",
    launchYear: object.launchYear || "",
    altitudeKm: Math.round(object.altitude),
    apogeeKm: Math.round(object.apogee),
    perigeeKm: Math.round(object.perigee),
    inclinationDeg: decimal(object.inclination),
    riskScore: Math.round(object.riskScore)
  }));
}

function simulationRows() {
  const impact = state.impact || simulateLaunchImpact();

  return [
    {
      mission: impact.name,
      satellites: impact.satellites,
      altitudeKm: impact.altitude,
      inclinationDeg: impact.inclination,
      expectedLifetimeYears: impact.lifetime,
      fragments: impact.fragments,
      rocketBodyRemains: impact.rocketBodyRemains,
      deorbitPlan: impact.deorbitPlan,
      orbitClass: impact.orbitClass,
      altitudeBandKm: impact.band,
      objectsAdded: impact.addedObjects,
      oldBandCount: impact.oldBandCount,
      newBandCount: impact.newBandCount,
      bandIncreasePercent: decimal(impact.bandIncrease, 2),
      oldCrowdingScore: decimal(impact.oldCongestion, 2),
      newCrowdingScore: decimal(impact.newCongestion, 2),
      launchRiskIndex: decimal(impact.riskIndex, 2),
      riskLevel: impact.riskLevel,
      sustainabilityGrade: impact.grade
    }
  ];
}

function buildHotspots(objects) {
  const groups = new Map();

  for (const object of objects) {
    const key = altitudeBand(object, object.orbitClass === "GEO" ? 500 : 200);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(object);
  }

  const hotspots = [...groups.entries()].map(([band, group]) => {
    const count = group.length;
    const debrisCount = group.filter(isDebrisLike).length;
    const inactivePayloads = group.filter((object) => object.type === "PAY" && !object.activePayload).length;
    const averageRisk = group.reduce((sum, object) => sum + object.riskScore, 0) / count;
    const score = clamp(
      averageRisk * 0.62 +
        Math.log10(count + 1) * 8.5 +
        (debrisCount / count) * 16 +
        (inactivePayloads / count) * 8,
      0,
      100
    );

    return {
      band,
      count,
      debrisCount,
      inactivePayloads,
      score,
      owner: ownerLeader(group)
    };
  });

  if (state.scenario.fragments > 0) {
    const leoHotspot = hotspots
      .filter((hotspot) => Number(hotspot.band.split("-")[0]) >= 600 && Number(hotspot.band.split("-")[0]) <= 1200)
      .sort((a, b) => b.score - a.score)[0];

    if (leoHotspot) {
      leoHotspot.count += state.scenario.fragments;
      leoHotspot.debrisCount += state.scenario.fragments;
      leoHotspot.score = clamp(leoHotspot.score + Math.log10(state.scenario.fragments + 1) * 6, 0, 100);
    }
  }

  return hotspots.sort((a, b) => b.score - a.score).slice(0, 9);
}

function renderBars(container, entries, total, colorMap = {}) {
  container.innerHTML = "";

  if (entries.length === 0) {
    container.innerHTML = "<p class=\"empty-state\">No matching records</p>";
    return;
  }

  for (const [label, count] of entries) {
    const row = document.createElement("div");
    row.className = "bar-row";
    const value = total ? (count / total) * 100 : 0;
    row.innerHTML = `
      <span>${label}</span>
      <div class="bar-track"><div class="bar-fill" style="--value: ${value}%; --bar-color: ${colorMap[label] || "#58c7bd"}"></div></div>
      <strong>${numberFormat(count)}</strong>
    `;
    container.append(row);
  }
}

function renderCharts() {
  const orbitOrder = ["LEO", "MEO", "GEO", "HEO"];
  const orbitEntries = orbitOrder.map((orbit) => [
    orbit,
    state.filtered.filter((object) => object.orbitClass === orbit).length
  ]);
  const typeEntries = groupCounts(state.filtered, (object) => typeLabel(object.type)).slice(0, 5);
  const typeColorMap = {
    Payload: TYPE_COLORS.PAY,
    Debris: TYPE_COLORS.DEB,
    "Rocket body": TYPE_COLORS["R/B"],
    Other: TYPE_COLORS.other
  };

  renderBars(elements.orbitBars, orbitEntries, state.filtered.length, {
    LEO: "#58c7bd",
    MEO: "#8fd17f",
    GEO: "#e9b95f",
    HEO: "#b78cff"
  });
  renderBars(elements.typeBars, typeEntries, state.filtered.length, typeColorMap);
  renderHistogram();
  renderTimeline();
}

function renderHistogram() {
  const bins = Array.from({ length: 10 }, (_, index) => ({
    label: `${index * 200}`,
    count: 0
  }));

  for (const object of state.filtered) {
    if (object.orbitClass !== "LEO") {
      continue;
    }

    const index = clamp(Math.floor(object.altitude / 200), 0, 9);
    bins[index].count += 1;
  }

  const max = Math.max(1, ...bins.map((bin) => bin.count));
  elements.altitudeHistogram.innerHTML = "";

  for (const bin of bins) {
    const item = document.createElement("div");
    item.className = "histogram-bar";
    item.title = `${bin.label}-${Number(bin.label) + 200} km: ${numberFormat(bin.count)} objects`;
    item.innerHTML = `
      <i style="--height: ${Math.max(4, (bin.count / max) * 190)}px"></i>
      <span>${bin.label}</span>
    `;
    elements.altitudeHistogram.append(item);
  }
}

function renderTimeline() {
  const years = state.objects
    .map((object) => object.launchYear)
    .filter((year) => Number.isFinite(year) && year >= 1957)
    .sort((a, b) => a - b);

  if (years.length === 0) {
    elements.timelineChart.innerHTML = "<p class=\"empty-state\">No launch-year data</p>";
    return;
  }

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const counts = new Map();

  for (const year of years) {
    counts.set(year, (counts.get(year) || 0) + 1);
  }

  const cumulative = [];
  let running = 0;

  for (let year = minYear; year <= maxYear; year += 1) {
    running += counts.get(year) || 0;
    cumulative.push({ year, total: running, added: counts.get(year) || 0 });
  }

  const width = 920;
  const height = 280;
  const padding = { left: 46, right: 18, top: 18, bottom: 34 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxTotal = Math.max(...cumulative.map((point) => point.total));
  const x = (year) => padding.left + ((year - minYear) / Math.max(1, maxYear - minYear)) * innerWidth;
  const y = (total) => padding.top + innerHeight - (total / maxTotal) * innerHeight;
  const line = cumulative.map((point) => `${x(point.year)},${y(point.total)}`).join(" ");
  const area = `${padding.left},${padding.top + innerHeight} ${line} ${padding.left + innerWidth},${padding.top + innerHeight}`;
  const labelYears = [1960, 1980, 2000, 2020, maxYear].filter((year, index, list) => year >= minYear && list.indexOf(year) === index);

  elements.timelinePeak.textContent = `${numberFormat(maxTotal)} current objects by ${maxYear}`;
  elements.timelineChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Timeline of objects still in orbit by launch year">
      <polygon points="${area}" fill="rgba(88, 199, 189, 0.18)"></polygon>
      <polyline points="${line}" fill="none" stroke="#58c7bd" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      <line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${padding.left + innerWidth}" y2="${padding.top + innerHeight}" stroke="#343d47"></line>
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + innerHeight}" stroke="#343d47"></line>
      ${labelYears
        .map(
          (year) => `
            <text class="timeline-axis" x="${x(year)}" y="${height - 10}" text-anchor="middle">${year}</text>
            <line x1="${x(year)}" y1="${padding.top}" x2="${x(year)}" y2="${padding.top + innerHeight}" stroke="rgba(52, 61, 71, 0.45)"></line>
          `
        )
        .join("")}
      <text class="timeline-axis" x="8" y="${y(maxTotal) + 4}">${numberFormat(maxTotal)}</text>
      <text class="timeline-axis" x="8" y="${padding.top + innerHeight}">0</text>
    </svg>
  `;
}

function renderTables() {
  const hotspots = buildHotspots(state.filtered);
  elements.hotspotRows.innerHTML = hotspots
    .map(
      (hotspot) => `
        <tr>
          <td>${hotspot.band} km</td>
          <td>${numberFormat(hotspot.count)}</td>
          <td>${numberFormat(hotspot.debrisCount)}</td>
          <td>${numberFormat(hotspot.inactivePayloads)}</td>
          <td><span class="risk-chip" style="--chip-color: ${riskColor(hotspot.score)}">${Math.round(hotspot.score)}</span></td>
          <td>${hotspot.owner}</td>
        </tr>
      `
    )
    .join("");

  const topObjects = [...state.filtered].sort((a, b) => b.riskScore - a.riskScore).slice(0, 12);
  elements.objectRows.innerHTML = topObjects
    .map(
      (object) => `
        <tr>
          <td>${object.name}</td>
          <td>${typeLabel(object.type)}</td>
          <td>${object.orbitClass}</td>
          <td>${numberFormat(object.altitude)} km</td>
          <td>${object.owner || "Unknown"}</td>
          <td><span class="risk-chip" style="--chip-color: ${riskColor(object.riskScore)}">${Math.round(object.riskScore)}</span></td>
        </tr>
      `
    )
    .join("");

  if (hotspots.length === 0) {
    elements.hotspotRows.innerHTML = "<tr><td colspan=\"6\" class=\"empty-state\">No matching records</td></tr>";
  }

  if (topObjects.length === 0) {
    elements.objectRows.innerHTML = "<tr><td colspan=\"6\" class=\"empty-state\">No matching records</td></tr>";
  }
}

function seededUnit(value) {
  const x = Math.sin(value * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function altitudeToSceneRadius(altitude) {
  const safeAltitude = clamp(altitude, 120, 46000);
  return 1.1 + (Math.log10(safeAltitude + 500) / Math.log10(46500)) * 3.15;
}

function orbitalPosition(object, radius) {
  const theta = seededUnit((object.norad || object.altitude) + 17) * Math.PI * 2;
  const raan = seededUnit((object.norad || object.altitude) + 91) * Math.PI * 2;
  const inclination = ((object.inclination || 0) * Math.PI) / 180;
  const x0 = radius * Math.cos(theta);
  const y0 = 0;
  const z0 = radius * Math.sin(theta);
  const y1 = y0 * Math.cos(inclination) - z0 * Math.sin(inclination);
  const z1 = y0 * Math.sin(inclination) + z0 * Math.cos(inclination);
  const x2 = x0 * Math.cos(raan) + z1 * Math.sin(raan);
  const z2 = -x0 * Math.sin(raan) + z1 * Math.cos(raan);

  return [x2, y1, z2];
}

async function initOrbitScene() {
  if (state.three.ready || state.three.fallback) {
    return;
  }

  try {
    const THREE = await import(THREE_URL);
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const root = new THREE.Group();
    const container = elements.orbitScene;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.append(renderer.domElement);
    elements.orbitCanvas.style.display = "none";
    camera.position.set(0, 1.15, 7.3);
    camera.lookAt(0, 0, 0);
    scene.add(root);
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    const light = new THREE.DirectionalLight(0xffffff, 1.35);
    light.position.set(3, 4, 5);
    scene.add(light);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 48, 48),
      new THREE.MeshStandardMaterial({
        color: 0x58c7bd,
        emissive: 0x132b2d,
        roughness: 0.82,
        metalness: 0.05
      })
    );
    root.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.77, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x8fd17f, transparent: true, opacity: 0.13 })
    );
    root.add(atmosphere);

    addThreeRing(THREE, root, altitudeToSceneRadius(2000), 0x58c7bd);
    addThreeRing(THREE, root, altitudeToSceneRadius(20200), 0x8fd17f);
    addThreeRing(THREE, root, altitudeToSceneRadius(35786), 0xe9b95f);

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i += 1) {
      starPositions[i * 3] = (seededUnit(i + 1) - 0.5) * 14;
      starPositions[i * 3 + 1] = (seededUnit(i + 2) - 0.5) * 9;
      starPositions[i * 3 + 2] = (seededUnit(i + 3) - 0.5) * 12;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xf1f4ee, size: 0.015, transparent: true, opacity: 0.45 })));

    state.three = {
      ...state.three,
      THREE,
      renderer,
      scene,
      camera,
      root,
      ready: true
    };
    resizeOrbitScene();
    renderOrbitScene();
    animateOrbitScene();
  } catch (error) {
    state.three.fallback = true;
    renderFallbackOrbitCanvas();
  }
}

function addThreeRing(THREE, root, radius, color) {
  const points = [];
  const segments = 192;

  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.44 });
  root.add(new THREE.LineLoop(geometry, material));
}

function animateOrbitScene() {
  if (!state.three.ready) {
    return;
  }

  state.three.root.rotation.y += 0.0022;
  state.three.root.rotation.x = -0.22;
  state.three.renderer.render(state.three.scene, state.three.camera);
  state.three.animationId = window.requestAnimationFrame(animateOrbitScene);
}

function resizeOrbitScene() {
  const rect = elements.orbitScene.getBoundingClientRect();

  if (state.three.ready) {
    state.three.camera.aspect = rect.width / Math.max(1, rect.height);
    state.three.camera.lookAt(0, 0, 0);
    state.three.camera.updateProjectionMatrix();
    state.three.renderer.setSize(rect.width, rect.height);
  } else {
    renderFallbackOrbitCanvas();
  }
}

function simulatedLaunchObjects() {
  const impact = state.impact || simulateLaunchImpact();
  const objects = [];

  for (let index = 0; index < impact.payloads; index += 1) {
    objects.push({
      norad: 900000 + index,
      type: "launch",
      altitude: impact.altitude,
      inclination: impact.inclination,
      riskScore: impact.riskIndex
    });
  }

  for (let index = 0; index < impact.rocketBodies; index += 1) {
    objects.push({
      norad: 910000 + index,
      type: "R/B",
      altitude: impact.altitude,
      inclination: impact.inclination,
      riskScore: impact.riskIndex
    });
  }

  for (let index = 0; index < Math.min(impact.debris, 120); index += 1) {
    objects.push({
      norad: 920000 + index,
      type: "DEB",
      altitude: impact.altitude + (seededUnit(index) - 0.5) * 16,
      inclination: impact.inclination + (seededUnit(index + 3) - 0.5) * 1.4,
      riskScore: impact.riskIndex
    });
  }

  return objects;
}

function renderOrbitScene() {
  if (!state.three.ready) {
    renderFallbackOrbitCanvas();
    return;
  }

  const THREE = state.three.THREE;
  const oldPoints = [state.three.objectPoints, state.three.launchPoints].filter(Boolean);

  for (const points of oldPoints) {
    state.three.root.remove(points);
    points.geometry.dispose();
    points.material.dispose();
  }

  state.three.objectPoints = createPointCloud(THREE, state.filtered, 2200, 0.026, false);
  state.three.launchPoints = createPointCloud(THREE, simulatedLaunchObjects(), 700, 0.055, true);
  state.three.root.add(state.three.objectPoints, state.three.launchPoints);
}

function createPointCloud(THREE, objects, limit, pointSize, forceLaunchColor) {
  const sampleStep = Math.max(1, Math.floor(objects.length / limit));
  const sample = objects.filter((_, index) => index % sampleStep === 0).slice(0, limit);
  const positions = new Float32Array(sample.length * 3);
  const colors = new Float32Array(sample.length * 3);

  for (let index = 0; index < sample.length; index += 1) {
    const object = sample[index];
    const radius = altitudeToSceneRadius(object.altitude);
    const [x, y, z] = orbitalPosition(object, radius);
    const color = hexToRgb(forceLaunchColor ? TYPE_COLORS.launch : TYPE_COLORS[object.type] || TYPE_COLORS.other);
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: true,
      transparent: true,
      opacity: forceLaunchColor ? 0.96 : 0.72
    })
  );
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255
  };
}

function renderFallbackOrbitCanvas() {
  const canvas = elements.orbitCanvas;

  if (!canvas || canvas.style.display === "none") {
    return;
  }

  const rect = elements.orbitScene.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(600, Math.floor(rect.width * scale));
  canvas.height = Math.max(360, Math.floor(rect.height * scale));

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.46;
  const earthRadius = Math.min(width, height) * 0.085;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0b0e12";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 160; i += 1) {
    const x = seededUnit(i + 4) * width;
    const y = seededUnit(i + 100) * height;
    ctx.fillStyle = `rgba(241, 244, 238, ${0.12 + seededUnit(i) * 0.24})`;
    ctx.beginPath();
    ctx.arc(x, y, seededUnit(i + 1) * 1.3 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  const rings = [
    { label: "LEO", altitude: 2000, color: "rgba(88, 199, 189, 0.35)", labelAngle: -0.05 },
    { label: "MEO", altitude: 20200, color: "rgba(143, 209, 127, 0.28)", labelAngle: 0.23 },
    { label: "GEO", altitude: 35786, color: "rgba(233, 185, 95, 0.32)", labelAngle: 0.47 }
  ];

  ctx.lineWidth = 1.4 * scale;
  ctx.font = `${12 * scale}px Inter, sans-serif`;

  for (const ring of rings) {
    const radius = fallbackScaleAltitude(ring.altitude, earthRadius, maxRadius);
    ctx.strokeStyle = ring.color;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = ring.color.replace("0.3", "0.9").replace("0.2", "0.9");
    ctx.fillText(
      ring.label,
      centerX + Math.cos(ring.labelAngle) * radius + 8 * scale,
      centerY + Math.sin(ring.labelAngle) * radius * 0.55 + 4 * scale
    );
  }

  renderFallbackPoints(ctx, state.filtered, maxRadius, earthRadius, centerX, centerY, scale, false);
  renderFallbackPoints(ctx, simulatedLaunchObjects(), maxRadius, earthRadius, centerX, centerY, scale, true);

  ctx.globalAlpha = 1;
  const earthGradient = ctx.createRadialGradient(
    centerX - earthRadius * 0.35,
    centerY - earthRadius * 0.35,
    earthRadius * 0.1,
    centerX,
    centerY,
    earthRadius
  );
  earthGradient.addColorStop(0, "#8fd17f");
  earthGradient.addColorStop(0.48, "#58c7bd");
  earthGradient.addColorStop(1, "#294951");
  ctx.fillStyle = earthGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
  ctx.fill();
}

function renderFallbackPoints(ctx, objects, maxRadius, earthRadius, centerX, centerY, scale, launch) {
  const sampleStep = Math.max(1, Math.floor(objects.length / (launch ? 600 : 1200)));
  const visibleObjects = objects.filter((_, index) => index % sampleStep === 0).slice(0, launch ? 600 : 1200);

  for (const object of visibleObjects) {
    const angle = seededUnit(object.norad || object.altitude) * Math.PI * 2;
    const radius = fallbackScaleAltitude(object.altitude, earthRadius, maxRadius);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.55;
    const color = launch ? TYPE_COLORS.launch : TYPE_COLORS[object.type] || TYPE_COLORS.other;
    const pointSize = launch ? 2.7 : object.riskScore > 70 ? 2.1 : 1.45;

    ctx.fillStyle = color;
    ctx.globalAlpha = launch ? 0.94 : object.riskScore > 70 ? 0.88 : 0.56;
    ctx.beginPath();
    ctx.arc(x, y, pointSize * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function fallbackScaleAltitude(altitude, earthRadius, maxRadius) {
  const safeAltitude = clamp(altitude, 120, 46000);
  const scaled = Math.log10(safeAltitude + 500) / Math.log10(46500);
  return earthRadius + scaled * (maxRadius - earthRadius);
}

function updateAll() {
  applyFilters();
  renderMetrics();
  renderCharts();
  renderTables();
  renderLaunchImpact();
}

function populateOwners() {
  const topOwners = groupCounts(state.objects, (object) => object.owner || "Unknown").slice(0, 18);

  for (const [owner, count] of topOwners) {
    const option = document.createElement("option");
    option.value = owner;
    option.textContent = `${owner} (${numberFormat(count)})`;
    elements.ownerFilter.append(option);
  }
}

function wireModeTabs() {
  for (const tab of elements.modeTabs) {
    tab.addEventListener("click", () => {
      const mode = tab.dataset.mode;

      for (const item of elements.modeTabs) {
        item.classList.toggle("active", item === tab);
      }

      for (const panel of elements.modePanels) {
        panel.classList.toggle("active", panel.id === `${mode}Mode`);
      }

      resizeOrbitScene();
    });
  }
}

function wireControls() {
  wireModeTabs();

  elements.orbitFilter.addEventListener("change", () => {
    state.filters.orbit = elements.orbitFilter.value;
    updateAll();
  });

  elements.typeFilter.addEventListener("change", () => {
    state.filters.type = elements.typeFilter.value;
    updateAll();
  });

  elements.statusFilter.addEventListener("change", () => {
    state.filters.status = elements.statusFilter.value;
    updateAll();
  });

  elements.ownerFilter.addEventListener("change", () => {
    state.filters.owner = elements.ownerFilter.value;
    updateAll();
  });

  elements.riskFilter.addEventListener("input", () => {
    state.filters.minRisk = Number(elements.riskFilter.value);
    elements.riskFilterValue.textContent = elements.riskFilter.value;
    updateAll();
  });

  elements.deorbitSlider.addEventListener("input", () => {
    state.scenario.deorbitCompliance = Number(elements.deorbitSlider.value);
    elements.deorbitValue.textContent = `${elements.deorbitSlider.value}%`;
    updateAll();
  });

  elements.fragmentInput.addEventListener("input", () => {
    state.scenario.fragments = clamp(Number(elements.fragmentInput.value || 0), 0, 2000);
    updateAll();
  });

  const launchInputs = [
    elements.launchName,
    elements.launchSatellites,
    elements.launchAltitude,
    elements.launchInclination,
    elements.launchLifetime,
    elements.launchFragments,
    elements.rocketBodyRemains,
    elements.deorbitPlan
  ];

  for (const input of launchInputs) {
    input.addEventListener("input", () => {
      readLaunchInputs();
      renderLaunchImpact();
    });
    input.addEventListener("change", () => {
      readLaunchInputs();
      renderLaunchImpact();
    });
  }

  elements.resetFilters.addEventListener("click", () => {
    state.filters = {
      orbit: "all",
      type: "all",
      status: "all",
      owner: "all",
      minRisk: 0
    };
    elements.orbitFilter.value = "all";
    elements.typeFilter.value = "all";
    elements.statusFilter.value = "all";
    elements.ownerFilter.value = "all";
    elements.riskFilter.value = "0";
    elements.riskFilterValue.textContent = "0";
    updateAll();
  });

  elements.exportCsv.addEventListener("click", exportFilteredCsv);
  elements.downloadOrbitJson.addEventListener("click", exportOrbitJson);
  elements.downloadSimulationJson.addEventListener("click", exportSimulationJson);
  elements.downloadSimulationCsv.addEventListener("click", exportSimulationCsv);
  elements.downloadReport.addEventListener("click", exportReportJson);
  window.addEventListener("resize", resizeOrbitScene);
}

function exportFilteredCsv() {
  downloadCSV("orbitguard-current-orbit-data.csv", currentOrbitRows());
}

function exportOrbitJson() {
  downloadJSON("orbitguard-current-orbit-data.json", {
    project: "OrbitGuard",
    creator: CREATOR.name,
    generatedAt: new Date().toISOString(),
    filters: state.filters,
    metadata: state.metadata,
    count: state.filtered.length,
    objects: currentOrbitRows()
  });
}

function exportSimulationJson() {
  const impact = state.impact || simulateLaunchImpact();
  const filename = `${slugify(impact.name) || "orbitguard"}-launch-simulation.json`;
  downloadJSON(filename, {
    project: "OrbitGuard",
    creator: CREATOR.name,
    generatedAt: new Date().toISOString(),
    simulation: impact,
    methodology:
      "Educational launch-impact model using band crowding, orbital persistence, mission lifetime, fragments, rocket-body presence, and deorbit planning."
  });
}

function exportSimulationCsv() {
  const impact = state.impact || simulateLaunchImpact();
  downloadCSV(`${slugify(impact.name) || "orbitguard"}-launch-simulation.csv`, simulationRows());
}

function exportReportJson() {
  const payload = buildReportPayload();
  downloadJSON(`${slugify(payload.launchImpact.name) || "orbitguard"}-sustainability-report.json`, payload);
}

async function init() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`Dataset request failed with ${response.status}`);
    }

    const payload = await response.json();
    const generatedDate = new Date(payload.metadata.generatedAt);
    const currentYear = generatedDate.getUTCFullYear();
    state.metadata = payload.metadata;
    state.objects = scoreObjects(payload.objects.map((object) => normalizeObject(object, currentYear)));

    elements.dataSource.textContent = `${numberFormat(state.objects.length)} CelesTrak records updated ${generatedDate.toLocaleDateString()}`;
    populateOwners();
    wireControls();
    readLaunchInputs();
    updateAll();
    await initOrbitScene();
  } catch (error) {
    elements.dataSource.textContent = "Dataset unavailable";
    document.querySelector("main").innerHTML = `
      <section class="panel">
        <h2>Dataset unavailable</h2>
        <p class="empty-state">${error.message}. Run <code>node scripts/update-data.mjs</code>, then start <code>node server.mjs</code>.</p>
      </section>
    `;
  }
}

init();
