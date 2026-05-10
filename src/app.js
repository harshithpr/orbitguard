const DATA_URL = "data/orbitguard-data.json";
const ENCYCLOPEDIA_TOPICS_URL = "data/encyclopedia-topics.json";
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
const STUDIO_STORAGE_KEY = "orbitguard-mission-studio-scenarios";
const DEFAULT_DISPLAY_SETTINGS = {
  theme: "soft-blue",
  baseTheme: "soft-blue",
  accent: "#93c5fd",
  brightness: 100,
  textContrast: 100,
  chartPalette: "balanced",
  reduceMotion: false,
  largeText: false,
  gravityCursor: true,
  showOrbitTrails: false,
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
const LAUNCH_SEQUENCE_PHASES = [
  { name: "Ignition buildup", start: 0, end: 3, stage: "Stage 1", telemetry: "Engines chilling down and plume pressure building." },
  { name: "Liftoff", start: 3, end: 7, stage: "Stage 1", telemetry: "Vehicle clears the tower with full exhaust plume." },
  { name: "Max-Q", start: 7, end: 10, stage: "Stage 1", telemetry: "Peak aerodynamic pressure adds visible camera shake." },
  { name: "Stage separation", start: 10, end: 13, stage: "Stage 2", telemetry: "First stage drops away and begins a controlled tumble." },
  { name: "Stage 2 burn", start: 13, end: 18, stage: "Stage 2", telemetry: "Upper stage continues accelerating toward orbital velocity." },
  { name: "Fairing jettison", start: 18, end: 21, stage: "Stage 2", telemetry: "Fairing halves split apart after atmospheric ascent." },
  { name: "Coast to insertion", start: 21, end: 24, stage: "Coast", telemetry: "Vehicle coasts while the horizon comes into view." },
  { name: "Orbit insertion", start: 24, end: 27, stage: "Insertion", telemetry: "Target orbit ring fades in around Earth." },
  { name: "Payload deploy", start: 27, end: 31, stage: "Payload", telemetry: "Satellites deploy one by one into the target shell." },
  { name: "Constellation spread", start: 31, end: 34, stage: "Payload", telemetry: "Payloads begin spacing along the orbital ring." },
  { name: "Mission complete", start: 34, end: 36, stage: "Complete", telemetry: "Deployment complete and launch impact model updated." }
];
const LAUNCH_SEQUENCE_DURATION = LAUNCH_SEQUENCE_PHASES[LAUNCH_SEQUENCE_PHASES.length - 1].end;
const MISSION_REPLAY_DURATION = 72;
const MISSION_REPLAY_PHASES = {
  launch: [
    { name: "Countdown", start: 0, end: 8, callout: "Mission timeline armed and weather/range checks complete." },
    { name: "Liftoff", start: 8, end: 16, callout: "Vehicle clears the pad and begins ascent through the lower atmosphere." },
    { name: "Max-Q", start: 16, end: 23, callout: "Peak aerodynamic pressure; guidance holds the planned trajectory." },
    { name: "Stage separation", start: 23, end: 31, callout: "First stage drops away while the upper stage continues to orbit." },
    { name: "Orbit insertion", start: 31, end: 43, callout: "The target altitude shell lights up as the mission reaches orbital velocity." },
    { name: "Payload deployment", start: 43, end: 58, callout: "Satellites deploy and spread along the assigned orbit ring." },
    { name: "Impact analysis", start: 58, end: 72, callout: "OrbitGuard compares before/after congestion and writes the mission autopsy." }
  ],
  event: [
    { name: "Before event", start: 0, end: 12, callout: "Baseline traffic is monitored before the debris-producing event." },
    { name: "Close approach", start: 12, end: 24, callout: "Objects converge through a dense orbital shell." },
    { name: "Event moment", start: 24, end: 34, callout: "A collision, breakup, test, or storm event changes the orbital environment." },
    { name: "Debris expansion", start: 34, end: 54, callout: "Fragments spread along the affected altitude band." },
    { name: "Long-term assessment", start: 54, end: 72, callout: "OrbitGuard summarizes sustainability consequences and operating lessons." }
  ]
};
const HISTORICAL_REPLAY_SCENARIOS = {
  "iridium-cosmos": {
    name: "Iridium 33 / Cosmos 2251 Collision",
    type: "event",
    year: 2009,
    altitude: 790,
    band: "700-900",
    inclination: 86.4,
    payloads: 0,
    rocketBodies: 0,
    debris: 2000,
    riskIndex: 88,
    riskLevel: "High",
    congestionChange: 18.6,
    description: "Two intact satellites collided at hypervelocity in LEO, creating a long-lived debris cloud across a valuable altitude range.",
    wentWell: "The event improved global awareness of conjunction screening and public space debris tracking.",
    increasedRisk: "Thousands of fragments raised collision exposure in the 700-900 km region.",
    redesign: "Operational satellites need continuous conjunction assessment and retired spacecraft need reliable disposal plans."
  },
  fengyun: {
    name: "Fengyun-1C ASAT Test",
    type: "event",
    year: 2007,
    altitude: 865,
    band: "800-900",
    inclination: 98.6,
    payloads: 0,
    rocketBodies: 0,
    debris: 3200,
    riskIndex: 94,
    riskLevel: "Critical",
    congestionChange: 31.4,
    description: "A kinetic anti-satellite test destroyed Fengyun-1C and produced one of the largest long-lived debris clouds in orbit.",
    wentWell: "The event became a clear policy example for why destructive debris tests are unsustainable.",
    increasedRisk: "The debris cloud populated sun-synchronous altitudes used by Earth observation satellites.",
    redesign: "Avoid debris-generating tests and use non-destructive verification for space security missions."
  },
  kosmos: {
    name: "Kosmos 1408 Debris Event",
    type: "event",
    year: 2021,
    altitude: 480,
    band: "400-600",
    inclination: 82.5,
    payloads: 0,
    rocketBodies: 0,
    debris: 1500,
    riskIndex: 86,
    riskLevel: "High",
    congestionChange: 14.2,
    description: "The breakup of Kosmos 1408 created fragments that produced immediate operational concern for crewed and uncrewed spacecraft.",
    wentWell: "Tracking networks rapidly cataloged fragments and operators reviewed avoidance procedures.",
    increasedRisk: "A sudden debris field increased alert volume in already active LEO traffic lanes.",
    redesign: "International norms should discourage destructive debris events in crewed and commercial orbital regions."
  },
  "starlink-storm": {
    name: "Starlink Geomagnetic Storm Loss",
    type: "event",
    year: 2022,
    altitude: 210,
    band: "200-300",
    inclination: 53,
    payloads: 49,
    rocketBodies: 0,
    debris: 0,
    riskIndex: 62,
    riskLevel: "Medium",
    congestionChange: 4.8,
    description: "A geomagnetic storm increased drag after deployment, preventing many satellites from raising orbit and causing reentry.",
    wentWell: "The low deployment orbit reduced long-term debris persistence because failed satellites reentered.",
    increasedRisk: "The event exposed how space weather can erase ascent margins and mission availability.",
    redesign: "Deployment plans should include storm holds, higher drag margins, and real-time space weather constraints."
  }
};
const TRAFFIC_ALTITUDE_SHELLS = [
  { label: "300-400 km", min: 300, max: 400 },
  { label: "400-500 km", min: 400, max: 500 },
  { label: "500-600 km", min: 500, max: 600 },
  { label: "600-700 km", min: 600, max: 700 },
  { label: "700-800 km", min: 700, max: 800 },
  { label: "800-900 km", min: 800, max: 900 },
  { label: "GEO belt", min: 33000, max: 41000 }
];
const MISSION_TEMPLATES = {
  internet: [
    { id: "internet-low-risk", name: "Low-Risk LEO Network", satellites: 24, altitude: 500, inclination: 53, lifetime: 5, deorbitPlan: true, rocketBodyRemains: false, coverage: 65, cost: 60, summary: "Lower satellite count and a low LEO shell keep persistence and debris risk controlled." },
    { id: "internet-balanced", name: "Balanced Broadband Network", satellites: 48, altitude: 550, inclination: 53, lifetime: 5, deorbitPlan: true, rocketBodyRemains: false, coverage: 82, cost: 75, summary: "More coverage while staying in a manageable LEO shell with planned deorbit." },
    { id: "internet-high-coverage", name: "High-Coverage Persistent Network", satellites: 90, altitude: 1200, inclination: 60, lifetime: 12, deorbitPlan: false, rocketBodyRemains: true, coverage: 95, cost: 95, summary: "Strong coverage, but high persistence and leftover upper-stage risk make it harder to justify." }
  ],
  earthObservation: [
    { id: "eo-sustainable", name: "Sustainable Imaging Mission", satellites: 8, altitude: 500, inclination: 97, lifetime: 4, deorbitPlan: true, rocketBodyRemains: false, coverage: 58, cost: 45, summary: "Small sun-synchronous style mission with short lifetime and strong disposal posture." },
    { id: "eo-balanced", name: "Sun-Synchronous Imaging Network", satellites: 16, altitude: 650, inclination: 98, lifetime: 7, deorbitPlan: true, rocketBodyRemains: false, coverage: 78, cost: 68, summary: "Good revisit rate, useful coverage, and manageable deorbit compliance." },
    { id: "eo-revisit", name: "High-Revisit Imaging Constellation", satellites: 40, altitude: 750, inclination: 98, lifetime: 10, deorbitPlan: false, rocketBodyRemains: true, coverage: 92, cost: 90, summary: "High imaging cadence, but more objects in debris-sensitive polar orbit." }
  ],
  communications: [
    { id: "comms-clean-relay", name: "Clean Regional Relay", satellites: 12, altitude: 520, inclination: 45, lifetime: 5, deorbitPlan: true, rocketBodyRemains: false, coverage: 62, cost: 52, summary: "A compact regional relay architecture that emphasizes disposal and low persistence." },
    { id: "comms-resilient", name: "Resilient Relay Mesh", satellites: 30, altitude: 780, inclination: 55, lifetime: 8, deorbitPlan: true, rocketBodyRemains: false, coverage: 84, cost: 78, summary: "More robust relay coverage with moderate altitude and strong deorbit planning." },
    { id: "comms-persistent", name: "Persistent High-Relay Network", satellites: 64, altitude: 1400, inclination: 63, lifetime: 15, deorbitPlan: false, rocketBodyRemains: true, coverage: 96, cost: 96, summary: "Maximum relay persistence, but long orbital lifetime creates serious sustainability pressure." }
  ],
  science: [
    { id: "science-cubesat", name: "Clean CubeSat Science Cluster", satellites: 6, altitude: 430, inclination: 51.6, lifetime: 3, deorbitPlan: true, rocketBodyRemains: false, coverage: 48, cost: 35, summary: "Low-cost mission with fast natural decay and minimal congestion impact." },
    { id: "science-distributed", name: "Distributed Science Network", satellites: 18, altitude: 600, inclination: 72, lifetime: 6, deorbitPlan: true, rocketBodyRemains: false, coverage: 74, cost: 66, summary: "A broader measurement network with balanced risk and coverage." },
    { id: "science-extended", name: "Extended Lifetime Science Web", satellites: 32, altitude: 1000, inclination: 82, lifetime: 12, deorbitPlan: false, rocketBodyRemains: false, coverage: 88, cost: 84, summary: "Long observation lifetime, but high altitude and weak disposal reduce sustainability." }
  ]
};
const SOLAR_ENVIRONMENTS = {
  earth: {
    label: "Earth Orbit",
    title: "3D Earth Orbit Visualizer",
    body: "Earth",
    challenge: "Orbital congestion and debris risk",
    risk: "Medium",
    concern: "LEO crowding, rocket bodies, fragments, and long-lived debris.",
    recommendation: "Use deorbit planning, passivation, shared tracking data, and avoid already crowded altitude bands."
  },
  moon: {
    label: "Moon Orbit",
    title: "OrbitGuard Lunar Environment",
    body: "Moon",
    challenge: "Reliable far-side communication",
    risk: "Emerging",
    concern: "Future lunar relay networks could clutter stable lunar orbital regions without disposal plans.",
    recommendation: "Use small relay constellations, disposal burns, and shared cislunar traffic coordination."
  },
  mars: {
    label: "Mars Orbit",
    title: "OrbitGuard Mars Relay Planner",
    body: "Mars",
    challenge: "Communication delay and autonomous operations",
    risk: "Moderate",
    concern: "Long-lived orbiters and relay satellites need end-of-mission planning before Mars traffic grows.",
    recommendation: "Design relay networks with autonomy, fuel margins, and disposal or aerobraking plans."
  },
  sun: {
    label: "Solar Weather",
    title: "OrbitGuard Solar Weather Mode",
    body: "Sun",
    challenge: "Space weather effects on satellites",
    risk: "Variable",
    concern: "Geomagnetic storms raise LEO drag, shorten lifetimes, disrupt radio links, and increase operations risk.",
    recommendation: "Monitor Kp, F10.7, solar wind, and keep extra maneuver margin for LEO spacecraft."
  },
  overview: {
    label: "Solar System View",
    title: "Interplanetary Sustainability Planner",
    body: "Solar System",
    challenge: "Responsible expansion beyond Earth orbit",
    risk: "Future-facing",
    concern: "Human missions can repeat Earth-orbit debris mistakes around the Moon, Mars, and other destinations.",
    recommendation: "Compare mission environments early and design disposal, autonomy, and governance into each architecture."
  }
};

const state = {
  mode: "home",
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
  solarSystem: {
    environment: "earth"
  },
  studio: {
    missionType: "internet",
    targetRegion: "northAmerica",
    riskTolerance: "low",
    priorities: {
      coverage: 70,
      sustainability: 95,
      cost: 60,
      risk: 85
    },
    selectedId: "internet-low-risk",
    savedScenarios: [],
    previewFrame: 0
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
  comparison: {
    seeded: false,
    selectedId: null,
    missions: []
  },
  missionReplay: {
    scenarioId: "custom",
    cameraMode: "mission-control",
    clock: 0,
    playing: true,
    lastFrame: 0,
    lastDomRender: 0,
    animationId: null
  },
  traffic: {
    selectedAlertId: null,
    maneuver: "lower",
    forecastYears: 10,
    emergencyActive: false,
    emergencyFragments: 0,
    commandLog: [],
    animationId: null
  },
  display: { ...DEFAULT_DISPLAY_SETTINGS },
  timeMachine: {
    selectedYear: 2010,
    currentYear: new Date().getFullYear(),
    showPayloads: true,
    showDebris: true,
    showRocketBodies: true,
    showOther: true
  },
  weather: {
    space: null,
    groundNetwork: null,
    selectedStation: "goldstone",
    selectedGround: null,
    loading: false,
    error: null
  },
  encyclopedia: {
    metadata: null,
    categories: [],
    topics: [],
    filtered: [],
    selectedCategory: "all",
    selectedDepth: "all",
    search: "",
    selectedTopicId: null,
    selectedArticle: null,
    factCheck: null,
    loading: false,
    error: null
  },
  three: {
    THREE: null,
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    root: null,
    earthSystem: null,
    earth: null,
    earthMarkers: null,
    atmosphere: null,
    clouds: null,
    orbitTrailGroup: null,
    objectPoints: null,
    launchPoints: null,
    modelGroup: null,
    environmentGroup: null,
    animationId: null,
    ready: false,
    fallback: false
  },
  launchSequence: {
    THREE: null,
    renderer: null,
    scene: null,
    camera: null,
    root: null,
    rocket: null,
    stageOne: null,
    stageTwo: null,
    fairingGroup: null,
    fairingHalves: [],
    satelliteGroup: null,
    satellites: [],
    launchPad: null,
    skyShell: null,
    starField: null,
    issReference: null,
    plume: null,
    plumePositions: null,
    plumeVelocities: null,
    plumeLife: null,
    plumeColors: null,
    earth: null,
    earthClouds: null,
    atmosphere: null,
    orbitRing: null,
    horizon: null,
    clock: 0,
    lastFrame: 0,
    phaseIndex: 0,
    playing: true,
    initializing: false,
    ready: false,
    fallback: false,
    animationId: null
  }
};

const elements = {
  dataSource: document.querySelector("#dataSource"),
  modeTabs: document.querySelectorAll(".mode-tab"),
  modeJumps: document.querySelectorAll(".mode-jump"),
  modePanels: document.querySelectorAll(".mode-panel"),
  settingsToggle: document.querySelector("#settingsToggle"),
  settingsDrawer: document.querySelector("#settingsDrawer"),
  settingsClose: document.querySelector("#settingsClose"),
  settingsBackdrop: document.querySelector("#settingsBackdrop"),
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
  gravityCursor: document.querySelector("#gravity-cursor"),
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
  environmentSelect: document.querySelector("#environmentSelect"),
  orbitTrailToggles: document.querySelectorAll(".orbit-trails-toggle"),
  orbitViewerTitle: document.querySelector("#orbitViewerTitle"),
  solarSystemPanel: document.querySelector("#solarSystemPanel"),
  metricObjects: document.querySelector("#metricObjects"),
  metricActive: document.querySelector("#metricActive"),
  metricDebris: document.querySelector("#metricDebris"),
  metricRocketBodies: document.querySelector("#metricRocketBodies"),
  metricCrowdedBand: document.querySelector("#metricCrowdedBand"),
  metricCrowdedBandNote: document.querySelector("#metricCrowdedBandNote"),
  metricRisk: document.querySelector("#metricRisk"),
  metricRiskNote: document.querySelector("#metricRiskNote"),
  weatherUpdated: document.querySelector("#weatherUpdated"),
  weatherRefreshDashboard: document.querySelector("#weatherRefreshDashboard"),
  dashKpValue: document.querySelector("#dashKpValue"),
  dashKpLevel: document.querySelector("#dashKpLevel"),
  dashF107Value: document.querySelector("#dashF107Value"),
  dashF107Note: document.querySelector("#dashF107Note"),
  dashSolarWindValue: document.querySelector("#dashSolarWindValue"),
  dashSolarWindNote: document.querySelector("#dashSolarWindNote"),
  dashDragValue: document.querySelector("#dashDragValue"),
  dashDragNote: document.querySelector("#dashDragNote"),
  groundStationDigest: document.querySelector("#groundStationDigest"),
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
  downloadEncyclopediaIndex: document.querySelector("#downloadEncyclopediaIndex"),
  encyclopediaTopicCount: document.querySelector("#encyclopediaTopicCount"),
  encyclopediaCategoryCount: document.querySelector("#encyclopediaCategoryCount"),
  encyclopediaCachedCount: document.querySelector("#encyclopediaCachedCount"),
  encyclopediaWordCount: document.querySelector("#encyclopediaWordCount"),
  encyclopediaSearch: document.querySelector("#encyclopediaSearch"),
  encyclopediaCategory: document.querySelector("#encyclopediaCategory"),
  encyclopediaDepth: document.querySelector("#encyclopediaDepth"),
  encyclopediaCategoryCards: document.querySelector("#encyclopediaCategoryCards"),
  encyclopediaResultsTitle: document.querySelector("#encyclopediaResultsTitle"),
  encyclopediaStatus: document.querySelector("#encyclopediaStatus"),
  encyclopediaTopicGrid: document.querySelector("#encyclopediaTopicGrid"),
  encyclopediaArticlePanel: document.querySelector("#encyclopediaArticlePanel"),
  articleCategory: document.querySelector("#articleCategory"),
  articleTitle: document.querySelector("#articleTitle"),
  articleMeta: document.querySelector("#articleMeta"),
  articleBody: document.querySelector("#articleBody"),
  relatedTopics: document.querySelector("#relatedTopics"),
  factCheckResults: document.querySelector("#factCheckResults"),
  articleTransparency: document.querySelector("#articleTransparency"),
  generateArticle: document.querySelector("#generateArticle"),
  factCheckArticle: document.querySelector("#factCheckArticle"),
  downloadArticle: document.querySelector("#downloadArticle"),
  weatherRefresh: document.querySelector("#weatherRefresh"),
  downloadWeatherSnapshot: document.querySelector("#downloadWeatherSnapshot"),
  weatherStatus: document.querySelector("#weatherStatus"),
  weatherKpValue: document.querySelector("#weatherKpValue"),
  weatherKpNote: document.querySelector("#weatherKpNote"),
  weatherStormLevel: document.querySelector("#weatherStormLevel"),
  weatherStormNote: document.querySelector("#weatherStormNote"),
  weatherF107Value: document.querySelector("#weatherF107Value"),
  weatherF107Note: document.querySelector("#weatherF107Note"),
  weatherSolarWindValue: document.querySelector("#weatherSolarWindValue"),
  weatherSolarWindNote: document.querySelector("#weatherSolarWindNote"),
  weatherDragMultiplier: document.querySelector("#weatherDragMultiplier"),
  weatherDragNote: document.querySelector("#weatherDragNote"),
  weatherAlertCount: document.querySelector("#weatherAlertCount"),
  weatherAlertNote: document.querySelector("#weatherAlertNote"),
  dragImpactBands: document.querySelector("#dragImpactBands"),
  solarCycleCurrent: document.querySelector("#solarCycleCurrent"),
  solarCycleChart: document.querySelector("#solarCycleChart"),
  solarCycleNote: document.querySelector("#solarCycleNote"),
  starlinkIncidentStats: document.querySelector("#starlinkIncidentStats"),
  spaceWeatherAlerts: document.querySelector("#spaceWeatherAlerts"),
  groundStationSelect: document.querySelector("#groundStationSelect"),
  customGroundName: document.querySelector("#customGroundName"),
  customGroundLat: document.querySelector("#customGroundLat"),
  customGroundLon: document.querySelector("#customGroundLon"),
  useCustomStation: document.querySelector("#useCustomStation"),
  groundStationName: document.querySelector("#groundStationName"),
  groundStationMeta: document.querySelector("#groundStationMeta"),
  groundPrimaryStatus: document.querySelector("#groundPrimaryStatus"),
  groundCondition: document.querySelector("#groundCondition"),
  groundTemperature: document.querySelector("#groundTemperature"),
  groundRain: document.querySelector("#groundRain"),
  groundRainNote: document.querySelector("#groundRainNote"),
  groundClouds: document.querySelector("#groundClouds"),
  groundOpticalNote: document.querySelector("#groundOpticalNote"),
  groundWind: document.querySelector("#groundWind"),
  groundWindNote: document.querySelector("#groundWindNote"),
  groundVisibility: document.querySelector("#groundVisibility"),
  groundLaserNote: document.querySelector("#groundLaserNote"),
  kaAttenuation: document.querySelector("#kaAttenuation"),
  kaAttenuationNote: document.querySelector("#kaAttenuationNote"),
  opticalScore: document.querySelector("#opticalScore"),
  opticalScoreNote: document.querySelector("#opticalScoreNote"),
  antennaStatus: document.querySelector("#antennaStatus"),
  antennaStatusNote: document.querySelector("#antennaStatusNote"),
  laserStatus: document.querySelector("#laserStatus"),
  clearWindow: document.querySelector("#clearWindow"),
  groundNetworkCards: document.querySelector("#groundNetworkCards"),
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
  studioMissionType: document.querySelector("#studioMissionType"),
  studioTargetRegion: document.querySelector("#studioTargetRegion"),
  studioRiskTolerance: document.querySelector("#studioRiskTolerance"),
  studioCoveragePriority: document.querySelector("#studioCoveragePriority"),
  studioSustainabilityPriority: document.querySelector("#studioSustainabilityPriority"),
  studioCostPriority: document.querySelector("#studioCostPriority"),
  studioRiskPriority: document.querySelector("#studioRiskPriority"),
  studioCoverageValue: document.querySelector("#studioCoverageValue"),
  studioSustainabilityValue: document.querySelector("#studioSustainabilityValue"),
  studioCostValue: document.querySelector("#studioCostValue"),
  studioRiskValue: document.querySelector("#studioRiskValue"),
  studioWarnings: document.querySelector("#studioWarnings"),
  studioSaveScenario: document.querySelector("#studioSaveScenario"),
  studioDownloadJson: document.querySelector("#studioDownloadJson"),
  studioDownloadTxt: document.querySelector("#studioDownloadTxt"),
  studioOptionCount: document.querySelector("#studioOptionCount"),
  studioMissionOptions: document.querySelector("#studioMissionOptions"),
  studioComparisonHead: document.querySelector("#studioComparisonHead"),
  studioComparisonBody: document.querySelector("#studioComparisonBody"),
  studioPreviewTitle: document.querySelector("#studioPreviewTitle"),
  studioScoreRing: document.querySelector("#studioScoreRing"),
  studioScoreValue: document.querySelector("#studioScoreValue"),
  studioPreviewCanvas: document.querySelector("#studioPreviewCanvas"),
  studioTradeoffs: document.querySelector("#studioTradeoffs"),
  studioAutopsy: document.querySelector("#studioAutopsy"),
  studioRedesignBox: document.querySelector("#studioRedesignBox"),
  studioReportPreview: document.querySelector("#studioReportPreview"),
  studioSavedScenarios: document.querySelector("#studioSavedScenarios"),
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
  launchSequenceViewport: document.querySelector("#launchSequenceViewport"),
  launchSequenceCanvas: document.querySelector("#launchSequenceCanvas"),
  launchPlayPause: document.querySelector("#launchPlayPause"),
  launchRestart: document.querySelector("#launchRestart"),
  launchPhaseList: document.querySelector("#launchPhaseList"),
  launchPhaseLabel: document.querySelector("#launchPhaseLabel"),
  launchClock: document.querySelector("#launchClock"),
  launchTelemetry: document.querySelector("#launchTelemetry"),
  launchScrubber: document.querySelector("#launchScrubber"),
  launchScrubberLabel: document.querySelector("#launchScrubberLabel"),
  launchVizAltitude: document.querySelector("#launchVizAltitude"),
  launchVizVelocity: document.querySelector("#launchVizVelocity"),
  launchVizSatellites: document.querySelector("#launchVizSatellites"),
  launchVizStage: document.querySelector("#launchVizStage"),
  addCurrentMission: document.querySelector("#addCurrentMission"),
  loadComparisonPresets: document.querySelector("#loadComparisonPresets"),
  clearComparisonMissions: document.querySelector("#clearComparisonMissions"),
  downloadComparisonReport: document.querySelector("#downloadComparisonReport"),
  missionComparisonSummary: document.querySelector("#missionComparisonSummary"),
  missionPresetButtons: document.querySelector("#missionPresetButtons"),
  missionComparisonRows: document.querySelector("#missionComparisonRows"),
  missionReportCard: document.querySelector("#missionReportCard"),
  missionReplayScenario: document.querySelector("#missionReplayScenario"),
  missionReplayCamera: document.querySelector("#missionReplayCamera"),
  missionReplayPlayPause: document.querySelector("#missionReplayPlayPause"),
  missionReplayRestart: document.querySelector("#missionReplayRestart"),
  downloadMissionAutopsy: document.querySelector("#downloadMissionAutopsy"),
  replaySustainabilityScore: document.querySelector("#replaySustainabilityScore"),
  replayScoreNote: document.querySelector("#replayScoreNote"),
  replayObjectsAdded: document.querySelector("#replayObjectsAdded"),
  replayObjectsNote: document.querySelector("#replayObjectsNote"),
  replayAffectedBand: document.querySelector("#replayAffectedBand"),
  replayBandNote: document.querySelector("#replayBandNote"),
  replayCongestionChange: document.querySelector("#replayCongestionChange"),
  replayRiskLevel: document.querySelector("#replayRiskLevel"),
  replayRiskNote: document.querySelector("#replayRiskNote"),
  replayCurrentPhase: document.querySelector("#replayCurrentPhase"),
  replayPhaseNote: document.querySelector("#replayPhaseNote"),
  replayClock: document.querySelector("#replayClock"),
  missionReplayCanvas: document.querySelector("#missionReplayCanvas"),
  replayHudPhase: document.querySelector("#replayHudPhase"),
  replayHudCallout: document.querySelector("#replayHudCallout"),
  replayAltitude: document.querySelector("#replayAltitude"),
  replayVelocity: document.querySelector("#replayVelocity"),
  replayInclination: document.querySelector("#replayInclination"),
  replayPayloads: document.querySelector("#replayPayloads"),
  missionReplayScrubber: document.querySelector("#missionReplayScrubber"),
  missionReplayScrubberLabel: document.querySelector("#missionReplayScrubberLabel"),
  missionReplayTimeline: document.querySelector("#missionReplayTimeline"),
  missionAutopsy: document.querySelector("#missionAutopsy"),
  triggerDebrisEvent: document.querySelector("#triggerDebrisEvent"),
  resetTrafficEvent: document.querySelector("#resetTrafficEvent"),
  downloadTrafficReport: document.querySelector("#downloadTrafficReport"),
  trafficTrackedObjects: document.querySelector("#trafficTrackedObjects"),
  trafficActivePayloads: document.querySelector("#trafficActivePayloads"),
  trafficDebrisObjects: document.querySelector("#trafficDebrisObjects"),
  trafficHighRiskPasses: document.querySelector("#trafficHighRiskPasses"),
  trafficCrowdedBand: document.querySelector("#trafficCrowdedBand"),
  trafficCrowdedBandNote: document.querySelector("#trafficCrowdedBandNote"),
  trafficDragRisk: document.querySelector("#trafficDragRisk"),
  trafficDragRiskNote: document.querySelector("#trafficDragRiskNote"),
  trafficMapCanvas: document.querySelector("#trafficMapCanvas"),
  trafficAlertFeed: document.querySelector("#trafficAlertFeed"),
  trafficRadarStatus: document.querySelector("#trafficRadarStatus"),
  trafficRadarCanvas: document.querySelector("#trafficRadarCanvas"),
  selectedTrafficAlert: document.querySelector("#selectedTrafficAlert"),
  maneuverSelect: document.querySelector("#maneuverSelect"),
  simulateManeuver: document.querySelector("#simulateManeuver"),
  maneuverResult: document.querySelector("#maneuverResult"),
  trafficHealthMap: document.querySelector("#trafficHealthMap"),
  trafficForecastYears: document.querySelector("#trafficForecastYears"),
  trafficForecast: document.querySelector("#trafficForecast"),
  operatorSatelliteSelect: document.querySelector("#operatorSatelliteSelect"),
  operatorView: document.querySelector("#operatorView"),
  trafficCommandLog: document.querySelector("#trafficCommandLog"),
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

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
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

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function easeInOut(amount) {
  const t = clamp(amount, 0, 1);
  return t * t * (3 - 2 * t);
}

function phaseProgress(time, phaseName) {
  const phase = LAUNCH_SEQUENCE_PHASES.find((item) => item.name === phaseName);

  if (!phase) {
    return 0;
  }

  return clamp((time - phase.start) / (phase.end - phase.start), 0, 1);
}

function currentLaunchPhase(time) {
  const clampedTime = clamp(time, 0, LAUNCH_SEQUENCE_DURATION);
  return LAUNCH_SEQUENCE_PHASES.find((phase) => clampedTime >= phase.start && clampedTime < phase.end) || LAUNCH_SEQUENCE_PHASES[LAUNCH_SEQUENCE_PHASES.length - 1];
}

function formatMissionClock(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `T+${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
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
  elements.gravityCursor.checked = Boolean(state.display.gravityCursor);
  elements.reduceMotion.checked = state.display.reduceMotion;
  elements.largeText.checked = state.display.largeText;
  elements.highContrastToggle.checked = state.display.theme === "high-contrast";
  syncOrbitTrailControls();
}

function syncOrbitTrailControls() {
  for (const toggle of elements.orbitTrailToggles) {
    toggle.checked = Boolean(state.display.showOrbitTrails);
  }
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
  document.documentElement.classList.toggle("gravity-cursor-disabled", !state.display.gravityCursor);

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
    if (state.launchSequence.fallback) {
      renderLaunchFallbackCanvas();
    }

    if (state.launchSequence.ready) {
      state.launchSequence.orbitRing.material.color.set(hexToNumber(readCssVar("--simulated-color", "#a78bfa")));
      state.launchSequence.atmosphere.material.color.set(hexToNumber(readCssVar("--accent", "#60a5fa")));
      setLaunchSequenceTime(state.launchSequence.clock || 0, 0);
    }
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

function signedPercent(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${Math.round(value)}%`;
}

function observedTime(value) {
  if (!value) {
    return "time unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "time unavailable";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function weatherSeverityColor(label = "") {
  const normalized = String(label).toLowerCase();

  if (normalized.includes("g4") || normalized.includes("g5") || normalized.includes("must stow") || normalized.includes("offline") || normalized.includes("severe")) {
    return readCssVar("--danger", "#f87171");
  }

  if (normalized.includes("g2") || normalized.includes("g3") || normalized.includes("approaching") || normalized.includes("marginal") || normalized.includes("poor") || normalized.includes("elevated")) {
    return readCssVar("--warning", "#facc15");
  }

  return readCssVar("--success", "#86efac");
}

function selectedGroundWeather() {
  if (state.weather.selectedGround) {
    return state.weather.selectedGround;
  }

  return state.weather.groundNetwork?.stations?.find((item) => item.station?.id === state.weather.selectedStation) || null;
}

async function fetchJsonEndpoint(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(`${url} returned ${contentType || "non-JSON content"}`);
  }

  return response.json();
}

async function loadWeatherData() {
  state.weather.loading = true;
  state.weather.error = null;
  renderWeatherLoading();

  try {
    const [space, groundNetwork] = await Promise.all([
      fetchJsonEndpoint("/api/v1/weather/space"),
      fetchJsonEndpoint("/api/v1/weather/ground?station=all")
    ]);
    state.weather.space = space;
    state.weather.groundNetwork = groundNetwork;
    state.weather.selectedGround = null;
    state.weather.loading = false;
    renderWeather();
  } catch (error) {
    state.weather.loading = false;
    state.weather.error = error.message;
    renderWeather();
  }
}

async function loadCustomGroundStation() {
  const lat = Number(elements.customGroundLat.value);
  const lon = Number(elements.customGroundLon.value);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    elements.weatherStatus.textContent = "Enter a valid latitude and longitude for the custom station.";
    return;
  }

  const name = elements.customGroundName.value.trim() || "Custom Station";
  state.weather.loading = true;
  elements.weatherStatus.textContent = "Loading custom ground station weather...";

  try {
    const params = new URLSearchParams({
      name,
      lat: String(lat),
      lon: String(lon)
    });
    state.weather.selectedStation = "custom";
    state.weather.selectedGround = await fetchJsonEndpoint(`/api/v1/weather/ground?${params}`);
    state.weather.loading = false;
    renderWeather();
  } catch (error) {
    state.weather.loading = false;
    state.weather.error = error.message;
    renderWeather();
  }
}

function renderWeatherLoading() {
  if (elements.weatherStatus) {
    elements.weatherStatus.textContent = "Loading live NOAA and ground-station weather feeds...";
  }

  if (elements.weatherUpdated) {
    elements.weatherUpdated.textContent = "Loading weather...";
  }
}

function renderWeather() {
  renderDashboardWeather();
  renderWeatherOps();
  if (state.mode === "traffic") {
    renderTrafficControl();
  }
}

function renderDashboardWeather() {
  const space = state.weather.space;
  const ground = selectedGroundWeather();

  if (state.weather.error) {
    elements.weatherUpdated.textContent = "Weather feed error";
    elements.groundStationDigest.textContent = state.weather.error;
    return;
  }

  if (!space) {
    renderWeatherLoading();
    return;
  }

  const kp = space.kp?.value ?? 0;
  const f107 = space.f107?.flux ?? 0;
  const wind = space.solarWind?.speedKmS ?? 0;
  const density = space.solarWind?.densityPcm3 ?? 0;
  const timelineChange = space.drag?.deorbitTimelineChangePercent ?? 0;

  elements.weatherUpdated.textContent = `Updated ${observedTime(space.generatedAt)}`;
  elements.dashKpValue.textContent = decimal(kp, 1);
  elements.dashKpLevel.textContent = `${space.kp?.stormLevel?.code || "G0"} - ${space.kp?.stormLevel?.label || "Quiet"}`;
  elements.dashF107Value.textContent = `${Math.round(f107)} sfu`;
  elements.dashF107Note.textContent = `${signedPercent(space.f107?.percentAboveSolarMinimum || 0)} vs solar-min baseline`;
  elements.dashSolarWindValue.textContent = wind ? `${Math.round(wind)} km/s` : "-";
  elements.dashSolarWindNote.textContent = `${decimal(density || 0, 1)} p/cm³ particle density`;
  elements.dashDragValue.textContent = signedPercent(timelineChange);
  elements.dashDragNote.textContent = "Estimated LEO lifetime change";

  if (ground?.ok) {
    const station = ground.station;
    const operations = ground.operations;
    elements.groundStationDigest.innerHTML = `
      <strong>${station.name}</strong>: ${ground.current.condition} -
      Ka-band ${decimal(operations.kaBandAttenuationDb, 1)} dB fade,
      optical tracking ${operations.opticalQuality.toLowerCase()},
      antenna ${operations.antennaStatus.toLowerCase()}.
    `;
  } else {
    elements.groundStationDigest.textContent = "Ground station weather loading...";
  }
}

function renderWeatherOps() {
  const space = state.weather.space;
  const ground = selectedGroundWeather();

  if (state.weather.error) {
    elements.weatherStatus.textContent = `Weather feed error: ${state.weather.error}`;
    return;
  }

  if (!space) {
    renderWeatherLoading();
    return;
  }

  const storm = space.kp?.stormLevel || { code: "G0", label: "Quiet" };
  const solarWind = space.solarWind || {};
  const dragChange = space.drag?.deorbitTimelineChangePercent ?? 0;
  const alertCount = space.activeAlerts?.length || 0;
  const stormColor = weatherSeverityColor(storm.code);

  elements.weatherStatus.textContent = `Live feeds loaded from NOAA SWPC and ground weather APIs. Space weather generated ${observedTime(space.generatedAt)}.`;
  elements.weatherKpValue.textContent = decimal(space.kp?.value || 0, 1);
  elements.weatherKpNote.textContent = `Observed ${observedTime(space.kp?.observedAt)}`;
  elements.weatherStormLevel.textContent = storm.code;
  elements.weatherStormLevel.style.color = stormColor;
  elements.weatherStormNote.textContent = storm.label;
  elements.weatherF107Value.textContent = `${Math.round(space.f107?.flux || 0)} sfu`;
  elements.weatherF107Note.textContent = `${signedPercent(space.f107?.percentAboveSolarMinimum || 0)} vs solar minimum; 90-day mean ${Math.round(space.f107?.ninetyDayMean || 0) || "-"}`;
  elements.weatherSolarWindValue.textContent = solarWind.speedKmS ? `${Math.round(solarWind.speedKmS)} km/s` : "-";
  elements.weatherSolarWindNote.textContent = `${decimal(solarWind.densityPcm3 || 0, 1)} p/cm³, observed ${observedTime(solarWind.observedAt)}`;
  elements.weatherDragMultiplier.textContent = `${decimal(space.drag?.multiplier || 1, 2)}x`;
  elements.weatherDragNote.textContent = space.drag?.interpretation || "Drag model unavailable.";
  elements.weatherAlertCount.textContent = numberFormat(alertCount);
  elements.weatherAlertNote.textContent = alertCount ? "Review current NOAA messages below" : "No active alerts returned";

  renderDragImpactBands(space);
  renderSolarCycle(space);
  renderSpaceWeatherAlerts(space);
  renderStarlinkIncident(space);
  renderGroundStation(ground);
  renderGroundNetwork();
}

function renderDragImpactBands(space) {
  const impacts = space.altitudeImpacts || [];

  if (!impacts.length) {
    elements.dragImpactBands.innerHTML = "<p class=\"empty-state\">Drag impact data unavailable</p>";
    return;
  }

  const max = Math.max(1, ...impacts.map((impact) => impact.densityMultiplier));
  elements.dragImpactBands.innerHTML = impacts
    .map((impact) => {
      const color = weatherSeverityColor(impact.risk);
      return `
        <div class="weather-band-row">
          <span>${impact.band}</span>
          <div class="bar-track"><div class="bar-fill" style="--value: ${(impact.densityMultiplier / max) * 100}%; --bar-color: ${color}"></div></div>
          <strong>${decimal(impact.densityMultiplier, 2)}x</strong>
          <small>${impact.shell}: ${impact.risk}, natural deorbit timeline shift ${signedPercent(impact.deorbitTimelineChangePercent)}.</small>
        </div>
      `;
    })
    .join("");
}

function renderSolarCycle(space) {
  const points = space.solarCycle?.points || [];
  const latest = space.f107?.flux || 0;
  elements.solarCycleCurrent.textContent = latest ? `${Math.round(latest)} sfu now` : "-";
  elements.solarCycleNote.textContent = `${space.solarCycle?.currentCycle || "Solar cycle"}: current F10.7 is ${signedPercent(space.f107?.percentAboveSolarMinimum || 0)} above a 70 sfu solar-minimum baseline.`;

  if (points.length < 2) {
    elements.solarCycleChart.innerHTML = "<p class=\"empty-state\">Solar cycle history unavailable</p>";
    return;
  }

  const width = 900;
  const height = 280;
  const padding = { left: 48, right: 18, top: 18, bottom: 34 };
  const minYear = Math.min(...points.map((point) => point.year));
  const maxYear = Math.max(...points.map((point) => point.year));
  const minFlux = Math.min(60, ...points.map((point) => point.f107));
  const maxFlux = Math.max(240, ...points.map((point) => point.f107), latest);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const x = (year) => padding.left + ((year - minYear) / Math.max(1, maxYear - minYear)) * innerWidth;
  const y = (flux) => padding.top + innerHeight - ((flux - minFlux) / Math.max(1, maxFlux - minFlux)) * innerHeight;
  const line = points.map((point) => `${x(point.year)},${y(point.f107)}`).join(" ");
  const area = `${padding.left},${padding.top + innerHeight} ${line} ${padding.left + innerWidth},${padding.top + innerHeight}`;
  const color = readCssVar("--accent", "#60a5fa");
  const axisColor = readCssVar("--border", "rgb(203 213 225 / 0.18)");
  const labelYears = [1990, 2000, 2010, 2020, maxYear].filter((year, index, list) => year >= minYear && list.indexOf(year) === index);

  elements.solarCycleChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="F10.7 solar flux yearly history">
      <polygon points="${area}" fill="${hexToRgba(color, 0.16)}"></polygon>
      <polyline points="${line}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
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
      <line x1="${padding.left}" y1="${y(latest)}" x2="${padding.left + innerWidth}" y2="${y(latest)}" stroke="${readCssVar("--warning", "#facc15")}" stroke-dasharray="5 5"></line>
      <text class="timeline-axis" x="8" y="${y(maxFlux) + 4}">${Math.round(maxFlux)}</text>
      <text class="timeline-axis" x="8" y="${padding.top + innerHeight}">${Math.round(minFlux)}</text>
    </svg>
  `;
}

function renderSpaceWeatherAlerts(space) {
  const alerts = space.activeAlerts || [];

  if (!alerts.length) {
    elements.spaceWeatherAlerts.innerHTML = "<p class=\"empty-state\">No active NOAA SWPC alert messages returned.</p>";
    return;
  }

  elements.spaceWeatherAlerts.innerHTML = alerts
    .map(
      (alert) => `
        <div class="alert-item">
          <strong>${alert.headline}</strong>
          <small>Issued ${observedTime(alert.issuedAt)}</small>
        </div>
      `
    )
    .join("");
}

function renderStarlinkIncident(space) {
  const incident = space.starlinkIncident || {};
  const stats = [
    ["Launch date", incident.date || "2022-02-03"],
    ["Deployment orbit", `${incident.launchAltitudeKm || 210} km`],
    ["Satellites launched", incident.launchedSatellites || 49],
    ["Reentered", incident.reenteredSatellites || 38]
  ];

  elements.starlinkIncidentStats.innerHTML = stats
    .map(
      ([label, value]) => `
        <div class="incident-stat">
          <strong>${value}</strong>
          <span>${label}</span>
        </div>
      `
    )
    .join("");
}

function renderGroundStation(ground) {
  if (!ground?.ok) {
    elements.groundStationName.textContent = "Ground station weather unavailable";
    elements.groundStationMeta.textContent = ground?.error || "Waiting for ground station network data.";
    elements.groundPrimaryStatus.textContent = "Unavailable";
    elements.groundPrimaryStatus.style.setProperty("--status-color", readCssVar("--danger", "#f87171"));
    return;
  }

  const station = ground.station;
  const current = ground.current;
  const operations = ground.operations;
  const primaryStatus = operations.antennaStatus === "Safe" && operations.opticalQuality !== "Offline"
    ? operations.linkMarginText
    : operations.antennaStatus;
  const primaryColor = weatherSeverityColor(`${operations.antennaStatus} ${operations.opticalQuality} ${operations.linkMarginText}`);

  elements.groundStationName.textContent = `${station.name} Ground Station`;
  elements.groundStationMeta.textContent = `${station.location}. ${station.primaryUse}. Source: ${ground.source}, observed ${observedTime(ground.observedAt)}.`;
  elements.groundPrimaryStatus.textContent = primaryStatus;
  elements.groundPrimaryStatus.style.setProperty("--status-color", primaryColor);
  elements.groundCondition.textContent = current.condition;
  elements.groundTemperature.textContent = current.temperatureC === null ? "Temperature unavailable" : `${decimal(current.temperatureC, 1)}°C, humidity ${Math.round(current.humidityPercent || 0)}%`;
  elements.groundRain.textContent = `${decimal(current.rainRateMmHr || 0, 1)} mm/hr`;
  elements.groundRainNote.textContent = operations.linkMarginText;
  elements.groundClouds.textContent = `${Math.round(current.cloudCoverPercent || 0)}%`;
  elements.groundOpticalNote.textContent = `Optical tracking ${operations.opticalQuality.toLowerCase()}`;
  elements.groundWind.textContent = `${decimal(current.windSpeedMps || 0, 1)} m/s`;
  elements.groundWindNote.textContent = `Gust ${decimal(current.windGustMps || current.windSpeedMps || 0, 1)} m/s; ${operations.antennaStatus}`;
  elements.groundVisibility.textContent = `${decimal(current.visibilityKm || 0, 1)} km`;
  elements.groundLaserNote.textContent = `Laser comm ${operations.laserCommStatus.toLowerCase()}`;
  elements.kaAttenuation.textContent = `${decimal(operations.kaBandAttenuationDb, 1)} dB`;
  elements.kaAttenuationNote.textContent = current.rainRateMmHr > 0
    ? "Rain fade can reduce Ka-band link margin during high-frequency satellite communications."
    : "No meaningful rain fade estimated at this station right now.";
  elements.opticalScore.textContent = `${Math.round(operations.opticalScore)}/100`;
  elements.opticalScoreNote.textContent = `${operations.opticalQuality} optical tracking based on cloud cover, precipitation, and visibility.`;
  elements.antennaStatus.textContent = operations.antennaStatus;
  elements.antennaStatusNote.textContent = "Large dish antennas can lose operational availability when wind and gusts approach safety limits.";
  elements.laserStatus.textContent = operations.laserCommStatus;
  elements.clearWindow.textContent = operations.nextClearWindow?.label || "Next clear optical window unavailable.";
}

function renderGroundNetwork() {
  const stations = state.weather.groundNetwork?.stations || [];

  if (!stations.length) {
    elements.groundNetworkCards.innerHTML = "<p class=\"empty-state\">Ground station network loading...</p>";
    return;
  }

  elements.groundNetworkCards.innerHTML = stations
    .map((item) => {
      const status = item.ok ? item.operations.linkMarginText : "Unavailable";
      const detail = item.ok ? `${Math.round(item.current.cloudCoverPercent || 0)}% clouds, ${decimal(item.current.windSpeedMps || 0, 1)} m/s wind` : item.error;
      return `
        <button class="station-card ${item.station.id === state.weather.selectedStation ? "active" : ""}" type="button" data-station="${item.station.id}">
          <strong>${item.station.name}</strong>
          <span>${status}</span>
          <small>${detail}</small>
        </button>
      `;
    })
    .join("");
}

function buildWeatherSnapshotPayload() {
  return {
    project: "OrbitGuard",
    mode: "Weather Operations",
    creator: CREATOR,
    generatedAt: new Date().toISOString(),
    spaceWeather: state.weather.space,
    selectedGroundStation: selectedGroundWeather(),
    groundNetwork: state.weather.groundNetwork,
    limitation:
      "Space-weather drag and ground-link calculations are educational screening estimates, not certified mission operations products."
  };
}

function encyclopediaSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function topicWords(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !["the", "and", "for", "with", "from"].includes(word));
}

function enrichEncyclopediaTopics(payload) {
  const bareTopics = payload.categories.flatMap((category, categoryIndex) =>
    category.topics.map((title, index) => ({
      id: encyclopediaSlug(title),
      title,
      category: category.name,
      categoryIndex,
      order: index,
      tags: topicWords(`${category.name} ${title}`).slice(0, 6),
      depth: /covariance|probability|nrlmsise|kessler|conjunction|policy|liability|economics|hypervelocity/i.test(title)
        ? "advanced"
        : "detailed",
      promptContext: `Explain ${title} through space sustainability, orbital risk, engineering tradeoffs, and mission-design implications.`
    }))
  );

  const topics = bareTopics.map((topic) => {
    const words = new Set(topicWords(topic.title));
    const related = bareTopics
      .filter((candidate) => candidate.id !== topic.id)
      .map((candidate) => {
        const score = topicWords(candidate.title).reduce((sum, word) => sum + (words.has(word) ? 2 : 0), 0) + (candidate.category === topic.category ? 1 : 0);
        return { candidate, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.candidate.id)
      .slice(0, 5);

    return { ...topic, related };
  });

  return {
    metadata: {
      ...payload.metadata,
      topicCount: topics.length,
      categoryCount: payload.categories.length
    },
    categories: payload.categories.map((category) => ({
      name: category.name,
      count: category.topics.length
    })),
    topics
  };
}

function articleCacheKey(topicId) {
  return `orbitguard_article_${topicId}`;
}

function readCachedArticle(topicId) {
  try {
    const cached = localStorage.getItem(articleCacheKey(topicId));
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function writeCachedArticle(article) {
  try {
    localStorage.setItem(articleCacheKey(article.id), JSON.stringify(article));
    return true;
  } catch {
    return false;
  }
}

function cachedArticleStats() {
  let count = 0;
  let words = 0;

  for (const topic of state.encyclopedia.topics) {
    const article = readCachedArticle(topic.id);
    if (article) {
      count += 1;
      words += Number(article.wordCount || 0);
    }
  }

  return { count, words };
}

function selectedEncyclopediaTopic() {
  return state.encyclopedia.topics.find((topic) => topic.id === state.encyclopedia.selectedTopicId) || null;
}

async function loadEncyclopediaTopics() {
  try {
    const response = await fetch(ENCYCLOPEDIA_TOPICS_URL);

    if (!response.ok) {
      throw new Error(`Topic index request failed with ${response.status}`);
    }

    const payload = enrichEncyclopediaTopics(await response.json());
    state.encyclopedia.metadata = payload.metadata;
    state.encyclopedia.categories = payload.categories;
    state.encyclopedia.topics = payload.topics;
    state.encyclopedia.filtered = payload.topics;
    populateEncyclopediaCategories();
    renderEncyclopedia();
  } catch (error) {
    state.encyclopedia.error = error.message;
    elements.encyclopediaStatus.textContent = "Topic index unavailable";
    elements.encyclopediaTopicGrid.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
}

function populateEncyclopediaCategories() {
  elements.encyclopediaCategory.innerHTML = "<option value=\"all\">All categories</option>";

  for (const category of state.encyclopedia.categories) {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = `${category.name} (${category.count})`;
    elements.encyclopediaCategory.append(option);
  }
}

function applyEncyclopediaFilters() {
  const query = state.encyclopedia.search.trim().toLowerCase();
  state.encyclopedia.filtered = state.encyclopedia.topics.filter((topic) => {
    if (state.encyclopedia.selectedCategory !== "all" && topic.category !== state.encyclopedia.selectedCategory) {
      return false;
    }

    if (state.encyclopedia.selectedDepth !== "all" && topic.depth !== state.encyclopedia.selectedDepth) {
      return false;
    }

    if (!query) {
      return true;
    }

    return `${topic.title} ${topic.category} ${topic.tags.join(" ")}`.toLowerCase().includes(query);
  });
}

function renderEncyclopedia() {
  if (!state.encyclopedia.topics.length) {
    return;
  }

  applyEncyclopediaFilters();
  renderEncyclopediaStats();
  renderEncyclopediaCategories();
  renderEncyclopediaTopics();

  if (!state.encyclopedia.selectedTopicId) {
    selectEncyclopediaTopic(state.encyclopedia.filtered[0]?.id || state.encyclopedia.topics[0].id, { scroll: false });
  }
}

function renderEncyclopediaStats() {
  const stats = cachedArticleStats();
  elements.encyclopediaTopicCount.textContent = numberFormat(state.encyclopedia.metadata?.topicCount || state.encyclopedia.topics.length);
  elements.encyclopediaCategoryCount.textContent = numberFormat(state.encyclopedia.metadata?.categoryCount || state.encyclopedia.categories.length);
  elements.encyclopediaCachedCount.textContent = numberFormat(stats.count);
  elements.encyclopediaWordCount.textContent = numberFormat(stats.words);
  elements.encyclopediaStatus.textContent = `${numberFormat(state.encyclopedia.filtered.length)} matching topics`;
  elements.encyclopediaResultsTitle.textContent = state.encyclopedia.selectedCategory === "all" ? "All Topics" : state.encyclopedia.selectedCategory;
}

function renderEncyclopediaCategories() {
  elements.encyclopediaCategoryCards.innerHTML = [
    { name: "all", count: state.encyclopedia.topics.length, label: "All categories" },
    ...state.encyclopedia.categories.map((category) => ({ ...category, label: category.name }))
  ]
    .map(
      (category) => `
        <button class="category-filter-card ${state.encyclopedia.selectedCategory === category.name ? "active" : ""}" type="button" data-category="${escapeHtml(category.name)}">
          <strong>${escapeHtml(category.label)}</strong>
          <span>${numberFormat(category.count)} topics</span>
        </button>
      `
    )
    .join("");
}

function renderEncyclopediaTopics() {
  if (!state.encyclopedia.filtered.length) {
    elements.encyclopediaTopicGrid.innerHTML = "<p class=\"empty-state\">No encyclopedia topics match that filter.</p>";
    return;
  }

  elements.encyclopediaTopicGrid.innerHTML = state.encyclopedia.filtered
    .map((topic) => {
      const cached = readCachedArticle(topic.id);
      return `
        <button class="topic-card ${state.encyclopedia.selectedTopicId === topic.id ? "active" : ""}" type="button" data-topic-id="${topic.id}">
          <span>${escapeHtml(topic.category)}</span>
          <strong>${escapeHtml(topic.title)}</strong>
          <small>${topic.depth === "advanced" ? "Advanced technical entry" : "Detailed reference entry"} ${cached ? "- cached" : "- ready to generate"}</small>
          <div class="topic-tags">${topic.tags.slice(0, 4).map((tag) => `<i>${escapeHtml(tag)}</i>`).join("")}</div>
        </button>
      `;
    })
    .join("");
}

function renderArticleMeta(article, topic) {
  const cached = readCachedArticle(topic.id);
  const generatedAt = article?.generatedAt ? observedTime(article.generatedAt) : "not generated yet";
  const modeLabels = {
    anthropic: "AI generated",
    "browser-fallback": "browser fallback",
    "local-template": "local generated",
    error: "error fallback"
  };
  const mode = article ? (modeLabels[article.generationMode] || "local generated") : "preview";
  elements.articleMeta.innerHTML = `
    <span>${escapeHtml(topic.category)}</span>
    <span>${escapeHtml(topic.depth)}</span>
    <span>${article?.wordCount ? `${numberFormat(article.wordCount)} words` : "article not loaded"}</span>
    <span>${article?.readingMinutes ? `${article.readingMinutes} min read` : "select Generate"}</span>
    <span>${cached ? "cached in browser" : "not cached yet"}</span>
    <span>${escapeHtml(mode)}</span>
    <span>${escapeHtml(generatedAt)}</span>
  `;
}

function renderArticleBody(article, topic) {
  if (!article) {
    elements.articleBody.innerHTML = `
      <p><strong>${escapeHtml(topic.title)}</strong> is ready to generate. The article will be cached in this browser and can be checked against live OrbitGuard data.</p>
      <p class="empty-state">Click Load Article to create the encyclopedia entry.</p>
    `;
    return;
  }

  elements.articleBody.innerHTML = String(article.content)
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function renderRelatedTopics(topic) {
  const related = topic.related
    .map((id) => state.encyclopedia.topics.find((candidate) => candidate.id === id))
    .filter(Boolean);

  elements.relatedTopics.innerHTML = related
    .map((item) => `<button type="button" data-topic-id="${item.id}">${escapeHtml(item.title)}</button>`)
    .join("");
}

function renderSelectedArticle() {
  const topic = selectedEncyclopediaTopic();

  if (!topic) {
    return;
  }

  const article = state.encyclopedia.selectedArticle || readCachedArticle(topic.id);
  elements.articleCategory.textContent = topic.category;
  elements.articleTitle.textContent = topic.title;
  renderArticleMeta(article, topic);
  renderArticleBody(article, topic);
  renderRelatedTopics(topic);
  elements.factCheckResults.classList.remove("active");
  elements.factCheckResults.innerHTML = "";
  elements.articleTransparency.textContent = article?.transparencyNote || "Generated article drafts are cached in localStorage so repeat visits load instantly.";
  renderEncyclopediaTopics();
  renderEncyclopediaStats();
}

function articleWordCount(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function buildClientFallbackArticle(topic, error = null) {
  const summary = summarize(state.objects);
  const [crowdedBand] = buildHotspots(state.objects);
  const relatedTitles = topic.related
    .map((id) => state.encyclopedia.topics.find((candidate) => candidate.id === id)?.title)
    .filter(Boolean)
    .slice(0, 3);
  const relatedText = relatedTitles.length ? relatedTitles.join(", ") : "orbital debris mitigation, space traffic coordination, and mission disposal planning";
  const crowdedText = crowdedBand ? `${crowdedBand.band} km` : "the most crowded LEO shells";
  const content = `${topic.title} is an OrbitGuard Space Encyclopedia topic that connects aerospace engineering decisions to the long-term safety of orbital environments. In the ${topic.category} category, the key question is how this subject changes tracking uncertainty, debris persistence, collision exposure, mission design, or public policy.

OrbitGuard evaluates the topic against the current catalog baseline of ${numberFormat(summary.total)} tracked objects, including ${numberFormat(summary.active)} active payloads, ${numberFormat(summary.debris)} debris objects, and ${numberFormat(summary.rocketBodies)} rocket bodies. That live context matters because space sustainability is not only a definition problem; it is a systems problem where every payload, upper stage, failed spacecraft, and fragment changes how operators plan maneuvers and disposal.

For ${topic.title.toLowerCase()}, the most important engineering link is mission lifecycle responsibility. Objects placed into low Earth orbit can sometimes naturally decay if they are low enough, but higher LEO, MEO, GEO, and cislunar environments can keep hardware in place for many years. When a mission uses crowded regions such as ${crowdedText}, the design needs stronger deorbit planning, passivation, collision-avoidance readiness, and transparent tracking data.

This topic should be studied alongside ${relatedText}, because no single concept explains orbital sustainability by itself. OrbitGuard treats encyclopedia articles as educational working notes: they should be compared with live catalog statistics, NOAA space-weather conditions, and documented mission rules before being used in a formal report.

This topic matters for the future of space sustainability because durable access to space depends on turning aerospace knowledge into measurable design choices before congestion becomes harder to reverse.${error ? `\n\nGeneration note: OrbitGuard used its built-in browser article generator because the live article API was unavailable or returned an invalid response: ${error.message}` : ""}`;

  const words = articleWordCount(content);

  return {
    id: topic.id,
    topic,
    content,
    wordCount: words,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
    generatedAt: new Date().toISOString(),
    generationMode: "browser-fallback",
    cacheKey: articleCacheKey(topic.id),
    sourceSuggestions: [
      "NASA Orbital Debris Program Office",
      "CelesTrak SATCAT",
      "NOAA Space Weather Prediction Center",
      "ESA Space Debris Office",
      "Secure World Foundation"
    ],
    transparencyNote:
      "This article was generated locally in the browser because the live article API was unavailable. Use the fact checker and source suggestions before citing it."
  };
}

function selectEncyclopediaTopic(topicId, { scroll = true } = {}) {
  const topic = state.encyclopedia.topics.find((item) => item.id === topicId);

  if (!topic) {
    return;
  }

  state.encyclopedia.selectedTopicId = topic.id;
  state.encyclopedia.selectedArticle = readCachedArticle(topic.id);
  state.encyclopedia.factCheck = null;
  renderSelectedArticle();

  if (scroll && state.mode === "encyclopedia") {
    elements.encyclopediaArticlePanel.scrollIntoView({ behavior: state.display.reduceMotion ? "auto" : "smooth", block: "start" });
  }
}

async function generateSelectedArticle() {
  const topic = selectedEncyclopediaTopic();

  if (!topic) {
    return;
  }

  const cached = readCachedArticle(topic.id);

  if (cached) {
    state.encyclopedia.selectedArticle = cached;
    renderSelectedArticle();
    return;
  }

  state.encyclopedia.loading = true;
  elements.generateArticle.disabled = true;
  elements.generateArticle.textContent = "Loading...";
  elements.articleBody.innerHTML = "<p class=\"empty-state\">Loading article and preparing local cache...</p>";

  try {
    const article = await fetchJsonEndpoint(`/api/v1/encyclopedia/article?id=${encodeURIComponent(topic.id)}`);
    writeCachedArticle(article);
    state.encyclopedia.selectedArticle = article;
  } catch (error) {
    const article = buildClientFallbackArticle(topic, error);
    writeCachedArticle(article);
    state.encyclopedia.selectedArticle = article;
  } finally {
    state.encyclopedia.loading = false;
    elements.generateArticle.disabled = false;
    elements.generateArticle.textContent = "Load Article";
    renderSelectedArticle();
  }
}

async function runSelectedArticleFactCheck() {
  const topic = selectedEncyclopediaTopic();
  const article = state.encyclopedia.selectedArticle || readCachedArticle(topic?.id);

  if (!topic || !article) {
    elements.factCheckResults.classList.add("active");
    elements.factCheckResults.innerHTML = "<p class=\"empty-state\">Generate the article before running the fact checker.</p>";
    return;
  }

  elements.factCheckResults.classList.add("active");
  elements.factCheckResults.innerHTML = "<p class=\"empty-state\">Checking article against live OrbitGuard data...</p>";

  try {
    const response = await fetch("/api/v1/encyclopedia/fact-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: topic.id, articleText: article.content })
    });

    if (!response.ok) {
      throw new Error(`Fact check request failed with ${response.status}`);
    }

    state.encyclopedia.factCheck = await response.json();
    renderFactCheckResults();
  } catch (error) {
    elements.factCheckResults.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
}

function renderFactCheckResults() {
  const result = state.encyclopedia.factCheck;

  if (!result) {
    return;
  }

  elements.factCheckResults.classList.add("active");
  elements.factCheckResults.innerHTML = `
    <p class="eyebrow">Fact checker</p>
    <h3>Live Data Review</h3>
    <p>${escapeHtml(result.methodology)}</p>
    <div class="fact-check-grid">
      ${result.checks
        .map(
          (check) => `
            <article class="fact-check-card">
              <span>${escapeHtml(check.label)}</span>
              <strong>${escapeHtml(check.value)}</strong>
              <small>${escapeHtml(check.status)} - ${escapeHtml(check.source)}</small>
            </article>
          `
        )
        .join("")}
    </div>
    <p class="time-note">Numbers found in article draft: ${result.numbersFoundInArticle.map(escapeHtml).join(", ") || "none detected"}.</p>
  `;
}

function buildEncyclopediaIndexPayload() {
  return {
    project: "OrbitGuard",
    mode: "Space Encyclopedia",
    creator: CREATOR,
    generatedAt: new Date().toISOString(),
    metadata: state.encyclopedia.metadata,
    categories: state.encyclopedia.categories,
    topics: state.encyclopedia.topics,
    cachedArticleStats: cachedArticleStats(),
    methodology:
      "Topic architecture is stored as data. Articles are generated on demand through the OrbitGuard API, cached in localStorage, and paired with a live-data fact checker."
  };
}

function exportEncyclopediaArticle() {
  const topic = selectedEncyclopediaTopic();
  const article = state.encyclopedia.selectedArticle || readCachedArticle(topic?.id);

  if (!topic || !article) {
    return;
  }

  downloadJSON(`${slugify(topic.title)}-orbitguard-article.json`, {
    project: "OrbitGuard Space Encyclopedia",
    creator: CREATOR.name,
    generatedAt: new Date().toISOString(),
    article,
    factCheck: state.encyclopedia.factCheck
  });
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

function simulateLaunchImpact(launchInput = state.launch) {
  const launch = {
    name: launchInput.name || "Untitled mission",
    satellites: clamp(Number(launchInput.satellites || 1), 1, 500),
    altitude: clamp(Number(launchInput.altitude || 550), 160, 42000),
    inclination: clamp(Number(launchInput.inclination || 0), 0, 180),
    lifetime: clamp(Number(launchInput.lifetime || 1), 1, 50),
    fragments: clamp(Number(launchInput.fragments || 0), 0, 1000),
    rocketBodyRemains: Boolean(launchInput.rocketBodyRemains),
    deorbitPlan: Boolean(launchInput.deorbitPlan)
  };
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

function regionCoverageAdjustment(region) {
  return { northAmerica: 0, global: 12, polar: -4, equatorial: 5 }[region] || 0;
}

function riskToleranceModifier(tolerance) {
  return {
    low: { riskWeight: 1.25, sustainabilityWeight: 1.12, scorePenalty: 5 },
    medium: { riskWeight: 1, sustainabilityWeight: 1, scorePenalty: 0 },
    high: { riskWeight: 0.76, sustainabilityWeight: 0.9, scorePenalty: -4 }
  }[tolerance] || { riskWeight: 1, sustainabilityWeight: 1, scorePenalty: 0 };
}

function missionStudioInput() {
  return {
    missionType: state.studio.missionType,
    targetRegion: state.studio.targetRegion,
    riskTolerance: state.studio.riskTolerance,
    priorities: { ...state.studio.priorities }
  };
}

function scoreMissionDesign(template, input = missionStudioInput()) {
  const mission = { ...template, fragments: 0 };
  const impact = simulateLaunchImpact({
    name: mission.name,
    satellites: mission.satellites,
    altitude: mission.altitude,
    inclination: mission.inclination,
    lifetime: mission.lifetime,
    fragments: 0,
    rocketBodyRemains: mission.rocketBodyRemains,
    deorbitPlan: mission.deorbitPlan
  });
  const tolerance = riskToleranceModifier(input.riskTolerance);
  const coverage = clamp(mission.coverage + regionCoverageAdjustment(input.targetRegion), 0, 100);
  const costEfficiency = clamp(112 - mission.cost, 0, 100);
  const compliance = mission.deorbitPlan ? 100 : 38;
  const debrisRisk = clamp(100 - impact.riskIndex - (mission.rocketBodyRemains ? 12 : 0), 0, 100);
  const spaceWeatherSensitivity = clamp(100 - Math.max(0, 650 - mission.altitude) / 8 - (mission.altitude > 1100 ? 12 : 0), 20, 96);
  const launchComplexity = clamp(100 - mission.satellites * 0.55 - mission.cost * 0.16, 8, 100);
  const sustainability = clamp(100 - impact.riskIndex + (mission.deorbitPlan ? 12 : -20) + (mission.rocketBodyRemains ? -14 : 6) - Math.max(0, mission.lifetime - 5) * 2, 0, 100);
  const priorities = input.priorities;
  const weights = {
    coverage: priorities.coverage,
    sustainability: priorities.sustainability * tolerance.sustainabilityWeight,
    cost: priorities.cost,
    risk: priorities.risk * tolerance.riskWeight
  };
  const totalWeight = weights.coverage + weights.sustainability + weights.cost + weights.risk;
  const architectureBonus =
    (mission.deorbitPlan ? 10 : -12) +
    (mission.rocketBodyRemains ? -10 : 6) +
    (mission.lifetime <= 5 ? 5 : 0) -
    (mission.altitude > 1000 ? 12 : 0);
  const finalScore = clamp(
    ((coverage * weights.coverage) + (sustainability * weights.sustainability) + (costEfficiency * weights.cost) + (debrisRisk * weights.risk)) / Math.max(totalWeight, 1) +
      architectureBonus -
      tolerance.scorePenalty,
    0,
    100
  );
  const tradeoffs = {
    Coverage: coverage,
    "Cost Efficiency": costEfficiency,
    "Debris Risk": debrisRisk,
    "Deorbit Compliance": compliance,
    "Space Weather": spaceWeatherSensitivity,
    "Launch Complexity": launchComplexity,
    Sustainability: sustainability
  };

  return {
    ...mission,
    impact,
    coverage,
    costEfficiency,
    compliance,
    debrisRisk,
    tradeoffs,
    finalScore: Math.round(finalScore),
    riskLevel: riskLevel(100 - debrisRisk),
    grade: sustainabilityGrade(100 - sustainability),
    verdict: finalScore >= 82 ? "Best" : finalScore >= 68 ? "Good" : finalScore >= 52 ? "Watch" : "Risky"
  };
}

function studioDesigns() {
  const templates = MISSION_TEMPLATES[state.studio.missionType] || MISSION_TEMPLATES.internet;
  const ranked = templates.map((template) => scoreMissionDesign(template)).sort((a, b) => b.finalScore - a.finalScore);

  if (!ranked.some((design) => design.id === state.studio.selectedId)) {
    state.studio.selectedId = ranked[0]?.id || null;
  }

  return ranked;
}

function selectedStudioDesign(designs = studioDesigns()) {
  return designs.find((design) => design.id === state.studio.selectedId) || designs[0] || null;
}

function studioScoreColor(score) {
  if (score >= 78) return readCssVar("--success", "#86efac");
  if (score >= 58) return readCssVar("--warning", "#facc15");
  return readCssVar("--danger", "#f87171");
}

function studioWarnings(designs = studioDesigns()) {
  const p = state.studio.priorities;
  const selected = selectedStudioDesign(designs);
  const warnings = [];

  if (p.coverage > 88 && p.sustainability > 88 && p.cost > 82) {
    warnings.push("Constraint conflict detected: maximum coverage, maximum sustainability, and low cost usually cannot all be optimized at the same time.");
  }
  if (p.coverage > 85 && p.cost > 80) {
    warnings.push("High coverage with strict cost pressure may be unrealistic without reducing redundancy or target region size.");
  }
  if (selected && selected.altitude >= 1000 && !selected.deorbitPlan) {
    warnings.push("High altitude plus no deorbit plan creates long-term orbital persistence risk.");
  }
  if (selected && selected.satellites >= 60) {
    warnings.push("Large satellite count increases conjunction-monitoring workload and traffic coordination needs.");
  }

  return warnings;
}

function renderStudioOptions(designs) {
  elements.studioOptionCount.textContent = `${designs.length} options`;
  elements.studioMissionOptions.innerHTML = designs.map((design, index) => {
    const selected = design.id === state.studio.selectedId ? " selected" : "";
    const badge = index === 0 ? `<span class="studio-badge">Recommended</span>` : design.debrisRisk >= 82 ? `<span class="studio-badge">Low debris risk</span>` : "";

    return `
      <article class="studio-option-card${selected}" data-studio-design="${design.id}">
        <header>
          <div>
            <p class="eyebrow">Option ${String.fromCharCode(65 + index)}</p>
            <h3>${escapeHTML(design.name)}</h3>
          </div>
          ${badge}
        </header>
        <p>${escapeHTML(design.summary)}</p>
        <div class="studio-card-metrics">
          <div><span>Satellites</span><strong>${numberFormat(design.satellites)}</strong></div>
          <div><span>Altitude</span><strong>${numberFormat(design.altitude)} km</strong></div>
          <div><span>Score</span><strong>${design.finalScore}/100</strong></div>
          <div><span>Risk</span><strong>${design.riskLevel}</strong></div>
        </div>
        <div class="studio-card-actions">
          <button type="button" data-studio-action="preview" data-design-id="${design.id}">Preview Orbit</button>
          <button type="button" data-studio-action="report" data-design-id="${design.id}">Generate Report</button>
          <button type="button" data-studio-action="use" data-design-id="${design.id}">Use In Simulator</button>
          <button type="button" data-studio-action="improve" data-design-id="${design.id}">Improve This Mission</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderStudioComparison(designs) {
  elements.studioComparisonHead.innerHTML = `
    <tr>
      <th>Feature</th>
      ${designs.map((design, index) => `<th class="${index === 0 ? "recommended-column" : ""}">${escapeHTML(design.name)}</th>`).join("")}
    </tr>
  `;
  const rows = [
    ["Satellites", (design) => numberFormat(design.satellites)],
    ["Altitude", (design) => `${numberFormat(design.altitude)} km`],
    ["Coverage", (design) => `${Math.round(design.coverage)}/100`],
    ["Sustainability", (design) => `${Math.round(design.tradeoffs.Sustainability)}/100`],
    ["Risk", (design) => design.riskLevel],
    ["Deorbit", (design) => design.deorbitPlan ? "Pass" : "Fail"]
  ];
  elements.studioComparisonBody.innerHTML = rows.map(([label, getter]) => `
    <tr>
      <td>${label}</td>
      ${designs.map((design, index) => `<td class="${index === 0 ? "recommended-column" : ""}">${getter(design)}</td>`).join("")}
    </tr>
  `).join("");
}

function renderStudioTradeoffs(design) {
  elements.studioTradeoffs.innerHTML = Object.entries(design.tradeoffs).map(([label, value]) => {
    const color = studioScoreColor(value);
    return `
      <div class="tradeoff-row">
        <span>${escapeHTML(label)}</span>
        <div class="tradeoff-meter"><i style="--value: ${Math.round(value)}%; --meter-color: ${color}"></i></div>
        <strong>${Math.round(value)}</strong>
      </div>
    `;
  }).join("");
}

function improvedStudioDesign(design) {
  const improved = {
    ...design,
    id: `${design.id}-improved`,
    name: `${design.name} Redesign`,
    satellites: Math.max(6, Math.round(design.satellites * 0.62)),
    altitude: clamp(Math.min(design.altitude, 520), 420, 700),
    lifetime: Math.min(design.lifetime, 5),
    deorbitPlan: true,
    rocketBodyRemains: false,
    coverage: clamp(design.coverage - 8, 35, 100),
    cost: clamp(design.cost - 14, 20, 100),
    summary: "Rule-based redesign that lowers altitude, reduces object count, removes leftover rocket body risk, and adds a 5-year deorbit plan."
  };

  return scoreMissionDesign(improved);
}

function renderStudioAutopsy(design) {
  const weakness = design.satellites > 50
    ? "The large satellite count creates more traffic-management demand."
    : design.coverage < 70
      ? "Coverage is lower than the larger constellation option."
      : "The main weakness is managing operations in an already active LEO environment.";
  elements.studioAutopsy.innerHTML = `
    <h3>Mission Autopsy</h3>
    <div class="autopsy-grid">
      <article class="autopsy-card"><strong>What went well</strong><p>${design.deorbitPlan ? "The design includes a deorbit plan and improves long-term compliance." : "The design meets the mission coverage goal, but disposal needs work."}</p></article>
      <article class="autopsy-card"><strong>What increased risk</strong><p>${escapeHTML(weakness)}</p></article>
      <article class="autopsy-card"><strong>What could improve</strong><p>Use fewer satellites, lower altitude, passivation, and no leftover upper stage whenever possible.</p></article>
    </div>
  `;
  const improved = improvedStudioDesign(design);
  elements.studioRedesignBox.innerHTML = `
    <article class="studio-redesign-card">
      <h3>Autonomous Redesign Suggestion</h3>
      <p>${escapeHTML(improved.name)}: ${numberFormat(improved.satellites)} satellites at ${numberFormat(improved.altitude)} km with 5-year deorbit planning. Estimated score improves to ${improved.finalScore}/100.</p>
      <button type="button" data-studio-action="apply-redesign" data-design-id="${design.id}">Apply Redesign To Simulator</button>
    </article>
  `;
}

function drawStudioPreview(design, now = performance.now()) {
  const canvas = elements.studioPreviewCanvas;
  if (!canvas || !design) return;

  const { context, width, height } = setCanvasSize(canvas);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#020617";
  context.fillRect(0, 0, width, height);

  for (let index = 0; index < 130; index += 1) {
    context.fillStyle = `rgb(226 242 255 / ${0.2 + seededUnit(index + 401) * 0.5})`;
    context.beginPath();
    context.arc(seededUnit(index + 421) * width, seededUnit(index + 431) * height, 0.6 + seededUnit(index + 441) * 1.2, 0, Math.PI * 2);
    context.fill();
  }

  const cx = width * 0.5;
  const cy = height * 0.52;
  const earthRadius = Math.min(width, height) * 0.16;
  const orbitRadius = fallbackScaleAltitude(design.altitude, earthRadius, Math.min(width, height) * 0.44);
  const scoreColor = studioScoreColor(design.finalScore);

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = hexToRgba(scoreColor, 0.32);
  context.lineWidth = 10;
  context.beginPath();
  context.ellipse(cx, cy, orbitRadius, orbitRadius * 0.36, -0.28, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  drawDigitalTwinEarth(context, cx, cy, earthRadius, now);

  context.strokeStyle = readCssVar("--simulated-color", "#a78bfa");
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(cx, cy, orbitRadius, orbitRadius * 0.36, -0.28, 0, Math.PI * 2);
  context.stroke();

  const dots = Math.min(design.satellites, 54);
  for (let index = 0; index < dots; index += 1) {
    const angle = (index / dots) * Math.PI * 2 + now * 0.00018;
    const x = cx + Math.cos(angle) * orbitRadius;
    const y = cy + Math.sin(angle) * orbitRadius * 0.36;
    context.fillStyle = readCssVar("--payload-color", "#93c5fd");
    context.shadowColor = context.fillStyle;
    context.shadowBlur = 8;
    context.beginPath();
    context.arc(x, y, 2.4, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  }

  for (let index = 0; index < 40; index += 1) {
    const angle = seededUnit(index + 621) * Math.PI * 2 + now * 0.00004;
    const radius = earthRadius + seededUnit(index + 631) * (Math.min(width, height) * 0.32);
    context.fillStyle = hexToRgba(readCssVar("--debris-color", "#f87171"), 0.62);
    context.beginPath();
    context.arc(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.36, 1.2, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = "rgb(203 213 225 / 0.86)";
  context.font = "700 12px Space Grotesk, sans-serif";
  context.fillText(`${numberFormat(design.altitude)} km selected mission orbit`, 16, 26);
}

function studioReportText(design = selectedStudioDesign()) {
  if (!design) return "";
  const missionType = elements.studioMissionType?.selectedOptions?.[0]?.textContent || state.studio.missionType;
  const region = elements.studioTargetRegion?.selectedOptions?.[0]?.textContent || state.studio.targetRegion;
  return `OrbitGuard Mission Design Report

Objective:
Design a ${missionType} mission for ${region} while balancing coverage, cost, risk, and long-term space sustainability.

Recommended Design:
${design.name} with ${design.satellites} satellites at ${design.altitude} km altitude and ${design.inclination} degrees inclination.

Score:
${design.finalScore}/100 overall, ${design.riskLevel} risk, sustainability grade ${design.grade}.

Reason:
${design.summary}

Main Tradeoff:
The design balances coverage (${Math.round(design.coverage)}/100) against debris risk (${Math.round(design.debrisRisk)}/100), cost efficiency (${Math.round(design.costEfficiency)}/100), and deorbit compliance (${design.deorbitPlan ? "pass" : "fail"}).

Suggested Improvements:
${improvedStudioDesign(design).summary}

Limitation:
This is an educational architecture screening model, not a flight-certified mission design or operational collision analysis.`;
}

function buildStudioReportPayload(design = selectedStudioDesign()) {
  return {
    project: "OrbitGuard",
    creator: CREATOR.name,
    generatedAt: new Date().toISOString(),
    mode: "Autonomous Mission Design Studio",
    objective: missionStudioInput(),
    recommendedDesign: design,
    reportText: studioReportText(design),
    methodology: "Weighted mission scoring using coverage, cost efficiency, debris risk, deorbit planning, launch complexity, and long-term sustainability."
  };
}

function renderSavedStudioScenarios() {
  if (!elements.studioSavedScenarios) return;
  const saved = state.studio.savedScenarios;
  elements.studioSavedScenarios.innerHTML = saved.length
    ? saved.map((item) => `
      <article class="saved-scenario-card">
        <strong>${escapeHTML(item.name)}</strong>
        <span>${escapeHTML(item.createdAt)} - ${item.score}/100 - ${escapeHTML(item.region)}</span>
      </article>
    `).join("")
    : `<p class="empty-state">No saved mission scenarios yet.</p>`;
}

function saveStudioScenario() {
  const design = selectedStudioDesign();
  if (!design) return;
  const scenario = {
    id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : `studio-${Date.now()}`,
    name: design.name,
    createdAt: new Date().toLocaleString(),
    objective: state.studio.missionType,
    region: elements.studioTargetRegion?.selectedOptions?.[0]?.textContent || state.studio.targetRegion,
    priorities: { ...state.studio.priorities },
    recommendedMission: design,
    score: design.finalScore
  };
  state.studio.savedScenarios = [scenario, ...state.studio.savedScenarios].slice(0, 6);
  localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(state.studio.savedScenarios));
  renderSavedStudioScenarios();
}

function loadStudioScenarios() {
  try {
    state.studio.savedScenarios = JSON.parse(localStorage.getItem(STUDIO_STORAGE_KEY) || "[]");
  } catch {
    state.studio.savedScenarios = [];
  }
}

function renderMissionStudio() {
  if (!elements.studioMissionOptions) return;

  elements.studioMissionType.value = state.studio.missionType;
  elements.studioTargetRegion.value = state.studio.targetRegion;
  elements.studioRiskTolerance.value = state.studio.riskTolerance;
  elements.studioCoveragePriority.value = String(state.studio.priorities.coverage);
  elements.studioSustainabilityPriority.value = String(state.studio.priorities.sustainability);
  elements.studioCostPriority.value = String(state.studio.priorities.cost);
  elements.studioRiskPriority.value = String(state.studio.priorities.risk);
  elements.studioCoverageValue.textContent = `${state.studio.priorities.coverage}%`;
  elements.studioSustainabilityValue.textContent = `${state.studio.priorities.sustainability}%`;
  elements.studioCostValue.textContent = `${state.studio.priorities.cost}%`;
  elements.studioRiskValue.textContent = `${state.studio.priorities.risk}%`;

  const designs = studioDesigns();
  const selected = selectedStudioDesign(designs);
  const warnings = studioWarnings(designs);
  elements.studioWarnings.innerHTML = warnings.map((warning) => `<div class="constraint-warning">${escapeHTML(warning)}</div>`).join("");

  renderStudioOptions(designs);
  renderStudioComparison(designs);

  if (selected) {
    const color = studioScoreColor(selected.finalScore);
    elements.studioPreviewTitle.textContent = selected.name;
    elements.studioScoreRing.style.setProperty("--score", selected.finalScore);
    elements.studioScoreRing.style.setProperty("--score-color", color);
    elements.studioScoreValue.textContent = selected.finalScore;
    renderStudioTradeoffs(selected);
    renderStudioAutopsy(selected);
    if (elements.studioReportPreview) {
      elements.studioReportPreview.textContent = studioReportText(selected);
    }
    drawStudioPreview(selected);
  }

  renderSavedStudioScenarios();
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
  renderMissionComparison();
  refreshLaunchSatellites();

  if (state.mode === "dashboard" || state.mode === "time") {
    renderOrbitScene();
  }

  if (state.mode === "simulator") {
    initLaunchSequence();
    setLaunchSequenceTime(state.launchSequence.clock || 0, 0);
  }
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

function missionComparisonPresets() {
  return [
    {
      name: "Clean LEO demonstrator",
      satellites: 12,
      altitude: 500,
      inclination: 53,
      lifetime: 4,
      fragments: 0,
      rocketBodyRemains: false,
      deorbitPlan: true,
      source: "preset"
    },
    {
      name: "Falcon 9 rideshare profile",
      satellites: 40,
      altitude: 550,
      inclination: 53,
      lifetime: 7,
      fragments: 0,
      rocketBodyRemains: false,
      deorbitPlan: true,
      source: "preset"
    },
    {
      name: "High-persistence constellation",
      satellites: 80,
      altitude: 900,
      inclination: 97,
      lifetime: 20,
      fragments: 6,
      rocketBodyRemains: true,
      deorbitPlan: false,
      source: "preset"
    },
    {
      name: "MEO relay mission",
      satellites: 24,
      altitude: 1200,
      inclination: 70,
      lifetime: 15,
      fragments: 2,
      rocketBodyRemains: true,
      deorbitPlan: true,
      source: "preset"
    }
  ];
}

function normalizeComparisonMission(launch, source = "custom") {
  return {
    id: `mission-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: launch.name || "Untitled mission",
    satellites: clamp(Number(launch.satellites || 1), 1, 500),
    altitude: clamp(Number(launch.altitude || 550), 160, 42000),
    inclination: clamp(Number(launch.inclination || 0), 0, 180),
    lifetime: clamp(Number(launch.lifetime || 1), 1, 50),
    fragments: clamp(Number(launch.fragments || 0), 0, 1000),
    rocketBodyRemains: Boolean(launch.rocketBodyRemains),
    deorbitPlan: Boolean(launch.deorbitPlan),
    source
  };
}

function seedComparisonMissions(force = false) {
  if (!elements.missionComparisonRows) {
    return;
  }

  if (state.comparison.seeded && !force) {
    return;
  }

  const current = normalizeComparisonMission({ ...state.launch, name: `${state.launch.name} (current)` }, "current");
  const presets = missionComparisonPresets().map((mission) => normalizeComparisonMission(mission, mission.source));
  state.comparison.missions = [current, ...presets].slice(0, 8);
  state.comparison.selectedId = state.comparison.missions[0]?.id || null;
  state.comparison.seeded = true;
}

function addComparisonMission(launch = state.launch, source = "custom") {
  const mission = normalizeComparisonMission(launch, source);
  state.comparison.missions = [mission, ...state.comparison.missions].slice(0, 8);
  state.comparison.selectedId = mission.id;
  state.comparison.seeded = true;
  renderMissionComparison();
}

function comparisonImpacts() {
  return state.comparison.missions
    .map((mission) => ({
      id: mission.id,
      source: mission.source,
      impact: simulateLaunchImpact(mission)
    }))
    .sort((a, b) => missionScoreFromImpact(b.impact) - missionScoreFromImpact(a.impact) || a.impact.riskIndex - b.impact.riskIndex);
}

function missionScoreFromImpact(impact) {
  const deorbitScore = impact.deorbitPlan ? (impact.lifetime <= 5 ? 95 : impact.lifetime <= 10 ? 84 : 72) : 32;
  const debrisScore = clamp(100 - (impact.debris * 3 + impact.rocketBodies * 18), 5, 100);
  const congestionScore = clamp(100 - impact.newCongestion * 0.72 - impact.bandIncrease * 0.08, 0, 100);
  const lifetimeScore = clamp(100 - Math.max(0, impact.lifetime - 5) * 4, 15, 100);
  const persistenceScoreValue = clamp(100 - persistenceScore({ altitude: impact.altitude, orbitClass: impact.orbitClass, activePayload: true }) * 70, 18, 100);

  return Math.round(
    0.26 * congestionScore +
      0.22 * deorbitScore +
      0.18 * debrisScore +
      0.16 * lifetimeScore +
      0.1 * persistenceScoreValue +
      0.08 * clamp(100 - impact.riskIndex, 0, 100)
  );
}

function letterGradeFromMissionScore(score) {
  if (score >= 92) return "A";
  if (score >= 84) return "B+";
  if (score >= 76) return "B";
  if (score >= 68) return "C+";
  if (score >= 58) return "C";
  if (score >= 46) return "D";
  return "F";
}

function reportCardCategories(impact) {
  return [
    {
      label: "Orbital congestion",
      score: clamp(100 - impact.newCongestion * 0.78 - impact.bandIncrease * 0.06, 0, 100)
    },
    {
      label: "Debris risk",
      score: clamp(100 - impact.debris * 3 - impact.rocketBodies * 22, 0, 100)
    },
    {
      label: "Deorbit compliance",
      score: impact.deorbitPlan ? (impact.lifetime <= 5 ? 96 : impact.lifetime <= 25 ? 78 : 52) : 28
    },
    {
      label: "Space-weather resilience",
      score: impact.altitude < 380 ? 54 : impact.altitude < 700 ? 78 : impact.altitude < 2000 ? 64 : 82
    },
    {
      label: "Ground-station reliability",
      score: impact.inclination >= 80 ? 82 : impact.inclination >= 45 ? 76 : 70
    },
    {
      label: "Collision avoidance readiness",
      score: impact.deorbitPlan && !impact.rocketBodies ? 90 : impact.deorbitPlan ? 72 : 42
    },
    {
      label: "Long-term sustainability",
      score: clamp(100 - impact.riskIndex, 0, 100)
    }
  ].map((category) => ({ ...category, score: Math.round(category.score) }));
}

function missionBadges(impact, score) {
  const badges = [];

  if (score >= 82) {
    badges.push(["Clean Orbit Candidate", "success"]);
  }

  if (impact.deorbitPlan) {
    badges.push(["Good Deorbit Plan", "success"]);
  } else {
    badges.push(["Missing Deorbit Plan", "danger"]);
  }

  if (impact.newCongestion >= 72) {
    badges.push(["Crowded Orbit Warning", "warning"]);
  }

  if (impact.rocketBodies) {
    badges.push(["Rocket Body Risk", "warning"]);
  }

  if (impact.altitude < 400) {
    badges.push(["Space Weather Sensitive", "warning"]);
  }

  if (impact.debris === 0 && !impact.rocketBodies) {
    badges.push(["Low Debris Impact", "success"]);
  }

  return badges.slice(0, 5);
}

function missionStrengthsAndWeaknesses(impact) {
  const strengths = [];
  const weaknesses = [];

  if (impact.deorbitPlan) {
    strengths.push("Includes an end-of-life disposal plan.");
  } else {
    weaknesses.push("No planned deorbit strategy is included.");
  }

  if (!impact.rocketBodies) {
    strengths.push("Avoids leaving a rocket body in orbit.");
  } else {
    weaknesses.push("Leaves upper-stage hardware in the orbital environment.");
  }

  if (impact.debris === 0) {
    strengths.push("No deployment fragments are modeled.");
  } else {
    weaknesses.push(`${numberFormat(impact.debris)} deployment fragments increase tracking difficulty.`);
  }

  if (impact.lifetime <= 5) {
    strengths.push("Mission lifetime aligns with the stricter 5-year deorbit direction.");
  } else if (impact.lifetime > 15) {
    weaknesses.push("Long orbital lifetime keeps objects in the environment for many years.");
  }

  if (impact.newCongestion >= 72) {
    weaknesses.push(`The ${impact.band} km band is already highly crowded.`);
  } else {
    strengths.push("Target altitude avoids the highest local congestion penalty.");
  }

  return {
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4)
  };
}

function buildMissionReportCard(impact, rank, count) {
  const score = missionScoreFromImpact(impact);
  const grade = letterGradeFromMissionScore(score);
  const categories = reportCardCategories(impact);
  const badges = missionBadges(impact, score);
  const notes = missionStrengthsAndWeaknesses(impact);

  return {
    mission: impact.name,
    rank,
    comparedMissions: count,
    score,
    grade,
    riskLevel: impact.riskLevel,
    categories,
    badges,
    strengths: notes.strengths,
    weaknesses: notes.weaknesses,
    impact
  };
}

function renderMissionComparison() {
  if (!elements.missionComparisonRows || !elements.missionComparisonSummary || !elements.missionReportCard) {
    return;
  }

  seedComparisonMissions();

  const ranked = comparisonImpacts();

  if (ranked.length === 0) {
    elements.missionComparisonSummary.innerHTML = `<article class="compare-card"><p>Add the current launch plan or load presets to compare mission designs.</p></article>`;
    elements.missionComparisonRows.innerHTML = "";
    elements.missionReportCard.innerHTML = "";
    return;
  }

  if (!state.comparison.selectedId || !ranked.some((entry) => entry.id === state.comparison.selectedId)) {
    state.comparison.selectedId = ranked[0].id;
  }

  const best = ranked[0].impact;
  const worst = [...ranked].sort((a, b) => b.impact.riskIndex - a.impact.riskIndex)[0].impact;
  const mostCrowded = [...ranked].sort((a, b) => b.impact.newCongestion - a.impact.newCongestion)[0].impact;
  const averageScore = ranked.reduce((sum, entry) => sum + missionScoreFromImpact(entry.impact), 0) / ranked.length;

  elements.missionComparisonSummary.innerHTML = [
    ["Best sustainability", `${escapeHTML(best.name)}`, `Grade ${letterGradeFromMissionScore(missionScoreFromImpact(best))}`],
    ["Highest long-term risk", `${escapeHTML(worst.name)}`, `${worst.riskLevel} risk, index ${Math.round(worst.riskIndex)}`],
    ["Most crowded band", `${mostCrowded.band} km`, `${Math.round(mostCrowded.newCongestion)} local crowding score`],
    ["Average report score", `${Math.round(averageScore)}/100`, `${ranked.length} missions compared`]
  ]
    .map(
      ([label, value, note]) => `
        <article class="compare-card comparison-summary-card">
          <p class="eyebrow">${label}</p>
          <h3>${value}</h3>
          <p>${note}</p>
        </article>
      `
    )
    .join("");

  elements.missionPresetButtons.innerHTML = missionComparisonPresets()
    .map(
      (mission, index) => `
        <button type="button" data-preset-index="${index}">
          ${escapeHTML(mission.name)}
        </button>
      `
    )
    .join("");

  elements.missionComparisonRows.innerHTML = ranked
    .map((entry, index) => {
      const impact = entry.impact;
      const score = missionScoreFromImpact(impact);
      const grade = letterGradeFromMissionScore(score);
      const selected = entry.id === state.comparison.selectedId ? " selected" : "";

      return `
        <tr class="mission-row${selected}">
          <td>#${index + 1}</td>
          <td>
            <strong>${escapeHTML(impact.name)}</strong>
            <span>${entry.source === "current" ? "Current input snapshot" : entry.source === "preset" ? "Preset profile" : "Custom scenario"}</span>
          </td>
          <td>${impact.orbitClass}</td>
          <td>${numberFormat(impact.satellites)}</td>
          <td>${numberFormat(impact.altitude)} km</td>
          <td>${impact.deorbitPlan ? "Yes" : "No"}</td>
          <td><span class="risk-chip" style="--chip-color: ${riskColor(impact.riskIndex)}">${impact.riskLevel}</span></td>
          <td><strong>${grade}</strong> <span>${score}/100</span></td>
          <td>
            <div class="row-actions">
              <button type="button" data-action="report" data-id="${entry.id}">Report</button>
              <button type="button" data-action="use" data-id="${entry.id}">Use</button>
              <button type="button" data-action="remove" data-id="${entry.id}">Remove</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  const selectedIndex = ranked.findIndex((entry) => entry.id === state.comparison.selectedId);
  const selectedEntry = ranked[selectedIndex >= 0 ? selectedIndex : 0];
  renderMissionReportCard(buildMissionReportCard(selectedEntry.impact, selectedIndex + 1 || 1, ranked.length));
}

function renderMissionReportCard(card) {
  const badgeMarkup = card.badges
    .map(([label, tone]) => `<span class="mission-badge ${tone}">${escapeHTML(label)}</span>`)
    .join("");

  const categoryMarkup = card.categories
    .map(
      (category) => `
        <div class="report-meter">
          <span>${escapeHTML(category.label)}</span>
          <div class="compare-track"><div class="compare-fill" style="--value: ${category.score}%; --bar-color: ${riskColor(100 - category.score)}"></div></div>
          <strong>${category.score}</strong>
        </div>
      `
    )
    .join("");

  elements.missionReportCard.innerHTML = `
    <article class="report-card-summary">
      <div>
        <p class="eyebrow">Selected mission report card</p>
        <h3>${escapeHTML(card.mission)}</h3>
        <p>Ranked #${card.rank} of ${card.comparedMissions}. This report card translates the launch-impact model into lifecycle categories used for mission design review.</p>
      </div>
      <div class="grade-meter">
        <span>Overall Grade</span>
        <strong>${card.grade}</strong>
        <em>${card.score}/100</em>
      </div>
    </article>

    <div class="badge-row">${badgeMarkup}</div>

    <div class="report-card-grid">
      <section>
        <h4>Category scores</h4>
        <div class="report-meter-list">${categoryMarkup}</div>
      </section>
      <section>
        <h4>Strong points</h4>
        <ul>${card.strengths.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
      </section>
      <section>
        <h4>Weak points</h4>
        <ul>${card.weaknesses.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
      </section>
    </div>
  `;
}

function setLaunchInputsFromMission(mission) {
  elements.launchName.value = mission.name;
  elements.launchSatellites.value = String(mission.satellites);
  elements.launchAltitude.value = String(mission.altitude);
  elements.launchInclination.value = String(mission.inclination);
  elements.launchLifetime.value = String(mission.lifetime);
  elements.launchFragments.value = String(mission.fragments);
  elements.rocketBodyRemains.checked = mission.rocketBodyRemains;
  elements.deorbitPlan.checked = mission.deorbitPlan;
  readLaunchInputs();
  renderLaunchImpact();
  setActiveMode("simulator");
}

function buildMissionComparisonPayload() {
  const ranked = comparisonImpacts();
  const highestRisk = [...ranked].sort((a, b) => b.impact.riskIndex - a.impact.riskIndex)[0]?.impact || null;

  return {
    project: "OrbitGuard",
    creator: CREATOR.name,
    generatedAt: new Date().toISOString(),
    purpose: "Mission Comparison Arena and Space Sustainability Report Card",
    summary: {
      comparedMissions: ranked.length,
      bestMission: ranked[0]?.impact.name || null,
      highestRiskMission: highestRisk?.name || null
    },
    rankings: ranked.map((entry, index) => ({
      rank: index + 1,
      reportCard: buildMissionReportCard(entry.impact, index + 1, ranked.length)
    })),
    methodology:
      "Educational scenario ranking using orbital congestion, debris contribution, rocket-body disposal, deorbit planning, mission lifetime, persistence, space-weather sensitivity, and collision-avoidance readiness."
  };
}

function exportMissionComparisonReport() {
  const payload = buildMissionComparisonPayload();
  downloadJSON("orbitguard-mission-comparison-report.json", payload);
}

function currentReplayScenario() {
  if (state.missionReplay.scenarioId !== "custom") {
    const scenario = HISTORICAL_REPLAY_SCENARIOS[state.missionReplay.scenarioId] || HISTORICAL_REPLAY_SCENARIOS["iridium-cosmos"];
    return {
      ...scenario,
      addedObjects: scenario.payloads + scenario.rocketBodies + scenario.debris,
      sustainabilityScore: clamp(100 - scenario.riskIndex, 0, 100),
      phaseType: "event"
    };
  }

  const impact = state.impact || simulateLaunchImpact();
  const sustainabilityScore = clamp(100 - impact.riskIndex + (impact.deorbitPlan ? 6 : -6), 0, 100);

  return {
    name: impact.name,
    type: "launch",
    year: new Date().getFullYear(),
    altitude: impact.altitude,
    band: impact.band,
    inclination: impact.inclination,
    payloads: impact.payloads,
    rocketBodies: impact.rocketBodies,
    debris: impact.debris,
    addedObjects: impact.addedObjects,
    riskIndex: impact.riskIndex,
    riskLevel: impact.riskLevel,
    congestionChange: impact.bandIncrease,
    sustainabilityScore,
    phaseType: "launch",
    description: `${impact.name} deploys ${numberFormat(impact.payloads)} payloads into ${impact.orbitClass} and updates the ${impact.band} km traffic shell as the replay reaches deployment.`,
    wentWell: impact.deorbitPlan ? "The mission includes a planned deorbit path, lowering long-term persistence." : "The mission reaches orbit, but sustainability margin is limited without a disposal plan.",
    increasedRisk: impact.rocketBodies || impact.debris
      ? "Non-payload objects increase the amount of uncontrolled hardware in the target shell."
      : `The main risk is adding payloads to the ${impact.band} km altitude band.`,
    redesign: impact.riskIndex > 55
      ? "Reduce payload count, avoid the most crowded shell, remove the upper stage, and keep the deorbit plan."
      : "Keep publishing orbit data, passivate spacecraft, and maintain autonomous collision avoidance."
  };
}

function missionReplayPhases(scenario = currentReplayScenario()) {
  return MISSION_REPLAY_PHASES[scenario.phaseType] || MISSION_REPLAY_PHASES.launch;
}

function phaseAtTime(phases, time) {
  return phases.find((phase) => time >= phase.start && time < phase.end) || phases[phases.length - 1];
}

function missionReplayProgress(scenario = currentReplayScenario()) {
  const time = clamp(state.missionReplay.clock, 0, MISSION_REPLAY_DURATION);
  const phases = missionReplayPhases(scenario);
  const phase = phaseAtTime(phases, time);
  const missionProgress = time / MISSION_REPLAY_DURATION;
  const insertionProgress = easeInOut(clamp((time - 31) / 12, 0, 1));
  const deployProgress = scenario.phaseType === "event"
    ? easeInOut(clamp((time - 24) / 30, 0, 1))
    : easeInOut(clamp((time - 43) / 15, 0, 1));
  const analysisProgress = easeInOut(clamp((time - 58) / 14, 0, 1));
  const altitude = scenario.phaseType === "event"
    ? scenario.altitude
    : Math.round(scenario.altitude * insertionProgress);
  const velocity = scenario.phaseType === "event"
    ? 7.6 + Math.sin(time * 0.08) * 0.35
    : 7.8 * easeInOut(clamp((time - 8) / 35, 0, 1));
  const deployed = Math.min(scenario.payloads, Math.floor(scenario.payloads * deployProgress));
  const debrisReleased = Math.floor(scenario.debris * deployProgress);
  const rocketBodyReleased = scenario.rocketBodies && time > 31 ? scenario.rocketBodies : 0;
  const objectsAdded = scenario.phaseType === "event"
    ? debrisReleased + deployed + rocketBodyReleased
    : deployed + rocketBodyReleased + debrisReleased;
  const congestionChange = scenario.congestionChange * Math.max(deployProgress, analysisProgress * 0.85);
  const liveRisk = clamp(scenario.riskIndex * Math.max(0.16, deployProgress), 0, 100);
  const liveScore = clamp(100 - liveRisk + (scenario.sustainabilityScore - (100 - scenario.riskIndex)) * deployProgress, 0, 100);

  return {
    time,
    phases,
    phase,
    missionProgress,
    insertionProgress,
    deployProgress,
    analysisProgress,
    altitude,
    velocity,
    deployed,
    debrisReleased,
    rocketBodyReleased,
    objectsAdded,
    congestionChange,
    liveRisk,
    liveScore
  };
}

function renderMissionReplayTimeline(phases, activePhase) {
  elements.missionReplayTimeline.innerHTML = phases.map((phase, index) => {
    const status = state.missionReplay.clock >= phase.end ? "complete" : phase.name === activePhase.name ? "active" : "";

    return `
      <div class="launch-phase-step ${status}">
        <span>${index + 1}</span>
        <div>
          <strong>${escapeHTML(phase.name)}</strong>
          <small>${formatMissionClock(phase.start)} - ${formatMissionClock(phase.end)}</small>
        </div>
      </div>
    `;
  }).join("");
}

function renderMissionAutopsy(scenario = currentReplayScenario(), progress = missionReplayProgress(scenario)) {
  const actionVerb = scenario.phaseType === "event" ? "replay" : "mission";
  elements.missionAutopsy.innerHTML = `
    <h3>Mission Autopsy</h3>
    <p>${escapeHTML(scenario.description)}</p>
    <div class="autopsy-grid">
      <article class="autopsy-card">
        <strong>What went well</strong>
        <p>${escapeHTML(scenario.wentWell)}</p>
      </article>
      <article class="autopsy-card">
        <strong>What increased risk</strong>
        <p>${escapeHTML(scenario.increasedRisk)}</p>
      </article>
      <article class="autopsy-card">
        <strong>Recommended redesign</strong>
        <p>${escapeHTML(scenario.redesign)}</p>
      </article>
    </div>
    <p>Current ${actionVerb} state: ${numberFormat(progress.objectsAdded)} objects represented, ${decimal(progress.congestionChange)}% modeled congestion change, live score ${Math.round(progress.liveScore)}/100.</p>
  `;
}

function setCanvasSize(canvas) {
  const parent = canvas.parentElement;
  const rect = parent?.getBoundingClientRect() || canvas.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width || 640));
  const height = Math.max(260, Math.floor(rect.height || 420));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { context, width, height, dpr };
}

function drawDigitalTwinEarth(context, centerX, centerY, radius, time = 0) {
  const ocean = context.createRadialGradient(centerX - radius * 0.28, centerY - radius * 0.32, radius * 0.1, centerX, centerY, radius);
  ocean.addColorStop(0, "#60a5fa");
  ocean.addColorStop(0.45, "#2563eb");
  ocean.addColorStop(1, "#0f172a");
  context.fillStyle = ocean;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();

  context.save();
  context.beginPath();
  context.arc(centerX, centerY, radius * 0.98, 0, Math.PI * 2);
  context.clip();
  context.fillStyle = "rgb(34 197 94 / 0.5)";
  for (let index = 0; index < 7; index += 1) {
    const angle = time * 0.00008 + index * 1.21;
    const x = centerX + Math.cos(angle) * radius * (0.18 + seededUnit(index + 17) * 0.52);
    const y = centerY + Math.sin(angle * 1.4) * radius * (0.18 + seededUnit(index + 41) * 0.46);
    context.beginPath();
    context.ellipse(x, y, radius * (0.18 + seededUnit(index + 81) * 0.18), radius * (0.055 + seededUnit(index + 101) * 0.09), angle * 0.7, 0, Math.PI * 2);
    context.fill();
  }
  context.strokeStyle = "rgb(248 250 252 / 0.24)";
  context.lineWidth = Math.max(1, radius * 0.018);
  for (let index = -2; index <= 2; index += 1) {
    context.beginPath();
    context.ellipse(centerX, centerY + index * radius * 0.18, radius * 0.92, radius * 0.12, 0, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();

  context.strokeStyle = "rgb(147 197 253 / 0.36)";
  context.lineWidth = Math.max(1, radius * 0.025);
  context.beginPath();
  context.arc(centerX, centerY, radius * 1.04, 0, Math.PI * 2);
  context.stroke();
}

function drawMissionReplayCanvas(scenario = currentReplayScenario(), progress = missionReplayProgress(scenario), now = performance.now()) {
  const canvas = elements.missionReplayCanvas;

  if (!canvas) {
    return;
  }

  const { context, width, height } = setCanvasSize(canvas);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#020617";
  context.fillRect(0, 0, width, height);

  for (let index = 0; index < 190; index += 1) {
    const x = seededUnit(index + 801) * width;
    const y = seededUnit(index + 901) * height;
    const alpha = 0.18 + seededUnit(index + 1001) * 0.5;
    context.fillStyle = `rgb(226 242 255 / ${alpha})`;
    context.beginPath();
    context.arc(x, y, 0.55 + seededUnit(index + 1101) * 1.2, 0, Math.PI * 2);
    context.fill();
  }

  const centerX = width * (state.missionReplay.cameraMode === "rocket-chase" ? 0.42 : 0.5);
  const centerY = height * 0.5;
  const earthRadius = Math.min(width, height) * 0.18;
  const targetRadius = earthRadius + Math.min(width, height) * (scenario.altitude > 2000 ? 0.25 : 0.15 + scenario.altitude / 9000);
  const heatColor = scenario.riskIndex >= 82 ? readCssVar("--danger", "#f87171") : scenario.riskIndex >= 58 ? readCssVar("--warning", "#facc15") : readCssVar("--accent", "#93c5fd");

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = hexToRgba(heatColor, 0.16 + progress.deployProgress * 0.32);
  context.lineWidth = 8 + progress.deployProgress * 9;
  context.beginPath();
  context.ellipse(centerX, centerY, targetRadius, targetRadius * 0.36, -0.32, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  for (let shell = 0; shell < 4; shell += 1) {
    context.strokeStyle = `rgb(147 197 253 / ${0.1 + shell * 0.03})`;
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(centerX, centerY, earthRadius + shell * earthRadius * 0.34, (earthRadius + shell * earthRadius * 0.34) * 0.36, -0.32, 0, Math.PI * 2);
    context.stroke();
  }

  drawDigitalTwinEarth(context, centerX, centerY, earthRadius, now);

  if (scenario.phaseType === "launch") {
    const ascent = easeInOut(clamp((progress.time - 8) / 35, 0, 1));
    const startX = centerX - earthRadius * 0.52;
    const startY = centerY + earthRadius * 0.9;
    const endX = centerX + Math.cos(-0.32) * targetRadius;
    const endY = centerY + Math.sin(-0.32) * targetRadius * 0.36;
    const rocketX = lerp(startX, endX, ascent);
    const rocketY = lerp(startY, endY, ascent) - Math.sin(ascent * Math.PI) * earthRadius * 1.1;

    context.strokeStyle = hexToRgba(readCssVar("--simulated-color", "#a78bfa"), 0.68);
    context.lineWidth = 2.4;
    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(centerX - earthRadius * 1.45, centerY - earthRadius * 1.2, endX, endY);
    context.stroke();

    context.save();
    context.translate(rocketX, rocketY);
    context.rotate(-0.48);
    context.fillStyle = "#f8fafc";
    context.fillRect(-3, -18, 6, 28);
    context.fillStyle = readCssVar("--simulated-color", "#a78bfa");
    context.beginPath();
    context.moveTo(0, -28);
    context.lineTo(7, -16);
    context.lineTo(-7, -16);
    context.closePath();
    context.fill();
    context.fillStyle = "rgb(251 191 36 / 0.72)";
    context.beginPath();
    context.moveTo(-5, 10);
    context.lineTo(0, 27 + Math.sin(now * 0.02) * 5);
    context.lineTo(5, 10);
    context.closePath();
    context.fill();
    context.restore();
  }

  const visiblePayloads = Math.min(48, Math.max(0, scenario.phaseType === "event" ? Math.min(18, Math.floor(progress.debrisReleased / 90)) : progress.deployed));
  const visibleDebris = Math.min(100, Math.floor(progress.debrisReleased / Math.max(1, Math.ceil(scenario.debris / 90))));
  const totalDots = visiblePayloads + visibleDebris + progress.rocketBodyReleased;

  for (let index = 0; index < totalDots; index += 1) {
    const isDebris = index >= visiblePayloads;
    const angle = now * 0.00016 + index * 0.42 + progress.deployProgress * Math.PI * 1.2;
    const radius = targetRadius + (seededUnit(index + 1301) - 0.5) * 26;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.36;
    context.fillStyle = isDebris ? readCssVar("--debris-color", "#f87171") : readCssVar("--payload-color", "#93c5fd");
    context.shadowColor = context.fillStyle;
    context.shadowBlur = isDebris ? 10 : 8;
    context.beginPath();
    context.arc(x, y, isDebris ? 2.1 : 2.8, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  }

  context.fillStyle = "rgb(203 213 225 / 0.82)";
  context.font = "600 12px Space Grotesk, sans-serif";
  context.fillText(`${scenario.band} km risk shell`, centerX - targetRadius * 0.72, centerY - targetRadius * 0.42 - 10);
}

function renderMissionReplay() {
  if (!elements.missionReplayCanvas) {
    return;
  }

  const scenario = currentReplayScenario();
  const progress = missionReplayProgress(scenario);
  const phases = progress.phases;
  const phase = progress.phase;
  const score = Math.round(progress.liveScore);
  const risk = progress.liveRisk >= 72 ? "High" : progress.liveRisk >= 42 ? "Medium" : "Low";

  elements.missionReplayScenario.value = state.missionReplay.scenarioId;
  elements.missionReplayCamera.value = state.missionReplay.cameraMode;
  elements.missionReplayPlayPause.textContent = state.missionReplay.playing ? "Pause" : "Play";
  elements.replaySustainabilityScore.textContent = `${score}/100`;
  elements.replayScoreNote.textContent = score >= 75 ? "Strong sustainability posture" : score >= 50 ? "Moderate sustainability posture" : "Needs redesign";
  elements.replayObjectsAdded.textContent = numberFormat(progress.objectsAdded);
  elements.replayObjectsNote.textContent = scenario.phaseType === "event" ? "Fragments represented as event expands" : "Payloads, rocket body, and deployment fragments";
  elements.replayAffectedBand.textContent = `${scenario.band} km`;
  elements.replayBandNote.textContent = `${numberFormat(scenario.altitude)} km target environment`;
  elements.replayCongestionChange.textContent = `${progress.congestionChange >= 0 ? "+" : ""}${decimal(progress.congestionChange)}%`;
  elements.replayRiskLevel.textContent = risk;
  elements.replayRiskNote.textContent = `${Math.round(progress.liveRisk)} live risk index`;
  elements.replayCurrentPhase.textContent = phase.name;
  elements.replayPhaseNote.textContent = phase.callout;
  elements.replayClock.textContent = formatMissionClock(progress.time);
  elements.replayHudPhase.textContent = phase.name;
  elements.replayHudCallout.textContent = phase.callout;
  elements.replayAltitude.textContent = `${numberFormat(progress.altitude)} km`;
  elements.replayVelocity.textContent = `${decimal(progress.velocity, 1)} km/s`;
  elements.replayInclination.textContent = `${decimal(scenario.inclination, 1)} deg`;
  elements.replayPayloads.textContent = `${numberFormat(progress.deployed)} / ${numberFormat(scenario.payloads)}`;
  elements.missionReplayScrubber.value = Math.round((progress.time / MISSION_REPLAY_DURATION) * 1000);
  elements.missionReplayScrubberLabel.textContent = formatMissionClock(progress.time);

  renderMissionReplayTimeline(phases, phase);
  renderMissionAutopsy(scenario, progress);
  drawMissionReplayCanvas(scenario, progress);
}

function buildMissionAutopsyPayload() {
  const scenario = currentReplayScenario();
  const progress = missionReplayProgress(scenario);

  return {
    project: "OrbitGuard",
    creator: CREATOR.name,
    generatedAt: new Date().toISOString(),
    mode: "Mission Replay Mode + Orbital Digital Twin",
    scenario: {
      name: scenario.name,
      type: scenario.type,
      year: scenario.year,
      altitudeKm: scenario.altitude,
      affectedBandKm: scenario.band,
      inclinationDeg: scenario.inclination,
      objectsAdded: scenario.addedObjects,
      riskLevel: scenario.riskLevel,
      riskIndex: Math.round(scenario.riskIndex),
      sustainabilityScore: Math.round(scenario.sustainabilityScore)
    },
    replayState: {
      missionTime: formatMissionClock(progress.time),
      phase: progress.phase.name,
      liveObjectsAdded: progress.objectsAdded,
      liveCongestionChangePercent: decimal(progress.congestionChange, 2),
      liveSustainabilityScore: Math.round(progress.liveScore)
    },
    autopsy: {
      whatWentWell: scenario.wentWell,
      whatIncreasedRisk: scenario.increasedRisk,
      recommendedRedesign: scenario.redesign
    },
    limitation:
      "Educational cinematic replay. Historical values are simplified event profiles, not operational ephemerides or validated conjunction analysis."
  };
}

function exportMissionAutopsy() {
  const payload = buildMissionAutopsyPayload();
  downloadJSON(`${slugify(payload.scenario.name) || "orbitguard"}-mission-autopsy.json`, payload);
}

function severityForMissDistance(distanceKm) {
  if (distanceKm < 0.75) return "Critical";
  if (distanceKm < 1.5) return "High";
  if (distanceKm < 3) return "Medium";
  return "Low";
}

function severityColor(severity) {
  if (severity === "Critical") return readCssVar("--danger", "#f87171");
  if (severity === "High") return "#fb923c";
  if (severity === "Medium") return readCssVar("--warning", "#facc15");
  return readCssVar("--accent", "#93c5fd");
}

function buildTrafficAlerts() {
  const payloads = state.objects.filter((object) => object.activePayload && object.orbitClass === "LEO");
  const hazards = state.objects.filter((object) => isDebrisLike(object) && object.orbitClass === "LEO");
  const alerts = [];
  const distances = state.traffic.emergencyActive ? [0.38, 0.62, 0.9, 1.2, 1.8, 2.6, 4.1] : [0.62, 1.1, 1.8, 2.7, 3.8, 5.2];
  const count = state.traffic.emergencyActive ? 7 : 6;

  for (let index = 0; index < count; index += 1) {
    const a = payloads[(index * 97 + 13) % Math.max(payloads.length, 1)] || state.objects[index];
    const b = hazards[(index * 131 + 29) % Math.max(hazards.length, 1)] || state.objects[index + 20] || a;
    const distanceKm = distances[index % distances.length];
    const severity = severityForMissDistance(distanceKm);
    const altitude = a?.altitude || b?.altitude || 550;
    const band = altitudeBand({ altitude }, 100);

    alerts.push({
      id: `alert-${index}`,
      primary: a?.name || `PAYLOAD-${2200 + index}`,
      secondary: b?.name || `DEBRIS-${7700 + index}`,
      primaryType: typeLabel(a?.type || "PAY"),
      secondaryType: typeLabel(b?.type || "DEB"),
      missDistanceKm: distanceKm,
      relativeSpeed: 7.8 + seededUnit(index + 47) * 6.2,
      timeToTcaMinutes: Math.round(28 + seededUnit(index + 59) * 420),
      altitude,
      band,
      severity,
      recommendedAction: severity === "Low" ? "Continue monitoring" : distanceKm < 1 ? "evaluate immediate avoidance maneuver" : "prepare maneuver option"
    });
  }

  return alerts;
}

function selectedTrafficAlert(alerts = buildTrafficAlerts()) {
  if (!state.traffic.selectedAlertId || !alerts.some((alert) => alert.id === state.traffic.selectedAlertId)) {
    state.traffic.selectedAlertId = alerts[0]?.id || null;
  }

  return alerts.find((alert) => alert.id === state.traffic.selectedAlertId) || alerts[0] || null;
}

function maneuverAssessment(alert = selectedTrafficAlert(), maneuver = state.traffic.maneuver) {
  if (!alert) {
    return null;
  }

  const profiles = {
    none: { factor: 1, deltaV: 0, impact: "No fuel used, but risk remains unchanged." },
    raise: { factor: 6.8, deltaV: 0.72, impact: "Small altitude raise increases miss distance with low fuel cost." },
    lower: { factor: 7.7, deltaV: 0.69, impact: "Lowering orbit separates the radial path and usually improves miss distance." },
    delay: { factor: 4.3, deltaV: 0.38, impact: "Timing change can be efficient when warning time is available." },
    inclination: { factor: 9.1, deltaV: 1.85, impact: "Plane change is powerful but expensive in delta-v." }
  };
  const profile = profiles[maneuver] || profiles.none;
  const newDistance = alert.missDistanceKm * profile.factor;
  const newSeverity = severityForMissDistance(newDistance);

  return {
    maneuver,
    oldDistance: alert.missDistanceKm,
    newDistance,
    oldSeverity: alert.severity,
    newSeverity,
    deltaV: profile.deltaV,
    impact: profile.impact
  };
}

function addTrafficLog(message) {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  state.traffic.commandLog = [{ timestamp, message }, ...state.traffic.commandLog].slice(0, 9);
  renderTrafficCommandLog();
}

function buildTrafficHealthShells() {
  return TRAFFIC_ALTITUDE_SHELLS.map((shell) => {
    const objects = state.objects.filter((object) => object.altitude >= shell.min && object.altitude < shell.max);
    const debris = objects.filter(isDebrisLike).length;
    const rocketBodies = objects.filter((object) => object.type === "R/B").length;
    const densityPenalty = Math.min(44, objects.length / (shell.label === "GEO belt" ? 85 : 55));
    const debrisPenalty = objects.length ? (debris / objects.length) * 34 : 0;
    const rocketPenalty = objects.length ? (rocketBodies / objects.length) * 12 : 0;
    const emergencyPenalty = state.traffic.emergencyActive && shell.label === "800-900 km" ? 24 : 0;
    const health = clamp(100 - densityPenalty - debrisPenalty - rocketPenalty - emergencyPenalty, 0, 100);

    return {
      ...shell,
      objects: objects.length + (state.traffic.emergencyActive && shell.label === "800-900 km" ? state.traffic.emergencyFragments : 0),
      debris: debris + (state.traffic.emergencyActive && shell.label === "800-900 km" ? state.traffic.emergencyFragments : 0),
      health,
      risk: health < 38 ? "High" : health < 62 ? "Caution" : "Stable",
      color: health < 38 ? readCssVar("--danger", "#f87171") : health < 62 ? readCssVar("--warning", "#facc15") : readCssVar("--accent", "#93c5fd")
    };
  });
}

function renderTrafficAlerts(alerts = buildTrafficAlerts()) {
  elements.trafficAlertFeed.innerHTML = alerts.map((alert) => {
    const color = severityColor(alert.severity);
    const active = alert.id === state.traffic.selectedAlertId ? " active" : "";

    return `
      <button class="alert-item traffic-alert${active}" type="button" data-alert-id="${alert.id}" style="--alert-color: ${color}">
        <span class="severity-pill">${escapeHTML(alert.severity)}</span>
        <strong>${escapeHTML(alert.primary)} / ${escapeHTML(alert.secondary)}</strong>
        <small>Miss distance ${decimal(alert.missDistanceKm, 2)} km, relative speed ${decimal(alert.relativeSpeed, 1)} km/s, TCA in ${alert.timeToTcaMinutes} min, ${alert.band} km shell.</small>
      </button>
    `;
  }).join("");
}

function renderSelectedTrafficAlert(alert = selectedTrafficAlert()) {
  if (!alert) {
    elements.selectedTrafficAlert.innerHTML = `<p class="empty-state">No simulated alerts available.</p>`;
    return;
  }

  const color = severityColor(alert.severity);
  elements.selectedTrafficAlert.style.setProperty("--alert-color", color);
  elements.selectedTrafficAlert.innerHTML = `
    <span>${escapeHTML(alert.severity)} risk</span>
    <h3>${escapeHTML(alert.primary)}</h3>
    <p>${escapeHTML(alert.secondary)} predicted pass distance: ${decimal(alert.missDistanceKm, 2)} km. Relative speed: ${decimal(alert.relativeSpeed, 1)} km/s. Recommended action: ${escapeHTML(alert.recommendedAction)}.</p>
  `;
}

function renderManeuverResult(assessment = maneuverAssessment()) {
  if (!assessment) {
    elements.maneuverResult.innerHTML = "";
    return;
  }

  const color = severityColor(assessment.newSeverity);
  elements.maneuverResult.style.setProperty("--alert-color", color);
  elements.maneuverResult.innerHTML = `
    <h3>Response Result</h3>
    <dl>
      <div><dt>Before</dt><dd>${decimal(assessment.oldDistance, 2)} km / ${assessment.oldSeverity}</dd></div>
      <div><dt>After</dt><dd>${decimal(assessment.newDistance, 2)} km / ${assessment.newSeverity}</dd></div>
      <div><dt>Fuel cost</dt><dd>${decimal(assessment.deltaV, 2)} m/s delta-v</dd></div>
      <div><dt>Mission impact</dt><dd>${assessment.deltaV > 1 ? "moderate" : "low"}</dd></div>
    </dl>
    <p>${escapeHTML(assessment.impact)}</p>
  `;
}

function renderTrafficHealthMap(shells = buildTrafficHealthShells()) {
  elements.trafficHealthMap.innerHTML = shells.map((shell) => `
    <article class="health-shell" style="--shell-color: ${shell.color}">
      <header><strong>${escapeHTML(shell.label)}</strong><span>${Math.round(shell.health)}/100</span></header>
      <div class="health-bar"><span style="width: ${Math.round(shell.health)}%"></span></div>
      <small>${numberFormat(shell.objects)} objects, ${numberFormat(shell.debris)} debris-like. Status: ${escapeHTML(shell.risk)}.</small>
    </article>
  `).join("");
}

function renderTrafficForecast(shells = buildTrafficHealthShells()) {
  const years = Number(state.traffic.forecastYears || 10);
  const summary = summarize(state.objects);
  const launchGrowth = years * (state.traffic.emergencyActive ? 540 : 390);
  const decayCredit = years * (state.scenario.deorbitCompliance / 100) * 72;
  const projectedObjects = Math.round(summary.total + launchGrowth - decayCredit + state.traffic.emergencyFragments);
  const crowded = [...shells].sort((a, b) => a.health - b.health)[0];
  const riskTrend = projectedObjects > summary.total * 1.28 || crowded.health < 42 ? "High" : projectedObjects > summary.total * 1.12 ? "Medium" : "Moderate";

  elements.trafficForecast.innerHTML = `
    <h3>Traffic Forecast: ${new Date().getFullYear() + years}</h3>
    <p>At the modeled launch rate, the catalog grows from ${numberFormat(summary.total)} to about ${numberFormat(projectedObjects)} objects. The weakest shell is ${escapeHTML(crowded.label)} with a health score of ${Math.round(crowded.health)}/100.</p>
    <p>Forecast risk: <strong>${riskTrend}</strong>. Strong 5-year deorbit compliance reduces projected congestion by about ${Math.round(state.scenario.deorbitCompliance * 0.31)}% in this educational model.</p>
  `;
}

function populateOperatorSelect() {
  if (!elements.operatorSatelliteSelect || elements.operatorSatelliteSelect.options.length) {
    return;
  }

  const candidates = state.objects
    .filter((object) => object.activePayload)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 18);

  for (const object of candidates) {
    const option = document.createElement("option");
    option.value = String(object.norad || object.name);
    option.textContent = object.name;
    elements.operatorSatelliteSelect.append(option);
  }
}

function selectedOperatorObject() {
  const selected = elements.operatorSatelliteSelect?.value;
  return state.objects.find((object) => String(object.norad || object.name) === selected) || state.objects.find((object) => object.activePayload) || state.objects[0];
}

function renderOperatorView() {
  const object = selectedOperatorObject();

  if (!object) {
    elements.operatorView.innerHTML = `<p class="empty-state">No satellite selected.</p>`;
    return;
  }

  const fuel = clamp(92 - object.age * 3.2 - object.riskScore * 0.12, 18, 96);
  const lifetime = clamp((1200 - Math.min(object.altitude, 1200)) / 140 + (object.orbitClass === "GEO" ? 14 : 2), 0.8, 18);
  const alerts = buildTrafficAlerts().filter((alert) => alert.primary === object.name || alert.secondary === object.name).length || Math.round(seededUnit((object.norad || 100) + 5) * 3);

  elements.operatorView.innerHTML = `
    <span>${escapeHTML(typeLabel(object.type))} operations snapshot</span>
    <h3>${escapeHTML(object.name)}</h3>
    <dl>
      <div><dt>Orbit</dt><dd>${escapeHTML(object.orbitClass)}</dd></div>
      <div><dt>Altitude</dt><dd>${numberFormat(object.altitude)} km</dd></div>
      <div><dt>Inclination</dt><dd>${decimal(object.inclination, 1)} deg</dd></div>
      <div><dt>Fuel estimate</dt><dd>${Math.round(fuel)}%</dd></div>
      <div><dt>Conjunction alerts</dt><dd>${alerts}</dd></div>
      <div><dt>Lifetime estimate</dt><dd>${decimal(lifetime, 1)} years</dd></div>
    </dl>
    <p>Recommended action: maintain tracking data quality, keep maneuver margin, and review disposal planning before end of mission.</p>
  `;
}

function renderTrafficCommandLog() {
  if (!elements.trafficCommandLog) {
    return;
  }

  if (!state.traffic.commandLog.length) {
    state.traffic.commandLog = [
      { timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), message: "Space Traffic Control Center initialized." }
    ];
  }

  elements.trafficCommandLog.innerHTML = state.traffic.commandLog.map((entry) => `
    <div class="log-entry"><span>${escapeHTML(entry.timestamp)}</span><strong>${escapeHTML(entry.message)}</strong></div>
  `).join("");
}

function drawTrafficMap(alerts = buildTrafficAlerts(), shells = buildTrafficHealthShells(), now = performance.now()) {
  const canvas = elements.trafficMapCanvas;

  if (!canvas) {
    return;
  }

  const { context, width, height } = setCanvasSize(canvas);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#020617";
  context.fillRect(0, 0, width, height);

  const centerX = width * 0.5;
  const centerY = height * 0.52;
  const earthRadius = Math.min(width, height) * 0.15;
  drawDigitalTwinEarth(context, centerX, centerY, earthRadius, now);

  shells.forEach((shell, index) => {
    const radius = earthRadius + (index + 1) * Math.min(width, height) * 0.052;
    context.strokeStyle = hexToRgba(shell.color, 0.22 + (100 - shell.health) / 360);
    context.lineWidth = shell.health < 45 ? 4 : 1.4;
    context.beginPath();
    context.ellipse(centerX, centerY, radius, radius * 0.34, -0.24, 0, Math.PI * 2);
    context.stroke();
  });

  const sample = representativeObjects(state.objects, [], 170);
  for (let index = 0; index < sample.length; index += 1) {
    const object = sample[index];
    const radius = fallbackScaleAltitude(object.altitude, earthRadius, Math.min(width, height) * 0.44);
    const angle = seededUnit((object.norad || index) + 63) * Math.PI * 2 + now * 0.00005 * (1 + seededUnit(index + 12));
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.34;
    context.fillStyle = getObjectColor(object);
    context.globalAlpha = object.riskScore > 70 ? 0.9 : 0.55;
    context.beginPath();
    context.arc(x, y, object.riskScore > 70 ? 2.2 : 1.35, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  for (const alert of alerts.slice(0, 4)) {
    const radius = fallbackScaleAltitude(alert.altitude, earthRadius, Math.min(width, height) * 0.44);
    const angleA = seededUnit(alert.timeToTcaMinutes + 200) * Math.PI * 2 + now * 0.00012;
    const angleB = angleA + 0.18 + alert.missDistanceKm * 0.035;
    const ax = centerX + Math.cos(angleA) * radius;
    const ay = centerY + Math.sin(angleA) * radius * 0.34;
    const bx = centerX + Math.cos(angleB) * radius;
    const by = centerY + Math.sin(angleB) * radius * 0.34;
    const color = severityColor(alert.severity);
    context.strokeStyle = hexToRgba(color, 0.72);
    context.lineWidth = alert.severity === "Critical" ? 2.6 : 1.7;
    context.beginPath();
    context.moveTo(ax, ay);
    context.lineTo(bx, by);
    context.stroke();
    context.fillStyle = color;
    context.beginPath();
    context.arc(ax, ay, 3.5, 0, Math.PI * 2);
    context.arc(bx, by, 3, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = "rgb(203 213 225 / 0.82)";
  context.font = "700 12px Space Grotesk, sans-serif";
  context.fillText("Risk heat shells: blue stable, amber caution, red high risk", 18, 28);
}

function drawTrafficRadar(alerts = buildTrafficAlerts(), now = performance.now()) {
  const canvas = elements.trafficRadarCanvas;

  if (!canvas) {
    return;
  }

  const { context, width, height } = setCanvasSize(canvas);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#020617";
  context.fillRect(0, 0, width, height);
  const cx = width * 0.5;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.42;

  context.strokeStyle = "rgb(147 197 253 / 0.22)";
  context.lineWidth = 1;
  for (let ring = 1; ring <= 4; ring += 1) {
    context.beginPath();
    context.arc(cx, cy, radius * (ring / 4), 0, Math.PI * 2);
    context.stroke();
  }
  context.beginPath();
  context.moveTo(cx - radius, cy);
  context.lineTo(cx + radius, cy);
  context.moveTo(cx, cy - radius);
  context.lineTo(cx, cy + radius);
  context.stroke();

  const sweep = now * 0.0014;
  const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, hexToRgba(readCssVar("--accent", "#93c5fd"), 0.18));
  gradient.addColorStop(1, "rgb(0 0 0 / 0)");
  context.fillStyle = gradient;
  context.beginPath();
  context.moveTo(cx, cy);
  context.arc(cx, cy, radius, sweep - 0.16, sweep + 0.02);
  context.closePath();
  context.fill();

  alerts.forEach((alert, index) => {
    const angle = seededUnit(index + 310) * Math.PI * 2;
    const r = radius * (0.22 + seededUnit(index + 320) * 0.72);
    context.fillStyle = severityColor(alert.severity);
    context.beginPath();
    context.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, alert.severity === "Critical" ? 4 : 2.8, 0, Math.PI * 2);
    context.fill();
  });
}

function renderTrafficControl() {
  if (!elements.trafficMapCanvas) {
    return;
  }

  const summary = summarize(state.objects);
  const alerts = buildTrafficAlerts();
  const selected = selectedTrafficAlert(alerts);
  const shells = buildTrafficHealthShells();
  const highRiskCount = alerts.filter((alert) => ["High", "Critical"].includes(alert.severity)).length;
  const [crowdedBand] = buildHotspots(state.objects);
  const dragLevel = state.weather.space?.drag?.level || state.weather.space?.storm?.label || "Moderate";

  elements.trafficTrackedObjects.textContent = numberFormat(summary.total + state.traffic.emergencyFragments);
  elements.trafficActivePayloads.textContent = numberFormat(summary.active);
  elements.trafficDebrisObjects.textContent = numberFormat(summary.debris + state.traffic.emergencyFragments);
  elements.trafficHighRiskPasses.textContent = numberFormat(highRiskCount);
  elements.trafficCrowdedBand.textContent = crowdedBand ? `${crowdedBand.band} km` : "-";
  elements.trafficCrowdedBandNote.textContent = crowdedBand ? `${numberFormat(crowdedBand.count)} objects in shell` : "No shell data";
  elements.trafficDragRisk.textContent = dragLevel;
  elements.trafficDragRiskNote.textContent = state.weather.space?.drag?.interpretation || "Space weather model updates when weather data is available.";
  elements.maneuverSelect.value = state.traffic.maneuver;
  elements.trafficForecastYears.value = String(state.traffic.forecastYears);

  populateOperatorSelect();
  renderTrafficAlerts(alerts);
  renderSelectedTrafficAlert(selected);
  renderManeuverResult();
  renderTrafficHealthMap(shells);
  renderTrafficForecast(shells);
  renderOperatorView();
  renderTrafficCommandLog();
  drawTrafficMap(alerts, shells);
  drawTrafficRadar(alerts);
}

function buildTrafficReportPayload() {
  const alerts = buildTrafficAlerts();
  const selected = selectedTrafficAlert(alerts);
  const assessment = maneuverAssessment(selected);
  const shells = buildTrafficHealthShells();

  return {
    project: "OrbitGuard",
    creator: CREATOR.name,
    generatedAt: new Date().toISOString(),
    mode: "Space Traffic Control Center",
    globalStatus: {
      trackedObjects: state.objects.length + state.traffic.emergencyFragments,
      activePayloads: summarize(state.objects).active,
      debrisObjects: summarize(state.objects).debris + state.traffic.emergencyFragments,
      highRiskPasses: alerts.filter((alert) => ["High", "Critical"].includes(alert.severity)).length,
      emergencyEventActive: state.traffic.emergencyActive
    },
    selectedAlert: selected,
    maneuverAssessment: assessment,
    orbitalHealthMap: shells,
    commandLog: state.traffic.commandLog,
    methodology:
      "Educational simulation based on orbital band density, catalog object type, simplified close-approach severity, and maneuver response rules. Not operational conjunction assessment."
  };
}

function exportTrafficReport() {
  downloadJSON("orbitguard-space-traffic-control-report.json", buildTrafficReportPayload());
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

function isEarthEnvironment() {
  return state.mode !== "dashboard" || state.solarSystem.environment === "earth";
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
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const ocean = ctx.createLinearGradient(0, 0, 0, height);
  ocean.addColorStop(0, "#0b2f5f");
  ocean.addColorStop(0.18, "#0f5f9e");
  ocean.addColorStop(0.5, "#0875aa");
  ocean.addColorStop(0.78, "#0a4a82");
  ocean.addColorStop(1, "#061f43");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  for (let y = 0; y < height; y += 1) {
    const latitude = Math.abs((y / height) * 2 - 1);
    ctx.fillStyle = `rgb(255 255 255 / ${latitude * 0.095})`;
    ctx.fillRect(0, y, width, 1);
  }

  drawDetailedEarthMap(ctx, width, height);
  drawEarthCoastGlow(ctx, width, height);

  ctx.strokeStyle = "rgb(255 255 255 / 0.06)";
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

function createEarthBumpTexture(THREE) {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, width, height);

  const regions = [
    [[-168, 68], [-145, 61], [-124, 50], [-126, 38], [-116, 31], [-100, 21], [-83, 25], [-72, 40], [-53, 48], [-61, 58], [-83, 66], [-116, 72]],
    [[-86, 21], [-72, 18], [-62, 10], [-55, -2], [-48, -18], [-54, -36], [-69, -55], [-78, -35], [-81, -8]],
    [[-12, 60], [8, 62], [32, 58], [45, 47], [30, 38], [10, 42], [-8, 50]],
    [[-18, 35], [10, 38], [34, 31], [50, 12], [43, -16], [30, -35], [14, -35], [-5, -18], [-17, 7]],
    [[36, 58], [67, 68], [104, 64], [142, 54], [158, 41], [143, 24], [118, 20], [100, 7], [78, 20], [56, 25], [42, 39]],
    [[113, -12], [136, -10], [153, -24], [146, -39], [120, -35], [111, -22]],
    [[-180, -70], [-120, -74], [-60, -69], [0, -73], [60, -69], [120, -74], [180, -70], [180, -90], [-180, -90]]
  ];

  for (const points of regions) {
    ctx.beginPath();
    points.forEach(([lon, lat], index) => {
      const [x, y] = lonLatToCanvas(width, height, lon, lat);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = "#a6b080";
    ctx.fill();
  }

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 4;
  const mountainChains = [
    [[-122, 55], [-112, 42], [-106, 31], [-100, 19]],
    [[-78, 7], [-73, -10], [-70, -25], [-68, -45]],
    [[7, 43], [16, 46], [27, 44], [38, 39]],
    [[68, 35], [82, 32], [95, 29]]
  ];
  for (const chain of mountainChains) {
    ctx.beginPath();
    chain.forEach(([lon, lat], index) => {
      const [x, y] = lonLatToCanvas(width, height, lon, lat);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createEarthLightsTexture(THREE) {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  const clusters = [
    [-74, 40.7, 28, 1.0],
    [-118.2, 34.05, 20, 0.8],
    [-95.37, 29.76, 18, 0.7],
    [-0.12, 51.5, 28, 0.95],
    [2.35, 48.85, 22, 0.75],
    [31.24, 30.04, 18, 0.62],
    [77.2, 28.6, 20, 0.7],
    [116.4, 39.9, 26, 0.82],
    [139.7, 35.7, 30, 0.95],
    [151.2, -33.9, 16, 0.65],
    [18.4, -33.9, 14, 0.5],
    [-46.6, -23.55, 20, 0.75]
  ];

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const [lon, lat, count, intensity] of clusters) {
    const [cx, cy] = lonLatToCanvas(width, height, lon, lat);
    for (let index = 0; index < count; index += 1) {
      const angle = seededUnit(lon * 31 + lat * 17 + index) * Math.PI * 2;
      const distance = seededUnit(lon * 47 + lat * 29 + index) ** 1.8 * 44;
      const x = cx + Math.cos(angle) * distance;
      const y = cy + Math.sin(angle) * distance * 0.56;
      const radius = 1.1 + seededUnit(lon * 53 + index) * 2.8;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 5);
      gradient.addColorStop(0, `rgb(255 226 143 / ${0.42 * intensity})`);
      gradient.addColorStop(1, "rgb(255 226 143 / 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function drawDetailedEarthMap(ctx, width, height) {
  const regions = [
    {
      color: "#328a5a",
      points: [[-168, 68], [-145, 61], [-124, 50], [-126, 38], [-116, 31], [-100, 21], [-83, 25], [-72, 40], [-53, 48], [-61, 58], [-83, 66], [-116, 72]]
    },
    {
      color: "#2f8154",
      points: [[-86, 21], [-72, 18], [-62, 10], [-55, -2], [-48, -18], [-54, -36], [-69, -55], [-78, -35], [-81, -8]]
    },
    {
      color: "#7fa05d",
      points: [[-12, 60], [8, 62], [32, 58], [45, 47], [30, 38], [10, 42], [-8, 50]]
    },
    {
      color: "#b99558",
      points: [[-18, 35], [10, 38], [34, 31], [50, 12], [43, -16], [30, -35], [14, -35], [-5, -18], [-17, 7]]
    },
    {
      color: "#3d8f5b",
      points: [[36, 58], [67, 68], [104, 64], [142, 54], [158, 41], [143, 24], [118, 20], [100, 7], [78, 20], [56, 25], [42, 39]]
    },
    {
      color: "#9f9d58",
      points: [[67, 25], [81, 29], [89, 21], [82, 8], [72, 7], [68, 18]]
    },
    {
      color: "#36875d",
      points: [[96, 18], [110, 17], [122, 8], [112, -6], [101, 0]]
    },
    {
      color: "#bc9652",
      points: [[113, -12], [136, -10], [153, -24], [146, -39], [120, -35], [111, -22]]
    },
    {
      color: "#e1eef8",
      points: [[-55, 80], [-22, 76], [-19, 64], [-45, 59], [-64, 70]]
    },
    {
      color: "#dbeafe",
      points: [[-180, -70], [-120, -74], [-60, -69], [0, -73], [60, -69], [120, -74], [180, -70], [180, -90], [-180, -90]]
    },
    {
      color: "#2f7d55",
      points: [[-92, 18], [-78, 22], [-66, 18], [-61, 9], [-73, 7], [-84, 12]]
    },
    {
      color: "#3c8a60",
      points: [[46, -13], [50, -20], [49, -27], [44, -25], [43, -17]]
    },
    {
      color: "#33845d",
      points: [[120, 23], [124, 20], [122, 14], [119, 17]]
    },
    {
      color: "#7f9f63",
      points: [[138, 45], [146, 42], [144, 34], [136, 35]]
    },
    {
      color: "#dbeafe",
      points: [[-54, 83], [-30, 82], [-22, 76], [-42, 72], [-62, 76]]
    }
  ];

  regions.forEach((region, index) => drawGeoRegion(ctx, width, height, region.points, region.color, index + 11));
  drawEarthOceanDetail(ctx, width, height);
  drawEarthMountainChains(ctx, width, height);
  drawEarthPlaceMarkers(ctx, width, height);
}

function drawEarthCoastGlow(ctx, width, height) {
  const coastlines = [
    [[-168, 68], [-145, 61], [-124, 50], [-126, 38], [-116, 31], [-100, 21], [-83, 25], [-72, 40], [-53, 48], [-61, 58], [-83, 66], [-116, 72]],
    [[-86, 21], [-72, 18], [-62, 10], [-55, -2], [-48, -18], [-54, -36], [-69, -55], [-78, -35], [-81, -8]],
    [[-12, 60], [8, 62], [32, 58], [45, 47], [30, 38], [10, 42], [-8, 50]],
    [[-18, 35], [10, 38], [34, 31], [50, 12], [43, -16], [30, -35], [14, -35], [-5, -18], [-17, 7]],
    [[36, 58], [67, 68], [104, 64], [142, 54], [158, 41], [143, 24], [118, 20], [100, 7], [78, 20], [56, 25], [42, 39]],
    [[113, -12], [136, -10], [153, -24], [146, -39], [120, -35], [111, -22]],
    [[-180, -70], [-120, -74], [-60, -69], [0, -73], [60, -69], [120, -74], [180, -70]]
  ];

  ctx.save();
  ctx.shadowColor = "rgb(147 197 253 / 0.72)";
  ctx.shadowBlur = 7;
  ctx.strokeStyle = "rgb(226 232 240 / 0.38)";
  ctx.lineWidth = 2.2;

  for (const coastline of coastlines) {
    ctx.beginPath();
    coastline.forEach(([lon, lat], index) => {
      const [x, y] = lonLatToCanvas(width, height, lon, lat);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

function drawEarthOceanDetail(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgb(147 197 253 / 0.12)";
  ctx.lineWidth = 1;

  for (let index = 0; index < 28; index += 1) {
    const y = height * (0.18 + seededUnit(index + 31) * 0.64);
    const x = seededUnit(index + 41) * width;
    ctx.beginPath();
    ctx.moveTo(x - 180, y);
    ctx.bezierCurveTo(x - 70, y - 26, x + 82, y + 28, x + 230, y - 8);
    ctx.stroke();
  }

  ctx.restore();
}

function lonLatToCanvas(width, height, lon, lat) {
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}

function drawGeoRegion(ctx, width, height, points, color, seed) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgb(226 232 240 / 0.28)";
  ctx.lineWidth = 1.25;
  ctx.beginPath();

  points.forEach(([lon, lat], index) => {
    const [x, y] = lonLatToCanvas(width, height, lon, lat);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.clip();

  const xs = points.map(([lon, lat]) => lonLatToCanvas(width, height, lon, lat)[0]);
  const ys = points.map(([lon, lat]) => lonLatToCanvas(width, height, lon, lat)[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (let index = 0; index < 32; index += 1) {
    const x = minX + seededUnit(seed * 43 + index) * (maxX - minX);
    const y = minY + seededUnit(seed * 59 + index) * (maxY - minY);
    const rx = 8 + seededUnit(seed * 71 + index) * 26;
    const ry = 2 + seededUnit(seed * 83 + index) * 9;
    ctx.fillStyle = index % 4 === 0 ? "rgb(245 201 119 / 0.24)" : "rgb(52 211 153 / 0.16)";
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, seededUnit(seed * 97 + index) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawEarthMountainChains(ctx, width, height) {
  const chains = [
    [[-122, 55], [-112, 42], [-106, 31], [-100, 19]],
    [[-78, 7], [-73, -10], [-70, -25], [-68, -45]],
    [[7, 43], [16, 46], [27, 44], [38, 39]],
    [[68, 35], [82, 32], [95, 29]]
  ];

  ctx.save();
  ctx.strokeStyle = "rgb(248 250 252 / 0.22)";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([3, 5]);

  for (const chain of chains) {
    ctx.beginPath();
    chain.forEach(([lon, lat], index) => {
      const [x, y] = lonLatToCanvas(width, height, lon, lat);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  ctx.restore();
}

function drawEarthPlaceMarkers(ctx, width, height) {
  const places = [
    ["Tucson", -110.97, 32.22],
    ["Madison", -86.75, 34.7],
    ["Houston", -95.37, 29.76],
    ["Cape Canaveral", -80.6, 28.4],
    ["London", -0.12, 51.5],
    ["Madrid", -3.7, 40.4],
    ["Tokyo", 139.7, 35.7],
    ["Sydney", 151.2, -33.9],
    ["Svalbard", 15.6, 78.2]
  ];

  ctx.save();
  ctx.font = "600 14px Space Grotesk, Arial, sans-serif";
  ctx.textBaseline = "middle";

  for (const [name, lon, lat] of places) {
    const [x, y] = lonLatToCanvas(width, height, lon, lat);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
    gradient.addColorStop(0, "rgb(253 224 71 / 0.95)");
    gradient.addColorStop(1, "rgb(253 224 71 / 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgb(255 255 255 / 0.78)";
    ctx.fillRect(x - 1.4, y - 1.4, 2.8, 2.8);
    ctx.fillStyle = "rgb(226 232 240 / 0.64)";
    ctx.fillText(name, x + 5, y - 6);
  }

  ctx.restore();
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

function lonLatToSpherePoint(lon, lat, radius) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;

  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  };
}

function createEarthSurfaceMarkers(THREE) {
  const group = new THREE.Group();
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xfde68a,
    transparent: true,
    opacity: 0.95,
    depthWrite: false
  });
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const places = [
    ["Cape Canaveral", -80.6, 28.4],
    ["Houston", -95.37, 29.76],
    ["Madison", -86.75, 34.7],
    ["Goldstone", -116.79, 35.25],
    ["Svalbard", 15.4, 78.2],
    ["Madrid", -3.7, 40.4],
    ["Canberra", 149.1, -35.3],
    ["Wallops", -75.48, 37.94]
  ];

  for (const [name, lon, lat] of places) {
    const point = lonLatToSpherePoint(lon, lat, 0.754);
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 8), markerMaterial.clone());
    marker.position.set(point.x, point.y, point.z);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 10), glowMaterial.clone());
    glow.position.copy(marker.position);
    const labelPoint = lonLatToSpherePoint(lon, lat, 0.86);
    const label = createBodyLabel(THREE, name, labelPoint.x, labelPoint.y, labelPoint.z, { depthTest: true });
    label.scale.set(0.5, 0.145, 1);
    group.add(glow, marker, label);
  }

  return group;
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

    const earthSystem = new THREE.Group();
    root.add(earthSystem);

    const earthTexture = createEarthTexture(THREE);
    const earthBumpTexture = createEarthBumpTexture(THREE);
    const earthLightsTexture = createEarthLightsTexture(THREE);
    const cloudTexture = createCloudTexture(THREE);
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 128, 128),
      new THREE.MeshStandardMaterial({
        map: earthTexture,
        bumpMap: earthBumpTexture,
        bumpScale: 0.045,
        emissive: 0xffd98a,
        emissiveMap: earthLightsTexture,
        emissiveIntensity: 0.22,
        roughness: 0.74,
        metalness: 0.05
      })
    );
    earthSystem.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.79, 64, 64),
      new THREE.MeshBasicMaterial({
        color: hexToNumber(readCssVar("--accent", "#60a5fa")),
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    earthSystem.add(atmosphere);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(0.748, 128, 128),
      new THREE.MeshBasicMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.52,
        depthWrite: false
      })
    );
    earthSystem.add(clouds);

    const earthMarkers = createEarthSurfaceMarkers(THREE);
    earth.add(earthMarkers);

    addThreeRing(THREE, earthSystem, altitudeToSceneRadius(2000), hexToNumber(readCssVar("--chart-leo", "#60a5fa")));
    addThreeRing(THREE, earthSystem, altitudeToSceneRadius(20200), hexToNumber(readCssVar("--chart-meo", "#86efac")));
    addThreeRing(THREE, earthSystem, altitudeToSceneRadius(35786), hexToNumber(readCssVar("--chart-geo", "#facc15")));

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
      earthSystem,
      earth,
      earthMarkers,
      atmosphere,
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
  const ring = new THREE.LineLoop(geometry, material);
  root.add(ring);
  return ring;
}

function animateOrbitScene() {
  if (!state.three.ready) {
    return;
  }

  if (!state.display.reduceMotion) {
    if (state.three.earth?.visible !== false) {
      state.three.earth.rotation.y += 0.00055;
    }

    if (state.three.clouds?.visible !== false) {
      state.three.clouds.rotation.y += 0.0009;
    }

    if (state.three.environmentGroup) {
      state.three.environmentGroup.traverse((child) => {
        if (child.userData?.rotateSpeed) {
          child.rotation.y += child.userData.rotateSpeed;
        }
      });
    }

    if (state.three.orbitTrailGroup) {
      state.three.orbitTrailGroup.traverse((child) => {
        if (child.userData?.rotateSpeed) {
          child.rotation.y += child.userData.rotateSpeed;
        }
      });
    }
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

  if (state.three.orbitTrailGroup) {
    state.three.root.remove(state.three.orbitTrailGroup);
    disposeObject3D(state.three.orbitTrailGroup);
  }

  state.three.objectPoints = null;
  state.three.launchPoints = null;
  state.three.modelGroup = null;
  state.three.orbitTrailGroup = null;

  if (state.three.environmentGroup) {
    state.three.root.remove(state.three.environmentGroup);
    disposeObject3D(state.three.environmentGroup);
    state.three.environmentGroup = null;
  }

  if (state.mode === "dashboard" && state.solarSystem.environment !== "earth") {
    if (state.three.earthSystem) {
      state.three.earthSystem.visible = false;
    }

    renderSolarEnvironmentScene(THREE);
    renderSolarSystemPanel();
    return;
  }

  if (state.three.earthSystem) {
    state.three.earthSystem.visible = true;
  }

  const catalogObjects = sceneCatalogObjects();
  const launchObjects = sceneLaunchObjects();

  state.three.objectPoints = createPointCloud(THREE, catalogObjects, state.mode === "time" ? 3200 : 2200, 0.028, false);
  state.three.launchPoints = launchObjects.length ? createPointCloud(THREE, launchObjects, 700, 0.056, true) : null;
  state.three.modelGroup = createObjectModelGroup(THREE, catalogObjects, launchObjects);

  if (state.display.showOrbitTrails) {
    state.three.orbitTrailGroup = createOrbitTrailGroup(THREE, catalogObjects, launchObjects);
    state.three.root.add(state.three.orbitTrailGroup);
  }

  state.three.root.add(state.three.objectPoints);

  if (state.three.launchPoints) {
    state.three.root.add(state.three.launchPoints);
  }

  state.three.root.add(state.three.modelGroup);
  renderSolarSystemPanel();
}

function renderSolarSystemPanel() {
  if (!elements.solarSystemPanel) {
    return;
  }

  const environment = state.mode === "dashboard" ? state.solarSystem.environment : "earth";
  const config = SOLAR_ENVIRONMENTS[environment] || SOLAR_ENVIRONMENTS.earth;
  const space = state.weather.space;
  const marsDelay = simulatedMarsDelayMinutes();
  const lunarScore = lunarNetworkScore();

  elements.orbitViewerTitle.textContent = config.title;
  elements.solarSystemPanel.innerHTML = `
    <article class="environment-card primary">
      <span>Selected body</span>
      <strong>${config.body}</strong>
      <p>${config.challenge}</p>
    </article>
    <article class="environment-card">
      <span>Mission risk</span>
      <strong>${config.risk}</strong>
      <p>${config.concern}</p>
    </article>
    <article class="environment-card">
      <span>Recommended design</span>
      <strong>${environment === "earth" ? `${numberFormat(state.objects.length)} tracked objects` : environment === "moon" ? `${lunarScore.coverage}% lunar relay coverage` : environment === "mars" ? `${marsDelay} min one-way delay` : environment === "sun" ? `${space?.kp?.value?.toFixed?.(1) || "Live"} Kp index` : "Plan disposal early"}</strong>
      <p>${config.recommendation}</p>
    </article>
  `;
}

function lunarNetworkScore() {
  const satellites = clamp(Math.round(state.launch.satellites || 6), 1, 24);
  const altitude = clamp(state.launch.altitude || 550, 100, 8000);
  const coverage = clamp(42 + satellites * 7 + Math.log10(altitude + 100) * 9, 45, 96);
  const sustainability = clamp(92 - satellites * 1.9 - (altitude > 3000 ? 10 : 0) + (state.launch.deorbitPlan ? 8 : -12), 35, 95);
  return { coverage: Math.round(coverage), sustainability: Math.round(sustainability) };
}

function simulatedMarsDelayMinutes() {
  const dayOfYear = Math.floor((Date.now() / 86400000) % 687);
  const cycle = (Math.sin((dayOfYear / 687) * Math.PI * 2) + 1) / 2;
  return decimal(4.3 + cycle * 19.7, 1);
}

function renderSolarEnvironmentScene(THREE) {
  const environment = state.solarSystem.environment;
  const group = new THREE.Group();
  group.rotation.x = -0.18;
  group.rotation.y = 0.18;
  state.three.environmentGroup = group;
  state.three.root.add(group);
  group.add(createEnvironmentStarField(THREE, environment === "overview" ? 1400 : 900, environment === "overview" ? 12 : 8));

  if (environment === "moon") {
    buildMoonEnvironment(THREE, group);
  } else if (environment === "mars") {
    buildMarsEnvironment(THREE, group);
  } else if (environment === "sun") {
    buildSolarWeatherEnvironment(THREE, group);
  } else {
    buildSolarSystemOverview(THREE, group);
  }

  state.three.camera.position.set(0, 1.1, environment === "overview" ? 8.8 : 6.5);
  state.three.controls.target.set(0, 0, 0);
  state.three.controls.minDistance = 2.6;
  state.three.controls.maxDistance = environment === "overview" ? 16 : 10;
  state.three.camera.lookAt(0, 0, 0);
  state.three.camera.updateProjectionMatrix();
}

function buildMoonEnvironment(THREE, group) {
  const moonTexture = createMoonTexture(THREE);
  const moonBump = createMoonBumpTexture(THREE);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.82, 128, 128),
    new THREE.MeshStandardMaterial({
      map: moonTexture,
      bumpMap: moonBump,
      bumpScale: 0.055,
      roughness: 0.95,
      metalness: 0.02
    })
  );
  moon.userData.rotateSpeed = 0.00028;
  group.add(moon);
  group.add(createMoonTerminator(THREE, 0.825));

  const earth = createTexturedBody(THREE, 0.22, createEarthTexture(THREE), { roughness: 0.78 });
  earth.position.set(-2.65, 1.18, -1.05);
  earth.userData.rotateSpeed = 0.00065;
  const earthGlow = createAtmosphereGlow(THREE, 0.28, 0x60a5fa, 0.18);
  earthGlow.position.copy(earth.position);
  group.add(earth, earthGlow, createBodyLabel(THREE, "Earth in distance", -2.65, 1.55, -1.05));

  addTiltedOrbitRing(THREE, group, 1.35, 0xcbd5e1, 0.58, 0.35);
  addTiltedOrbitRing(THREE, group, 1.85, hexToNumber(readCssVar("--simulated-color", "#a78bfa")), 0.6, -0.08);
  addMissionArc(THREE, group, 0x93c5fd, 2.4, -0.9, 0.7);
  addLunarGateway(THREE, group, 1.35, 0.42);
  addCislunarTransferPath(THREE, group);

  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    const sat = createMiniRelaySatellite(THREE, 0xcbd5e1);
    sat.position.set(Math.cos(angle) * 1.55, Math.sin(angle) * 0.2, Math.sin(angle) * 1.1);
    sat.lookAt(0, 0, 0);
    group.add(sat);
  }

  group.add(createBodyLabel(THREE, "South Pole candidate region", 0.16, -0.82, 0.5));
}

function buildMarsEnvironment(THREE, group) {
  const marsTexture = createMarsTexture(THREE);
  const marsBump = createMarsBumpTexture(THREE);
  const mars = new THREE.Mesh(
    new THREE.SphereGeometry(0.86, 128, 128),
    new THREE.MeshStandardMaterial({
      map: marsTexture,
      bumpMap: marsBump,
      bumpScale: 0.04,
      roughness: 0.92,
      metalness: 0.02
    })
  );
  mars.userData.rotateSpeed = 0.00042;
  group.add(mars);
  group.add(createAtmosphereGlow(THREE, 0.96, 0xf97316, 0.12));
  group.add(createMarsDustShell(THREE));

  addTiltedOrbitRing(THREE, group, 1.32, 0xf97316, 0.64, 0.18);
  addTiltedOrbitRing(THREE, group, 1.78, 0xfca5a5, 0.58, -0.12);
  addMissionArc(THREE, group, 0x60a5fa, 2.7, -1.2, 0.95);

  const phobos = createRockMoon(THREE, 0.065);
  phobos.position.set(1.18, 0.18, 0.32);
  const deimos = createRockMoon(THREE, 0.045);
  deimos.position.set(-1.72, -0.1, -0.4);
  group.add(phobos, deimos, createBodyLabel(THREE, "Phobos", 1.28, 0.32, 0.36), createBodyLabel(THREE, "Deimos", -1.82, 0.06, -0.4));

  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2;
    const sat = createMiniRelaySatellite(THREE, 0xf97316);
    sat.position.set(Math.cos(angle) * 1.62, Math.sin(angle) * 0.22, Math.sin(angle) * 1.0);
    sat.lookAt(0, 0, 0);
    group.add(sat);
  }

  group.add(createBodyLabel(THREE, `${simulatedMarsDelayMinutes()} min one-way delay`, 0, 1.32, 0));
  group.add(createBodyLabel(THREE, "Valles Marineris / dust risk", -0.18, -1.02, 0.65));
}

function buildSolarWeatherEnvironment(THREE, group) {
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 128, 128),
    new THREE.MeshBasicMaterial({
      map: createSunTexture(THREE),
      color: 0xffd166
    })
  );
  sun.userData.rotateSpeed = 0.0009;
  group.add(sun);

  group.add(createSolarCorona(THREE));
  group.add(createSolarProminences(THREE));

  addSolarWindParticles(THREE, group);
  addMissionArc(THREE, group, 0xfacc15, 2.9, -0.2, 0.42);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 48, 48),
    new THREE.MeshStandardMaterial({ map: createEarthTexture(THREE), roughness: 0.78 })
  );
  earth.position.set(2.45, -0.25, -0.4);
  group.add(earth, createMagnetosphere(THREE, 2.45, -0.25, -0.4), createBodyLabel(THREE, "LEO drag affected", 2.45, 0.2, -0.4));
}

function buildSolarSystemOverview(THREE, group) {
  const planets = [
    { name: "Sun", orbit: 0, angle: 0, radius: 0.42, texture: createSunTexture(THREE), emissive: true },
    { name: "Mercury", orbit: 0.82, angle: 0.62, radius: 0.065, texture: createRockyPlanetTexture(THREE, "mercury") },
    { name: "Venus", orbit: 1.14, angle: 2.02, radius: 0.105, texture: createRockyPlanetTexture(THREE, "venus"), glow: 0xfde68a },
    { name: "Earth", orbit: 1.5, angle: 3.02, radius: 0.13, texture: createEarthTexture(THREE), glow: 0x60a5fa },
    { name: "Moon", orbit: 1.68, angle: 3.12, radius: 0.038, texture: createMoonTexture(THREE) },
    { name: "Mars", orbit: 1.95, angle: 4.16, radius: 0.1, texture: createMarsTexture(THREE), glow: 0xf97316 },
    { name: "Jupiter", orbit: 2.8, angle: 5.16, radius: 0.29, texture: createGasGiantTexture(THREE, "jupiter") },
    { name: "Saturn", orbit: 3.65, angle: 0.26, radius: 0.24, texture: createGasGiantTexture(THREE, "saturn"), rings: true },
    { name: "Uranus", orbit: 4.35, angle: 1.32, radius: 0.17, texture: createGasGiantTexture(THREE, "uranus"), rings: "thin" },
    { name: "Neptune", orbit: 5.0, angle: 2.58, radius: 0.16, texture: createGasGiantTexture(THREE, "neptune") }
  ];

  for (const planetInfo of planets) {
    const { name, orbit, angle, radius } = planetInfo;
    const material = planetInfo.emissive
      ? new THREE.MeshBasicMaterial({ map: planetInfo.texture, color: 0xfff0a6 })
      : new THREE.MeshStandardMaterial({ map: planetInfo.texture, roughness: 0.74, metalness: 0.03 });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 64), material);
    planet.position.set(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit * 0.42);
    planet.userData.rotateSpeed = 0.00025 + radius * 0.001;
    group.add(planet, createBodyLabel(THREE, name, planet.position.x, radius + 0.2, planet.position.z));

    if (planetInfo.glow) {
      const glow = createAtmosphereGlow(THREE, radius * 1.45, planetInfo.glow, 0.11);
      glow.position.copy(planet.position);
      group.add(glow);
    }

    if (name !== "Sun") {
      const orbitRing = addThreeRing(THREE, group, orbit, planetInfo.glow || 0x94a3b8);
      orbitRing.material.opacity = 0.18;
      orbitRing.scale.z = 0.42;
    }

    if (planetInfo.rings) {
      const ring = createPlanetRingSystem(THREE, radius, planetInfo.rings === "thin");
      ring.position.copy(planet.position);
      ring.rotation.x = Math.PI / 2.5;
      ring.rotation.z = -0.22;
      group.add(ring);
    }
  }

  group.add(createAsteroidBelt(THREE, 2.25, 2.54));
  addMissionArc(THREE, group, 0x60a5fa, 1.9, -1.45, 0.55);
  addMissionArc(THREE, group, 0xa78bfa, 2.6, -1.25, 0.85);
  group.add(createBodyLabel(THREE, "Mission paths are schematic", 0.2, -0.72, 0));
}

function createTextureFromCanvas(THREE, canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createTexturedBody(THREE, radius, texture, materialOptions = {}) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 96, 96),
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.78,
      metalness: 0.03,
      ...materialOptions
    })
  );
}

function createEnvironmentStarField(THREE, count, spread) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = spread * (0.46 + seededUnit(index + 1201) * 0.54);
    const theta = seededUnit(index + 1203) * Math.PI * 2;
    const phi = Math.acos(2 * seededUnit(index + 1205) - 1);
    positions[offset] = Math.sin(phi) * Math.cos(theta) * radius;
    positions[offset + 1] = Math.cos(phi) * radius * 0.72;
    positions[offset + 2] = Math.sin(phi) * Math.sin(theta) * radius;
    const warmth = seededUnit(index + 1207);
    colors[offset] = 0.76 + warmth * 0.24;
    colors[offset + 1] = 0.82 + warmth * 0.14;
    colors[offset + 2] = 0.95;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const stars = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    })
  );
  stars.userData.rotateSpeed = 0.00006;
  return stars;
}

function createAtmosphereGlow(THREE, radius, color, opacity) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 72, 72),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
}

function addTiltedOrbitRing(THREE, group, radius, color, tilt = 0.55, yaw = 0) {
  const ring = addThreeRing(THREE, group, radius, color);
  ring.rotation.x = Math.PI / 2.9 + tilt * 0.2;
  ring.rotation.z = yaw;
  ring.scale.z = 0.72;
  ring.material.opacity = 0.5;
  return ring;
}

function createMoonTerminator(THREE, radius) {
  const terminator = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 72, 72),
    new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.MultiplyBlending
    })
  );
  terminator.scale.set(1, 1, 0.985);
  terminator.rotation.y = -0.62;
  return terminator;
}

