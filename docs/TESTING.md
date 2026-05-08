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
- Render the 3D orbit visualizer
- Keep controls readable on phone width
- Switch between all three modes
- Avoid text overlapping controls

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
- Download Launch Simulation
- Download Simulation CSV
- Download Sustainability Report

Expected:

- Files download in the browser
- JSON files open cleanly
- CSV files open in Numbers, Excel, or Google Sheets

## API Checks

Open these in the browser:

```text
http://localhost:4173/api/v1/health
http://localhost:4173/api/v1/summary
http://localhost:4173/api/v1/objects?band=500-600&type=debris&limit=5
http://localhost:4173/api/v1/sustainability?satellites=24&altitude=550&inclination=53&rocketBodyRemains=false
```

Expected:

- JSON appears in the browser
- `health.ok` is `true`
- `summary` includes catalog counts
- `objects` returns matching records
- `sustainability` returns an `impact` object

