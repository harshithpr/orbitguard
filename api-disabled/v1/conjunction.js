import { handleOptions, sendJson } from "../_catalog.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  sendJson(res, 501, {
    error: "Conjunction API requires the planned SGP4/TLE propagation engine.",
    nextStep: "Add satellite.js or another SGP4 implementation, ingest TLE/GP data, propagate both NORAD objects, find closest approach, then estimate Pc with a documented covariance model.",
    honestyNote: "SATCAT apogee/perigee data alone is not enough to compute real conjunction probability."
  });
}