function addCislunarTransferPath(THREE, group) {
  const curvePoints = [];
  for (let index = 0; index <= 96; index += 1) {
    const t = index / 96;
    curvePoints.push(new THREE.Vector3(
      -2.42 + t * 2.64,
      0.78 + Math.sin(t * Math.PI) * 0.34,
      -0.96 + Math.sin(t * Math.PI * 1.3) * 0.46
    ));
  }

  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curvePoints),
    new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.74 })
  );
  group.add(line);
}

function createMarsDustShell(THREE) {
  const geometry = new THREE.BufferGeometry();
  const count = 260;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const angle = seededUnit(index + 1301) * Math.PI * 2;
    const radius = 0.94 + seededUnit(index + 1303) * 0.08;
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = (seededUnit(index + 1305) - 0.5) * 0.52;
    positions[offset + 2] = Math.sin(angle) * radius * 0.68;
    colors[offset] = 1;
    colors[offset + 1] = 0.58 + seededUnit(index + 1307) * 0.16;
    colors[offset + 2] = 0.24;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const dust = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  dust.userData.rotateSpeed = 0.00032;
  return dust;
}

function createSolarCorona(THREE) {
  const group = new THREE.Group();
  const coronaColors = [
    [1.12, 0xfacc15, 0.24],
    [1.34, 0xfb923c, 0.15],
    [1.62, 0xef4444, 0.07]
  ];

  for (const [radius, color, opacity] of coronaColors) {
    group.add(createAtmosphereGlow(THREE, radius, color, opacity));
  }

  return group;
}

