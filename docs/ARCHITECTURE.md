# OrbitGuard Architecture

OrbitGuard is structured as a small platform, not just a single-page website.

```text
Apps
  Browser dashboard
  Launch impact simulator
  Sustainability report

API
  /api/v1/objects
  /api/v1/bands
  /api/v1/sustainability
  /api/v1/simulate

Engines
  orbitguard-core.js
    catalog normalization
    orbit-band classification
    launch impact model
    compliance screening
    band-density summaries

Data
  CelesTrak SATCAT CSV
  orbitguard-data.json
```

## Current Data Flow

1. `node scripts/update-data.mjs` downloads CelesTrak SATCAT CSV data.
2. The updater filters to non-decayed Earth-orbiting objects with usable apogee/perigee.
3. The browser dashboard reads `data/orbitguard-data.json`.
4. The local API reads the same file and exposes queryable endpoints.
5. `src/engines/orbitguard-core.js` contains reusable model logic for the API layer.

## Why The Engine Layer Matters

The next professional step is adding real propagation:

```text
TLE/GP data -> SGP4 propagation -> closest approach search -> covariance/Pc model
```

The app currently avoids pretending SATCAT-only data can produce true conjunction probability. The `/api/v1/conjunction` route intentionally returns a `501` until a real TLE/SGP4 engine is added.

## Planned Advanced Engines

- **SGP4 propagation engine:** use TLE/GP data and `satellite.js` or another validated SGP4 implementation.
- **Conjunction engine:** closest approach search, miss distance, relative velocity, simplified covariance model.
- **Space weather engine:** ingest NOAA SWPC Kp and F10.7 data to adjust LEO lifetime estimates.
- **Compliance engine:** expand the current educational checks against FCC, IADC, ITU, and mission-specific constraints.
- **Kessler shell model:** track LEO object density and simplified fragmentation risk by altitude shell.

