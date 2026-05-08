# OrbitGuard Roadmap

## Phase 1: Strong Portfolio Tool

- Live CelesTrak SATCAT updater
- Current orbit dashboard
- Launch impact simulator
- Sustainability report
- 3D Earth orbit visualizer
- Local API endpoints

Status: built.

## Phase 2: Real Orbital Mechanics

- Ingest TLE/GP data from CelesTrak
- Add SGP4 propagation with `satellite.js`
- Show future object positions at selected timestamps
- Add closest approach search for selected object pairs
- Keep the current SATCAT model as the fast catalog layer

## Phase 3: Conjunction Risk

- Implement miss-distance and relative-velocity calculations
- Add simplified covariance assumptions
- Add an educational Foster/Chan-style Pc estimate
- Publish limitations clearly so the app is not mistaken for operational flight safety software

## Phase 4: Space Weather

- Ingest NOAA SWPC Kp and F10.7 products
- Adjust LEO lifetime estimates under high and low solar activity assumptions
- Add a space-weather badge to the simulator

Useful official sources:

- NOAA Kp product: https://www.swpc.noaa.gov/products/planetary-k-index
- NOAA product index: https://services.swpc.noaa.gov/products/
- NOAA 45-day Ap/F10.7 forecast: https://www.swpc.noaa.gov/products/45-day-forecast

## Phase 5: Regulatory Screening

- Expand the educational compliance engine
- Include IADC post-mission disposal checks
- Include FCC five-year LEO deorbit screening
- Add GEO graveyard-orbit checks

Useful official sources:

- IADC debris guidelines: https://orbitaldebris.jsc.nasa.gov/library/IADC-Space-Debris-Guidelines-Revision-2.pdf
- FCC orbital debris order: https://docs.fcc.gov/public/attachments/FCC-22-74A1.pdf

## Phase 6: Review And Community

- Publish the project on GitHub
- Add issues labeled `good-first-issue`, `orbital-mechanics`, `data-source`, and `frontend`
- Ask for review from aerospace, astronomy, and open-source communities
- Add a public demo link once deployed

