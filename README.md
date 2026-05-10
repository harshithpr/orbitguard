# OrbitGuard

![OrbitGuard logo](public/logo.png)

OrbitGuard is a space sustainability analyzer that tracks satellites and debris, measures orbital crowding, and shows how new launches can affect collision-risk pressure and long-term space safety.

Built by **Harshith Pranav Praveen**.

It uses public CelesTrak SATCAT data plus live weather feeds and turns them into a six-mode portfolio project:

OrbitGuard also includes a customizable visual theme system that lets users switch between soft blue, deep space, light, high-contrast, and custom modes. The design improves accessibility, readability, and visual contrast while keeping sustainability colors meaningful instead of overwhelming.

1. **Current Orbit Dashboard**
   - Total tracked objects
   - Active satellites
   - Debris objects
   - Rocket bodies
   - LEO, MEO, GEO, and HEO orbit bands
   - Most crowded altitude bands
   - 3D Earth orbit visualizer with a textured Earth, cloud layer, orbit rings, density points, and representative object models
   - OrbitGuard Solar System Mode with Earth, Moon, Mars, Solar Weather, and Solar System Overview environments
   - Mission-environment cards for lunar relay coverage, Mars communication delay, solar-weather drag effects, and interplanetary sustainability planning
   - Timeline of objects still in orbit by launch year
   - Softer display settings with theme, contrast, motion, chart color, and 3D object color controls

2. **OrbitGuard Time Machine**
   - Year slider from the first space age launches through the current catalog year
   - Past-vs-today statistics for payloads, active satellites, debris, rocket bodies, and LEO objects
   - Moveable 3D Earth orbit view with rotate, pan, and zoom controls
   - Object-type toggles for payloads, debris, rocket bodies, and other hardware
   - Downloadable Time Machine comparison report

3. **Launch Impact Simulator**
   - User enters satellites deployed, target altitude, inclination, lifetime, fragments, rocket-body disposal, and deorbit plan
   - App calculates objects added, affected altitude band, band-density increase, launch risk, and sustainability grade
   - Immersive procedural 3D launch sequence with ignition, liftoff, Max-Q, stage separation, fairing jettison, orbit insertion, and satellite deployment
   - Lightweight rendering uses generated geometry and particle systems instead of heavy model files

4. **OrbitGuard Space Encyclopedia**
   - 200 curated topics across 10 aerospace and space-sustainability categories
   - Search, category filters, related-topic links, reading-time metadata, and downloadable topic index
   - Articles generate on demand through the OrbitGuard API, cache in the browser, and reload instantly after first generation
   - Built-in Fact Checker compares generated article drafts against live OrbitGuard catalog summaries, NOAA weather data when relevant, and selected historical incident facts
   - Transparent methodology note so the encyclopedia is useful without pretending generated text is a primary source

5. **Weather Ops Monitor**
   - NOAA SWPC Kp index, F10.7 solar flux, solar wind, and alert messages
   - Educational LEO drag and deorbit-timeline scaling by altitude band
   - Solar Cycle 25 F10.7 timeline from public NOAA records
   - 2022 Starlink geomagnetic storm incident case study
   - Ground station monitor for Goldstone, Canberra, Madrid, Svalbard, McMurdo, Diego Garcia, Wallops, and custom coordinates
   - Ka-band rain fade, optical tracking score, wind/antenna status, laser comm viability, and next clear-window estimate

6. **Sustainability Report**
   - Generates a short report explaining how the launch changes orbital congestion
   - Suggests mitigation steps such as deorbit planning, avoiding crowded bands, reducing deployment fragments, and disposing of upper stages

Users can download:

- Current orbit data as CSV
- Current orbit data as JSON
- Google Earth KML exports for the dashboard and Time Machine views
- Time Machine comparison report as JSON
- Encyclopedia topic index as JSON
- Individual encyclopedia article as JSON
- Weather operations snapshot as JSON
- Launch simulation output as JSON
- Launch simulation output as CSV
- Sustainability report as JSON

## About The Creator

**Harshith Pranav Praveen** is interested in aerospace engineering and excited to explore the field through hands-on engineering, design, manufacturing, and future work with aerospace companies such as Boeing, Lockheed Martin, and other organizations building advanced flight and space systems.

