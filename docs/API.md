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

## Catalog Live Status

```http
GET /api/v1/catalog/live-status
```

Checks the deployed OrbitGuard catalog against the current public CelesTrak SATCAT feed and returns whether the local snapshot appears fresh. The response includes local record count, live record count, last local update time, and a short status message. Use this endpoint to verify the header CelesTrak freshness button.

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

## Encyclopedia Topics

```http
GET /api/v1/encyclopedia/topics
```

Returns the OrbitGuard Space Encyclopedia topic architecture: 200 curated topics, 10 categories, tags, related-topic links, depth labels, and prompt context. The browser also loads `data/encyclopedia-topics.json` directly for the interactive topic index.

## Encyclopedia Article

```http
GET /api/v1/encyclopedia/article?id=kessler-syndrome
```

Generates an article for a selected topic. If `ANTHROPIC_API_KEY` is configured, the API can use the Anthropic Messages API. Without a key, OrbitGuard falls back to a local educational article generator so the site still works for reviewers. The browser caches each generated article in `localStorage`.

## Encyclopedia Fact Check

```http
POST /api/v1/encyclopedia/fact-check
Content-Type: application/json

{
  "id": "kessler-syndrome",
  "articleText": "Generated article text..."
}
```

Returns live-data review cards using OrbitGuard catalog counts, most crowded altitude bands, NOAA space-weather values when relevant, and selected historical incident facts. This is a review aid, not a formal citation engine.

## Space Weather

```http
GET /api/v1/weather/space
```

Returns live NOAA SWPC space weather values:

- Kp index and storm level
- F10.7 solar flux and 90-day mean
- Solar wind speed and density
- Active SWPC alert messages
- Educational drag multiplier and deorbit-timeline shift by LEO altitude band
- F10.7 solar-cycle timeline points
- 2022 Starlink geomagnetic storm case study metadata

Official feed roots:

- https://services.swpc.noaa.gov/json/
- https://services.swpc.noaa.gov/products/

## Ground Station Weather

```http
GET /api/v1/weather/ground?station=goldstone
GET /api/v1/weather/ground?station=all
GET /api/v1/weather/ground?name=School%20Station&lat=34.7304&lon=-86.5861
```

Preset stations:

- `goldstone`
- `canberra`
- `madrid`
- `svalbard`
- `mcmurdo`
- `diego-garcia`
- `wallops`

Returns current weather plus operations estimates:

- Rain rate and Ka-band attenuation in dB
- Cloud cover and optical tracking score
- Wind speed/gust and antenna status
- Visibility and laser communication status
- Next likely clear optical window when forecast data is available

If `OPENWEATHER_API_KEY` is set, the server uses OpenWeatherMap current weather first and Open-Meteo for clear-window forecast support. Without a key, it uses Open-Meteo directly.

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
