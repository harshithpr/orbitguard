import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  buildBands,
  filterObjects,
  normalizeObject,
  scoreObjects,
  simulateLaunchImpact,
  summarize
} from "../src/engines/orbitguard-core.js";

let catalogCache = null;

export async function loadCatalog() {
  if (catalogCache) {
    return catalogCache;
  }

  const payload = JSON.parse(await readFile(resolve(process.cwd(), "data/orbitguard-data.json"), "utf8"));
  const generatedDate = new Date(payload.metadata.generatedAt);
  const currentYear = generatedDate.getUTCFullYear();
  const objects = scoreObjects(payload.objects.map((object) => normalizeObject(object, currentYear)));
  catalogCache = {
    metadata: payload.metadata,
    objects
  };

  return catalogCache;
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
}

export function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return true;
  }

  return false;
}

export function parseQuery(req) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  return Object.fromEntries(url.searchParams.entries());
}

export async function readBody(req) {
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

export { buildBands, filterObjects, simulateLaunchImpact, summarize };

