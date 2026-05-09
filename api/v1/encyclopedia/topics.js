import { resolve } from "node:path";
import { handleOptions, sendJson } from "../../_catalog.js";
import { loadEncyclopediaTopics } from "../../../src/engines/encyclopedia-core.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  sendJson(res, 200, await loadEncyclopediaTopics(resolve(process.cwd(), "data/encyclopedia-topics.json")));
}
