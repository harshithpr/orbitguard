import { buildBands, handleOptions, loadCatalog, sendJson, summarize } from "../_catalog.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const catalog = await loadCatalog();
  sendJson(res, 200, {
    metadata: catalog.metadata,
    summary: summarize(catalog.objects),
    topBands: buildBands(catalog.objects, 100).slice(0, 12)
  });
}

