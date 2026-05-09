import { buildBands, handleOptions, loadCatalog, parseQuery, sendJson } from "../_catalog.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const catalog = await loadCatalog();
  const query = parseQuery(req);
  const size = Math.min(1000, Math.max(50, Number(query.size || 100)));
  const bands = buildBands(catalog.objects, size);

  sendJson(res, 200, {
    sizeKm: size,
    count: bands.length,
    bands
  });
}