function createSolarProminences(THREE) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.72 });

  for (let loopIndex = 0; loopIndex < 11; loopIndex += 1) {
    const points = [];
    const base = seededUnit(loopIndex + 1411) * Math.PI * 2;
    const width = 0.22 + seededUnit(loopIndex + 1413) * 0.22;
    const height = 0.18 + seededUnit(loopIndex + 1415) * 0.32;

    for (let index = 0; index <= 32; index += 1) {
      const t = index / 32;
      const angle = base + (t - 0.5) * width;
      const radius = 0.95 + Math.sin(t * Math.PI) * height;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        (seededUnit(loopIndex + 1417) - 0.5) * 0.9 + Math.sin(t * Math.PI) * height * 0.36,
        Math.sin(angle) * radius
      ));
    }

    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material.clone()));
  }

  group.userData.rotateSpeed = 0.00045;
  return group;
}

function createPlanetRingSystem(THREE, radius, thin = false) {
  const group = new THREE.Group();
  const bands = thin
    ? [[1.55, 0.008, 0xbae6fd, 0.32], [1.82, 0.006, 0xe0f2fe, 0.22]]
    : [[1.38, 0.014, 0xfde68a, 0.56], [1.68, 0.018, 0xf8c471, 0.42], [1.95, 0.012, 0xfef3c7, 0.34]];

  for (const [scale, tube, color, opacity] of bands) {
    group.add(new THREE.Mesh(
      new THREE.TorusGeometry(radius * scale, tube, 8, 96),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    ));
  }

  return group;
}

