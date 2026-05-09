import { handleOptions, sendJson } from "../../_catalog.js";
import {
  getGroundStationNetwork,
  getGroundStationWeather
} from "../../../src/engines/weather-core.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const query = Object.fromEntries(url.searchParams.entries());
    const payload = String(query.station || "").toLowerCase() === "all"
      ? await getGroundStationNetwork()
      : await getGroundStationWeather(query);

    sendJson(res, 200, payload);
  } catch (error) {
    sendJson(res, 502, {
      ok: false,
      error: "Ground station weather feed unavailable",
      detail: error.message
    });
  }
}
