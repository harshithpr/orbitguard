import { clamp } from "./orbitguard-core.js";

const SWPC_JSON_BASE = "https://services.swpc.noaa.gov/json";
const SWPC_PRODUCTS_BASE = "https://services.swpc.noaa.gov/products";
const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

export const GROUND_STATIONS = [
  {
    id: "goldstone",
    name: "Goldstone",
    location: "Mojave Desert, California",
    latitude: 35.2472,
    longitude: -116.7933,
    primaryUse: "Deep space + LEO tracking"
  },
  {
    id: "canberra",
    name: "Canberra",
    location: "Australian Capital Territory, Australia",
    latitude: -35.3985,
    longitude: 148.9819,
    primaryUse: "Southern hemisphere coverage"
  },
  {
    id: "madrid",
    name: "Madrid",
    location: "Robledo de Chavela, Spain",
    latitude: 40.4314,
    longitude: -4.2481,
    primaryUse: "ESA/NASA coordination"
  },
  {
    id: "svalbard",
    name: "Svalbard",
    location: "Svalbard, Norway",
    latitude: 78.2298,
    longitude: 15.4078,
    primaryUse: "Polar orbit passes"
  },
  {
    id: "mcmurdo",
    name: "McMurdo",
    location: "Ross Island, Antarctica",
    latitude: -77.8419,
    longitude: 166.6863,
    primaryUse: "Polar satellite operations"
  },
  {
    id: "diego-garcia",
    name: "Diego Garcia",
    location: "British Indian Ocean Territory",
    latitude: -7.3133,
    longitude: 72.4111,
    primaryUse: "Indian Ocean tracking coverage"
  },
  {
    id: "wallops",
    name: "Wallops",
    location: "Wallops Island, Virginia",
    latitude: 37.9402,
    longitude: -75.4664,
    primaryUse: "NASA LEO communications"
  }
];

export function stationList() {
  return GROUND_STATIONS.map((station) => ({ ...station }));
}

