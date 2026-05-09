# Deployment Guide

The easiest public website path is:

```text
GitHub repository -> Vercel deployment
```

Use this link when the repo is ready:

```text
https://vercel.com/new
```

Vercel is the best first choice because it can import a GitHub repository and create automatic deployments when you push changes. The project also includes Vercel-compatible API functions under `api/v1/`.

Official docs:

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel deployment methods: https://vercel.com/docs/deployments/deployment-methods
- Node.js: https://nodejs.org/en
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Upload To GitHub

Create a public GitHub repo named:

```text
orbitguard
```

For this project, the repo URL is:

```text
https://github.com/harshithpr/orbitguard
```

Then run from this folder:

```bash
git add .
git commit -m "Update OrbitGuard public app"
git branch -M main
git remote add origin https://github.com/harshithpr/orbitguard.git
git push -u origin main
```

If the remote already exists, skip the `git remote add origin ...` line.

## Deploy On Vercel

1. Go to https://vercel.com/new.
2. Sign in with GitHub.
3. Import the `orbitguard` repository.
4. Keep the default build settings.
5. Deploy.

Your public URL will look like:

```text
https://orbitguard.vercel.app
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

## Good Review Post

```text
I’m Harshith Pranav Praveen, a high school student interested in aerospace engineering. I’m building OrbitGuard, a space sustainability analyzer that uses orbital object data to measure congestion, debris risk, and launch impact. I’m looking for feedback on the science, UI, and code structure.
```

Ask:

- Is the sustainability scoring clear?
- Are the launch simulator inputs realistic?
- Does the dashboard explain orbital debris well?
- What feature would make this more useful?
- Is the API understandable?
