import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildBands,
  buildTimeMachineComparison,
  filterObjects,
  normalizeObject,
  scoreObjects,
  simulateLaunchImpact,
  summarize
} from "./src/engines/orbitguard-core.js";
import {
  getGroundStationNetwork,
  getGroundStationWeather,
  getSpaceWeather
} from "./src/engines/weather-core.js";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const dataPath = resolve(join(root, "data/orbitguard-data.json"));
let catalogCache = null;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/plain; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".ico", "image/x-icon"]
]);

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleaned = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const requested = cleaned === "/" ? "/index.html" : cleaned;
  const absolute = resolve(join(root, requested));

  if (!absolute.startsWith(root)) {
    return null;
  }

  return absolute;
}

async function loadCatalog() {
  if (catalogCache) {
    return catalogCache;
  }

  const payload = JSON.parse(await readFile(dataPath, "utf8"));
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
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
}

async function readJsonBody(req) {
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

async function handleApi(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const catalog = await loadCatalog();

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
    const bands = buildBands(catalog.objects, size);

    sendJson(res, 200, {
      sizeKm: size,
      count: bands.length,
      bands
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

  if (url.pathname === "/api/v1/weather/space" || url.pathname === "/api/v1/weather-space") {
    try {
      sendJson(res, 200, await getSpaceWeather());
    } catch (error) {
      sendJson(res, 502, {
        ok: false,
        error: "Space weather feed unavailable",
        detail: error.message
      });
    }
    return;
  }

  if (url.pathname === "/api/v1/weather/ground" || url.pathname === "/api/v1/weather-ground") {
    try {
      const query = searchParamsToObject(url.searchParams);
      const payload = String(query.station || "").toLowerCase() === "all"
        ? await getGroundStationNetwork()
        : await getGroundStationWeather(query);
      sendJson(res, 200, payload);
    } catch (error) {
      sendJson(res, 502, {
        ok: false,
        error: "Ground station weather feed unavailable",
        detail: error.message
      });
    }
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
    endpoints: [
      "GET /api/v1/health",
      "GET /api/v1/summary",
      "GET /api/v1/objects?band=500-600&type=debris",
      "GET /api/v1/bands?size=100",
      "GET /api/v1/time-machine?year=2005",
      "GET /api/v1/weather/space",
      "GET /api/v1/weather/ground?station=goldstone",
      "GET /api/v1/weather/ground?station=all",
      "GET /api/v1/sustainability?satellites=24&altitude=550&inclination=53&rocketBodyRemains=true",
      "POST /api/v1/simulate"
    ]
  });
}

const server = createServer(async (req, res) => {
  try {
    if ((req.url || "").startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }

    const filePath = safePath(req.url || "/");

    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const fileStat = await stat(filePath);
    const finalPath = fileStat.isDirectory() ? join(filePath, "index.html") : filePath;
    const body = await readFile(finalPath);
    const contentType = mimeTypes.get(extname(finalPath)) || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store"
    });
    res.end(body);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`OrbitGuard running at http://localhost:${port}`);
});