function createAsteroidBelt(THREE, inner, outer) {
  const count = 520;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = inner + seededUnit(index + 1501) * (outer - inner);
    const angle = seededUnit(index + 1503) * Math.PI * 2;
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = (seededUnit(index + 1505) - 0.5) * 0.08;
    positions[offset + 2] = Math.sin(angle) * radius * 0.35;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xcbd5e1, size: 0.012, transparent: true, opacity: 0.42 })
  );
}

function createMoonTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#eef2f7");
  gradient.addColorStop(0.45, "#9aa3b1");
  gradient.addColorStop(1, "#d9dee7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 26; index += 1) {
    const x = seededUnit(index + 1601) * canvas.width;
    const y = seededUnit(index + 1603) * canvas.height;
    const rx = 28 + seededUnit(index + 1605) * 92;
    const ry = rx * (0.36 + seededUnit(index + 1607) * 0.24);
    ctx.fillStyle = index % 3 === 0 ? "rgb(51 65 85 / 0.2)" : "rgb(15 23 42 / 0.12)";
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, seededUnit(index + 1609) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let index = 0; index < 180; index += 1) {
    const x = seededUnit(index + 4) * canvas.width;
    const y = seededUnit(index + 8) * canvas.height;
    const radius = 3 + seededUnit(index + 12) * 34;
    const rimAlpha = 0.14 + seededUnit(index) * 0.28;
    const fillAlpha = 0.035 + seededUnit(index + 2) * 0.095;
    ctx.strokeStyle = `rgb(15 23 42 / ${rimAlpha})`;
    ctx.fillStyle = `rgb(15 23 42 / ${fillAlpha})`;
    ctx.lineWidth = 0.8 + seededUnit(index + 18) * 2.2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = `rgb(248 250 252 / ${0.08 + seededUnit(index + 20) * 0.18})`;
    ctx.beginPath();
    ctx.arc(x - radius * 0.18, y - radius * 0.18, radius * 0.72, Math.PI * 0.95, Math.PI * 1.75);
    ctx.stroke();
  }

  for (let ray = 0; ray < 9; ray += 1) {
    const x = (0.18 + seededUnit(ray + 1711) * 0.68) * canvas.width;
    const y = (0.18 + seededUnit(ray + 1713) * 0.62) * canvas.height;
    ctx.strokeStyle = "rgb(248 250 252 / 0.13)";
    ctx.lineWidth = 1;
    for (let spoke = 0; spoke < 12; spoke += 1) {
      const angle = (spoke / 12) * Math.PI * 2 + seededUnit(ray + 1717) * 0.2;
      const length = 28 + seededUnit(ray * 31 + spoke) * 76;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length * 0.55);
      ctx.stroke();
    }
  }

  return createTextureFromCanvas(THREE, canvas);
}

function createMarsTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#6b2110");
  gradient.addColorStop(0.22, "#a93d17");
  gradient.addColorStop(0.52, "#d35c1f");
  gradient.addColorStop(0.82, "#9a3412");
  gradient.addColorStop(1, "#f2a268");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 120; index += 1) {
    ctx.fillStyle = index % 4 === 0 ? "rgb(254 215 170 / 0.28)" : "rgb(69 26 3 / 0.23)";
    ctx.beginPath();
    ctx.ellipse(
      seededUnit(index + 7) * canvas.width,
      seededUnit(index + 11) * canvas.height,
      12 + seededUnit(index + 13) * 52,
      3 + seededUnit(index + 17) * 14,
      seededUnit(index + 19) * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.strokeStyle = "rgb(69 26 3 / 0.52)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.16, canvas.height * 0.47);
  ctx.bezierCurveTo(canvas.width * 0.32, canvas.height * 0.42, canvas.width * 0.46, canvas.height * 0.52, canvas.width * 0.67, canvas.height * 0.45);
  ctx.bezierCurveTo(canvas.width * 0.76, canvas.height * 0.42, canvas.width * 0.82, canvas.height * 0.46, canvas.width * 0.9, canvas.height * 0.43);
  ctx.stroke();
  ctx.strokeStyle = "rgb(254 215 170 / 0.18)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const olympusX = canvas.width * 0.32;
  const olympusY = canvas.height * 0.35;
  const olympus = ctx.createRadialGradient(olympusX, olympusY, 0, olympusX, olympusY, 44);
  olympus.addColorStop(0, "rgb(254 215 170 / 0.42)");
  olympus.addColorStop(0.38, "rgb(120 53 15 / 0.35)");
  olympus.addColorStop(1, "rgb(120 53 15 / 0)");
  ctx.fillStyle = olympus;
  ctx.beginPath();
  ctx.arc(olympusX, olympusY, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgb(255 247 237 / 0.72)";
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.5, 24, 120, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgb(255 247 237 / 0.48)";
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.52, canvas.height - 18, 94, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  return createTextureFromCanvas(THREE, canvas);
}

function createSunTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 560);
  gradient.addColorStop(0, "#fff7ad");
  gradient.addColorStop(0.48, "#facc15");
  gradient.addColorStop(1, "#ea580c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 170; index += 1) {
    ctx.strokeStyle = `rgb(255 255 255 / ${0.1 + seededUnit(index) * 0.16})`;
    ctx.lineWidth = 1 + seededUnit(index + 2) * 3;
    ctx.beginPath();
    const y = seededUnit(index + 9) * canvas.height;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(130, y - 30, 260, y + 34, canvas.width, y - 6);
    ctx.stroke();
  }

  for (let index = 0; index < 34; index += 1) {
    const x = seededUnit(index + 1801) * canvas.width;
    const y = seededUnit(index + 1803) * canvas.height;
    const radius = 14 + seededUnit(index + 1805) * 46;
    const flare = ctx.createRadialGradient(x, y, 0, x, y, radius);
    flare.addColorStop(0, "rgb(255 255 255 / 0.42)");
    flare.addColorStop(0.4, "rgb(251 146 60 / 0.28)");
    flare.addColorStop(1, "rgb(239 68 68 / 0)");
    ctx.fillStyle = flare;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return createTextureFromCanvas(THREE, canvas);
}

function createMoonBumpTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#7f8792";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 220; index += 1) {
    const x = seededUnit(index + 1901) * canvas.width;
    const y = seededUnit(index + 1903) * canvas.height;
    const radius = 3 + seededUnit(index + 1905) * 38;
    ctx.strokeStyle = "rgb(245 245 245 / 0.55)";
    ctx.lineWidth = 1 + seededUnit(index + 1907) * 2.4;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgb(30 41 59 / 0.18)";
    ctx.beginPath();
    ctx.arc(x + radius * 0.12, y + radius * 0.12, radius * 0.72, 0, Math.PI * 2);
    ctx.fill();
  }

  return createTextureFromCanvas(THREE, canvas);
}

function createMarsBumpTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#8c5b3c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 130; index += 1) {
    ctx.fillStyle = index % 2 ? "rgb(245 158 11 / 0.28)" : "rgb(69 26 3 / 0.26)";
    ctx.beginPath();
    ctx.ellipse(
      seededUnit(index + 2001) * canvas.width,
      seededUnit(index + 2003) * canvas.height,
      10 + seededUnit(index + 2005) * 70,
      2 + seededUnit(index + 2007) * 16,
      seededUnit(index + 2009) * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  return createTextureFromCanvas(THREE, canvas);
}

function createRockyPlanetTexture(THREE, kind) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");
  const palettes = {
    mercury: ["#5b5f66", "#a3a3a3", "#3f3f46", "#d4d4d8"],
    venus: ["#8a5f18", "#fbbf24", "#fef3c7", "#b45309"]
  };
  const [dark, mid, light, accent] = palettes[kind] || palettes.mercury;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, light);
  gradient.addColorStop(0.46, mid);
  gradient.addColorStop(1, dark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 90; index += 1) {
    ctx.fillStyle = index % 3 === 0 ? `${accent}66` : "rgb(15 23 42 / 0.14)";
    ctx.beginPath();
    ctx.ellipse(
      seededUnit(index + 2101) * canvas.width,
      seededUnit(index + 2103) * canvas.height,
      8 + seededUnit(index + 2105) * 42,
      3 + seededUnit(index + 2107) * 15,
      seededUnit(index + 2109) * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  return createTextureFromCanvas(THREE, canvas);
}

function createGasGiantTexture(THREE, kind) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const palettes = {
    jupiter: ["#7c4a22", "#d6a35d", "#f8ddb0", "#b45309", "#f97316"],
    saturn: ["#a16207", "#e6c36a", "#fff1c2", "#c0842f", "#facc15"],
    uranus: ["#155e75", "#7dd3fc", "#ccfbf1", "#38bdf8", "#bae6fd"],
    neptune: ["#172554", "#3b82f6", "#bfdbfe", "#1d4ed8", "#60a5fa"]
  };
  const colors = palettes[kind] || palettes.jupiter;

  for (let band = 0; band < 36; band += 1) {
    const y = (band / 36) * canvas.height;
    const h = canvas.height / 34 + seededUnit(band + 2201) * 8;
    ctx.fillStyle = colors[band % colors.length];
    ctx.globalAlpha = 0.72 + seededUnit(band + 2203) * 0.2;
    ctx.fillRect(0, y, canvas.width, h);
  }
  ctx.globalAlpha = 1;

  for (let index = 0; index < 120; index += 1) {
    const y = seededUnit(index + 2301) * canvas.height;
    ctx.strokeStyle = `rgb(255 255 255 / ${0.05 + seededUnit(index + 2303) * 0.13})`;
    ctx.lineWidth = 1 + seededUnit(index + 2305) * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(canvas.width * 0.28, y + (seededUnit(index + 2307) - 0.5) * 42, canvas.width * 0.72, y + (seededUnit(index + 2309) - 0.5) * 42, canvas.width, y + (seededUnit(index + 2311) - 0.5) * 24);
    ctx.stroke();
  }

  if (kind === "jupiter") {
    const spotX = canvas.width * 0.68;
    const spotY = canvas.height * 0.56;
    const spot = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 54);
    spot.addColorStop(0, "rgb(248 113 113 / 0.72)");
    spot.addColorStop(0.54, "rgb(154 52 18 / 0.54)");
    spot.addColorStop(1, "rgb(154 52 18 / 0)");
    ctx.fillStyle = spot;
    ctx.beginPath();
    ctx.ellipse(spotX, spotY, 76, 34, -0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  return createTextureFromCanvas(THREE, canvas);
}

function createBodyLabel(THREE, text, x, y, z, options = {}) {
  const labelText = String(text);
  const fontSize = 54;
  const paddingX = 56;
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = `700 ${fontSize}px Space Grotesk, Arial, sans-serif`;
  const measuredWidth = Math.ceil(probe.measureText(labelText).width);
  const canvasWidth = Math.min(1536, Math.max(512, measuredWidth + paddingX * 2));
  const canvasHeight = 160;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.shadowColor = "rgb(0 0 0 / 0.55)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgb(7 13 30 / 0.86)";
  roundedRect(ctx, 10, 12, canvas.width - 20, canvas.height - 24, 30);
  ctx.fill();
  ctx.restore();

  const edgeGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  edgeGradient.addColorStop(0, "rgb(96 165 250 / 0.25)");
  edgeGradient.addColorStop(0.5, "rgb(226 232 240 / 0.6)");
  edgeGradient.addColorStop(1, "rgb(167 139 250 / 0.25)");
  ctx.strokeStyle = edgeGradient;
  ctx.lineWidth = 3;
  roundedRect(ctx, 11.5, 13.5, canvas.width - 23, canvas.height - 27, 28);
  ctx.stroke();

  ctx.fillStyle = "rgb(147 197 253 / 0.34)";
  ctx.fillRect(34, canvas.height - 31, canvas.width - 68, 2);
  ctx.fillStyle = "#f8fafc";
  ctx.font = `700 ${fontSize}px Space Grotesk, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgb(0 0 0 / 0.82)";
  ctx.shadowBlur = 5;
  ctx.lineWidth = 7;
  ctx.strokeStyle = "rgb(2 6 23 / 0.78)";
  ctx.strokeText(labelText, canvas.width / 2, canvas.height / 2 + 1);
  ctx.fillText(labelText, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: options.opacity ?? 0.98,
    depthWrite: false,
    depthTest: options.depthTest ?? false
  }));
  const baseWidth = clamp(canvas.width / 560, 0.78, 2.45);
  sprite.position.set(x, y, z);
  sprite.scale.set(baseWidth, baseWidth * (canvas.height / canvas.width), 1);
  sprite.renderOrder = options.depthTest ? 4 : 20;
  return sprite;
}

function roundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function addMissionArc(THREE, group, color, width, offsetX, height) {
  const points = [];
  for (let index = 0; index <= 72; index += 1) {
    const t = index / 72;
    points.push(new THREE.Vector3(offsetX + t * width, Math.sin(t * Math.PI) * height - 0.12, (t - 0.5) * 0.9));
  }

  const arc = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.72 })
  );
  group.add(arc);
  return arc;
}

function createMiniRelaySatellite(THREE, color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.065, 0.045, 0.045),
    new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.46 })
  );
  const panelA = createSolarPanelGroup(THREE, 0.11, 0.045, 0x1d4ed8);
  const panelB = createSolarPanelGroup(THREE, 0.11, 0.045, 0x1d4ed8);
  panelA.position.x = -0.095;
  panelB.position.x = 0.095;
  const dish = createDishAntenna(THREE, 0.016);
  dish.position.y = 0.055;
  group.add(body, panelA, panelB, dish);
  return group;
}

function addLunarGateway(THREE, group, radius, angle) {
  const gateway = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.34, metalness: 0.68 });
  const moduleA = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 18), metal);
  moduleA.rotation.z = Math.PI / 2;
  const moduleB = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 18), metal);
  moduleB.position.y = 0.06;
  const truss = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.012, 0.012), metal);
  const panelA = createSolarPanelGroup(THREE, 0.15, 0.052, 0x1d4ed8);
  const panelB = createSolarPanelGroup(THREE, 0.15, 0.052, 0x1d4ed8);
  panelA.position.x = -0.22;
  panelB.position.x = 0.22;
  gateway.add(moduleA, moduleB, truss, panelA, panelB);
  gateway.position.set(Math.cos(angle) * radius, 0.18, Math.sin(angle) * radius * 0.72);
  gateway.lookAt(0, 0, 0);
  group.add(gateway, createBodyLabel(THREE, "Gateway relay", gateway.position.x, gateway.position.y + 0.25, gateway.position.z));
}

function createRockMoon(THREE, radius) {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(radius, 1),
    new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.95, metalness: 0.03, flatShading: true })
  );
  mesh.userData.rotateSpeed = 0.0007;
  return mesh;
}

function addSolarWindParticles(THREE, group) {
  const count = 420;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = 1.1 + seededUnit(index + 2) * 3.7;
    const angle = seededUnit(index + 7) * Math.PI * 2;
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = (seededUnit(index + 11) - 0.5) * 2.8;
    positions[offset + 2] = Math.sin(angle) * radius * 0.42;
    colors[offset] = 1;
    colors[offset + 1] = 0.72 + seededUnit(index + 13) * 0.28;
    colors[offset + 2] = 0.18;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  particles.userData.rotateSpeed = 0.0009;
  group.add(particles);
}

function createMagnetosphere(THREE, x, y, z) {
  const shield = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  shield.position.set(x, y, z);
  shield.scale.set(1.45, 0.92, 0.92);
  return shield;
}

function renderLaunchPhaseList() {
  if (!elements.launchPhaseList) {
    return;
  }

  elements.launchPhaseList.innerHTML = LAUNCH_SEQUENCE_PHASES.map(
    (phase, index) => `
      <div class="launch-phase-step" data-launch-phase="${index}">
        <span>${index + 1}</span>
        <div>
          <strong>${phase.name}</strong>
          <small>${formatMissionClock(phase.start)} - ${formatMissionClock(phase.end)}</small>
        </div>
      </div>
    `
  ).join("");
}

function createLaunchSkyShell(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#020617");
  gradient.addColorStop(0.42, "#12315e");
  gradient.addColorStop(0.72, "#5d86b8");
  gradient.addColorStop(1, "#dbeafe");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 220; index += 1) {
    const x = seededUnit(index + 301) * canvas.width;
    const y = seededUnit(index + 401) * canvas.height * 0.55;
    const alpha = 0.08 + seededUnit(index + 501) * 0.32;
    ctx.fillStyle = `rgb(255 255 255 / ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.7 + seededUnit(index + 601) * 1.7, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let index = 0; index < 16; index += 1) {
    const x = seededUnit(index + 701) * canvas.width;
    const y = canvas.height * (0.58 + seededUnit(index + 711) * 0.26);
    const width = 80 + seededUnit(index + 721) * 160;
    const gradientCloud = ctx.createRadialGradient(x, y, 0, x, y, width);
    gradientCloud.addColorStop(0, "rgb(255 255 255 / 0.18)");
    gradientCloud.addColorStop(1, "rgb(255 255 255 / 0)");
    ctx.fillStyle = gradientCloud;
    ctx.beginPath();
    ctx.ellipse(x, y, width, width * 0.14, seededUnit(index + 731) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return new THREE.Mesh(
    new THREE.SphereGeometry(48, 48, 24),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    })
  );
}

function createLaunchPadEnvironment(THREE) {
  const group = new THREE.Group();
  const concrete = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88, metalness: 0.04 });
  const trenchMaterial = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.62, metalness: 0.2 });
  const towerMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.42, metalness: 0.58 });
  const warningMaterial = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.42, metalness: 0.2 });
  const smokeMaterial = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.25, depthWrite: false });

  const platform = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.09, 2.6), concrete);
  platform.position.set(0, -3.25, 0.08);
  const flameTrench = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.055, 1.36), trenchMaterial);
  flameTrench.position.set(0, -3.18, 0.1);
  group.add(platform, flameTrench);

  const tower = new THREE.Group();
  tower.position.set(-0.72, -2.2, 0.02);
  for (const x of [-0.08, 0.08]) {
    for (const z of [-0.08, 0.08]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.018, 2.2, 0.018), towerMaterial);
      leg.position.set(x, 0, z);
      tower.add(leg);
    }
  }

  for (let level = 0; level < 8; level += 1) {
    const y = -1.05 + level * 0.3;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.012, 0.22), towerMaterial);
    deck.position.y = y;
    tower.add(deck);
    const braceA = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.34, 0.014), towerMaterial);
    braceA.position.set(0, y + 0.12, 0);
    braceA.rotation.z = 0.7;
    const braceB = braceA.clone();
    braceB.rotation.z = -0.7;
    tower.add(braceA, braceB);
  }

  const crewArm = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.035, 0.035), warningMaterial);
  crewArm.position.set(0.34, 0.63, 0);
  const strongback = new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.38, 0.035), towerMaterial);
  strongback.position.set(0.24, -0.04, 0.14);
  tower.add(crewArm, strongback);
  group.add(tower);

  for (let index = 0; index < 7; index += 1) {
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(0.18 + seededUnit(index + 801) * 0.22, 16, 10), smokeMaterial.clone());
    cloud.position.set((seededUnit(index + 811) - 0.5) * 1.25, -3.06 + seededUnit(index + 821) * 0.16, (seededUnit(index + 831) - 0.5) * 0.86);
    cloud.scale.y = 0.28;
    group.add(cloud);
  }

  for (const x of [-1.6, 1.6]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.78, 10), towerMaterial);
    mast.position.set(x, -2.82, -0.88);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfef3c7 }));
    light.position.set(x, -2.4, -0.88);
    group.add(mast, light);
  }

  group.userData.groundY = -3.25;
  return group;
}

