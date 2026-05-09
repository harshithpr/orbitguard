import { handleOptions, loadCatalog, readBody, sendJson, simulateLaunchImpact } from "../_catalog.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Use POST with a JSON launch scenario body." });
    return;
  }

  const catalog = await loadCatalog();
  const body = await readBody(req);
  const impact = simulateLaunchImpact(catalog.objects, body);

  sendJson(res, 200, {
    impact,
    methodology: "Educational launch-impact score using catalog crowding, altitude persistence, lifetime, debris/rocket-body presence, and deorbit planning."
  });
}

