const DATA_URL = "data/orbitguard-data.json";
const THREE_URL = "https://unpkg.com/three@0.165.0/build/three.module.js";
const ORBIT_CONTROLS_URL = "https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js";
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
const THEME_STORAGE_KEY = "orbitguard-display-settings";
const DEFAULT_DISPLAY_SETTINGS = {
  theme: "soft-blue",
  baseTheme: "soft-blue",
  accent: "#93c5fd",
  brightness: 100,
  textContrast: 100,
  chartPalette: "balanced",
  reduceMotion: false,
  largeText: false,
  payloadColor: "#93c5fd",
  debrisColor: "#f87171",
  rocketColor: "#fbbf24",
  simulatedColor: "#a78bfa",
  otherColor: "#cbd5e1"
};
const THEME_PRESETS = {
  "deep-space": {
    bgMain: "#020617",
    bgPanel: "#0f172a",
    bgCard: "#111827",
    textMain: "#f8fafc",
    textMuted: "#cbd5e1"
  },
  "soft-blue": {
    bgMain: "#0f172a",
    bgPanel: "#172033",
    bgCard: "#1e293b",
    textMain: "#f8fafc",
    textMuted: "#dbeafe"
  },
  light: {
    bgMain: "#f8fafc",
    bgPanel: "#ffffff",
    bgCard: "#f1f5f9",
    textMain: "#0f172a",
    textMuted: "#475569"
  },
  "high-contrast": {
    bgMain: "#000000",
    bgPanel: "#0a0a0a",
    bgCard: "#111111",
    textMain: "#ffffff",
    textMuted: "#e5e7eb"
  }
};
const CHART_PALETTES = {
  balanced: {
    leo: "#60a5fa",
    meo: "#86efac",
    geo: "#facc15",
    heo: "#c084fc"
  },
  aerospace: {
    leo: "#38bdf8",
    meo: "#22c55e",
    geo: "#fbbf24",
    heo: "#818cf8"
  },
  calm: {
    leo: "#93c5fd",
    meo: "#a7f3d0",
    geo: "#fde68a",
    heo: "#ddd6fe"
  }
};
const TYPE_COLORS = {
  PAY: "#93c5fd",
  DEB: "#f27667",
  "R/B": "#fbbf24",
  other: "#cbd5e1",
  launch: "#a78bfa"
};

const state = {
  mode: "dashboard",
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
  display: { ...DEFAULT_DISPLAY_SETTINGS },
  timeMachine: {
    selectedYear: 2010,
    currentYear: new Date().getFullYear(),
    showPayloads: true,
    showDebris: true,
    showRocketBodies: true,
    showOther: true
  },
  three: {
    THREE: null,
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    root: null,
    earth: null,
    clouds: null,
    objectPoints: null,
    launchPoints: null,
    modelGroup: null,
    animationId: null,
    ready: false,
    fallback: false
  }
};

const elements = {
  dataSource: document.querySelector("#dataSource"),
  modeTabs: document.querySelectorAll(".mode-tab"),
  modeJumps: document.querySelectorAll(".mode-jump"),
  modePanels: document.querySelectorAll(".mode-panel"),
  themeSelect: document.querySelector("#theme-select"),
  accentColor: document.querySelector("#accent-color"),
  backgroundBrightness: document.querySelector("#background-brightness"),
  textContrast: document.querySelector("#text-contrast"),
  chartPalette: document.querySelector("#chart-palette"),
  payloadColor: document.querySelector("#payload-color"),
  debrisColor: document.querySelector("#debris-color"),
  rocketColor: document.querySelector("#rocket-color"),
  simulatedColor: document.querySelector("#simulated-color"),
  otherColor: document.querySelector("#other-color"),
  reduceMotion: document.querySelector("#reduce-motion"),
  largeText: document.querySelector("#large-text"),
  highContrastToggle: document.querySelector("#high-contrast-toggle"),
  orbitFilter: document.querySelector("#orbitFilter"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  ownerFilter: document.querySelector("#ownerFilter"),
  riskFilter: document.querySelector("#riskFilter"),
  riskFilterValue: document.querySelector("#riskFilterValue"),
  resetFilters: document.querySelector("#resetFilters"),
  exportCsv: document.querySelector("#exportCsv"),
  downloadOrbitJson: document.querySelector("#downloadOrbitJson"),
  downloadGoogleEarthKml: document.querySelector("#downloadGoogleEarthKml"),
  metricObjects: document.querySelector("#metricObjects"),
  metricActive: document.querySelector("#metricActive"),
  metricDebris: document.querySelector("#metricDebris"),
  metricRocketBodies: document.querySelector("#metricRocketBodies"),
  metricCrowdedBand: document.querySelector("#metricCrowdedBand"),
  metricCrowdedBandNote: document.querySelector("#metricCrowdedBandNote"),
  metricRisk: document.querySelector("#metricRisk"),
  metricRiskNote: document.querySelector("#metricRiskNote"),
  orbitScene: document.querySelector("#orbitScene"),
  orbitCanvas: document.querySelector("#orbitCanvas"),
  timeOrbitScene: document.querySelector("#timeOrbitScene"),
  timeOrbitCanvas: document.querySelector("#timeOrbitCanvas"),
  yearSlider: document.querySelector("#yearSlider"),
  selectedYear: document.querySelector("#selectedYear"),
  compareToday: document.querySelector("#compareToday"),
  timePayloadToggle: document.querySelector("#timePayloadToggle"),
  timeDebrisToggle: document.querySelector("#timeDebrisToggle"),
  timeRocketToggle: document.querySelector("#timeRocketToggle"),
  timeOtherToggle: document.querySelector("#timeOtherToggle"),
  pastYearTitle: document.querySelector("#pastYearTitle"),
  currentYearTitle: document.querySelector("#currentYearTitle"),
  pastSummary: document.querySelector("#pastSummary"),
  currentSummary: document.querySelector("#currentSummary"),
  differenceSummary: document.querySelector("#differenceSummary"),
  pastColumnTitle: document.querySelector("#pastColumnTitle"),
  comparisonBody: document.querySelector("#comparisonBody"),
  downloadTimeMachineJson: document.querySelector("#downloadTimeMachineJson"),
  downloadTimeGoogleEarthKml: document.querySelector("#downloadTimeGoogleEarthKml"),
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

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
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

function readCssVar(name, fallback = "") {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function hexToChannels(hex) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function channelsToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")).join("")}`;
}

function mixHex(firstHex, secondHex, amount) {
  const first = hexToChannels(firstHex);
  const second = hexToChannels(secondHex);
  return channelsToHex({
    r: first.r + (second.r - first.r) * amount,
    g: first.g + (second.g - first.g) * amount,
    b: first.b + (second.b - first.b) * amount
  });
}

function adjustHexBrightness(hex, percentValue) {
  const amount = Math.abs(percentValue - 100) / 100;
  return percentValue >= 100 ? mixHex(hex, "#ffffff", amount) : mixHex(hex, "#000000", amount);
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToChannels(hex);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

function hexToNumber(hex) {
  return Number.parseInt(hex.replace("#", ""), 16);
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

function loadDisplaySettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || "{}");
    const legacyTheme = localStorage.getItem("orbitguard-theme");
    state.display = { ...DEFAULT_DISPLAY_SETTINGS, ...(legacyTheme ? { theme: legacyTheme, baseTheme: legacyTheme } : {}), ...saved };
  } catch {
    state.display = { ...DEFAULT_DISPLAY_SETTINGS };
  }
}

function saveDisplaySettings() {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state.display));
}