async function initLaunchSequence() {
  if (state.launchSequence.ready || state.launchSequence.initializing || state.launchSequence.fallback || !elements.launchSequenceViewport) {
    return;
  }

  state.launchSequence.initializing = true;

  try {
    const THREE = await import(THREE_URL);
    const renderer = new THREE.WebGLRenderer({
      canvas: elements.launchSequenceCanvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1200);
    const root = new THREE.Group();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    camera.position.set(0, 0.8, 8.3);
    camera.lookAt(0, 0, 0);

    scene.add(root);
    scene.add(new THREE.AmbientLight(0x91b7ff, 0.68));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(3.5, 4.2, 4.5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x60a5fa, 2.7, 16);
    rimLight.position.set(-3.4, 1.8, 3.6);
    scene.add(rimLight);

    const skyShell = createLaunchSkyShell(THREE);
    scene.add(skyShell);

    const launchPad = createLaunchPadEnvironment(THREE);
    root.add(launchPad);

    const rocket = createLaunchRocket(THREE);
    const plume = createLaunchPlume(THREE);
    rocket.add(plume);
    root.add(rocket);

    const starField = createLaunchStarField(THREE);
    scene.add(starField);

    const earthTexture = createEarthTexture(THREE);
    const earthBumpTexture = createEarthBumpTexture(THREE);
    const earthLightsTexture = createEarthLightsTexture(THREE);
    const earthCloudTexture = createCloudTexture(THREE);
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(5.6, 128, 128),
      new THREE.MeshStandardMaterial({
        map: earthTexture,
        bumpMap: earthBumpTexture,
        bumpScale: 0.075,
        emissive: 0xffd98a,
        emissiveMap: earthLightsTexture,
        emissiveIntensity: 0.18,
        roughness: 0.74,
        metalness: 0.03,
        transparent: true,
        opacity: 0
      })
    );
    earth.position.set(0, -6.8, -2.3);
    root.add(earth);

    const earthClouds = new THREE.Mesh(
      new THREE.SphereGeometry(5.68, 128, 128),
      new THREE.MeshBasicMaterial({
        map: earthCloudTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false
      })
    );
    earthClouds.position.copy(earth.position);
    root.add(earthClouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(5.85, 96, 96),
      new THREE.MeshBasicMaterial({
        color: hexToNumber(readCssVar("--accent", "#60a5fa")),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    atmosphere.position.copy(earth.position);
    root.add(atmosphere);

    const orbitRing = createLaunchOrbitRing(THREE);
    root.add(orbitRing);

    const satelliteGroup = new THREE.Group();
    root.add(satelliteGroup);

    const issReference = createLaunchIssReference(THREE);
    root.add(issReference);

    state.launchSequence = {
      ...state.launchSequence,
      THREE,
      renderer,
      scene,
      camera,
      root,
      rocket,
      stageOne: rocket.userData.stageOne,
      stageTwo: rocket.userData.stageTwo,
      fairingGroup: rocket.userData.fairingGroup,
      fairingHalves: rocket.userData.fairingHalves,
      satelliteGroup,
      launchPad,
      skyShell,
      starField,
      issReference,
      plume,
      plumePositions: plume.geometry.getAttribute("position").array,
      plumeVelocities: plume.userData.velocities,
      plumeLife: plume.userData.life,
      plumeColors: plume.geometry.getAttribute("color").array,
      earth,
      earthClouds,
      atmosphere,
      orbitRing,
      ready: true,
      fallback: false,
      initializing: false,
      playing: true,
      lastFrame: performance.now()
    };

    renderLaunchPhaseList();
    refreshLaunchSatellites();
    resizeLaunchSequence();
    setLaunchSequenceTime(state.launchSequence.clock || 0, 0);
    animateLaunchSequence();
  } catch (error) {
    console.warn("OrbitGuard launch renderer unavailable; using canvas fallback.", error);
    state.launchSequence.initializing = false;
    state.launchSequence.fallback = true;
    renderLaunchPhaseList();
    renderLaunchFallbackCanvas();
  }
}

function createLaunchRocket(THREE) {
  const rocket = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.36, metalness: 0.26 });
  const black = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.42, metalness: 0.32 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.68 });
  const accent = new THREE.MeshStandardMaterial({
    color: hexToNumber(readCssVar("--accent", "#60a5fa")),
    emissive: hexToNumber(readCssVar("--accent", "#60a5fa")),
    emissiveIntensity: 0.18,
    roughness: 0.32,
    metalness: 0.22
  });
  const fairing = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    roughness: 0.34,
    metalness: 0.24,
    side: THREE.DoubleSide
  });

  const stageOne = new THREE.Group();
  const stageTwo = new THREE.Group();
  const fairingGroup = new THREE.Group();

  const booster = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 2.15, 36), white);
  booster.position.y = -0.78;
  stageOne.add(booster);

  const lowerBand = new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.305, 0.12, 36), black);
  lowerBand.position.y = -1.77;
  const upperBand = new THREE.Mesh(new THREE.CylinderGeometry(0.268, 0.268, 0.08, 36), black);
  upperBand.position.y = 0.24;
  stageOne.add(lowerBand, upperBand);

  for (const y of [-1.38, -0.96, -0.48, -0.05]) {
    const seam = new THREE.Mesh(new THREE.CylinderGeometry(0.263, 0.263, 0.012, 36), metal);
    seam.position.y = y;
    stageOne.add(seam);
  }

  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * Math.PI * 2 + Math.PI / 4;
    const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1.64, 0.014), metal);
    pipe.position.set(Math.cos(angle) * 0.269, -0.78, Math.sin(angle) * 0.269);
    pipe.rotation.y = -angle;
    stageOne.add(pipe);
  }

  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.16), accent);
    fin.position.set(Math.cos(angle) * 0.31, -1.62, Math.sin(angle) * 0.31);
    fin.rotation.y = -angle;
    stageOne.add(fin);

    const engine = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.18, 20), metal);
    engine.position.set(Math.cos(angle + Math.PI / 4) * 0.1, -1.98, Math.sin(angle + Math.PI / 4) * 0.1);
    engine.rotation.x = Math.PI;
    stageOne.add(engine);
  }

  const centerEngine = new THREE.Mesh(new THREE.ConeGeometry(0.078, 0.2, 24), metal);
  centerEngine.position.y = -2.02;
  centerEngine.rotation.x = Math.PI;
  stageOne.add(centerEngine);

  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    const engine = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.13, 16), metal);
    engine.position.set(Math.cos(angle) * 0.18, -2, Math.sin(angle) * 0.18);
    engine.rotation.x = Math.PI;
    stageOne.add(engine);
  }

  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * Math.PI * 2 + Math.PI / 4;
    const gridFin = new THREE.Group();
    const finPlate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.012), black);
    gridFin.add(finPlate);
    for (let ribIndex = -1; ribIndex <= 1; ribIndex += 1) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.006, 0.016), metal);
      rib.position.y = ribIndex * 0.026;
      gridFin.add(rib);
    }
    gridFin.position.set(Math.cos(angle) * 0.3, 0.08, Math.sin(angle) * 0.3);
    gridFin.rotation.y = -angle;
    gridFin.rotation.z = 0.4;
    stageOne.add(gridFin);
  }

  const upperStage = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.12, 36), white);
  upperStage.position.y = 0.82;
  const upperStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.08, 36), black);
  upperStripe.position.y = 1.17;
  const vacuumEngine = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 28), metal);
  vacuumEngine.position.y = 0.2;
  vacuumEngine.rotation.x = Math.PI;
  const upperTankBand = new THREE.Mesh(new THREE.CylinderGeometry(0.203, 0.203, 0.014, 36), metal);
  upperTankBand.position.y = 0.58;
  const avionicsBox = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.025), accent);
  avionicsBox.position.set(0, 1.03, 0.205);
  const stagePipe = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.86, 0.012), metal);
  stagePipe.position.set(0.205, 0.78, 0);
  stageTwo.add(upperStage, upperStripe, vacuumEngine, upperTankBand, avionicsBox, stagePipe);

  const leftFairing = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.78, 36, 1, false, 0, Math.PI), fairing);
  const rightFairing = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.78, 36, 1, false, Math.PI, Math.PI), fairing.clone());
  leftFairing.position.y = 1.74;
  rightFairing.position.y = 1.74;
  const fairingSeam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.72, 0.018), metal);
  fairingSeam.position.set(0, 1.64, 0.282);
  fairingGroup.add(fairingSeam);
  fairingGroup.add(leftFairing, rightFairing);

  rocket.add(stageOne, stageTwo, fairingGroup);
  rocket.userData = {
    stageOne,
    stageTwo,
    fairingGroup,
    fairingHalves: [leftFairing, rightFairing]
  };
  rocket.scale.setScalar(1.03);
  return rocket;
}

function createLaunchPlume(THREE) {
  const count = 1700;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const life = new Float32Array(count);
  const geometry = new THREE.BufferGeometry();

  for (let index = 0; index < count; index += 1) {
    resetLaunchParticle(index, positions, velocities, life, colors, 0, 1);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const plume = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  plume.userData = { velocities, life };
  return plume;
}

function resetLaunchParticle(index, positions, velocities, life, colors, baseY, intensity) {
  const offset = index * 3;
  const seed = index + performance.now() * 0.001;
  const angle = seededUnit(seed + 1) * Math.PI * 2;
  const spread = 0.02 + seededUnit(seed + 2) * (0.11 + intensity * 0.12);
  const warm = seededUnit(seed + 3);

  positions[offset] = Math.cos(angle) * spread;
  positions[offset + 1] = baseY - seededUnit(seed + 4) * 0.12;
  positions[offset + 2] = Math.sin(angle) * spread;
  velocities[offset] = Math.cos(angle) * (0.012 + seededUnit(seed + 5) * 0.035) * (0.5 + intensity);
  velocities[offset + 1] = -(0.045 + seededUnit(seed + 6) * 0.15) * (0.35 + intensity);
  velocities[offset + 2] = Math.sin(angle) * (0.012 + seededUnit(seed + 7) * 0.035) * (0.5 + intensity);
  life[index] = 0.35 + seededUnit(seed + 8) * 0.65;

  colors[offset] = warm > 0.72 ? 0.48 : 1;
  colors[offset + 1] = warm > 0.72 ? 0.72 : 0.55 + seededUnit(seed + 9) * 0.35;
  colors[offset + 2] = warm > 0.72 ? 1 : 0.12;
}

function createLaunchStarField(THREE) {
  const count = 1100;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (seededUnit(index + 3) - 0.5) * 20;
    positions[index * 3 + 1] = (seededUnit(index + 13) - 0.5) * 13;
    positions[index * 3 + 2] = -4 - seededUnit(index + 23) * 13;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xf8fafc,
      size: 0.019,
      transparent: true,
      opacity: 0.16,
      depthWrite: false
    })
  );
}

function createLaunchOrbitRing(THREE) {
  const points = [];
  const radius = 3.35;
  const segments = 256;

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius * 0.38));
  }

  const curve = new THREE.CatmullRomCurve3(points, true);
  const ring = new THREE.Mesh(
    new THREE.TubeGeometry(curve, segments, 0.012, 8, true),
    new THREE.MeshBasicMaterial({
      color: hexToNumber(readCssVar("--simulated-color", "#a78bfa")),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  ring.position.set(-1.72, 0.75, -1.2);
  return ring;
}

function createLaunchSatelliteModel(THREE) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: hexToNumber(readCssVar("--simulated-color", "#a78bfa")),
    emissive: hexToNumber(readCssVar("--simulated-color", "#a78bfa")),
    emissiveIntensity: 0.24,
    roughness: 0.38,
    metalness: 0.42
  });
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    emissive: 0x172554,
    emissiveIntensity: 0.34,
    roughness: 0.32,
    metalness: 0.24
  });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.34, metalness: 0.65 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.09), bodyMaterial);
  const payloadDeck = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.018, 0.105), trimMaterial);
  payloadDeck.position.y = 0.056;
  const leftPanel = createSolarPanelGroup(THREE, 0.24, 0.085, 0x1d4ed8);
  const rightPanel = createSolarPanelGroup(THREE, 0.24, 0.085, 0x1d4ed8);
  leftPanel.position.x = -0.205;
  rightPanel.position.x = 0.205;
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 12), trimMaterial);
  boom.rotation.z = Math.PI / 2;
  boom.position.z = 0.07;
  const dish = createDishAntenna(THREE, 0.032);
  dish.position.set(0, 0.105, 0.005);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 10), panelMaterial);
  beacon.position.set(0.065, 0.064, -0.044);
  group.add(body, payloadDeck, leftPanel, rightPanel, boom, dish, beacon);
  group.visible = false;
  return group;
}

function createLaunchIssReference(THREE) {
  const group = new THREE.Group();
  const iss = createIssReferenceModel(THREE);
  iss.scale.setScalar(2.15);
  const label = createBodyLabel(THREE, "ISS at ~420 km", 0, 0.24, 0);
  label.scale.set(0.9, 0.26, 1);
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.003, 8, 80),
    new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.62
    })
  );
  orbit.rotation.x = Math.PI / 2.35;
  group.add(orbit, iss, label);
  group.position.set(2.28, 1.34, -1.1);
  group.rotation.set(-0.25, 0.5, 0.1);
  group.visible = false;
  return group;
}

function refreshLaunchSatellites() {
  const viz = state.launchSequence;

  if (!viz.ready || !viz.satelliteGroup) {
    return;
  }

  const THREE = viz.THREE;
  const visualCount = clamp(Math.round(state.launch.satellites || 0), 1, 36);

  while (viz.satelliteGroup.children.length) {
    const child = viz.satelliteGroup.children[0];
    viz.satelliteGroup.remove(child);
    disposeObject3D(child);
  }

  viz.satellites = [];
  for (let index = 0; index < visualCount; index += 1) {
    const satellite = createLaunchSatelliteModel(THREE);
    viz.satelliteGroup.add(satellite);
    viz.satellites.push(satellite);
  }
}

function setLaunchSequenceTime(time, deltaSeconds = 0.016) {
  const viz = state.launchSequence;

  if (!viz.ready) {
    if (viz.fallback) {
      renderLaunchFallbackCanvas(time);
    }
    return;
  }

  const clampedTime = clamp(time, 0, LAUNCH_SEQUENCE_DURATION);
  const phase = currentLaunchPhase(clampedTime);
  const liftoff = easeInOut(clamp((clampedTime - 3) / 16, 0, 1));
  const atmosphereExit = easeInOut(clamp((clampedTime - 7) / 15, 0, 1));
  const orbital = easeInOut(clamp((clampedTime - 20) / 10, 0, 1));
  const launchComplete = easeInOut(clamp((clampedTime - 27) / 8, 0, 1));
  const rocket = viz.rocket;
  const maxQShake = phase.name === "Max-Q" && !state.display.reduceMotion ? Math.sin(clampedTime * 34) * 0.038 : 0;

  rocket.position.set(lerp(0, -1.72, orbital), lerp(-1.06, 1.64, liftoff) + maxQShake, lerp(0, -0.85, orbital));
  rocket.rotation.z = lerp(0, -Math.PI / 2.45, orbital);
  rocket.rotation.x = lerp(0, 0.12, orbital);
  rocket.scale.setScalar(lerp(1.03, 0.54, orbital));

  if (viz.launchPad) {
    viz.launchPad.position.y = lerp(0, -2.8, atmosphereExit);
    viz.launchPad.position.z = lerp(0, 1.2, atmosphereExit);
    setObjectOpacity(viz.launchPad, 1 - clamp((clampedTime - 9) / 8, 0, 1));
    viz.launchPad.visible = clampedTime < 19;
  }

  if (viz.skyShell) {
    viz.skyShell.material.opacity = lerp(0.92, 0.12, atmosphereExit);
    viz.skyShell.rotation.y += state.display.reduceMotion ? 0 : 0.0003;
  }

  if (viz.starField?.material) {
    viz.starField.material.opacity = lerp(0.16, 0.86, atmosphereExit);
  }

  viz.stageOne.visible = clampedTime < 21;
  const separation = phaseProgress(clampedTime, "Stage separation");
  if (clampedTime >= 10) {
    viz.stageOne.position.y = -separation * 1.05 - clamp((clampedTime - 13) / 8, 0, 1) * 1.2;
    viz.stageOne.position.x = -separation * 0.28 - clamp((clampedTime - 13) / 8, 0, 1) * 0.42;
    viz.stageOne.rotation.z = separation * 1.25 + clamp((clampedTime - 13) / 8, 0, 1) * 4.4;
    viz.stageOne.rotation.x = separation * 0.55;
  } else {
    viz.stageOne.position.set(0, 0, 0);
    viz.stageOne.rotation.set(0, 0, 0);
  }

  const fairingProgress = phaseProgress(clampedTime, "Fairing jettison");
  for (let index = 0; index < viz.fairingHalves.length; index += 1) {
    const direction = index === 0 ? -1 : 1;
    const half = viz.fairingHalves[index];
    half.position.x = fairingProgress * direction * 0.48;
    half.position.y = 1.74 + fairingProgress * 0.2;
    half.rotation.z = fairingProgress * direction * 1.1;
    half.rotation.x = fairingProgress * 0.55;
    setObjectOpacity(half, 1 - clamp((clampedTime - 22) / 3, 0, 1));
  }

  const earthOpacity = clamp((clampedTime - 20) / 5, 0, 1);
  viz.earth.material.opacity = earthOpacity;
  if (viz.earthClouds) {
    viz.earthClouds.material.opacity = earthOpacity * 0.5;
    viz.earthClouds.rotation.y += state.display.reduceMotion ? 0 : 0.0009 + orbital * 0.0008;
  }
  viz.atmosphere.material.opacity = earthOpacity * 0.19;
  viz.earth.rotation.y += state.display.reduceMotion ? 0 : 0.0006 + orbital * 0.001;
  viz.orbitRing.material.opacity = clamp((clampedTime - 24) / 3, 0, 1) * 0.85;

  if (viz.issReference) {
    const issProgress = clamp((clampedTime - 24) / 4, 0, 1);
    viz.issReference.visible = issProgress > 0;
    setObjectOpacity(viz.issReference, issProgress);
    viz.issReference.rotation.y += state.display.reduceMotion ? 0 : 0.004;
  }

  const plumeIntensity = launchPlumeIntensity(clampedTime);
  viz.plume.position.y = clampedTime < 10.2 ? -1.98 : 0.14;
  viz.plume.material.opacity = plumeIntensity * (clampedTime > 22 ? 0.35 : 1);
  updateLaunchParticles(clampedTime, deltaSeconds, plumeIntensity);

  updateLaunchSatellites(clampedTime, launchComplete);
  updateLaunchCamera(clampedTime, maxQShake);
  updateLaunchSequenceUi(clampedTime, phase);
  viz.renderer.render(viz.scene, viz.camera);
}

function launchPlumeIntensity(time) {
  if (time < 3) {
    return 0.2 + phaseProgress(time, "Ignition buildup") * 0.68;
  }

  if (time < 10.2) {
    return 1;
  }

  if (time < 18) {
    return 0.66;
  }

  if (time < 22) {
    return 0.34;
  }

  return 0.04;
}

function updateLaunchParticles(time, deltaSeconds, intensity) {
  const viz = state.launchSequence;
  const positions = viz.plumePositions;
  const velocities = viz.plumeVelocities;
  const life = viz.plumeLife;
  const colors = viz.plumeColors;
  const baseY = time < 10.2 ? -1.98 : 0.14;
  const count = life.length;

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    life[index] -= deltaSeconds * (0.55 + intensity * 0.92);

    if (life[index] <= 0 || intensity <= 0.05) {
      resetLaunchParticle(index, positions, velocities, life, colors, baseY, intensity);
      if (intensity <= 0.05) {
        life[index] *= 0.08;
      }
    } else {
      positions[offset] += velocities[offset] * deltaSeconds * 22;
      positions[offset + 1] += velocities[offset + 1] * deltaSeconds * 22;
      positions[offset + 2] += velocities[offset + 2] * deltaSeconds * 22;
      velocities[offset] *= 1.004;
      velocities[offset + 2] *= 1.004;
    }
  }

  viz.plume.geometry.getAttribute("position").needsUpdate = true;
  viz.plume.geometry.getAttribute("color").needsUpdate = true;
}

function updateLaunchSatellites(time, spreadProgress) {
  const viz = state.launchSequence;
  const deployProgress = clamp((time - 27) / 4, 0, 1);
  const visualCount = viz.satellites.length;
  const deployedVisual = Math.floor(deployProgress * visualCount + 0.0001);
  const ringRadius = 3.35;

  for (let index = 0; index < visualCount; index += 1) {
    const satellite = viz.satellites[index];
    const isVisible = index < deployedVisual || time >= 31;
    const localDeploy = clamp((deployProgress * visualCount - index) / 1.2, 0, 1);
    const angle = -0.95 + (index / Math.max(1, visualCount)) * Math.PI * 2 * (0.35 + spreadProgress * 0.65);
    const radius = lerp(0.18, ringRadius, easeInOut(localDeploy || spreadProgress));

    satellite.visible = isVisible;
    satellite.position.set(-1.72 + Math.cos(angle) * radius, 0.75 + Math.sin(angle) * radius * 0.38, -1.2 + Math.sin(angle) * radius * 0.11);
    satellite.rotation.y += state.display.reduceMotion ? 0 : 0.018 + index * 0.0007;
    satellite.rotation.z = angle + Math.PI / 2;
    satellite.scale.setScalar(lerp(0.5, 1.72, localDeploy || spreadProgress));
  }
}

function updateLaunchCamera(time, maxQShake) {
  const viz = state.launchSequence;
  const ascent = easeInOut(clamp((time - 3) / 15, 0, 1));
  const orbital = easeInOut(clamp((time - 20) / 10, 0, 1));
  const camera = viz.camera;

  camera.position.x = lerp(0.18, 0.45, orbital) + maxQShake * 0.75;
  camera.position.y = lerp(-0.72, 1.35, Math.max(ascent * 0.65, orbital)) + maxQShake * 0.35;
  camera.position.z = lerp(7.35, 7.4, orbital);
  camera.lookAt(lerp(0, -0.7, orbital), lerp(-0.98, 0.55, Math.max(ascent * 0.55, orbital)), lerp(0, -1.1, orbital));
}

function updateLaunchSequenceUi(time, phase) {
  const viz = state.launchSequence;
  const altitudeProgress = easeInOut(clamp((time - 3) / 25, 0, 1));
  const velocityProgress = easeInOut(clamp((time - 3) / 26, 0, 1));
  const altitude = Math.round(altitudeProgress * state.launch.altitude);
  const velocity = (velocityProgress * 7.7).toFixed(1);
  const deployed = Math.min(state.launch.satellites, Math.floor(clamp((time - 27) / 4, 0, 1) * state.launch.satellites));

  viz.clock = time;
  elements.launchPhaseLabel.textContent = phase.name;
  elements.launchClock.textContent = formatMissionClock(time);
  elements.launchTelemetry.textContent = phase.telemetry;
  elements.launchVizAltitude.textContent = `${numberFormat(altitude)} km`;
  elements.launchVizVelocity.textContent = `${velocity} km/s`;
  elements.launchVizSatellites.textContent = `${numberFormat(deployed)} / ${numberFormat(state.launch.satellites)}`;
  elements.launchVizStage.textContent = phase.stage;
  elements.launchScrubber.value = Math.round((time / LAUNCH_SEQUENCE_DURATION) * 1000);
  elements.launchScrubberLabel.textContent = formatMissionClock(time);
  elements.launchPlayPause.textContent = viz.playing ? "Pause" : "Play";

  const phaseSteps = elements.launchPhaseList?.querySelectorAll(".launch-phase-step") || [];
  phaseSteps.forEach((step, index) => {
    const item = LAUNCH_SEQUENCE_PHASES[index];
    step.classList.toggle("active", item.name === phase.name);
    step.classList.toggle("complete", time >= item.end);
  });
}

function setObjectOpacity(object, opacity) {
  object.traverse((child) => {
    if (!child.material) {
      return;
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (material.userData.baseOpacity === undefined) {
        material.userData.baseOpacity = material.opacity ?? 1;
        material.userData.baseTransparent = Boolean(material.transparent);
      }

      material.transparent = material.userData.baseTransparent || opacity < 1;
      material.opacity = material.userData.baseOpacity * opacity;
    }
  });
}

function animateLaunchSequence(now = performance.now()) {
  const viz = state.launchSequence;

  if (!viz.ready) {
    return;
  }

  const deltaSeconds = Math.min(0.05, (now - (viz.lastFrame || now)) / 1000);
  viz.lastFrame = now;

  if (viz.playing && !state.display.reduceMotion) {
    viz.clock += deltaSeconds;

    if (viz.clock > LAUNCH_SEQUENCE_DURATION) {
      viz.clock = LAUNCH_SEQUENCE_DURATION;
      viz.playing = false;
    }
  }

  setLaunchSequenceTime(viz.clock, deltaSeconds);
  viz.animationId = window.requestAnimationFrame(animateLaunchSequence);
}

function resizeLaunchSequence() {
  const viz = state.launchSequence;
  const container = elements.launchSequenceViewport;

  if (!container) {
    return;
  }

  const rect = container.getBoundingClientRect();

  if (viz.ready) {
    viz.camera.aspect = rect.width / Math.max(1, rect.height);
    viz.camera.updateProjectionMatrix();
    viz.renderer.setSize(rect.width, rect.height, false);
    setLaunchSequenceTime(viz.clock || 0, 0);
  } else if (viz.fallback) {
    renderLaunchFallbackCanvas(viz.clock || 0);
  }
}

function renderLaunchFallbackCanvas(time = state.launchSequence.clock || 0) {
  const canvas = elements.launchSequenceCanvas;
  const container = elements.launchSequenceViewport;

  if (!canvas || !container || state.launchSequence.ready) {
    return;
  }

  const rect = container.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(640, Math.floor(rect.width * scale));
  canvas.height = Math.max(420, Math.floor(rect.height * scale));
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const phase = currentLaunchPhase(time);
  const progress = clamp(time / LAUNCH_SEQUENCE_DURATION, 0, 1);
  const rocketX = width * lerp(0.5, 0.37, progress);
  const rocketY = height * lerp(0.72, 0.28, easeInOut(clamp((time - 3) / 22, 0, 1)));

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = readCssVar("--bg-main", "#0b1120");
  ctx.fillRect(0, 0, width, height);

  for (let index = 0; index < 120; index += 1) {
    ctx.fillStyle = hexToRgba(readCssVar("--text-main", "#f8fafc"), 0.12 + seededUnit(index) * 0.26);
    ctx.beginPath();
    ctx.arc(seededUnit(index + 2) * width, seededUnit(index + 8) * height, (0.6 + seededUnit(index + 4) * 1.3) * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  const earthY = height * 0.95;
  const earthRadius = width * 0.46;
  const gradient = ctx.createRadialGradient(width * 0.43, earthY - earthRadius * 0.36, 0, width * 0.5, earthY, earthRadius);
  gradient.addColorStop(0, readCssVar("--success", "#86efac"));
  gradient.addColorStop(0.45, readCssVar("--payload-color", "#93c5fd"));
  gradient.addColorStop(1, readCssVar("--bg-card", "#172033"));
  ctx.globalAlpha = clamp((time - 20) / 5, 0, 1);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, earthY, earthRadius, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(rocketX, rocketY);
  ctx.rotate(lerp(0, -Math.PI / 2.8, easeInOut(clamp((time - 20) / 10, 0, 1))));
  const plume = launchPlumeIntensity(time);
  const plumeGradient = ctx.createRadialGradient(0, 58 * scale, 0, 0, 88 * scale, 70 * scale);
  plumeGradient.addColorStop(0, hexToRgba(readCssVar("--warning", "#facc15"), 0.9 * plume));
  plumeGradient.addColorStop(0.45, `rgb(249 115 22 / ${0.48 * plume})`);
  plumeGradient.addColorStop(1, "rgb(96 165 250 / 0)");
  ctx.fillStyle = plumeGradient;
  ctx.beginPath();
  ctx.ellipse(0, 88 * scale, 42 * scale, 96 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(-18 * scale, -82 * scale, 36 * scale, 132 * scale);
  ctx.fillStyle = readCssVar("--accent", "#60a5fa");
  ctx.fillRect(-20 * scale, 36 * scale, 40 * scale, 12 * scale);
  ctx.fillStyle = "#dbeafe";
  ctx.beginPath();
  ctx.moveTo(-18 * scale, -82 * scale);
  ctx.lineTo(0, -122 * scale);
  ctx.lineTo(18 * scale, -82 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  updateLaunchSequenceUi(time, phase);
}

function disposeObject3D(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        for (const key of ["map", "alphaMap", "bumpMap", "emissiveMap", "roughnessMap", "metalnessMap"]) {
          if (material[key]) {
            material[key].dispose();
          }
        }
        material.dispose();
      }
    }
  });
}

function orbitalPathPoints(THREE, object, radius, segments = 192) {
  const points = [];
  const seed = object.norad || object.altitude || 1;
  const raan = seededUnit(seed + 91) * Math.PI * 2;
  const inclination = ((object.inclination || 0) * Math.PI) / 180;

  for (let index = 0; index < segments; index += 1) {
    const theta = (index / segments) * Math.PI * 2;
    const x0 = radius * Math.cos(theta);
    const y0 = 0;
    const z0 = radius * Math.sin(theta);
    const y1 = y0 * Math.cos(inclination) - z0 * Math.sin(inclination);
    const z1 = y0 * Math.sin(inclination) + z0 * Math.cos(inclination);
    const x2 = x0 * Math.cos(raan) + z1 * Math.sin(raan);
    const z2 = -x0 * Math.sin(raan) + z1 * Math.cos(raan);
    points.push(new THREE.Vector3(x2, y1, z2));
  }

  return points;
}

function createOrbitTrailGroup(THREE, catalogObjects, launchObjects) {
  const group = new THREE.Group();
  const trailObjects = representativeObjects(catalogObjects, launchObjects, state.mode === "time" ? 44 : 58);

  for (let index = 0; index < trailObjects.length; index += 1) {
    const object = trailObjects[index];
    const radius = altitudeToSceneRadius(object.altitude) + 0.018;
    const color = hexToNumber(getObjectColor(object, object.simulated));
    const opacity = object.simulated ? 0.58 : object.type === "PAY" ? 0.23 : object.type === "R/B" ? 0.2 : 0.15;
    const geometry = new THREE.BufferGeometry().setFromPoints(orbitalPathPoints(THREE, object, radius, 216));
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: object.simulated ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });
    const trail = new THREE.LineLoop(geometry, material);
    trail.userData.rotateSpeed = (object.simulated ? 0.0007 : 0.00022) * (index % 2 === 0 ? 1 : -1);
    group.add(trail);
  }

  return group;
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
      opacity: forceLaunchColor ? 0.98 : 0.86,
      sizeAttenuation: true,
      depthWrite: false
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
    const scale = object.simulated ? 2.55 : object.riskScore > 72 ? 2.18 : 1.82;
    model.position.set(x, y, z);
    model.lookAt(0, 0, 0);
    model.rotateY(Math.PI / 2);
    model.rotateZ(seededUnit((object.norad || index) + 41) * Math.PI * 2);
    model.scale.setScalar(scale);
    group.add(model);
  }

  const iss = createIssReferenceModel(THREE);
  const issRadius = altitudeToSceneRadius(420) + 0.12;
  const [issX, issY, issZ] = orbitalPosition({ norad: 25544, altitude: 420, inclination: 51.6 }, issRadius);
  iss.position.set(issX, issY, issZ);
  iss.lookAt(0, 0, 0);
  iss.rotateY(Math.PI / 2);
  iss.scale.setScalar(2.85);
  group.add(iss);

  const label = createBodyLabel(THREE, "ISS reference orbit", issX, issY + 0.22, issZ);
  label.scale.set(0.9, 0.26, 1);
  group.add(label);

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