async function fetchJson(url, { ttl = CACHE_TTL_MS } = {}) {
  const cached = cache.get(url);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "OrbitGuard/0.3 educational space sustainability analyzer"
      }
    });

    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`);
    }

    const data = await response.json();
    cache.set(url, { timestamp: now, data });
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function parseFinite(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function latestObject(rows, timeKey = "time_tag", predicate = () => true) {
  return [...(Array.isArray(rows) ? rows : [])]
    .filter((row) => row && predicate(row))
    .sort((a, b) => new Date(a[timeKey] || 0) - new Date(b[timeKey] || 0))
    .at(-1);
}

function latestSolarWindRow(rows) {
  if (!Array.isArray(rows)) {
    return null;
  }

  return [...rows]
    .reverse()
    .find((row) => Array.isArray(row) && Number.isFinite(Number(row[1])) && Number.isFinite(Number(row[2])));
}

export function geomagneticStormLevel(kpValue) {
  if (kpValue >= 9) return { code: "G5", label: "Extreme storm", severity: "extreme" };
  if (kpValue >= 8) return { code: "G4", label: "Severe storm", severity: "severe" };
  if (kpValue >= 7) return { code: "G3", label: "Strong storm", severity: "strong" };
  if (kpValue >= 6) return { code: "G2", label: "Moderate storm", severity: "moderate" };
  if (kpValue >= 5) return { code: "G1", label: "Minor storm", severity: "minor" };
  return { code: "G0", label: "Quiet to unsettled", severity: "quiet" };
}

function dragMultiplier(kpValue, f107Flux) {
  const kp = Number.isFinite(kpValue) ? kpValue : 2;
  const f107 = Number.isFinite(f107Flux) ? f107Flux : 110;
  const solarTerm = 1 + clamp((f107 - 70) / 160, -0.25, 1.4) * 1.15;
  const geomagneticTerm = 1 + clamp((kp - 2) / 7, -0.12, 1) * 1.2;
  return clamp(solarTerm * geomagneticTerm, 0.72, 4.4);
}

function buildAltitudeImpacts(multiplier) {
  return [
    { band: "300-400 km", shell: "Very low LEO", scale: 1.35 },
    { band: "400-500 km", shell: "Low LEO", scale: 1.1 },
    { band: "500-600 km", shell: "Constellation LEO", scale: 0.82 },
    { band: "600-800 km", shell: "Sun-synchronous LEO", scale: 0.52 },
    { band: "800-1200 km", shell: "Persistent LEO", scale: 0.3 }
  ].map((item) => {
    const densityMultiplier = clamp(multiplier * item.scale, 0.55, 5.5);
    const timelineChange = densityMultiplier >= 1
      ? clamp((1 - 1 / densityMultiplier) * 100, 0, 82)
      : -clamp((1 / densityMultiplier - 1) * 100, 0, 75);
    const risk = densityMultiplier >= 2.4 ? "High drag" : densityMultiplier >= 1.35 ? "Elevated" : "Nominal";

    return {
      ...item,
      densityMultiplier,
      deorbitTimelineChangePercent: timelineChange,
      risk
    };
  });
}

function yearlySolarCyclePoints(rows) {
  const byYear = new Map();

  for (const row of Array.isArray(rows) ? rows : []) {
    const rawDate = row["time-tag"] || row.time_tag;
    const year = rawDate ? Number(String(rawDate).slice(0, 4)) : null;
    const flux = parseFinite(row["f10.7"] ?? row.f107 ?? row.flux);

    if (!Number.isFinite(year) || year < 1990 || !Number.isFinite(flux) || flux <= 0) {
      continue;
    }

    if (!byYear.has(year)) {
      byYear.set(year, []);
    }

    byYear.get(year).push(flux);
  }

  return [...byYear.entries()]
    .map(([year, values]) => ({
      year,
      f107: values.reduce((sum, value) => sum + value, 0) / values.length
    }))
    .sort((a, b) => a.year - b.year);
}

function alertSummary(alerts) {
  return [...(Array.isArray(alerts) ? alerts : [])]
    .filter((alert) => alert && alert.issue_datetime && alert.message)
    .sort((a, b) => new Date(b.issue_datetime) - new Date(a.issue_datetime))
    .slice(0, 5)
    .map((alert) => ({
      id: alert.product_id,
      issuedAt: alert.issue_datetime,
      headline: String(alert.message).split("\n").find(Boolean)?.replace(/^Space Weather Message Code:\s*/i, "").slice(0, 110) || "Space weather alert",
      message: alert.message
    }));
}

export async function getSpaceWeather() {
  const [kpResult, f107Result, plasmaResult, alertsResult, cycleResult] = await Promise.allSettled([
    fetchJson(`${SWPC_JSON_BASE}/planetary_k_index_1m.json`),
    fetchJson(`${SWPC_JSON_BASE}/f107_cm_flux.json`, { ttl: 30 * 60 * 1000 }),
    fetchJson(`${SWPC_PRODUCTS_BASE}/solar-wind/plasma-1-day.json`),
    fetchJson(`${SWPC_PRODUCTS_BASE}/alerts.json`),
    fetchJson(`${SWPC_JSON_BASE}/solar-cycle/observed-solar-cycle-indices.json`, { ttl: 12 * 60 * 60 * 1000 })
  ]);

  const kpData = kpResult.status === "fulfilled" ? kpResult.value : [];
  const f107Data = f107Result.status === "fulfilled" ? f107Result.value : [];
  const plasmaData = plasmaResult.status === "fulfilled" ? plasmaResult.value : [];
  const alertsData = alertsResult.status === "fulfilled" ? alertsResult.value : [];
  const cycleData = cycleResult.status === "fulfilled" ? cycleResult.value : [];
  const errors = [kpResult, f107Result, plasmaResult, alertsResult, cycleResult]
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason.message);

  const kpEntry = latestObject(kpData, "time_tag", (row) => parseFinite(row.estimated_kp ?? row.kp_index ?? Number.parseFloat(row.kp)) !== null);
  const kpValue = parseFinite(kpEntry?.estimated_kp ?? kpEntry?.kp_index ?? Number.parseFloat(kpEntry?.kp), 0);
  const stormLevel = geomagneticStormLevel(kpValue);
  const f107Entry = latestObject(f107Data, "time_tag", (row) => parseFinite(row.flux) > 0);
  const f107Flux = parseFinite(f107Entry?.flux, 110);
  const f107Mean = parseFinite(f107Entry?.ninety_day_mean, null);
  const plasmaEntry = latestSolarWindRow(plasmaData);
  const solarWind = plasmaEntry
    ? {
        observedAt: plasmaEntry[0],
        densityPcm3: parseFinite(plasmaEntry[1], 0),
        speedKmS: parseFinite(plasmaEntry[2], 0),
        temperatureK: parseFinite(plasmaEntry[3], 0)
      }
    : {
        observedAt: null,
        densityPcm3: 0,
        speedKmS: 0,
        temperatureK: 0
      };
  const multiplier = dragMultiplier(kpValue, f107Flux);
  const timelineChange = multiplier >= 1 ? clamp((1 - 1 / multiplier) * 100, 0, 82) : -clamp((1 / multiplier - 1) * 100, 0, 75);
  const cyclePoints = yearlySolarCyclePoints(cycleData);
  const minimumBaseline = 70;
  const solarCyclePercentAboveMinimum = ((f107Flux - minimumBaseline) / minimumBaseline) * 100;

  return {
    ok: errors.length < 5,
    generatedAt: new Date().toISOString(),
    sources: {
      kp: `${SWPC_JSON_BASE}/planetary_k_index_1m.json`,
      f107: `${SWPC_JSON_BASE}/f107_cm_flux.json`,
      solarWind: `${SWPC_PRODUCTS_BASE}/solar-wind/plasma-1-day.json`,
      alerts: `${SWPC_PRODUCTS_BASE}/alerts.json`,
      solarCycle: `${SWPC_JSON_BASE}/solar-cycle/observed-solar-cycle-indices.json`
    },
    kp: {
      value: kpValue,
      label: kpEntry?.kp || String(kpValue),
      observedAt: kpEntry?.time_tag || null,
      stormLevel
    },
    f107: {
      flux: f107Flux,
      ninetyDayMean: f107Mean,
      observedAt: f107Entry?.time_tag || null,
      reportingSchedule: f107Entry?.reporting_schedule || null,
      percentAboveSolarMinimum: solarCyclePercentAboveMinimum
    },
    solarWind,
    activeAlerts: alertSummary(alertsData),
    drag: {
      multiplier,
      deorbitTimelineChangePercent: timelineChange,
      interpretation:
        timelineChange >= 0
          ? `Educational drag model estimates natural deorbit timelines are about ${Math.round(timelineChange)}% shorter than a quiet solar-minimum baseline.`
          : `Educational drag model estimates natural deorbit timelines are about ${Math.abs(Math.round(timelineChange))}% longer than a quiet solar-minimum baseline.`
    },
    altitudeImpacts: buildAltitudeImpacts(multiplier),
    solarCycle: {
      points: cyclePoints,
      currentCycle: "Solar Cycle 25",
      note: "F10.7 is used here as a solar activity proxy for educational drag-risk scaling."
    },
    starlinkIncident: {
      date: "2022-02-03",
      launchAltitudeKm: 210,
      launchedSatellites: 49,
      reenteredSatellites: 38,
      eventKpApprox: 6,
      lesson:
        "A geomagnetic storm increased atmospheric density at very low LEO, preventing most satellites from raising orbit before reentry."
    },
    methodology:
      "Space weather values come from NOAA SWPC feeds. Drag and deorbit changes are an educational scaling model using Kp and F10.7, not a replacement for NRLMSISE-00 or operational orbit determination.",
    errors
  };
}

function resolveStation(input = {}) {
  const stationId = String(input.station || "goldstone").toLowerCase();
  const preset = GROUND_STATIONS.find((station) => station.id === stationId || station.name.toLowerCase() === stationId);
  const latitude = parseFinite(input.lat ?? input.latitude);
  const longitude = parseFinite(input.lon ?? input.longitude);

  if (latitude !== null && longitude !== null) {
    return {
      id: "custom",
      name: input.name || "Custom Station",
      location: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      latitude: clamp(latitude, -90, 90),
      longitude: clamp(longitude, -180, 180),
      primaryUse: "User-defined ground station"
    };
  }

  return preset || GROUND_STATIONS[0];
}

function openMeteoUrl(station) {
  const url = new URL(OPEN_METEO_BASE);
  url.searchParams.set("latitude", station.latitude);
  url.searchParams.set("longitude", station.longitude);
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m",
      "visibility",
      "weather_code"
    ].join(",")
  );
  url.searchParams.set("hourly", ["precipitation", "cloud_cover", "wind_speed_10m", "visibility"].join(","));
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("timezone", "auto");
  return url;
}

function weatherCodeLabel(code) {
  const labels = new Map([
    [0, "Clear"],
    [1, "Mostly clear"],
    [2, "Partly cloudy"],
    [3, "Overcast"],
    [45, "Fog"],
    [48, "Depositing rime fog"],
    [51, "Light drizzle"],
    [53, "Drizzle"],
    [55, "Dense drizzle"],
    [61, "Light rain"],
    [63, "Rain"],
    [65, "Heavy rain"],
    [71, "Light snow"],
    [73, "Snow"],
    [75, "Heavy snow"],
    [80, "Rain showers"],
    [81, "Rain showers"],
    [82, "Violent rain showers"],
    [95, "Thunderstorm"]
  ]);

  return labels.get(Number(code)) || "Current weather";
}

function nextClearWindow(hourly) {
  if (!hourly || !Array.isArray(hourly.time)) {
    return {
      availableNow: false,
      label: "Hourly clear-window estimate unavailable in this data source."
    };
  }

  const now = Date.now();

  for (let index = 0; index < hourly.time.length; index += 1) {
    const time = new Date(hourly.time[index]).getTime();
    const hoursFromNow = (time - now) / 3_600_000;

    if (hoursFromNow < 0) {
      continue;
    }

    const cloud = parseFinite(hourly.cloud_cover?.[index], 100);
    const precipitation = parseFinite(hourly.precipitation?.[index], 0);
    const windMps = parseFinite(hourly.wind_speed_10m?.[index], 0) / 3.6;
    const visibilityKm = parseFinite(hourly.visibility?.[index], 0) / 1000;

    if (cloud <= 35 && precipitation <= 0.2 && windMps <= 18 && visibilityKm >= 8) {
      return {
        availableNow: hoursFromNow < 1,
        time: new Date(time).toISOString(),
        hoursFromNow: Math.max(0, hoursFromNow),
        label: hoursFromNow < 1 ? "Clear optical window likely now." : `Next likely clear optical window in ${Math.round(hoursFromNow)} hours.`
      };
    }
  }

  return {
    availableNow: false,
    label: "No strong optical window found in the next 48 hours."
  };
}

async function fetchOpenMeteoConditions(station) {
  const data = await fetchJson(openMeteoUrl(station).toString(), { ttl: 10 * 60 * 1000 });
  const current = data.current || {};
  const precipitationMm = parseFinite(current.precipitation ?? current.rain ?? 0, 0);
  const rainMm = parseFinite(current.rain, 0) + parseFinite(current.showers, 0);
  const snowMm = parseFinite(current.snowfall, 0);

  return {
    source: "Open-Meteo",
    observedAt: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
    current: {
      condition: weatherCodeLabel(current.weather_code),
      temperatureC: parseFinite(current.temperature_2m, null),
      humidityPercent: parseFinite(current.relative_humidity_2m, null),
      rainRateMmHr: Math.max(precipitationMm, rainMm, snowMm) * 4,
      cloudCoverPercent: parseFinite(current.cloud_cover, 0),
      windSpeedMps: parseFinite(current.wind_speed_10m, 0) / 3.6,
      windGustMps: parseFinite(current.wind_gusts_10m, 0) / 3.6,
      visibilityKm: parseFinite(current.visibility, 0) / 1000
    },
    nextClearWindow: nextClearWindow(data.hourly)
  };
}

async function fetchOpenWeatherConditions(station, apiKey) {
  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("lat", station.latitude);
  url.searchParams.set("lon", station.longitude);
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");
  const [data, openMeteo] = await Promise.all([
    fetchJson(url.toString(), { ttl: 10 * 60 * 1000 }),
    fetchOpenMeteoConditions(station).catch(() => null)
  ]);
  const rainRate = parseFinite(data.rain?.["1h"], null) ?? (parseFinite(data.rain?.["3h"], 0) / 3);

  return {
    source: "OpenWeatherMap",
    observedAt: data.dt ? new Date(data.dt * 1000).toISOString() : new Date().toISOString(),
    current: {
      condition: data.weather?.[0]?.description || "Current weather",
      temperatureC: parseFinite(data.main?.temp, null),
      humidityPercent: parseFinite(data.main?.humidity, null),
      rainRateMmHr: rainRate,
      cloudCoverPercent: parseFinite(data.clouds?.all, 0),
      windSpeedMps: parseFinite(data.wind?.speed, 0),
      windGustMps: parseFinite(data.wind?.gust, parseFinite(data.wind?.speed, 0)),
      visibilityKm: parseFinite(data.visibility, 0) / 1000
    },
    nextClearWindow: openMeteo?.nextClearWindow || {
      availableNow: false,
      label: "Hourly clear-window estimate unavailable."
    }
  };
}

async function fetchGroundConditions(station) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (apiKey) {
    try {
      return await fetchOpenWeatherConditions(station, apiKey);
    } catch {
      return fetchOpenMeteoConditions(station);
    }
  }

  return fetchOpenMeteoConditions(station);
}

export function analyzeGroundConditions(current, nextClearWindow = null) {
  const rainRate = parseFinite(current.rainRateMmHr, 0);
  const cloudCover = parseFinite(current.cloudCoverPercent, 0);
  const wind = parseFinite(current.windSpeedMps, 0);
  const gust = parseFinite(current.windGustMps, wind);
  const visibility = parseFinite(current.visibilityKm, 0);
  const kaBandAttenuationDb = rainRate > 0 ? Math.pow(rainRate, 0.6) * 2.8 * 0.65 : 0;
  const opticalScore = clamp(100 - cloudCover * 0.9 - rainRate * 5 - Math.max(0, 10 - visibility) * 4, 0, 100);
  const opticalQuality = opticalScore >= 75 ? "Good" : opticalScore >= 45 ? "Marginal" : opticalScore >= 20 ? "Poor" : "Offline";
  const antennaStatus = gust >= 30 || wind >= 25
    ? "Must stow"
    : gust >= 24 || wind >= 20
      ? "Approaching wind limit"
      : "Safe";
  const laserCommStatus = opticalScore >= 72 && rainRate < 0.5 && cloudCover < 30 ? "Available" : "Unavailable";

  return {
    kaBandAttenuationDb,
    linkMarginText: kaBandAttenuationDb >= 12
      ? "Severe Ka-band rain fade"
      : kaBandAttenuationDb >= 4
        ? "Noticeable Ka-band degradation"
        : "Ka-band nominal",
    opticalScore,
    opticalQuality,
    antennaStatus,
    laserCommStatus,
    nextClearWindow: nextClearWindow || {
      availableNow: opticalScore >= 75,
      label: opticalScore >= 75 ? "Clear optical window likely now." : "Next clear window estimate unavailable."
    }
  };
}

export async function getGroundStationWeather(input = {}) {
  const station = resolveStation(input);
  const weather = await fetchGroundConditions(station);
  const operations = analyzeGroundConditions(weather.current, weather.nextClearWindow);

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    station,
    source: weather.source,
    observedAt: weather.observedAt,
    current: weather.current,
    operations,
    methodology:
      "Ground station operations are estimated from surface weather. Ka-band rain fade uses a simplified ITU-R-style educational model; optical and antenna status use threshold scoring.",
    sources: {
      openMeteo: "https://open-meteo.com/en/docs",
      openWeatherMap: "https://openweathermap.org/api/current"
    }
  };
}

export async function getGroundStationNetwork() {
  const results = await Promise.allSettled(GROUND_STATIONS.map((station) => getGroundStationWeather({ station: station.id })));

  return {
    ok: results.some((result) => result.status === "fulfilled"),
    generatedAt: new Date().toISOString(),
    stations: results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }

      return {
        ok: false,
        station: GROUND_STATIONS[index],
        error: result.reason.message
      };
    }),
    methodology: "Network view runs the same ground-station weather analysis across preset tracking sites."
  };
}
