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
- Switch between all four modes
- Avoid text overlapping controls

## Display Settings Test

Open the top display settings panel.

Expected:

- `Theme` changes the full app palette without hiding text
- `Accent`, `Background`, and `Text contrast` switch the selector to `Custom`
- `Chart colors` changes dashboard bar/timeline colors
- 3D object color inputs change payload, debris, rocket-body, simulated, and other object dots
- `Reduce motion`, `Larger text`, and `High contrast` apply immediately and remain after refresh

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

## Download Checks

Click:

- Download Data CSV
- Download Data JSON
- Download Google Earth KML from the dashboard
- Download Google Earth KML from Time Machine
- Download Comparison
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
http://localhost:4173/api/v1/sustainability?satellites=24&altitude=550&inclination=53&rocketBodyRemains=false
```

Expected:

- JSON appears in the browser
- `health.ok` is `true`
- `summary` includes catalog counts
- `objects` returns matching records
- `time-machine` returns selected year, current year, and change values
- `sustainability` returns an `impact` object
