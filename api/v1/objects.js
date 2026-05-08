import { filterObjects, handleOptions, loadCatalog, parseQuery, sendJson } from "../_catalog.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const catalog = await loadCatalog();
  const filters = parseQuery(req);
  const limit = Math.min(500, Math.max(1, Number(filters.limit || 100)));
  const objects = filterObjects(catalog.objects, filters)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, limit);

  sendJson(res, 200, {
    count: objects.length,
    filters,
    objects
  });
}