function setDisplayControls() {
  elements.themeSelect.value = state.display.theme;
  elements.accentColor.value = state.display.accent;
  elements.backgroundBrightness.value = String(state.display.brightness);
  elements.textContrast.value = String(state.display.textContrast);
  elements.chartPalette.value = state.display.chartPalette;
  elements.payloadColor.value = state.display.payloadColor;
  elements.debrisColor.value = state.display.debrisColor;
  elements.rocketColor.value = state.display.rocketColor;
  elements.simulatedColor.value = state.display.simulatedColor;
  elements.otherColor.value = state.display.otherColor;
  elements.reduceMotion.checked = state.display.reduceMotion;
  elements.largeText.checked = state.display.largeText;
  elements.highContrastToggle.checked = state.display.theme === "high-contrast";
}

function clearCustomSurfaceVariables() {
  for (const name of ["--bg-main", "--bg-panel", "--bg-card", "--text-main", "--text-muted", "--accent", "--accent-soft"]) {
    document.documentElement.style.removeProperty(name);
  }
}

function applyCustomSurfaceVariables() {
  const base = THEME_PRESETS[state.display.baseTheme] || THEME_PRESETS["soft-blue"];
  const contrast = state.display.textContrast;
  document.documentElement.style.setProperty("--bg-main", adjustHexBrightness(base.bgMain, state.display.brightness));
  document.documentElement.style.setProperty("--bg-panel", adjustHexBrightness(base.bgPanel, state.display.brightness));
  document.documentElement.style.setProperty("--bg-card", adjustHexBrightness(base.bgCard, state.display.brightness));
  document.documentElement.style.setProperty("--text-main", contrast >= 100 ? mixHex(base.textMain, "#ffffff", (contrast - 100) / 100) : mixHex(base.textMain, "#94a3b8", (100 - contrast) / 100));
  document.documentElement.style.setProperty("--text-muted", contrast >= 100 ? mixHex(base.textMuted, "#ffffff", (contrast - 100) / 130) : mixHex(base.textMuted, "#64748b", (100 - contrast) / 100));
  document.documentElement.style.setProperty("--accent", state.display.accent);
  document.documentElement.style.setProperty("--accent-soft", hexToRgba(state.display.accent, 0.18));
}

function updateThemeDerivedColors() {
  const palette = CHART_PALETTES[state.display.chartPalette] || CHART_PALETTES.balanced;
  const root = document.documentElement;
  root.style.setProperty("--chart-leo", palette.leo);
  root.style.setProperty("--chart-meo", palette.meo);
  root.style.setProperty("--chart-geo", palette.geo);
  root.style.setProperty("--chart-heo", palette.heo);
  root.style.setProperty("--payload-color", state.display.payloadColor);
  root.style.setProperty("--debris-color", state.display.debrisColor);
  root.style.setProperty("--rocket-color", state.display.rocketColor);
  root.style.setProperty("--simulated-color", state.display.simulatedColor);
  root.style.setProperty("--other-color", state.display.otherColor);

  TYPE_COLORS.PAY = state.display.payloadColor;
  TYPE_COLORS.DEB = state.display.debrisColor;
  TYPE_COLORS["R/B"] = state.display.rocketColor;
  TYPE_COLORS.launch = state.display.simulatedColor;
  TYPE_COLORS.other = state.display.otherColor;
}

function applyDisplaySettings({ persist = true, rerender = true } = {}) {
  document.documentElement.dataset.theme = state.display.theme;
  document.documentElement.classList.toggle("reduce-motion", state.display.reduceMotion);
  document.documentElement.classList.toggle("large-text", state.display.largeText);

  if (state.display.theme === "custom") {
    applyCustomSurfaceVariables();
  } else {
    clearCustomSurfaceVariables();
  }

  updateThemeDerivedColors();

  if (persist) {
    saveDisplaySettings();
  }

  if (rerender && state.objects.length) {
    renderCharts();
    renderTables();
    renderLaunchImpact();
    renderTimeMachine();
    renderFallbackOrbitCanvas();
  }
}

function switchToCustomTheme() {
  if (state.display.theme !== "custom") {
    state.display.baseTheme = state.display.theme === "custom" ? state.display.baseTheme : state.display.theme;
    state.display.theme = "custom";
    elements.themeSelect.value = "custom";
  }
}

