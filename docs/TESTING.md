# OrbitGuard Testing Checklist

Use this before sharing the project publicly.

## Local Setup

1. Install Node.js from https://nodejs.org/en.
2. Open Terminal in the OrbitGuard folder.
3. Run:

```bash
npm install
npm start
```

If `npm` is not available yet, run directly:

```bash
node server.mjs
```

Open:

```text
http://localhost:4173
```

## Browser Checks

- Desktop Safari
- Desktop Chrome
- Desktop Firefox
- iPhone Safari
- Android Chrome

The app should:

- Load the OrbitGuard logo and favicon
- Show current CelesTrak object counts
- Render the 3D orbit visualizer with colored Earth land/ocean, cloud layer, orbit rings, density points, and 3D object models
- Switch between Soft Blue, Deep Space, Light, High Contrast, and Custom themes
- Save display settings after refresh
- Keep controls readable on phone width
- Switch between all six modes
- Avoid text overlapping controls

## Display Settings Test

Click `Display` in the top bar.

Expected:

- Display settings open in a right-side drawer instead of taking up space in the main page
- `Theme` changes the full app palette without hiding text
- `Accent`, `Background`, and `Text contrast` switch the selector to `Custom`
- `Chart colors` changes dashboard bar/timeline colors
- 3D object color inputs change payload, debris, rocket-body, simulated, and other object dots
- `Reduce motion`, `Larger text`, and `High contrast` apply immediately and remain after refresh
- Close button hides the drawer

## Encyclopedia Test

Open the `Encyclopedia` tab.

Expected:

- The page shows 200 topics across 10 categories
- Search filters the topic cards
- Category cards and the category dropdown filter the same topic list
- Selecting `Kessler Syndrome` shows an article preview
- `Generate / Load Article` creates a 280-340 word article and caches it locally
- `Run Fact Checker` shows live OrbitGuard catalog checks such as tracked objects and debris counts
- Related topic chips switch the selected article
- Download Topic Index and Download Article save JSON files

## Time Machine Test

Open the `Time Machine` tab.

Input:

```text
Selected year: 2005
Object toggles: Payloads, Debris, Rocket bodies, Other hardware all enabled
```

Expected:

- Past card changes to `2005 Orbit`
- Current card stays on the current catalog year
- Comparison table shows positive changes for total objects and LEO objects
- 3D orbit view updates to the selected year
- Drag rotates the globe, scroll/pinch zooms, and the object points remain visible
- Download Comparison saves a JSON report with selected year, current year, and change values

## Launch Simulator Test 1

Input:

```text
Mission name: Test LEO Mission
Satellites: 24
Altitude: 550
Inclination: 53
Expected lifetime: 5
Deployment fragments: 0
Rocket body remains: No
Deorbit plan: Yes
```

Expected:

- Orbit class: LEO
- Altitude band: 500-600 km
- Objects added: 24
- Moderate/low sustainability impact
- Report mentions deorbit planning as a positive factor
- Immersive Launch Sequence starts at ignition, advances through liftoff, and updates altitude, velocity, stage, and deployed-satellite telemetry
- Restart returns the sequence to T+00:00, and the mission-time slider scrubs through all 11 phases

## Weather Ops Test

Open the `Weather Ops` tab.

Expected:

- Kp, F10.7, solar wind, drag multiplier, and active-alert cards load from the API
- Altitude Band Impact shows multiple LEO bands with density multipliers
- Solar Cycle chart renders an F10.7 timeline
- Starlink 2022 case study shows 49 launched and 38 reentered
- Ground Station Monitor defaults to Goldstone and shows weather, rain rate, cloud cover, wind, visibility, Ka-band attenuation, optical score, antenna status, and laser comm status
- Changing preset station updates the selected station card
- Entering custom coordinates loads a custom ground station
- Download Weather Snapshot saves JSON

## Launch Simulator Test 2

Input:

```text
Mission name: Bad LEO Mission
Satellites: 80
Altitude: 900
Inclination: 98
Expected lifetime: 20
Deployment fragments: 25
Rocket body remains: Yes
Deorbit plan: No
```

Expected:

- Higher risk than Test 1
- Lower sustainability grade
- Warnings or recommendations about long lifetime, fragments, missing deorbit plan, and rocket body disposal
- Launch visualization updates the deployed-satellite count to match the scenario input while still limiting visual objects for performance

## Download Checks

Click:

- Download Data CSV
- Download Data JSON
- Download Google Earth KML from the dashboard
- Download Google Earth KML from Time Machine
- Download Comparison
- Download Topic Index
- Download Article
- Download Launch Simulation
- Download Simulation CSV
- Download Sustainability Report

Expected:

- Files download in the browser
- JSON files open cleanly
- CSV files open in Numbers, Excel, or Google Sheets
- KML files import into Google Earth as altitude-aware educational orbit markers

## API Checks

Open these in the browser:

```text
http://localhost:4173/api/v1/health
http://localhost:4173/api/v1/summary
http://localhost:4173/api/v1/objects?band=500-600&type=debris&limit=5
http://localhost:4173/api/v1/time-machine?year=2005
http://localhost:4173/api/v1/encyclopedia/topics
http://localhost:4173/api/v1/encyclopedia/article?id=kessler-syndrome
http://localhost:4173/api/v1/weather/space
http://localhost:4173/api/v1/weather/ground?station=goldstone
http://localhost:4173/api/v1/weather/ground?station=all
http://localhost:4173/api/v1/sustainability?satellites=24&altitude=550&inclination=53&rocketBodyRemains=false
```

Expected:

- JSON appears in the browser
- `health.ok` is `true`
- `summary` includes catalog counts
- `objects` returns matching records
- `time-machine` returns selected year, current year, and change values
- `encyclopedia/topics` returns 200 topics and 10 categories
- `encyclopedia/article` returns generated article content, word count, and topic metadata
- `weather/space` returns Kp, F10.7, solar wind, altitude impacts, and solar-cycle fields
- `weather/ground` returns a station, current conditions, and operations scoring
- `sustainability` returns an `impact` object
