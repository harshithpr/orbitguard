import { handleOptions, loadCatalog, sendJson } from "../_catalog.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const catalog = await loadCatalog();
  sendJson(res, 200, {
    ok: true,
    service: "OrbitGuard API",
    objects: catalog.objects.length,
    generatedAt: catalog.metadata.generatedAt
  });
}

