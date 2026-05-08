import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SATCAT_URL = "https://celestrak.org/pub/satcat.csv";
const FORMAT_DOCS_URL = "https://celestrak.org/satcat/satcat-format.php";
const outputPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/orbitguard-data.json"
);

function parseCsv(text) {
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
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

function toNumber(value) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function compactRecord(record) {
  return {
    name: record.OBJECT_NAME,
    objectId: record.OBJECT_ID,
    norad: toNumber(record.NORAD_CAT_ID),
    type: record.OBJECT_TYPE,
    status: record.OPS_STATUS_CODE,
    owner: record.OWNER,
    launchDate: record.LAUNCH_DATE,
    launchSite: record.LAUNCH_SITE,
    period: toNumber(record.PERIOD),
    inclination: toNumber(record.INCLINATION),
    apogee: toNumber(record.APOGEE),
    perigee: toNumber(record.PERIGEE),
    rcs: toNumber(record.RCS),
    orbitCenter: record.ORBIT_CENTER,
    orbitType: record.ORBIT_TYPE
  };
}

async function main() {
  console.log("Downloading SATCAT data from CelesTrak...");
  const response = await fetch(SATCAT_URL, {
    headers: {
      "User-Agent": "OrbitGuard student space-sustainability project"
    }
  });

  if (!response.ok) {
    throw new Error(`CelesTrak request failed with ${response.status}`);
  }

  const csv = await response.text();
  const rows = parseCsv(csv);
  const objects = rows
    .filter((record) => record.DECAY_DATE === "" && record.ORBIT_CENTER === "EA" && record.ORBIT_TYPE === "ORB")
    .map(compactRecord)
    .filter((record) => record.norad !== null && record.apogee !== null && record.perigee !== null);

  const payload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: SATCAT_URL,
      sourceDocs: FORMAT_DOCS_URL,
      totalSatcatRows: rows.length,
      earthOrbitingObjects: objects.length,
      note: "Filtered to non-decayed Earth-orbiting SATCAT records with usable apogee/perigee values."
    },
    objects
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload)}\n`, "utf8");
  console.log(`Wrote ${objects.length.toLocaleString()} objects to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
