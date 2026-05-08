export const ACTIVE_STATUS_CODES = new Set(["+", "P", "B", "S", "X"]);

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function numberOrNull(value) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function classifyOrbit(object) {
  const altitude = object.altitude;
  const eccentricSpan = (object.apogee || altitude) - (object.perigee || altitude);

  if ((object.perigee || altitude) < 2000 && (object.apogee || altitude) > 8000) {
    return "HEO";
  }

  if (altitude <= 2000) {
    return "LEO";
  }

  if (altitude >= 33000 && altitude <= 41000 && (object.inclination || 0) <= 30) {
    return "GEO";
  }

  if (altitude < 33000 && eccentricSpan < 10000) {
    return "MEO";
  }

  return "HEO";
}

export function typeLabel(type) {
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

export function normalizeObject(raw, currentYear = new Date().getUTCFullYear()) {
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

export function objectHazard(object) {
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

export function persistenceScore(object) {
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

export function altitudeBand(object, size = 200) {
  if (!Number.isFinite(object.altitude)) {
    return "Unknown";
  }

  const start = Math.floor(object.altitude / size) * size;
  return `${start}-${start + size}`;
}

export function bandSizeForAltitude(altitude) {
  if (altitude <= 2000) {
    return 100;
  }

  if (altitude >= 33000 && altitude <= 41000) {
    return 500;
  }

  return 1000;
}

export function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

export function scoreObjects(objects) {
  const binCounts = new Map();

  for (const object of objects) {
    const key = altitudeBand(object, 100);
    binCounts.set(key, (binCounts.get(key) || 0) + 1);
  }

  const maxBinCount = Math.max(1, ...binCounts.values());

  return objects.map((object) => {
    const congestion = (binCounts.get(altitudeBand(object, 100)) || 0) / maxBinCount;
    const age = clamp(object.age / 30, 0, 1);
    const riskScore = clamp(
      100 * (0.34 * objectHazard(object) + 0.34 * persistenceScore(object) + 0.22 * congestion + 0.1 * age),
      0,
      100
    );

    return { ...object, riskScore };
  });
}

export function filterObjects(objects, filters = {}) {
  return objects.filter((object) => {
    if (filters.orbit && filters.orbit !== "all" && object.orbitClass !== filters.orbit) {
      return false;
    }

    if (filters.type === "debris" && object.type !== "DEB") {
      return false;
    }

    if (filters.type === "payload" && object.type !== "PAY") {
      return false;
    }

    if (filters.type === "rocket-body" && object.type !== "R/B") {
      return false;
    }

    if (filters.type && ["PAY", "DEB", "R/B"].includes(filters.type) && object.type !== filters.type) {
      return false;
    }

    if (filters.band) {
      const [start, end] = String(filters.band).replace("km", "").split("-").map(Number);

      if (!Number.isFinite(start) || !Number.isFinite(end) || object.altitude < start || object.altitude >= end) {
        return false;
      }
    }

    if (filters.owner && filters.owner !== "all" && object.owner !== filters.owner) {
      return false;
    }

    if (filters.minRisk && object.riskScore < Number(filters.minRisk)) {
      return false;
    }

    return true;
  });
}

export function summarize(objects) {
  const total = objects.length;
  const active = objects.filter((object) => object.activePayload).length;
  const debris = objects.filter((object) => object.type === "DEB").length;
  const rocketBodies = objects.filter((object) => object.type === "R/B").length;
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
    averageRisk
  };
}

export function riskLevel(score) {
  if (score >= 68) {
    return "High";
  }

  if (score >= 35) {
    return "Medium";
  }

  return "Low";
}

export function sustainabilityGrade(score) {
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

export function maxBandCount(objects, size) {
  const counts = new Map();

  for (const object of objects) {
    const key = altitudeBand(object, size);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Math.max(1, ...counts.values());
}

export function simulateLaunchImpact(objects, input = {}) {
  const launch = {
    name: input.name || "Untitled mission",
    satellites: clamp(Number(input.satellites || input.payloads || 1), 1, 500),
    altitude: clamp(Number(input.altitude || 550), 160, 42000),
    inclination: clamp(Number(input.inclination || 0), 0, 180),
    lifetime: clamp(Number(input.lifetime || 5), 1, 50),
    fragments: clamp(Number(input.fragments || 0), 0, 1000),
    rocketBodyRemains: parseBoolean(input.rocketBodyRemains, false),
    deorbitPlan: parseBoolean(input.deorbitPlan, true)
  };
  const size = bandSizeForAltitude(launch.altitude);
  const band = altitudeBand({ altitude: launch.altitude }, size);
  const [bandStart, bandEnd] = band.split("-").map(Number);
  const bandObjects = objects.filter((object) => object.altitude >= bandStart && object.altitude < bandEnd);
  const payloads = launch.satellites;
  const rocketBodies = launch.rocketBodyRemains ? 1 : 0;
  const debris = launch.fragments;
  const addedObjects = payloads + rocketBodies + debris;
  const total = objects.length;
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
  const crowdingScale = maxBandCount(objects, size);
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
    grade: sustainabilityGrade(riskIndex),
    compliance: complianceCheck({ ...launch, orbitClass, riskIndex })
  };
}

export function complianceCheck(mission) {
  const estimatedDeorbitYears = estimateDeorbitYears(mission);
  const isLeo = mission.orbitClass === "LEO" || mission.altitude < 2000;

  return {
    estimatedDeorbitYears,
    iadc25Year: !isLeo || estimatedDeorbitYears <= 25,
    fcc5Year: !isLeo || estimatedDeorbitYears <= 5,
    debrisMitigation: mission.deorbitPlan && !mission.rocketBodyRemains,
    notes: [
      "Educational screen only; not a legal or licensing determination.",
      "Use official FCC, IADC, ITU, and mission-specific analysis before filing."
    ]
  };
}

export function estimateDeorbitYears(mission) {
  if (mission.deorbitPlan) {
    return Math.min(Number(mission.lifetime || 5), 25);
  }

  if (mission.altitude < 400) {
    return 1.5;
  }

  if (mission.altitude < 600) {
    return 7;
  }

  if (mission.altitude < 800) {
    return 18;
  }

  if (mission.altitude < 1200) {
    return 40;
  }

  return 100;
}

export function buildBands(objects, size = 100) {
  const groups = new Map();

  for (const object of objects) {
    const band = altitudeBand(object, size);
    const existing = groups.get(band) || {
      band,
      count: 0,
      debris: 0,
      rocketBodies: 0,
      active: 0,
      averageRisk: 0
    };

    existing.count += 1;
    existing.debris += object.type === "DEB" ? 1 : 0;
    existing.rocketBodies += object.type === "R/B" ? 1 : 0;
    existing.active += object.activePayload ? 1 : 0;
    existing.averageRisk += object.riskScore;
    groups.set(band, existing);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      averageRisk: group.count ? group.averageRisk / group.count : 0
    }))
    .sort((a, b) => b.count - a.count);
}