function createSolarPanelGroup(THREE, width, depth, panelColor = 0x1d4ed8) {
  const group = new THREE.Group();
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: panelColor,
    emissive: 0x172554,
    emissiveIntensity: 0.32,
    roughness: 0.32,
    metalness: 0.28
  });
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.72
  });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(width, 0.004, depth), panelMaterial);
  group.add(panel);

  for (let index = 1; index < 4; index += 1) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.0022, 0.006, depth * 1.02), gridMaterial);
    rib.position.x = -width / 2 + (width * index) / 4;
    rib.position.y = 0.004;
    group.add(rib);
  }

  for (let index = 1; index < 3; index += 1) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(width * 1.02, 0.006, 0.0022), gridMaterial);
    rib.position.z = -depth / 2 + (depth * index) / 3;
    rib.position.y = 0.004;
    group.add(rib);
  }

  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6 });
  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width * 1.06, 0.007, 0.004), frameMaterial);
  const bottomFrame = topFrame.clone();
  topFrame.position.z = depth / 2;
  bottomFrame.position.z = -depth / 2;
  const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.007, depth * 1.05), frameMaterial);
  const rightFrame = leftFrame.clone();
  leftFrame.position.x = -width / 2;
  rightFrame.position.x = width / 2;
  group.add(topFrame, bottomFrame, leftFrame, rightFrame);
  return group;
}

function createDishAntenna(THREE, radius = 0.016) {
  const group = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.28, metalness: 0.72 });
  const dish = new THREE.Mesh(new THREE.ConeGeometry(radius, radius * 0.55, 24, 1, true), metal);
  dish.rotation.x = Math.PI / 2;
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.1, radius * 0.1, radius * 0.9, 10), metal);
  feed.rotation.x = Math.PI / 2;
  feed.position.z = radius * 0.42;
  group.add(dish, feed);
  return group;
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
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.38, metalness: 0.58 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.036, 0.038), bodyMaterial);
  const avionics = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.01, 0.04), trimMaterial);
  avionics.position.y = 0.024;
  const leftPanel = createSolarPanelGroup(THREE, 0.09, 0.034);
  const rightPanel = createSolarPanelGroup(THREE, 0.09, 0.034);
  leftPanel.position.x = -0.074;
  rightPanel.position.x = 0.074;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.052, 10), trimMaterial);
  mast.position.y = 0.055;
  const dish = createDishAntenna(THREE, 0.013);
  dish.position.y = 0.083;
  dish.rotation.z = -0.35;
  const sensor = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.018, 16), trimMaterial);
  sensor.rotation.x = Math.PI / 2;
  sensor.position.z = 0.03;
  group.add(body, avionics, leftPanel, rightPanel, mast, dish, sensor);
  return group;
}

function createIssReferenceModel(THREE) {
  const group = new THREE.Group();
  const trussMaterial = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.28, metalness: 0.72 });
  const moduleMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.34, metalness: 0.55 });
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.26,
    roughness: 0.35,
    metalness: 0.22
  });
  const centralTruss = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.01, 0.012), trussMaterial);
  const moduleA = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.11, 18), moduleMaterial);
  moduleA.rotation.z = Math.PI / 2;
  const moduleB = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 18), moduleMaterial);
  moduleB.position.set(0.02, 0.032, 0);
  moduleB.rotation.z = Math.PI / 2;
  const node = new THREE.Mesh(new THREE.SphereGeometry(0.021, 16, 10), trussMaterial);
  const leftArray = createSolarPanelGroup(THREE, 0.18, 0.05, 0x1d4ed8);
  const rightArray = createSolarPanelGroup(THREE, 0.18, 0.05, 0x1d4ed8);
  leftArray.position.x = -0.16;
  rightArray.position.x = 0.16;
  leftArray.rotation.z = 0.08;
  rightArray.rotation.z = -0.08;

  for (let index = -1; index <= 1; index += 1) {
    const radiator = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.003, 0.018), panelMaterial);
    radiator.position.set(index * 0.055, -0.026, 0.025);
    group.add(radiator);
  }

  group.add(centralTruss, moduleA, moduleB, node, leftArray, rightArray);
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
  const dark = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.44, metalness: 0.36 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.32, metalness: 0.7 });
  const group = new THREE.Group();
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.017, 0.108, 24), material);
  cylinder.rotation.z = Math.PI / 2;
  const forwardCap = new THREE.Mesh(new THREE.SphereGeometry(0.015, 16, 8), metal);
  forwardCap.scale.set(1, 1, 0.42);
  forwardCap.position.x = -0.058;
  const bandA = new THREE.Mesh(new THREE.CylinderGeometry(0.0172, 0.0172, 0.006, 24), dark);
  const bandB = bandA.clone();
  bandA.rotation.z = Math.PI / 2;
  bandB.rotation.z = Math.PI / 2;
  bandA.position.x = -0.025;
  bandB.position.x = 0.025;
  const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.028, 18), metal);
  nozzle.rotation.z = -Math.PI / 2;
  nozzle.position.x = 0.066;

  for (let index = 0; index < 3; index += 1) {
    const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.094, 0.0028, 0.0028), metal);
    const angle = (index / 3) * Math.PI * 2;
    pipe.position.set(0, Math.cos(angle) * 0.0175, Math.sin(angle) * 0.0175);
    group.add(pipe);
  }

  group.add(cylinder, forwardCap, bandA, bandB, nozzle);
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
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.024, 0), material);
  core.scale.set(1.25, 0.72, 0.9);
  group.add(core);

  for (let index = 0; index < 3; index += 1) {
    const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.011 + index * 0.002, 0), material);
    shard.position.set((seededUnit(index + 2) - 0.5) * 0.045, (seededUnit(index + 5) - 0.5) * 0.03, (seededUnit(index + 8) - 0.5) * 0.04);
    shard.rotation.set(seededUnit(index + 13) * Math.PI, seededUnit(index + 17) * Math.PI, seededUnit(index + 19) * Math.PI);
    group.add(shard);
  }

  return group;
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
  const group = createSatelliteModel(THREE, { ...object, type: "launch" });
  const glow = new THREE.Mesh(
    new THREE.TorusGeometry(0.075, 0.002, 8, 36),
    new THREE.MeshBasicMaterial({
      color: hexToNumber(getObjectColor(object, true)),
      transparent: true,
      opacity: 0.52
    })
  );
  glow.rotation.x = Math.PI / 2;
  group.add(glow);
  group.traverse((child) => {
    if (child.material && child.material.color) {
      child.material.color.set(material.color);
    }
  });
  return group;
}

function createOtherObjectModel(THREE, object) {
  const material = new THREE.MeshStandardMaterial({
    color: hexToNumber(getObjectColor(object)),
    emissive: hexToNumber(getObjectColor(object)),
    emissiveIntensity: 0.08,
    roughness: 0.56,
    metalness: 0.22
  });
  const group = new THREE.Group();
  const bus = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.026, 0.022), material);
  const boomMaterial = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.4, metalness: 0.62 });
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.07, 8), boomMaterial);
  boom.rotation.z = Math.PI / 2;
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.007, 12, 8), boomMaterial);
  beacon.position.x = 0.041;
  group.add(bus, boom, beacon);
  return group;
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

  if (state.mode === "studio") {
    renderMissionStudio();
  }

  if (state.mode === "replay") {
    renderMissionReplay();
  }

  if (state.mode === "traffic") {
    renderTrafficControl();
  }
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
  document.body.classList.toggle("home-active", mode === "home");

  for (const item of elements.modeTabs) {
    item.classList.toggle("active", item.dataset.mode === mode);
  }

  for (const item of elements.modeJumps) {
    item.classList.toggle("active", item.dataset.mode === mode);
  }

  for (const panel of elements.modePanels) {
    panel.classList.toggle("active", panel.id === `${mode}Mode`);
  }

  if (mode === "home") {
    window.scrollTo({ top: 0, behavior: state.display.reduceMotion ? "auto" : "smooth" });
  } else if (mode === "studio") {
    renderMissionStudio();
  } else if (mode === "time") {
    renderTimeMachine();
    initOrbitScene().then(() => resizeOrbitScene());
  } else if (mode === "dashboard") {
    initOrbitScene().then(() => {
      renderOrbitScene();
      resizeOrbitScene();
    });
  } else if (mode === "weather") {
    renderWeather();
  } else if (mode === "encyclopedia") {
    renderEncyclopedia();
  } else if (mode === "simulator") {
    renderLaunchImpact();
    initLaunchSequence();
    resizeLaunchSequence();
  } else if (mode === "replay") {
    renderMissionReplay();
  } else if (mode === "traffic") {
    renderTrafficControl();
  } else {
    initOrbitScene().then(() => renderOrbitScene());
  }
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

function setSettingsDrawer(open) {
  elements.settingsDrawer.classList.toggle("open", open);
  elements.settingsDrawer.setAttribute("aria-hidden", open ? "false" : "true");
  elements.settingsBackdrop.hidden = !open;
}

function wireDisplaySettings() {
  elements.settingsToggle.addEventListener("click", () => setSettingsDrawer(true));
  elements.settingsClose.addEventListener("click", () => setSettingsDrawer(false));
  elements.settingsBackdrop.addEventListener("click", () => setSettingsDrawer(false));

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

  elements.gravityCursor.addEventListener("change", () => {
    state.display.gravityCursor = elements.gravityCursor.checked;
    applyDisplaySettings({ rerender: false });
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

function wireWeatherControls() {
  elements.weatherRefresh.addEventListener("click", loadWeatherData);
  elements.weatherRefreshDashboard.addEventListener("click", loadWeatherData);
  elements.downloadWeatherSnapshot.addEventListener("click", () => {
    downloadJSON("orbitguard-weather-operations-snapshot.json", buildWeatherSnapshotPayload());
  });

  elements.groundStationSelect.addEventListener("change", () => {
    state.weather.selectedStation = elements.groundStationSelect.value;
    state.weather.selectedGround = null;
    renderWeather();
  });

  elements.useCustomStation.addEventListener("click", loadCustomGroundStation);

  elements.groundNetworkCards.addEventListener("click", (event) => {
    const button = event.target.closest("[data-station]");

    if (!button) {
      return;
    }

    state.weather.selectedStation = button.dataset.station;
    state.weather.selectedGround = null;
    elements.groundStationSelect.value = state.weather.selectedStation;
    renderWeather();
  });
}

function wireEncyclopediaControls() {
  elements.encyclopediaSearch.addEventListener("input", () => {
    state.encyclopedia.search = elements.encyclopediaSearch.value;
    renderEncyclopedia();
  });

  elements.encyclopediaCategory.addEventListener("change", () => {
    state.encyclopedia.selectedCategory = elements.encyclopediaCategory.value;
    renderEncyclopedia();
  });

  elements.encyclopediaDepth.addEventListener("change", () => {
    state.encyclopedia.selectedDepth = elements.encyclopediaDepth.value;
    renderEncyclopedia();
  });

  elements.encyclopediaCategoryCards.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");

    if (!button) {
      return;
    }

    state.encyclopedia.selectedCategory = button.getAttribute("data-category");
    elements.encyclopediaCategory.value = state.encyclopedia.selectedCategory;
    renderEncyclopedia();
  });

  elements.encyclopediaTopicGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic-id]");

    if (button) {
      selectEncyclopediaTopic(button.getAttribute("data-topic-id"));
    }
  });

  elements.relatedTopics.addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic-id]");

    if (button) {
      selectEncyclopediaTopic(button.getAttribute("data-topic-id"));
    }
  });

  elements.generateArticle.addEventListener("click", generateSelectedArticle);
  elements.factCheckArticle.addEventListener("click", runSelectedArticleFactCheck);
  elements.downloadArticle.addEventListener("click", exportEncyclopediaArticle);
  elements.downloadEncyclopediaIndex.addEventListener("click", () => {
    downloadJSON("orbitguard-space-encyclopedia-index.json", buildEncyclopediaIndexPayload());
  });
}

function wireLaunchSequenceControls() {
  renderLaunchPhaseList();

  elements.launchPlayPause?.addEventListener("click", () => {
    const viz = state.launchSequence;

    if (viz.clock >= LAUNCH_SEQUENCE_DURATION) {
      viz.clock = 0;
    }

    viz.playing = !viz.playing;
    viz.lastFrame = performance.now();
    elements.launchPlayPause.textContent = viz.playing ? "Pause" : "Play";
    initLaunchSequence();
    setLaunchSequenceTime(viz.clock || 0, 0);
  });

  elements.launchRestart?.addEventListener("click", () => {
    state.launchSequence.clock = 0;
    state.launchSequence.playing = true;
    state.launchSequence.lastFrame = performance.now();
    initLaunchSequence();
    setLaunchSequenceTime(0, 0);
  });

  elements.launchScrubber?.addEventListener("input", () => {
    const time = (Number(elements.launchScrubber.value) / 1000) * LAUNCH_SEQUENCE_DURATION;
    state.launchSequence.clock = time;
    state.launchSequence.playing = false;
    initLaunchSequence();
    setLaunchSequenceTime(time, 0);
  });
}

function wireMissionComparisonControls() {
  elements.addCurrentMission?.addEventListener("click", () => {
    readLaunchInputs();
    addComparisonMission({ ...state.launch, name: `${state.launch.name} scenario` }, "custom");
  });

  elements.loadComparisonPresets?.addEventListener("click", () => {
    state.comparison.seeded = false;
    seedComparisonMissions(true);
    renderMissionComparison();
  });

  elements.clearComparisonMissions?.addEventListener("click", () => {
    state.comparison.missions = [];
    state.comparison.selectedId = null;
    state.comparison.seeded = true;
    renderMissionComparison();
  });

  elements.downloadComparisonReport?.addEventListener("click", exportMissionComparisonReport);

  elements.missionPresetButtons?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-preset-index]");

    if (!button) {
      return;
    }

    const preset = missionComparisonPresets()[Number(button.dataset.presetIndex)];

    if (preset) {
      addComparisonMission(preset, "preset");
    }
  });

  elements.missionComparisonRows?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action][data-id]");

    if (!button) {
      return;
    }

    const mission = state.comparison.missions.find((item) => item.id === button.dataset.id);

    if (!mission) {
      return;
    }

    if (button.dataset.action === "remove") {
      state.comparison.missions = state.comparison.missions.filter((item) => item.id !== mission.id);
      state.comparison.selectedId = state.comparison.missions[0]?.id || null;
      renderMissionComparison();
      return;
    }

    if (button.dataset.action === "use") {
      state.comparison.selectedId = mission.id;
      setLaunchInputsFromMission(mission);
      return;
    }

    state.comparison.selectedId = mission.id;
    renderMissionComparison();
  });
}

function wireMissionReplayControls() {
  elements.missionReplayScenario?.addEventListener("change", () => {
    state.missionReplay.scenarioId = elements.missionReplayScenario.value;
    state.missionReplay.clock = 0;
    state.missionReplay.playing = true;
    renderMissionReplay();
  });

  elements.missionReplayCamera?.addEventListener("change", () => {
    state.missionReplay.cameraMode = elements.missionReplayCamera.value;
    renderMissionReplay();
  });

  elements.missionReplayPlayPause?.addEventListener("click", () => {
    state.missionReplay.playing = !state.missionReplay.playing;
    state.missionReplay.lastFrame = performance.now();
    renderMissionReplay();
  });

  elements.missionReplayRestart?.addEventListener("click", () => {
    state.missionReplay.clock = 0;
    state.missionReplay.playing = true;
    state.missionReplay.lastFrame = performance.now();
    renderMissionReplay();
  });

  elements.missionReplayScrubber?.addEventListener("input", () => {
    state.missionReplay.clock = (Number(elements.missionReplayScrubber.value) / 1000) * MISSION_REPLAY_DURATION;
    state.missionReplay.playing = false;
    renderMissionReplay();
  });

  elements.downloadMissionAutopsy?.addEventListener("click", exportMissionAutopsy);
}

function wireTrafficControls() {
  elements.trafficAlertFeed?.addEventListener("click", (event) => {
    const alertButton = event.target.closest("[data-alert-id]");

    if (!alertButton) {
      return;
    }

    state.traffic.selectedAlertId = alertButton.dataset.alertId;
    addTrafficLog(`Alert ${state.traffic.selectedAlertId} selected for maneuver review.`);
    renderTrafficControl();
  });

  elements.maneuverSelect?.addEventListener("change", () => {
    state.traffic.maneuver = elements.maneuverSelect.value;
    renderManeuverResult();
  });

  elements.simulateManeuver?.addEventListener("click", () => {
    const alert = selectedTrafficAlert();
    const assessment = maneuverAssessment(alert);
    addTrafficLog(`${assessment.newSeverity} result after ${elements.maneuverSelect.options[elements.maneuverSelect.selectedIndex].text}. Miss distance ${decimal(assessment.newDistance, 2)} km.`);
    renderTrafficControl();
  });

  elements.trafficForecastYears?.addEventListener("change", () => {
    state.traffic.forecastYears = Number(elements.trafficForecastYears.value);
    addTrafficLog(`Traffic forecast horizon changed to ${state.traffic.forecastYears} years.`);
    renderTrafficControl();
  });

  elements.operatorSatelliteSelect?.addEventListener("change", () => {
    const object = selectedOperatorObject();
    addTrafficLog(`Operator view loaded for ${object?.name || "selected satellite"}.`);
    renderOperatorView();
  });

  elements.triggerDebrisEvent?.addEventListener("click", () => {
    state.traffic.emergencyActive = true;
    state.traffic.emergencyFragments = 1200;
    addTrafficLog("Emergency fragmentation event simulated in the 800-900 km shell.");
    renderTrafficControl();
  });

  elements.resetTrafficEvent?.addEventListener("click", () => {
    state.traffic.emergencyActive = false;
    state.traffic.emergencyFragments = 0;
    addTrafficLog("Traffic model reset to baseline catalog conditions.");
    renderTrafficControl();
  });

  elements.downloadTrafficReport?.addEventListener("click", exportTrafficReport);
}

function wireMissionStudioControls() {
  elements.studioMissionType?.addEventListener("change", () => {
    state.studio.missionType = elements.studioMissionType.value;
    state.studio.selectedId = (MISSION_TEMPLATES[state.studio.missionType] || MISSION_TEMPLATES.internet)[0].id;
    renderMissionStudio();
  });

  elements.studioTargetRegion?.addEventListener("change", () => {
    state.studio.targetRegion = elements.studioTargetRegion.value;
    renderMissionStudio();
  });

  elements.studioRiskTolerance?.addEventListener("change", () => {
    state.studio.riskTolerance = elements.studioRiskTolerance.value;
    renderMissionStudio();
  });

  const priorityControls = [
    [elements.studioCoveragePriority, "coverage"],
    [elements.studioSustainabilityPriority, "sustainability"],
    [elements.studioCostPriority, "cost"],
    [elements.studioRiskPriority, "risk"]
  ];

  for (const [input, key] of priorityControls) {
    input?.addEventListener("input", () => {
      state.studio.priorities[key] = Number(input.value);
      renderMissionStudio();
    });
  }

  elements.studioMissionOptions?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-studio-action]");
    const card = event.target.closest("[data-studio-design]");
    const id = actionButton?.dataset.designId || card?.dataset.studioDesign;

    if (!id) {
      return;
    }

    const designs = studioDesigns();
    const design = designs.find((item) => item.id === id);

    if (!design) {
      return;
    }

    state.studio.selectedId = id;

    if (actionButton?.dataset.studioAction === "use") {
      setLaunchInputsFromMission({ ...design, fragments: 0 });
      setActiveMode("simulator");
      return;
    }

    if (actionButton?.dataset.studioAction === "improve") {
      const improved = improvedStudioDesign(design);
      setLaunchInputsFromMission({ ...improved, fragments: 0 });
      setActiveMode("simulator");
      return;
    }

    renderMissionStudio();
  });

  elements.studioRedesignBox?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-studio-action='apply-redesign']");

    if (!button) {
      return;
    }

    const design = selectedStudioDesign();
    const improved = improvedStudioDesign(design);
    setLaunchInputsFromMission({ ...improved, fragments: 0 });
    setActiveMode("simulator");
  });

  elements.studioSaveScenario?.addEventListener("click", saveStudioScenario);
  elements.studioDownloadJson?.addEventListener("click", () => {
    const design = selectedStudioDesign();
    downloadJSON(`${slugify(design?.name || "orbitguard-mission-design")}-mission-design.json`, buildStudioReportPayload(design));
  });
  elements.studioDownloadTxt?.addEventListener("click", () => {
    const design = selectedStudioDesign();
    downloadText(`${slugify(design?.name || "orbitguard-mission-design")}-mission-design.txt`, studioReportText(design), "text/plain");
  });
}

function wireControls() {
  wireModeTabs();
  wireDisplaySettings();
  wireTimeMachineControls();
  wireWeatherControls();
  wireEncyclopediaControls();
  wireLaunchSequenceControls();
  wireMissionComparisonControls();
  wireMissionReplayControls();
  wireTrafficControls();
  wireMissionStudioControls();

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

  elements.environmentSelect.addEventListener("change", () => {
    state.solarSystem.environment = elements.environmentSelect.value;
    renderOrbitScene();
    resizeOrbitScene();
  });

  for (const toggle of elements.orbitTrailToggles) {
    toggle.addEventListener("change", () => {
      state.display.showOrbitTrails = toggle.checked;
      syncOrbitTrailControls();
      saveDisplaySettings();
      renderOrbitScene();
    });
  }

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
  window.addEventListener("resize", resizeLaunchSequence);
  window.addEventListener("resize", () => {
    if (state.mode === "studio") {
      renderMissionStudio();
    }

    if (state.mode === "replay") {
      renderMissionReplay();
    }

    if (state.mode === "traffic") {
      renderTrafficControl();
    }
  });
}

function startMissionReplayLoop() {
  if (state.missionReplay.animationId) {
    return;
  }

  const frame = (now) => {
    if (state.mode === "replay") {
      if (state.missionReplay.playing && !state.display.reduceMotion) {
        const previous = state.missionReplay.lastFrame || now;
        const delta = Math.min(0.14, (now - previous) / 1000);
        state.missionReplay.clock += delta;

        if (state.missionReplay.clock > MISSION_REPLAY_DURATION) {
          state.missionReplay.clock = MISSION_REPLAY_DURATION;
          state.missionReplay.playing = false;
        }
      }

      state.missionReplay.lastFrame = now;
      const scenario = currentReplayScenario();
      drawMissionReplayCanvas(scenario, missionReplayProgress(scenario), now);
      if (now - state.missionReplay.lastDomRender > 120) {
        state.missionReplay.lastDomRender = now;
        renderMissionReplay();
      }
    } else {
      state.missionReplay.lastFrame = now;
    }

    state.missionReplay.animationId = requestAnimationFrame(frame);
  };

  state.missionReplay.animationId = requestAnimationFrame(frame);
}

function startTrafficAnimationLoop() {
  if (state.traffic.animationId) {
    return;
  }

  const frame = (now) => {
    if (state.mode === "studio") {
      drawStudioPreview(selectedStudioDesign(), now);
    }

    if (state.mode === "traffic") {
      const alerts = buildTrafficAlerts();
      const shells = buildTrafficHealthShells();
      drawTrafficMap(alerts, shells, now);
      drawTrafficRadar(alerts, now);
    }

    state.traffic.animationId = requestAnimationFrame(frame);
  };

  state.traffic.animationId = requestAnimationFrame(frame);
}

function setupThemeControls() {
  loadDisplaySettings();
  setDisplayControls();
  applyDisplaySettings({ persist: false, rerender: false });
}

function setupInteractiveSpaceEffects() {
  const canvas = document.querySelector("#spaceBackdropCanvas");
  const cursor = document.querySelector("#cursorSingularity");

  if (!canvas || !cursor) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    return;
  }
  const pointerFine = window.matchMedia("(pointer: fine)");
  const pointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.38,
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.38,
    active: false
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];

  function canUseCursorEffects() {
    return pointerFine.matches && state.display.gravityCursor && !state.display.reduceMotion;
  }

  function setCursorState() {
    const enabled = canUseCursorEffects();
    document.body.classList.toggle("cursor-effects-enabled", enabled);
    cursor.classList.toggle("active", enabled && pointer.active);
  }

  function seedStars() {
    const count = Math.min(620, Math.max(210, Math.floor((width * height) / 4200)));
    stars = Array.from({ length: count }, (_, index) => ({
      x: seededUnit(index + 2401) * width,
      y: seededUnit(index + 2501) * height,
      radius: 0.45 + seededUnit(index + 2601) * 1.55,
      depth: 0.25 + seededUnit(index + 2701) * 0.92,
      phase: seededUnit(index + 2801) * Math.PI * 2,
      warmth: seededUnit(index + 2901)
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function drawNebula(time, interactive) {
    const accent = readCssVar("--accent", "#93c5fd");
    const violet = readCssVar("--simulated-color", "#a78bfa");
    const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.max(width, height) * 0.72);
    glow.addColorStop(0, hexToRgba(accent, interactive && pointer.active ? 0.1 : 0.07));
    glow.addColorStop(0.32, hexToRgba(violet, interactive && pointer.active ? 0.052 : 0.04));
    glow.addColorStop(1, "rgb(0 0 0 / 0)");

    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    context.save();
    context.globalCompositeOperation = "lighter";
    for (let band = 0; band < 3; band += 1) {
      const y = height * (0.18 + band * 0.26) + Math.sin(time * 0.00012 + band) * 24;
      const gradient = context.createLinearGradient(0, y - 80, width, y + 80);
      gradient.addColorStop(0, "rgb(0 0 0 / 0)");
      gradient.addColorStop(0.42, band === 1 ? hexToRgba(accent, 0.045) : hexToRgba(violet, 0.035));
      gradient.addColorStop(1, "rgb(0 0 0 / 0)");
      context.strokeStyle = gradient;
      context.lineWidth = 54 + band * 18;
      context.beginPath();
      context.moveTo(-40, y);
      context.bezierCurveTo(width * 0.25, y - 60, width * 0.72, y + 74, width + 40, y - 24);
      context.stroke();
    }
    context.restore();
  }

  function drawStars(time, interactive) {
    const lensRadius = Math.min(84, Math.max(56, width * 0.052));

    context.save();
    context.globalCompositeOperation = "lighter";

    for (const star of stars) {
      const driftX = Math.sin(time * 0.00006 * star.depth + star.phase) * 12 * star.depth;
      const driftY = Math.cos(time * 0.00005 * star.depth + star.phase) * 8 * star.depth;
      const x = (star.x + driftX + width) % width;
      const y = (star.y + driftY + height) % height;
      let drawX = x;
      let drawY = y;
      let twinkle = 0.24 + Math.sin(time * 0.0017 + star.phase) * 0.12 + star.depth * 0.28;

      if (interactive && pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < lensRadius) {
          const falloff = (1 - distance / lensRadius) ** 2;
          const invDistance = 1 / Math.max(distance, 1);
          const tangent = falloff * 22 * star.depth;
          const pull = falloff * 5.5 * star.depth;
          drawX = x + -dy * invDistance * tangent - dx * invDistance * pull;
          drawY = y + dx * invDistance * tangent - dy * invDistance * pull;
          twinkle += falloff * 0.22;

          if (distance > 18) {
            context.strokeStyle = star.warmth > 0.82 ? "rgb(253 230 138 / 0.065)" : hexToRgba(readCssVar("--accent", "#93c5fd"), 0.06);
            context.lineWidth = Math.max(0.35, star.radius * 0.28);
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(drawX, drawY);
            context.stroke();
          }
        }
      }

      context.fillStyle = star.warmth > 0.84
        ? `rgb(253 230 138 / ${clamp(twinkle, 0.15, 0.86)})`
        : `rgb(226 242 255 / ${clamp(twinkle, 0.15, 0.82)})`;
      context.beginPath();
      context.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  function drawSingularityLens(time, interactive) {
    if (!interactive || !pointer.active) {
      return;
    }

    const accent = readCssVar("--accent", "#93c5fd");
    const violet = readCssVar("--simulated-color", "#a78bfa");
    const radius = 48 + Math.sin(time * 0.003) * 3;
    const halo = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius * 1.82);
    halo.addColorStop(0, "rgb(0 0 0 / 0.12)");
    halo.addColorStop(0.22, "rgb(0 0 0 / 0.08)");
    halo.addColorStop(0.5, hexToRgba(accent, 0.055));
    halo.addColorStop(1, "rgb(0 0 0 / 0)");

    context.save();
    context.globalCompositeOperation = "source-over";
    context.fillStyle = halo;
    context.beginPath();
    context.arc(pointer.x, pointer.y, radius * 1.75, 0, Math.PI * 2);
    context.fill();

    context.globalCompositeOperation = "lighter";
    for (let ring = 0; ring < 2; ring += 1) {
      const ringRadius = radius * (0.64 + ring * 0.28);
      context.strokeStyle = ring % 2 === 0 ? hexToRgba(accent, 0.16) : hexToRgba(violet, 0.13);
      context.lineWidth = 1.05 - ring * 0.18;
      context.beginPath();
      context.ellipse(
        pointer.x,
        pointer.y,
        ringRadius,
        ringRadius * (0.38 + ring * 0.08),
        time * 0.0015 + ring * 0.74,
        Math.PI * 0.08,
        Math.PI * 1.62
      );
      context.stroke();
    }
    context.restore();
  }

  function drawFrame(time = 0) {
    const interactive = canUseCursorEffects();
    const renderTime = state.display.reduceMotion ? 0 : time;
    pointer.x += (pointer.targetX - pointer.x) * (interactive ? 0.18 : 0.04);
    pointer.y += (pointer.targetY - pointer.y) * (interactive ? 0.18 : 0.04);

    cursor.style.left = `${pointer.x}px`;
    cursor.style.top = `${pointer.y}px`;
    setCursorState();

    context.clearRect(0, 0, width, height);
    drawNebula(renderTime, interactive);
    drawStars(renderTime, interactive);
    drawSingularityLens(renderTime, interactive);

    requestAnimationFrame(drawFrame);
  }

  window.addEventListener("pointermove", (event) => {
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    pointer.active = true;
    cursor.classList.toggle("interface-hover", Boolean(event.target.closest("button, a, input, select, textarea, label")));
    document.documentElement.style.setProperty("--space-x", `${(event.clientX / Math.max(window.innerWidth, 1)) * 100}%`);
    document.documentElement.style.setProperty("--space-y", `${(event.clientY / Math.max(window.innerHeight, 1)) * 100}%`);
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  if (typeof pointerFine.addEventListener === "function") {
    pointerFine.addEventListener("change", setCursorState);
  } else if (typeof pointerFine.addListener === "function") {
    pointerFine.addListener(setCursorState);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(drawFrame);
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
    await loadEncyclopediaTopics();
    loadStudioScenarios();
    wireControls();
    readLaunchInputs();
    populateOperatorSelect();
    updateAll();
    renderTimeMachine();
    startMissionReplayLoop();
    startTrafficAnimationLoop();
    loadWeatherData();
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
setupInteractiveSpaceEffects();
init();
