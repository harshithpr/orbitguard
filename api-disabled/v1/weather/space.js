import { handleOptions, sendJson } from "../../_catalog.js";
import { getSpaceWeather } from "../../../src/engines/weather-core.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  try {
    sendJson(res, 200, await getSpaceWeather());
  } catch (error) {
    sendJson(res, 502, {
      ok: false,
      error: "Space weather feed unavailable",
      detail: error.message
    });
  }
}
