import { resolve } from "node:path";
import { handleOptions, loadCatalog, sendJson } from "../../_catalog.js";
import {
  findTopic,
  generateEncyclopediaArticle,
  loadEncyclopediaTopics
} from "../../../src/engines/encyclopedia-core.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const topicCatalog = await loadEncyclopediaTopics(resolve(process.cwd(), "data/encyclopedia-topics.json"));
  const topic = findTopic(topicCatalog, url.searchParams.get("id"));

  if (!topic) {
    sendJson(res, 404, { error: "Unknown encyclopedia topic" });
    return;
  }

  const catalog = await loadCatalog();
  sendJson(res, 200, await generateEncyclopediaArticle(topic, catalog.objects));
}
