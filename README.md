# OrbitGuard

![OrbitGuard logo](public/logo.png)

OrbitGuard is a space sustainability analyzer that tracks satellites and debris, measures orbital crowding, and shows how new launches can affect collision-risk pressure and long-term space safety.

It uses public CelesTrak SATCAT data and turns it into a three-mode portfolio project:

1. **Current Orbit Dashboard**
   - Total tracked objects
   - Active satellites
   - Debris objects
   - Rocket bodies
   - LEO, MEO, GEO, and HEO orbit bands
   - Most crowded altitude bands
   - 3D Earth orbit visualizer
   - Timeline of objects still in orbit by launch year

2. **Launch Impact Simulator**
   - User enters satellites deployed, target altitude, inclination, lifetime, fragments, rocket-body disposal, and deorbit plan
   - App calculates objects added, affected altitude band, band-density increase, launch risk, and sustainability grade

3. **Sustainability Report**
   - Generates a short report explaining how the launch changes orbital congestion
   - Suggests mitigation steps such as deorbit planning, avoiding crowded bands, reducing deployment fragments, and disposing of upper stages

Users can download:

- Current orbit data as CSV
- Current orbit data as JSON
- Launch simulation output as JSON
- Launch simulation output as CSV
- Sustainability report as JSON

## College-App Framing

Use this description:

> I built a space sustainability analyzer that uses public orbital data to evaluate how satellite launches affect congestion and debris risk in Earth orbit. The project combines aerospace engineering, data analysis, and environmental responsibility in space.

That sounds stronger than "I made a data analyzer" because it shows a real problem, an engineering model, public data, and impact.

## Run The App

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

Example output:

> This launch adds 24 objects into LEO. The 500-600 km band changes from 7,241 to 7,265 objects, increasing local band share and producing a medium launch-impact rating.

## Important Note

OrbitGuard is not an operational collision prediction system. It is a transparent educational screening model for student research and aerospace portfolio work.

The project intentionally does not claim true conjunction probability yet. Real conjunction assessment needs TLE/GP data, SGP4 propagation, covariance assumptions, and a documented collision-probability method.

## Upload To GitHub

1. Create a new GitHub repository named `orbitguard`.
2. In this project folder, run:

```bash
git init
git add .
git commit -m "Build OrbitGuard space sustainability analyzer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/orbitguard.git
git push -u origin main
```

3. Add the GitHub repo link to your college application activities or portfolio.
4. Ask for review by opening GitHub Issues labeled `orbital-mechanics`, `data-source`, `frontend`, and `good-first-issue`.

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