Harshith began formal engineering coursework at James Clemens High School in 2024 and has taken PLTW engineering classes. After moving from Tucson to Texas and then to Madison, he spent significant time studying mathematics and advanced coursework, which led him to appreciate engineering as a combination of math, design, modeling, and problem solving.

In Introduction to Engineering Design, Harshith earned a certification connected to 3D modeling, engineering drawing, and the fundamentals of creating precise engineering models. During his sophomore year in 2025, he also earned a Python credential after studying programming fundamentals and more advanced topics.

Python credential: https://www.credly.com/badges/d74e2ecb-c57e-44fd-87ad-6acd2b58008c/public_url

## Run The App

On macOS, the easiest option is to double-click:

```text
Run OrbitGuard.command
```

That opens the local website at:

```text
http://localhost:4173
```

Manual option:

```bash
node server.mjs
```

Then open:

```text
http://localhost:4173
```

You can also use npm-compatible hosting platforms because the project includes a `package.json`:

```bash
npm install
npm start
```

The project has no required third-party npm packages right now, so `node server.mjs` works directly after Node.js is installed.

## Update Live Data

```bash
node scripts/update-data.mjs
```

The updater downloads CelesTrak SATCAT CSV data from:

- https://celestrak.org/pub/satcat.csv
- https://celestrak.org/satcat/satcat-format.php

It keeps non-decayed Earth-orbiting objects with usable apogee/perigee data and writes them to:

```text
data/orbitguard-data.json
```

## API Platform

OrbitGuard now includes local API endpoints:

```text
GET  /api/v1/health
GET  /api/v1/summary
GET  /api/v1/objects?band=500-600&type=debris
GET  /api/v1/bands?size=100
GET  /api/v1/time-machine?year=2005
GET  /api/v1/encyclopedia/topics
GET  /api/v1/encyclopedia/article?id=kessler-syndrome
POST /api/v1/encyclopedia/fact-check
GET  /api/v1/weather/space
GET  /api/v1/weather/ground?station=goldstone
GET  /api/v1/weather/ground?station=all
GET  /api/v1/sustainability?satellites=24&altitude=550&inclination=53
POST /api/v1/simulate
```

API docs:

```text
docs/API.md
```

Architecture docs:

```text
docs/ARCHITECTURE.md
```

Creator bio:

```text
docs/ABOUT_CREATOR.md
```

Roadmap:

```text
docs/ROADMAP.md
```

Testing checklist:

```text
docs/TESTING.md
```

Deployment guide:

```text
docs/DEPLOYMENT.md
```

## How The Launch Simulator Works

For a new launch, OrbitGuard estimates:

- **Objects added:** payloads, optional rocket body, and deployment fragments
- **Affected altitude band:** based on target altitude
- **Band share:** objects in that altitude band divided by all tracked objects
- **Crowding score:** how dense that band is compared with the densest band in the catalog
- **Launch risk:** a 0-100 educational index combining crowding, orbital persistence, mission lifetime, debris/rocket-body presence, and deorbit planning

The simulator also includes a browser-based procedural launch visualization. The rocket, exhaust plume, Earth horizon, orbit ring, and satellites are generated with code, so users get a high-quality mission sequence without large 3D asset downloads. The sequence follows 11 mission phases from ignition through payload deployment and updates the same telemetry shown in the launch impact model.

Example output:

> This launch adds 24 objects into LEO. The 500-600 km band changes from 7,241 to 7,265 objects, increasing local band share and producing a medium launch-impact rating.

## Important Note

OrbitGuard is not an operational collision prediction system. It is a transparent educational screening model for student research and aerospace portfolio work.

The project intentionally does not claim true conjunction probability yet. Real conjunction assessment needs TLE/GP data, SGP4 propagation, covariance assumptions, and a documented collision-probability method.

## Deployment Options

- **Vercel:** recommended first public deployment. Use https://vercel.com/new after pushing to GitHub. The project includes Vercel-compatible API functions in `api/v1/`.
- **Render / Railway / Fly.io:** good for running `node server.mjs` as a persistent Node server.
- **GitHub Pages:** works for static frontend files only, not the API.

## Strong Next Improvements

- Add SGP4 propagation from live TLEs
- Add launch provider presets
- Compare altitude bands against NASA debris-mitigation rules
- Save multiple launch scenarios and rank them
- Export the sustainability report as PDF
- Replace the educational drag scaling with a full NRLMSISE-00 atmospheric-density model
