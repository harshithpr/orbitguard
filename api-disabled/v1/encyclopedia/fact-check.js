import { resolve } from "node:path";
import { handleOptions, loadCatalog, readBody, sendJson } from "../../_catalog.js";
import {
  buildArticleFactCheck,
  findTopic,
  loadEncyclopediaTopics
} from "../../../src/engines/encyclopedia-core.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const body = req.method === "POST" ? await readBody(req) : {};
  const id = body.id || url.searchParams.get("id");
  const topicCatalog = await loadEncyclopediaTopics(resolve(process.cwd(), "data/encyclopedia-topics.json"));
  const topic = findTopic(topicCatalog, id);

  if (!topic) {
    sendJson(res, 404, { error: "Unknown encyclopedia topic" });
    return;
  }

  const catalog = await loadCatalog();
  sendJson(res, 200, await buildArticleFactCheck(topic, body.articleText || "", catalog.objects));
}
