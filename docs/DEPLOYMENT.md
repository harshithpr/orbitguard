# Deployment Guide

The easiest public website path is:

```text
GitHub repository -> Vercel deployment
```

Use this link when the repo is ready:

```text
https://vercel.com/new
```

Vercel is the best first choice because it can import a GitHub repository and create automatic deployments when changes are pushed. OrbitGuard uses one Vercel serverless API router under `api/v1/` so the public site can serve weather, encyclopedia, catalog, and simulation endpoints without hitting the Hobby plan function limit.

Official docs:

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel deployment methods: https://vercel.com/docs/deployments/deployment-methods
- Node.js: https://nodejs.org/en
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Deploy On Vercel

The public project is designed for:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Weather Ops works without private keys because it can use NOAA SWPC and Open-Meteo public feeds. If you later want OpenWeatherMap current-weather data, add this environment variable in Vercel:

```text
OPENWEATHER_API_KEY=your_key_here
```

The encyclopedia also works without private keys because it has a local educational generator. If you want Anthropic/Claude article generation on Vercel, add:

```text
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

## GitHub Pages Alternative

GitHub Pages is best for static sites. OrbitGuard has API endpoints, so GitHub Pages can host the frontend only, not the API. Use Vercel, Render, Railway, or Fly.io if you want the public API too.
