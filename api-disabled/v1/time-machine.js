import { buildTimeMachineComparison, handleOptions, loadCatalog, sendJson } from "../_catalog.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const catalog = await loadCatalog();
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const generatedYear = new Date(catalog.metadata.generatedAt).getUTCFullYear();

  sendJson(res, 200, {
    metadata: catalog.metadata,
    ...buildTimeMachineComparison(catalog.objects, url.searchParams.get("year"), generatedYear)
  });
}