function riskColor(score) {
  if (score >= 68) {
    return readCssVar("--danger", "#f87171");
  }

  if (score >= 35) {
    return readCssVar("--warning", "#facc15");
  }

  return readCssVar("--success", "#86efac");
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

function summarizeTimeObjects(objects) {
  const summary = summarize(objects);
  const payloads = objects.filter((object) => object.type === "PAY").length;
  const leo = objects.filter((object) => object.orbitClass === "LEO").length;
  const other = objects.filter((object) => !["PAY", "DEB", "R/B"].includes(object.type)).length;

  return {
    ...summary,
    payloads,
    leo,
    other
  };
}

function launchYearBounds() {
  const years = state.objects
    .map((object) => object.launchYear)
    .filter((year) => Number.isFinite(year) && year >= 1957);
  const metadataYear = state.metadata?.generatedAt ? new Date(state.metadata.generatedAt).getUTCFullYear() : new Date().getFullYear();

  return {
    min: years.length ? Math.min(1957, ...years) : 1957,
    max: Math.max(metadataYear, new Date().getFullYear(), ...(years.length ? years : [metadataYear]))
  };
}

function configureTimeMachineControls() {
  const { min, max } = launchYearBounds();
  state.timeMachine.currentYear = max;
  state.timeMachine.selectedYear = clamp(state.timeMachine.selectedYear, min, max);
  elements.yearSlider.min = String(min);
  elements.yearSlider.max = String(max);
  elements.yearSlider.value = String(state.timeMachine.selectedYear);
  elements.currentYearTitle.textContent = `${max} Orbit`;
  renderTimeMachine();
}

function objectsForYear(objects, year) {
  return objects.filter((object) => Number.isFinite(object.launchYear) && object.launchYear <= year);
}

function filterTimeMachineTypes(objects) {
  return objects.filter((object) => {
    if (object.type === "PAY") {
      return state.timeMachine.showPayloads;
    }

    if (object.type === "DEB") {
      return state.timeMachine.showDebris;
    }

    if (object.type === "R/B") {
      return state.timeMachine.showRocketBodies;
    }

    return state.timeMachine.showOther;
  });
}

function timeMachineSceneObjects() {
  return filterTimeMachineTypes(objectsForYear(state.objects, state.timeMachine.selectedYear));
}

function timeSummaryMarkup(summary) {
  return `
    Total objects: <strong>${numberFormat(summary.total)}</strong><br>
    Payloads: <strong>${numberFormat(summary.payloads)}</strong><br>
    Active satellites: <strong>${numberFormat(summary.active)}</strong><br>
    Debris: <strong>${numberFormat(summary.debris)}</strong><br>
    Rocket bodies: <strong>${numberFormat(summary.rocketBodies)}</strong><br>
    LEO objects: <strong>${numberFormat(summary.leo)}</strong>
  `;
}

function updateComparisonTable(year, past, current) {
  elements.pastColumnTitle.textContent = String(year);

  const rows = [
    ["Total Objects", past.total, current.total],
    ["Payloads", past.payloads, current.payloads],
    ["Active Satellites", past.active, current.active],
    ["Debris", past.debris, current.debris],
    ["Rocket Bodies", past.rocketBodies, current.rocketBodies],
    ["LEO Objects", past.leo, current.leo],
    ["Average Risk Index", Math.round(past.averageRisk), Math.round(current.averageRisk)]
  ];

  elements.comparisonBody.innerHTML = rows
    .map(([label, pastValue, currentValue]) => {
      const change = currentValue - pastValue;
      return `
        <tr>
          <td>${label}</td>
          <td>${numberFormat(pastValue)}</td>
          <td>${numberFormat(currentValue)}</td>
          <td>${change >= 0 ? "+" : ""}${numberFormat(change)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildTimeMachinePayload() {
  const year = state.timeMachine.selectedYear;
  const pastObjects = objectsForYear(state.objects, year);
  const currentObjects = state.objects;
  const past = summarizeTimeObjects(pastObjects);
  const current = summarizeTimeObjects(currentObjects);

  return {
    project: "OrbitGuard",
    mode: "Time Machine",
    creator: CREATOR,
    generatedAt: new Date().toISOString(),
    selectedYear: year,
    currentYear: state.timeMachine.currentYear,
    dataSource: state.metadata?.source || DATA_URL,
    past,
    current,
    change: {
      totalObjects: current.total - past.total,
      payloads: current.payloads - past.payloads,
      activeSatellites: current.active - past.active,
      debris: current.debris - past.debris,
      rocketBodies: current.rocketBodies - past.rocketBodies,
      leoObjects: current.leo - past.leo
    },
    displayFilters: {
      payloads: state.timeMachine.showPayloads,
      debris: state.timeMachine.showDebris,
      rocketBodies: state.timeMachine.showRocketBodies,
      other: state.timeMachine.showOther
    },
    limitation:
      "Educational reconstruction based on launch-year data from the current catalog. It does not remove decayed objects by historical date and is not a replacement for archived TLE snapshots."
  };
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hexToKmlColor(hex, alpha = "ff") {
  const normalized = hex.replace("#", "").padStart(6, "0");
  const red = normalized.slice(0, 2);
  const green = normalized.slice(2, 4);
  const blue = normalized.slice(4, 6);
  return `${alpha}${blue}${green}${red}`;
}

function objectLonLat(object) {
  const seed = object.norad || Math.round(object.altitude * 10);
  const lon = seededUnit(seed + 211) * 360 - 180;
  const maxLatitude = clamp(Math.abs(object.inclination || 0), 8, 82);
  const lat = (seededUnit(seed + 419) * 2 - 1) * maxLatitude;
  return { lon, lat };
}

function circleCoordinates(altitudeKm, segments = 144) {
  const coordinates = [];
  const altitudeMeters = Math.round(altitudeKm * 1000);

  for (let index = 0; index <= segments; index += 1) {
    const lon = -180 + (index / segments) * 360;
    coordinates.push(`${decimal(lon, 3)},0,${altitudeMeters}`);
  }

  return coordinates.join(" ");
}

function kmlStyleDefinitions() {
  return `
    <Style id="payload"><IconStyle><color>${hexToKmlColor(TYPE_COLORS.PAY)}</color><scale>0.8</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle></Style>
    <Style id="debris"><IconStyle><color>${hexToKmlColor(TYPE_COLORS.DEB)}</color><scale>0.72</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle></Style>
    <Style id="rocket"><IconStyle><color>${hexToKmlColor(TYPE_COLORS["R/B"])}</color><scale>0.84</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle></Style>
    <Style id="simulated"><IconStyle><color>${hexToKmlColor(TYPE_COLORS.launch)}</color><scale>0.95</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/target.png</href></Icon></IconStyle></Style>
    <Style id="other"><IconStyle><color>${hexToKmlColor(TYPE_COLORS.other)}</color><scale>0.68</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle></Style>
    <Style id="orbitRingLeo"><LineStyle><color>${hexToKmlColor(readCssVar("--chart-leo", "#60a5fa"), "99")}</color><width>2</width></LineStyle></Style>
    <Style id="orbitRingMeo"><LineStyle><color>${hexToKmlColor(readCssVar("--chart-meo", "#86efac"), "99")}</color><width>2</width></LineStyle></Style>
    <Style id="orbitRingGeo"><LineStyle><color>${hexToKmlColor(readCssVar("--chart-geo", "#facc15"), "99")}</color><width>2</width></LineStyle></Style>
  `;
}

function kmlStyleForObject(object) {
  if (object.simulated || object.type === "launch") return "simulated";
  if (object.type === "PAY") return "payload";
  if (object.type === "DEB") return "debris";
  if (object.type === "R/B") return "rocket";
  return "other";
}

function objectKmlPlacemark(object, index) {
  const { lon, lat } = objectLonLat(object);
  const altitudeMeters = Math.round(clamp(object.altitude, 160, 42000) * 1000);
  const name = object.name || `${object.simulated ? "Simulated" : "Catalog"} object ${index + 1}`;
  const description = [
    `Type: ${typeLabel(object.type)}`,
    `Orbit: ${object.orbitClass || "Simulated"}`,
    `Altitude: ${numberFormat(object.altitude)} km`,
    `Inclination: ${decimal(object.inclination || 0)} degrees`,
    `Risk score: ${Math.round(object.riskScore || 0)}`,
    object.simulated ? "Simulated launch object from OrbitGuard." : "Catalog object from OrbitGuard reconstruction."
  ].join("\n");

  return `
      <Placemark>
        <name>${escapeXml(name)}</name>
        <description>${escapeXml(description)}</description>
        <styleUrl>#${kmlStyleForObject(object)}</styleUrl>
        <Point>
          <altitudeMode>absolute</altitudeMode>
          <extrude>1</extrude>
          <coordinates>${decimal(lon, 5)},${decimal(lat, 5)},${altitudeMeters}</coordinates>
        </Point>
      </Placemark>`;
}

function orbitRingPlacemark(name, altitudeKm, styleId) {
  return `
      <Placemark>
        <name>${escapeXml(name)}</name>
        <styleUrl>#${styleId}</styleUrl>
        <LineString>
          <altitudeMode>absolute</altitudeMode>
          <tessellate>0</tessellate>
          <coordinates>${circleCoordinates(altitudeKm)}</coordinates>
        </LineString>
      </Placemark>`;
}

function buildGoogleEarthKml({ title, objects, includeLaunchObjects }) {
  const launchObjects = includeLaunchObjects ? simulatedLaunchObjects() : [];
  const exportObjects = representativeObjects(objects, launchObjects, 420);
  const generatedAt = new Date().toISOString();
  const placemarks = exportObjects.map(objectKmlPlacemark).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(title)}</name>
    <description>${escapeXml(`OrbitGuard Google Earth export generated ${generatedAt}. Object positions are educational reconstructions, not operational ephemerides.`)}</description>
    ${kmlStyleDefinitions()}
    <Folder>
      <name>Reference orbit bands</name>
      ${orbitRingPlacemark("LEO reference shell - 2,000 km", 2000, "orbitRingLeo")}
      ${orbitRingPlacemark("MEO reference shell - 20,200 km", 20200, "orbitRingMeo")}
      ${orbitRingPlacemark("GEO reference shell - 35,786 km", 35786, "orbitRingGeo")}
    </Folder>
    <Folder>
      <name>OrbitGuard objects</name>
      ${placemarks}
    </Folder>
  </Document>
</kml>`;
}

function renderTimeMachine() {
  if (!state.objects.length) {
    return;
  }

  const year = state.timeMachine.selectedYear;
  const pastObjects = objectsForYear(state.objects, year);
  const currentObjects = state.objects;
  const past = summarizeTimeObjects(pastObjects);
  const current = summarizeTimeObjects(currentObjects);
  const totalChange = current.total - past.total;
  const debrisChange = current.debris - past.debris;
  const leoChange = current.leo - past.leo;
  const payloadChange = current.payloads - past.payloads;

  elements.selectedYear.textContent = String(year);
  elements.pastYearTitle.textContent = `${year} Orbit`;
  elements.currentYearTitle.textContent = `${state.timeMachine.currentYear} Orbit`;
  elements.pastSummary.innerHTML = timeSummaryMarkup(past);
  elements.currentSummary.innerHTML = timeSummaryMarkup(current);
  elements.differenceSummary.innerHTML = `
    Compared with ${year}, today's catalog has <strong>${numberFormat(totalChange)}</strong> more tracked objects,
    including <strong>${numberFormat(payloadChange)}</strong> more payloads,
    <strong>${numberFormat(debrisChange)}</strong> more debris objects,
    and <strong>${numberFormat(leoChange)}</strong> more LEO objects.
    The growth makes deorbit planning, upper-stage disposal, and lower-congestion mission design more important.
  `;

  updateComparisonTable(year, past, current);

  if (state.mode === "time") {
    renderOrbitScene();
  }
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
  const [crowdedBand] = buildHotspots(state.filtered);
  const summaryRiskLevel = riskLevel(summary.averageRisk);

  elements.metricObjects.textContent = numberFormat(summary.total);
  elements.metricActive.textContent = numberFormat(summary.active);
  elements.metricDebris.textContent = numberFormat(summary.debris);
  elements.metricRocketBodies.textContent = numberFormat(summary.rocketBodies);
  elements.metricCrowdedBand.textContent = crowdedBand ? `${crowdedBand.band} km` : "-";
  elements.metricCrowdedBandNote.textContent = crowdedBand ? `${numberFormat(crowdedBand.count)} objects in highest-density shell` : "No matching altitude shell";
  elements.metricRisk.textContent = summaryRiskLevel;
  elements.metricRiskNote.textContent = `${Math.round(summary.averageRisk)} average catalog risk index`;
  elements.scenarioIndex.textContent = Math.round(scenario.projected);
  elements.scenarioDelta.textContent = `${scenario.delta >= 0 ? "+" : ""}${scenario.delta.toFixed(1)} vs current filter`;
  elements.scenarioDelta.style.color = scenario.delta > 0 ? riskColor(80) : riskColor(10);
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
    ["Old share", impact.oldShare, readCssVar("--chart-leo", "#60a5fa")],
    ["New share", impact.newShare, readCssVar("--success", "#86efac")],
    ["Old crowding", impact.oldCongestion, readCssVar("--warning", "#facc15")],
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
      <div class="bar-track"><div class="bar-fill" style="--value: ${value}%; --bar-color: ${colorMap[label] || readCssVar("--accent", "#60a5fa")}"></div></div>
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
    LEO: readCssVar("--chart-leo", "#60a5fa"),
    MEO: readCssVar("--chart-meo", "#86efac"),
    GEO: readCssVar("--chart-geo", "#facc15"),
    HEO: readCssVar("--chart-heo", "#c084fc")
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
  const timelineColor = readCssVar("--accent", "#60a5fa");
  const axisColor = readCssVar("--border", "rgb(203 213 225 / 0.18)");

  elements.timelinePeak.textContent = `${numberFormat(maxTotal)} current objects by ${maxYear}`;
  elements.timelineChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Timeline of objects still in orbit by launch year">
      <polygon points="${area}" fill="${hexToRgba(timelineColor, 0.18)}"></polygon>
      <polyline points="${line}" fill="none" stroke="${timelineColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      <line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${padding.left + innerWidth}" y2="${padding.top + innerHeight}" stroke="${axisColor}"></line>
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + innerHeight}" stroke="${axisColor}"></line>
      ${labelYears
        .map(
          (year) => `
            <text class="timeline-axis" x="${x(year)}" y="${height - 10}" text-anchor="middle">${year}</text>
            <line x1="${x(year)}" y1="${padding.top}" x2="${x(year)}" y2="${padding.top + innerHeight}" stroke="${axisColor}"></line>
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

function activeOrbitContainer() {
  return state.mode === "time" ? elements.timeOrbitScene : elements.orbitScene;
}

function activeOrbitCanvas() {
  return state.mode === "time" ? elements.timeOrbitCanvas : elements.orbitCanvas;
}

function sceneCatalogObjects() {
  if (state.mode === "time") {
    return timeMachineSceneObjects();
  }

  return state.filtered;
}

function sceneLaunchObjects() {
  return state.mode === "time" ? [] : simulatedLaunchObjects();
}

function syncRendererTarget() {
  if (!state.three.renderer) {
    return;
  }

  const container = activeOrbitContainer();
  const canvas = activeOrbitCanvas();

  if (state.three.renderer.domElement.parentElement !== container) {
    container.append(state.three.renderer.domElement);
  }

  if (elements.orbitCanvas) {
    elements.orbitCanvas.style.display = state.mode === "dashboard" ? "none" : "block";
  }

  if (elements.timeOrbitCanvas) {
    elements.timeOrbitCanvas.style.display = state.mode === "time" ? "none" : "block";
  }

  if (canvas) {
    canvas.style.display = "none";
  }
}

function createEarthTexture(THREE) {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const ocean = ctx.createLinearGradient(0, 0, 0, height);
  ocean.addColorStop(0, "#0f4f8a");
  ocean.addColorStop(0.5, "#0b6aa4");
  ocean.addColorStop(1, "#08345e");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  for (let y = 0; y < height; y += 1) {
    const latitude = Math.abs((y / height) * 2 - 1);
    ctx.fillStyle = `rgb(255 255 255 / ${latitude * 0.06})`;
    ctx.fillRect(0, y, width, 1);
  }

  const landColor = "#2f8c57";
  const highlandColor = "#9aa66a";
  const desertColor = "#c3a15e";
  const continents = [
    [-102, 46, 108, 54, landColor],
    [-61, -14, 55, 88, landColor],
    [18, 5, 86, 82, desertColor],
    [76, 45, 156, 54, landColor],
    [80, 18, 56, 42, landColor],
    [133, -25, 52, 34, desertColor],
    [-42, 74, 42, 16, highlandColor],
    [10, -72, 320, 18, "#dbeafe"]
  ];

  for (let index = 0; index < continents.length; index += 1) {
    const [lon, lat, rx, ry, color] = continents[index];
    drawLandMass(ctx, width, height, lon, lat, rx, ry, color, index + 3);
  }

  ctx.strokeStyle = "rgb(255 255 255 / 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += width / 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = height / 6; y < height; y += height / 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function drawLandMass(ctx, width, height, lon, lat, rx, ry, color, seed) {
  const centerX = ((lon + 180) / 360) * width;
  const centerY = ((90 - lat) / 180) * height;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((seededUnit(seed) - 0.5) * 0.7);
  ctx.fillStyle = color;
  ctx.beginPath();

  const points = 28;
  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * Math.PI * 2;
    const wobble = 0.78 + seededUnit(seed * 97 + index) * 0.44;
    const x = Math.cos(angle) * rx * wobble;
    const y = Math.sin(angle) * ry * (0.72 + seededUnit(seed * 131 + index) * 0.42);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.clip();

  for (let index = 0; index < 18; index += 1) {
    ctx.fillStyle = index % 3 === 0 ? "rgb(214 197 128 / 0.28)" : "rgb(116 172 96 / 0.28)";
    ctx.beginPath();
    ctx.ellipse(
      (seededUnit(seed * 211 + index) - 0.5) * rx * 1.5,
      (seededUnit(seed * 307 + index) - 0.5) * ry * 1.25,
      rx * (0.08 + seededUnit(seed * 419 + index) * 0.16),
      ry * (0.05 + seededUnit(seed * 503 + index) * 0.13),
      seededUnit(seed * 601 + index) * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}

function createCloudTexture(THREE) {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);

  for (let index = 0; index < 95; index += 1) {
    const x = seededUnit(index * 13 + 5) * width;
    const y = seededUnit(index * 17 + 9) * height;
    const radiusX = 22 + seededUnit(index * 19 + 11) * 62;
    const radiusY = 5 + seededUnit(index * 23 + 13) * 15;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusX);
    gradient.addColorStop(0, "rgb(255 255 255 / 0.34)");
    gradient.addColorStop(0.72, "rgb(255 255 255 / 0.12)");
    gradient.addColorStop(1, "rgb(255 255 255 / 0)");
    ctx.fillStyle = gradient;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((seededUnit(index * 29) - 0.5) * 0.8);
    ctx.beginPath();
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

async function initOrbitScene() {
  if (state.three.ready || state.three.fallback) {
    return;
  }

  try {
    const THREE = await import(THREE_URL);
    const { OrbitControls } = await import(ORBIT_CONTROLS_URL);
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const root = new THREE.Group();
    const container = activeOrbitContainer();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.append(renderer.domElement);
    camera.position.set(0, 1.15, 7.3);
    camera.lookAt(0, 0, 0);
    root.rotation.x = -0.22;
    root.rotation.y = 0.16;
    scene.add(root);
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    const light = new THREE.DirectionalLight(0xffffff, 1.35);
    light.position.set(3, 4, 5);
    scene.add(light);

    const earthTexture = createEarthTexture(THREE);
    const cloudTexture = createCloudTexture(THREE);
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 96, 96),
      new THREE.MeshStandardMaterial({
        map: earthTexture,
        emissive: hexToNumber(readCssVar("--bg-card", "#172033")),
        emissiveIntensity: 0.12,
        roughness: 0.82,
        metalness: 0.05
      })
    );
    root.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.79, 64, 64),
      new THREE.MeshBasicMaterial({ color: hexToNumber(readCssVar("--accent", "#60a5fa")), transparent: true, opacity: 0.13 })
    );
    root.add(atmosphere);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(0.742, 96, 96),
      new THREE.MeshBasicMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      })
    );
    root.add(clouds);

    addThreeRing(THREE, root, altitudeToSceneRadius(2000), hexToNumber(readCssVar("--chart-leo", "#60a5fa")));
    addThreeRing(THREE, root, altitudeToSceneRadius(20200), hexToNumber(readCssVar("--chart-meo", "#86efac")));
    addThreeRing(THREE, root, altitudeToSceneRadius(35786), hexToNumber(readCssVar("--chart-geo", "#facc15")));

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i += 1) {
      starPositions[i * 3] = (seededUnit(i + 1) - 0.5) * 14;
      starPositions[i * 3 + 1] = (seededUnit(i + 2) - 0.5) * 9;
      starPositions[i * 3 + 2] = (seededUnit(i + 3) - 0.5) * 12;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xf1f4ee, size: 0.015, transparent: true, opacity: 0.45 })));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 3.2;
    controls.maxDistance = 13;
    controls.target.set(0, 0, 0);

    state.three = {
      ...state.three,
      THREE,
      renderer,
      scene,
      camera,
      controls,
      root,
      earth,
      clouds,
      ready: true
    };
    syncRendererTarget();
    resizeOrbitScene();
    renderOrbitScene();
    animateOrbitScene();
  } catch (error) {
    console.warn("OrbitGuard 3D renderer unavailable; using canvas fallback.", error);
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

  if (!state.display.reduceMotion) {
    state.three.earth.rotation.y += 0.00055;
    state.three.clouds.rotation.y += 0.0009;
  }

  state.three.controls.update();
  state.three.renderer.render(state.three.scene, state.three.camera);
  state.three.animationId = window.requestAnimationFrame(animateOrbitScene);
}

function resizeOrbitScene() {
  const container = activeOrbitContainer();
  const rect = container.getBoundingClientRect();

  if (state.three.ready) {
    syncRendererTarget();
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
      simulated: true,
      altitude: impact.altitude,
      inclination: impact.inclination,
      riskScore: impact.riskIndex
    });
  }

  for (let index = 0; index < impact.rocketBodies; index += 1) {
    objects.push({
      norad: 910000 + index,
      type: "R/B",
      simulated: true,
      altitude: impact.altitude,
      inclination: impact.inclination,
      riskScore: impact.riskIndex
    });
  }

  for (let index = 0; index < Math.min(impact.debris, 120); index += 1) {
    objects.push({
      norad: 920000 + index,
      type: "DEB",
      simulated: true,
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

  syncRendererTarget();
  const THREE = state.three.THREE;
  const oldPoints = [state.three.objectPoints, state.three.launchPoints].filter(Boolean);

  for (const points of oldPoints) {
    state.three.root.remove(points);
    points.geometry.dispose();
    points.material.dispose();
  }

  if (state.three.modelGroup) {
    state.three.root.remove(state.three.modelGroup);
    disposeObject3D(state.three.modelGroup);
  }

  const catalogObjects = sceneCatalogObjects();
  const launchObjects = sceneLaunchObjects();

  state.three.objectPoints = createPointCloud(THREE, catalogObjects, state.mode === "time" ? 3200 : 2200, 0.018, false);
  state.three.launchPoints = launchObjects.length ? createPointCloud(THREE, launchObjects, 700, 0.038, true) : null;
  state.three.modelGroup = createObjectModelGroup(THREE, catalogObjects, launchObjects);
  state.three.root.add(state.three.objectPoints);

  if (state.three.launchPoints) {
    state.three.root.add(state.three.launchPoints);
  }

  state.three.root.add(state.three.modelGroup);
}

function disposeObject3D(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        material.dispose();
      }
    }
  });
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
    const color = hexToRgb(getObjectColor(object, forceLaunchColor));
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

function createObjectModelGroup(THREE, catalogObjects, launchObjects) {
  const group = new THREE.Group();
  const selectedObjects = representativeObjects(catalogObjects, launchObjects, state.mode === "time" ? 90 : 120);

  for (let index = 0; index < selectedObjects.length; index += 1) {
    const object = selectedObjects[index];
    const radius = altitudeToSceneRadius(object.altitude) + 0.035;
    const [x, y, z] = orbitalPosition(object, radius);
    const model = createOrbitObjectModel(THREE, object);
    const scale = object.simulated ? 1.25 : object.riskScore > 72 ? 1.08 : 0.92;
    model.position.set(x, y, z);
    model.lookAt(0, 0, 0);
    model.rotateY(Math.PI / 2);
    model.rotateZ(seededUnit((object.norad || index) + 41) * Math.PI * 2);
    model.scale.setScalar(scale);
    group.add(model);
  }

  return group;
}

function representativeObjects(catalogObjects, launchObjects, limit) {
  const launchSample = launchObjects.slice(0, Math.min(28, launchObjects.length));
  const sortedCatalog = [...catalogObjects]
    .filter((object) => Number.isFinite(object.altitude))
    .sort((a, b) => b.riskScore - a.riskScore);
  const buckets = [
    sortedCatalog.filter((object) => object.type === "PAY").slice(0, 32),
    sortedCatalog.filter((object) => object.type === "DEB").slice(0, 32),
    sortedCatalog.filter((object) => object.type === "R/B").slice(0, 24),
    sortedCatalog.filter((object) => !["PAY", "DEB", "R/B"].includes(object.type)).slice(0, 12)
  ];
  const merged = [...launchSample, ...buckets.flat()];
  const unique = new Map();

  for (const object of merged) {
    unique.set(`${object.simulated ? "sim" : "cat"}-${object.norad}-${object.type}`, object);
  }

  return [...unique.values()].slice(0, limit);
}

function createOrbitObjectModel(THREE, object) {
  if (object.simulated || object.type === "launch") {
    return createSimulatedObjectModel(THREE, object);
  }

  if (object.type === "PAY") {
    return createSatelliteModel(THREE, object);
  }

  if (object.type === "R/B") {
    return createRocketBodyModel(THREE, object);
  }

  if (object.type === "DEB") {
    return createDebrisModel(THREE, object);
  }

  return createOtherObjectModel(THREE, object);
}

function createSatelliteModel(THREE, object) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: hexToNumber(getObjectColor(object)),
    emissive: hexToNumber(getObjectColor(object)),
    emissiveIntensity: 0.18,
    roughness: 0.48,
    metalness: 0.52
  });
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.28,
    roughness: 0.36,
    metalness: 0.25
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.032, 0.032), bodyMaterial);
  const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.0035, 0.028), panelMaterial);
  const rightPanel = leftPanel.clone();
  leftPanel.position.x = -0.062;
  rightPanel.position.x = 0.062;
  group.add(body, leftPanel, rightPanel);
  return group;
}

function createRocketBodyModel(THREE, object) {
  const material = new THREE.MeshStandardMaterial({
    color: hexToNumber(getObjectColor(object)),
    emissive: hexToNumber(getObjectColor(object)),
    emissiveIntensity: 0.08,
    roughness: 0.42,
    metalness: 0.46
  });
  const group = new THREE.Group();
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.015, 0.095, 16), material);
  cylinder.rotation.z = Math.PI / 2;
  const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.026, 16), material);
  nozzle.rotation.z = -Math.PI / 2;
  nozzle.position.x = 0.06;
  group.add(cylinder, nozzle);
  return group;
}

function createDebrisModel(THREE, object) {
  const material = new THREE.MeshStandardMaterial({
    color: hexToNumber(getObjectColor(object)),
    emissive: hexToNumber(getObjectColor(object)),
    emissiveIntensity: 0.12,
    roughness: 0.72,
    metalness: 0.2,
    flatShading: true
  });
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), material);
  mesh.scale.set(1.2, 0.72, 0.9);
  return mesh;
}

function createSimulatedObjectModel(THREE, object) {
  const material = new THREE.MeshStandardMaterial({
    color: hexToNumber(getObjectColor(object, true)),
    emissive: hexToNumber(getObjectColor(object, true)),
    emissiveIntensity: 0.35,
    roughness: 0.36,
    metalness: 0.18,
    transparent: true,
    opacity: 0.92
  });
  return new THREE.Mesh(new THREE.OctahedronGeometry(0.034, 0), material);
}

function createOtherObjectModel(THREE, object) {
  const material = new THREE.MeshStandardMaterial({
    color: hexToNumber(getObjectColor(object)),
    emissive: hexToNumber(getObjectColor(object)),
    emissiveIntensity: 0.08,
    roughness: 0.56,
    metalness: 0.22
  });
  return new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.026, 0.02), material);
}

function getObjectColor(object, forceLaunchColor = false) {
  if (forceLaunchColor || object.simulated || object.type === "launch") {
    return TYPE_COLORS.launch;
  }

  if (object.type === "DEB") {
    return TYPE_COLORS.DEB;
  }

  if (object.type === "R/B") {
    return TYPE_COLORS["R/B"];
  }

  if (object.type === "PAY") {
    return TYPE_COLORS.PAY;
  }

  return TYPE_COLORS.other;
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
  const canvas = activeOrbitCanvas();

  if (!canvas || state.three.ready) {
    return;
  }

  canvas.style.display = "block";
  const rect = activeOrbitContainer().getBoundingClientRect();
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
  ctx.fillStyle = readCssVar("--bg-main", "#0b1120");
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 160; i += 1) {
    const x = seededUnit(i + 4) * width;
    const y = seededUnit(i + 100) * height;
    ctx.fillStyle = hexToRgba(readCssVar("--text-main", "#f8fafc"), 0.12 + seededUnit(i) * 0.24);
    ctx.beginPath();
    ctx.arc(x, y, seededUnit(i + 1) * 1.3 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  const rings = [
    { label: "LEO", altitude: 2000, color: hexToRgba(readCssVar("--chart-leo", "#60a5fa"), 0.35), labelAngle: -0.05 },
    { label: "MEO", altitude: 20200, color: hexToRgba(readCssVar("--chart-meo", "#86efac"), 0.28), labelAngle: 0.23 },
    { label: "GEO", altitude: 35786, color: hexToRgba(readCssVar("--chart-geo", "#facc15"), 0.32), labelAngle: 0.47 }
  ];

  ctx.lineWidth = 1.4 * scale;
  ctx.font = `${12 * scale}px Inter, sans-serif`;

  for (const ring of rings) {
    const radius = fallbackScaleAltitude(ring.altitude, earthRadius, maxRadius);
    ctx.strokeStyle = ring.color;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = ring.color.replace(/\/ 0\.\d+\)/, "/ 0.9)");
    ctx.fillText(
      ring.label,
      centerX + Math.cos(ring.labelAngle) * radius + 8 * scale,
      centerY + Math.sin(ring.labelAngle) * radius * 0.55 + 4 * scale
    );
  }

  renderFallbackPoints(ctx, sceneCatalogObjects(), maxRadius, earthRadius, centerX, centerY, scale, false);
  renderFallbackPoints(ctx, sceneLaunchObjects(), maxRadius, earthRadius, centerX, centerY, scale, true);

  ctx.globalAlpha = 1;
  const earthGradient = ctx.createRadialGradient(
    centerX - earthRadius * 0.35,
    centerY - earthRadius * 0.35,
    earthRadius * 0.1,
    centerX,
    centerY,
    earthRadius
  );
  earthGradient.addColorStop(0, readCssVar("--success", "#86efac"));
  earthGradient.addColorStop(0.48, readCssVar("--payload-color", "#93c5fd"));
  earthGradient.addColorStop(1, readCssVar("--bg-card", "#172033"));
  ctx.fillStyle = earthGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
  ctx.fill();
  drawFallbackEarthLand(ctx, centerX, centerY, earthRadius, scale);
}

function renderFallbackPoints(ctx, objects, maxRadius, earthRadius, centerX, centerY, scale, launch) {
  const sampleStep = Math.max(1, Math.floor(objects.length / (launch ? 600 : 1200)));
  const visibleObjects = objects.filter((_, index) => index % sampleStep === 0).slice(0, launch ? 600 : 1200);

  for (const object of visibleObjects) {
    const angle = seededUnit(object.norad || object.altitude) * Math.PI * 2;
    const radius = fallbackScaleAltitude(object.altitude, earthRadius, maxRadius);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.55;
    const color = getObjectColor(object, launch);
    const pointSize = launch ? 2.7 : object.riskScore > 70 ? 2.1 : 1.45;

    ctx.fillStyle = color;
    ctx.globalAlpha = launch ? 0.94 : object.riskScore > 70 ? 0.88 : 0.56;
    ctx.beginPath();
    ctx.arc(x, y, pointSize * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFallbackEarthLand(ctx, centerX, centerY, earthRadius, scale) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
  ctx.clip();
  const landColor = readCssVar("--success", "#86efac");
  const highlandColor = readCssVar("--warning", "#facc15");
  const landShapes = [
    [-0.36, -0.18, 0.28, 0.15, landColor],
    [-0.1, 0.22, 0.18, 0.28, landColor],
    [0.24, -0.06, 0.32, 0.18, highlandColor],
    [0.42, 0.26, 0.18, 0.12, landColor],
    [-0.22, -0.48, 0.2, 0.06, "#dbeafe"]
  ];

  for (const [offsetX, offsetY, radiusX, radiusY, color] of landShapes) {
    ctx.fillStyle = color;
    ctx.globalAlpha = color === "#dbeafe" ? 0.88 : 0.72;
    ctx.beginPath();
    ctx.ellipse(
      centerX + offsetX * earthRadius,
      centerY + offsetY * earthRadius,
      radiusX * earthRadius,
      radiusY * earthRadius,
      offsetX,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.strokeStyle = `rgb(255 255 255 / 0.14)`;
  ctx.lineWidth = 0.8 * scale;
  for (let index = -2; index <= 2; index += 1) {
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + index * earthRadius * 0.2, earthRadius * 0.94, earthRadius * 0.18, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
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

function setActiveMode(mode) {
  state.mode = mode;

  for (const item of elements.modeTabs) {
    item.classList.toggle("active", item.dataset.mode === mode);
  }

  for (const panel of elements.modePanels) {
    panel.classList.toggle("active", panel.id === `${mode}Mode`);
  }

  if (mode === "time") {
    renderTimeMachine();
  } else {
    renderOrbitScene();
  }

  resizeOrbitScene();
}

function wireModeTabs() {
  for (const tab of elements.modeTabs) {
    tab.addEventListener("click", () => {
      setActiveMode(tab.dataset.mode);
    });
  }

  for (const button of elements.modeJumps) {
    button.addEventListener("click", () => {
      setActiveMode(button.dataset.mode);
    });
  }
}

function wireDisplaySettings() {
  elements.themeSelect.addEventListener("change", () => {
    state.display.theme = elements.themeSelect.value;
    if (state.display.theme !== "custom") {
      state.display.baseTheme = state.display.theme;
    }
    state.display.highContrast = state.display.theme === "high-contrast";
    elements.highContrastToggle.checked = state.display.theme === "high-contrast";
    applyDisplaySettings();
  });

  elements.accentColor.addEventListener("input", () => {
    switchToCustomTheme();
    state.display.accent = elements.accentColor.value;
    applyDisplaySettings();
  });

  elements.backgroundBrightness.addEventListener("input", () => {
    switchToCustomTheme();
    state.display.brightness = Number(elements.backgroundBrightness.value);
    applyDisplaySettings();
  });

  elements.textContrast.addEventListener("input", () => {
    switchToCustomTheme();
    state.display.textContrast = Number(elements.textContrast.value);
    applyDisplaySettings();
  });

  elements.chartPalette.addEventListener("change", () => {
    state.display.chartPalette = elements.chartPalette.value;
    applyDisplaySettings();
  });

  const colorControls = [
    [elements.payloadColor, "payloadColor"],
    [elements.debrisColor, "debrisColor"],
    [elements.rocketColor, "rocketColor"],
    [elements.simulatedColor, "simulatedColor"],
    [elements.otherColor, "otherColor"]
  ];

  for (const [input, key] of colorControls) {
    input.addEventListener("input", () => {
      state.display[key] = input.value;
      applyDisplaySettings();
    });
  }

  elements.reduceMotion.addEventListener("change", () => {
    state.display.reduceMotion = elements.reduceMotion.checked;
    applyDisplaySettings();
  });

  elements.largeText.addEventListener("change", () => {
    state.display.largeText = elements.largeText.checked;
    applyDisplaySettings();
  });

  elements.highContrastToggle.addEventListener("change", () => {
    state.display.theme = elements.highContrastToggle.checked ? "high-contrast" : "soft-blue";
    state.display.baseTheme = state.display.theme;
    elements.themeSelect.value = state.display.theme;
    applyDisplaySettings();
  });
}

function wireTimeMachineControls() {
  elements.yearSlider.addEventListener("input", () => {
    state.timeMachine.selectedYear = Number(elements.yearSlider.value);
    renderTimeMachine();
  });

  elements.compareToday.addEventListener("click", () => {
    renderTimeMachine();
  });

  const toggles = [
    [elements.timePayloadToggle, "showPayloads"],
    [elements.timeDebrisToggle, "showDebris"],
    [elements.timeRocketToggle, "showRocketBodies"],
    [elements.timeOtherToggle, "showOther"]
  ];

  for (const [toggle, key] of toggles) {
    toggle.addEventListener("change", () => {
      state.timeMachine[key] = toggle.checked;
      renderTimeMachine();
    });
  }

  elements.downloadTimeMachineJson.addEventListener("click", () => {
    const payload = buildTimeMachinePayload();
    downloadJSON(`orbitguard-time-machine-${payload.selectedYear}-to-${payload.currentYear}.json`, payload);
  });
}

function wireControls() {
  wireModeTabs();
  wireDisplaySettings();
  wireTimeMachineControls();

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
  elements.downloadGoogleEarthKml.addEventListener("click", () => exportGoogleEarthKml("dashboard"));
  elements.downloadTimeGoogleEarthKml.addEventListener("click", () => exportGoogleEarthKml("time"));
  elements.downloadSimulationJson.addEventListener("click", exportSimulationJson);
  elements.downloadSimulationCsv.addEventListener("click", exportSimulationCsv);
  elements.downloadReport.addEventListener("click", exportReportJson);
  window.addEventListener("resize", resizeOrbitScene);
}

function setupThemeControls() {
  loadDisplaySettings();
  setDisplayControls();
  applyDisplaySettings({ persist: false, rerender: false });
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

function exportGoogleEarthKml(mode = state.mode) {
  const isTimeMode = mode === "time";
  const year = state.timeMachine.selectedYear;
  const objects = isTimeMode ? timeMachineSceneObjects() : state.filtered;
  const title = isTimeMode ? `OrbitGuard Time Machine ${year}` : "OrbitGuard Current Orbit Dashboard";
  const filename = isTimeMode ? `orbitguard-time-machine-${year}-google-earth.kml` : "orbitguard-current-orbit-google-earth.kml";
  const kml = buildGoogleEarthKml({
    title,
    objects,
    includeLaunchObjects: !isTimeMode
  });

  downloadText(filename, kml, "application/vnd.google-earth.kml+xml");
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
    configureTimeMachineControls();
    populateOwners();
    wireControls();
    readLaunchInputs();
    updateAll();
    renderTimeMachine();
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

setupThemeControls();
init();
