# OrbitGuard Architecture

OrbitGuard is structured as a small platform, not just a single-page website.

```text
Apps
  Browser dashboard
  OrbitGuard Time Machine
  OrbitGuard Space Encyclopedia
  Weather Ops monitor
  Launch impact simulator
  Sustainability report
  Display/theme drawer

API
  /api/v1/objects
  /api/v1/bands
  /api/v1/time-machine
  /api/v1/encyclopedia/topics
  /api/v1/encyclopedia/article
  /api/v1/encyclopedia/fact-check
  /api/v1/weather/space
  /api/v1/weather/ground
  /api/v1/sustainability
  /api/v1/simulate

Engines
  orbitguard-core.js
    catalog normalization
    orbit-band classification
    launch impact model
    compliance screening
    band-density summaries
  weather-core.js
    NOAA SWPC Kp/F10.7/solar-wind parsing
    educational drag scaling
    OpenWeatherMap or Open-Meteo ground weather
    Ka-band, optical, antenna, and laser status scoring
  encyclopedia-core.js
    topic architecture expansion
    optional Anthropic article generation
    local fallback article generation
    live-data fact checks

Data
  CelesTrak SATCAT CSV
  orbitguard-data.json
  encyclopedia-topics.json
  NOAA SWPC live JSON feeds
  Open-Meteo weather API fallback
  Optional OpenWeatherMap current-weather API if OPENWEATHER_API_KEY is set
```

## Current Data Flow

1. `node scripts/update-data.mjs` downloads CelesTrak SATCAT CSV data.
2. The updater filters to non-decayed Earth-orbiting objects with usable apogee/perigee.
3. The browser dashboard reads `data/orbitguard-data.json`.
4. The Time Machine mode reconstructs past catalog views by filtering current records to objects with `launchYear <= selectedYear`.
5. The local API reads the same file and exposes queryable endpoints.
6. `src/engines/orbitguard-core.js` contains reusable model logic for the API layer.
7. `src/engines/weather-core.js` pulls live NOAA SWPC and ground-weather feeds, then returns normalized operations-focused summaries to both the dashboard and deployable API routes.
8. `src/engines/encyclopedia-core.js` expands 200 topic titles into searchable reference metadata, generates articles on demand, and returns fact-check summaries.

## Time Machine Layer

The first Time Machine version is intentionally transparent: it uses launch-year reconstruction from the current catalog, not archived historical snapshots. This gives users a useful educational comparison while avoiding false claims about exact historical positions. A future version can load yearly snapshot files from `data/snapshots/` and replace the reconstruction layer without changing the main app shell.

## Theme Layer

The browser app uses CSS custom properties as a design system. Preset themes define surface, text, accent, status, chart, and object colors. The Custom mode stores user choices in `localStorage`, then updates CSS variables and rerenders charts and 3D point clouds so the visual language stays consistent across the dashboard, Time Machine, encyclopedia, simulator, and reports. Display settings live in a right-side drawer so the controls stay available without occupying the main workflow.

## Encyclopedia Layer

The encyclopedia is data-driven. `data/encyclopedia-topics.json` stores 200 topic titles across 10 categories. The browser builds the searchable index and caches each generated article in `localStorage`. The API can use Anthropic if `ANTHROPIC_API_KEY` is configured; otherwise it uses a local educational generator so the feature still works without secrets.

The fact-check endpoint compares article drafts with live OrbitGuard catalog data, altitude-band summaries, NOAA space-weather data when relevant, and selected historical incident facts. It is intentionally labeled as a review aid rather than a formal citation engine.

## Weather Operations Layer

The Weather Ops monitor has two connected systems:

- **Space weather:** NOAA SWPC Kp, F10.7, solar wind, alerts, and solar-cycle records feed an educational drag model that estimates how current activity changes natural deorbit timelines across LEO altitude bands.
- **Ground station weather:** preset or custom coordinates load current weather. OrbitGuard estimates Ka-band rain fade, optical tracking quality, wind/antenna safety, laser-comm viability, and the next likely clear optical window.

The app labels these as educational screening estimates. They are useful for learning and mission-planning intuition, but operational decisions would require validated atmospheric density, RF link-budget, station hardware, and orbit-determination models.

## Why The Engine Layer Matters

The next professional step is adding real propagation:

```text
TLE/GP data -> SGP4 propagation -> closest approach search -> covariance/Pc model
```

The app currently avoids pretending SATCAT-only data can produce true conjunction probability. The `/api/v1/conjunction` route intentionally returns a `501` until a real TLE/SGP4 engine is added.

## Planned Advanced Engines

- **SGP4 propagation engine:** use TLE/GP data and `satellite.js` or another validated SGP4 implementation.
- **Conjunction engine:** closest approach search, miss distance, relative velocity, simplified covariance model.
- **Space weather engine:** replace the current educational scaling with NRLMSISE-00 density modeling and spacecraft-specific drag properties.
- **Compliance engine:** expand the current educational checks against FCC, IADC, ITU, and mission-specific constraints.
- **Kessler shell model:** track LEO object density and simplified fragmentation risk by altitude shell.
