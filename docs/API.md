# OrbitGuard API

Run locally:

```bash
node server.mjs
```

Base URL:

```text
http://localhost:4173
```

## Health

```http
GET /api/v1/health
```

Returns service status and catalog size.

## Summary

```http
GET /api/v1/summary
```

Returns catalog metadata, high-level object counts, and the most crowded altitude bands.

## Objects

```http
GET /api/v1/objects?band=500-600&type=debris&limit=25
```

Query parameters:

- `band`: altitude band in kilometers, such as `500-600`
- `type`: `debris`, `payload`, `rocket-body`, `PAY`, `DEB`, or `R/B`
- `orbit`: `LEO`, `MEO`, `GEO`, or `HEO`
- `owner`: CelesTrak owner code such as `US`, `PRC`, or `CIS`
- `minRisk`: minimum object risk score
- `limit`: maximum results, capped at 500

## Bands

```http
GET /api/v1/bands?size=100
```

Returns object density by altitude shell.

## Time Machine

```http
GET /api/v1/time-machine?year=2005
```

Returns a past-vs-current catalog comparison using the same launch-year reconstruction as the Time Machine page. The response includes selected year, current year, past counts, current counts, change values, methodology, and limitation notes.

## Sustainability

```http
GET /api/v1/sustainability?satellites=64&altitude=550&inclination=53&fragments=12&rocketBodyRemains=true&deorbitPlan=true
```

Returns launch-impact analysis, affected altitude band, risk level, sustainability grade, and educational compliance checks.

## Simulate

```http
POST /api/v1/simulate
Content-Type: application/json

{
  "name": "Demo launch",
  "satellites": 24,
  "altitude": 550,
  "inclination": 53,
  "lifetime": 5,
  "fragments": 0,
  "rocketBodyRemains": true,
  "deorbitPlan": true
}
```

## Conjunction

```http
GET /api/v1/conjunction?norad1=25544&norad2=45623
```

This currently returns `501 Not Implemented` by design. True conjunction analysis requires TLE/GP data and SGP4 propagation. SATCAT apogee/perigee data is not enough to compute real closest approach or collision probability.
