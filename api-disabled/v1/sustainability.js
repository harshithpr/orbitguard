import { handleOptions, loadCatalog, parseQuery, sendJson, simulateLaunchImpact } from "../_catalog.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const catalog = await loadCatalog();
  const impact = simulateLaunchImpact(catalog.objects, parseQuery(req));

  sendJson(res, 200, {
    impact,
    methodology: "Educational launch-impact score using catalog crowding, altitude persistence, lifetime, debris/rocket-body presence, and deorbit planning."
  });
}

