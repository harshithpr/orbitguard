export const SATCAT_URL = "https://celestrak.org/pub/satcat.csv";
export const SATCAT_FORMAT_DOCS_URL = "https://celestrak.org/satcat/satcat-format.php";

export function parseSatcatCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        value += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value);
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const headers = rows.shift();
  if (!headers?.length || !headers.includes("NORAD_CAT_ID")) {
    throw new Error("CelesTrak SATCAT response did not include the expected headers");
  }

  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

export function satcatNumber(value) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function compactSatcatRecord(record) {
  return {
    name: record.OBJECT_NAME,
    objectId: record.OBJECT_ID,
    norad: satcatNumber(record.NORAD_CAT_ID),
    type: record.OBJECT_TYPE,
    status: record.OPS_STATUS_CODE,
    owner: record.OWNER,
    launchDate: record.LAUNCH_DATE,
    launchSite: record.LAUNCH_SITE,
    period: satcatNumber(record.PERIOD),
    inclination: satcatNumber(record.INCLINATION),
    apogee: satcatNumber(record.APOGEE),
    perigee: satcatNumber(record.PERIGEE),
    rcs: satcatNumber(record.RCS),
    orbitCenter: record.ORBIT_CENTER,
    orbitType: record.ORBIT_TYPE
  };
}

export function activeEarthOrbitRecords(rows) {
  return rows
    .filter((record) => record.DECAY_DATE === "" && record.ORBIT_CENTER === "EA" && record.ORBIT_TYPE === "ORB")
    .map(compactSatcatRecord)
    .filter((record) => record.norad !== null && record.apogee !== null && record.perigee !== null);
}

export function buildCatalogPayloadFromSatcat(csv, generatedAt = new Date()) {
  const rows = parseSatcatCsv(csv);
  const objects = activeEarthOrbitRecords(rows);

  return {
    metadata: {
      generatedAt: generatedAt.toISOString(),
      source: SATCAT_URL,
      sourceDocs: SATCAT_FORMAT_DOCS_URL,
      totalSatcatRows: rows.length,
      earthOrbitingObjects: objects.length,
      note: "Filtered to non-decayed Earth-orbiting SATCAT records with usable apogee/perigee values."
    },
    objects
  };
}

export function buildCatalogStatusFromSatcat(csv, checkedAt = new Date(), sourceLastModified = null) {
  const rows = parseSatcatCsv(csv);
  const objects = activeEarthOrbitRecords(rows);

  return {
    ok: true,
    checkedAt: checkedAt.toISOString(),
    source: SATCAT_URL,
    sourceDocs: SATCAT_FORMAT_DOCS_URL,
    sourceLastModified,
    totalSatcatRows: rows.length,
    earthOrbitingObjects: objects.length,
    note: "Live CelesTrak SATCAT check filtered to active Earth-orbiting records with usable apogee/perigee values."
  };
}

export async function fetchSatcatCsv({
  fetchImpl = fetch,
  headers = {},
  timeoutMs = 25_000
} = {}) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  let response;
  try {
    response = await fetchImpl(SATCAT_URL, {
      headers: {
        "User-Agent": "OrbitGuard space-sustainability project",
        ...headers
      },
      signal: controller?.signal
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("CelesTrak request timed out");
    }
    throw error;
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }

  if (!response.ok) {
    throw new Error(`CelesTrak request failed with ${response.status}`);
  }

  return {
    csv: await response.text(),
    sourceLastModified: response.headers.get("last-modified")
  };
}
