# OrbitGuard Architecture

OrbitGuard is structured as a small platform, not just a single-page website.

```text
Apps
  Browser dashboard
  OrbitGuard Time Machine
  Launch impact simulator
  Sustainability report
  Display/theme control panel

API
  /api/v1/objects
  /api/v1/bands
  /api/v1/time-machine
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
4. The Time Machine mode reconstructs past catalog views by filtering current records to objects with `launchYear <= selectedYear`.
5. The local API reads the same file and exposes queryable endpoints.
6. `src/engines/orbitguard-core.js` contains reusable model logic for the API layer.

## Time Machine Layer

The first Time Machine version is intentionally transparent: it uses launch-year reconstruction from the current catalog, not archived historical snapshots. This gives users a useful educational comparison while avoiding false claims about exact historical positions. A future version can load yearly snapshot files from `data/snapshots/` and replace the reconstruction layer without changing the main app shell.

## Theme Layer

The browser app uses CSS custom properties as a design system. Preset themes define surface, text, accent, status, chart, and object colors. The Custom mode stores user choices in `localStorage`, then updates CSS variables and rerenders charts and 3D point clouds so the visual language stays consistent across the dashboard, Time Machine, simulator, and reports.

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
