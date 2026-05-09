# OrbitGuard Roadmap

## Phase 1: Strong Portfolio Tool

- Live CelesTrak SATCAT updater
- Current orbit dashboard
- Launch impact simulator
- Sustainability report
- 3D Earth orbit visualizer
- Time Machine comparison mode with year slider
- Space Encyclopedia with 200 generated-and-cached reference topics
- Customizable visual theme and accessibility controls
- Local API endpoints

Status: built.

## Phase 1.5: Historical Accuracy Upgrade

- Replace launch-year reconstruction with archived yearly SATCAT/TLE snapshots
- Add major debris-event annotations for Fengyun-1C, Iridium-33/Kosmos-2251, and future catalog events
- Export side-by-side historical comparison CSV files
- Add a public methodology note explaining which historical records are exact snapshots and which are reconstructed

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
- Add solar wind, SWPC alerts, Solar Cycle 25 timeline, 2022 Starlink case study, and ground-station weather operations monitor

Status: first educational version built. Next upgrade is replacing the simple drag scaling with NRLMSISE-00 density modeling and spacecraft-specific drag assumptions.

## Phase 4.5: Ground Station Network

- Add map-based station selection
- Add satellite pass windows for each station
- Add frequency-specific link budget presets for S-band, X-band, Ku-band, and Ka-band
- Add station-specific antenna wind limits where public hardware data is available

Useful official sources:

- NOAA Kp product: https://www.swpc.noaa.gov/products/planetary-k-index
- NOAA product index: https://services.swpc.noaa.gov/products/
- NOAA 45-day Ap/F10.7 forecast: https://www.swpc.noaa.gov/products/45-day-forecast
- Open-Meteo API: https://open-meteo.com/en/docs
- OpenWeatherMap current weather API: https://openweathermap.org/api/current

## Phase 5: Regulatory Screening

- Expand the educational compliance engine
- Include IADC post-mission disposal checks
- Include FCC five-year LEO deorbit screening
- Add GEO graveyard-orbit checks

Useful official sources:

- IADC debris guidelines: https://orbitaldebris.jsc.nasa.gov/library/IADC-Space-Debris-Guidelines-Revision-2.pdf
- FCC orbital debris order: https://docs.fcc.gov/public/attachments/FCC-22-74A1.pdf

## Phase 5.5: Encyclopedia Accuracy Upgrade

- Add source-specific fact cards for NASA ODPO, ESA, FCC, ITU, and CelesTrak where each topic needs them
- Add manual reviewer notes for high-risk articles
- Export article bundles as Markdown
- Add article revision history so generated drafts can be improved by mentors
- Add optional Anthropic generation through `ANTHROPIC_API_KEY` while keeping the local generator as fallback

## Phase 6: Review And Community

- Publish the project on GitHub
- Add issues labeled `good-first-issue`, `orbital-mechanics`, `data-source`, and `frontend`
- Ask for review from aerospace, astronomy, and open-source communities
- Add a public demo link once deployed
