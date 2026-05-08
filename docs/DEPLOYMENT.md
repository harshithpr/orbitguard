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

Then run from this folder:

```bash
git init
git add .
git commit -m "Initial OrbitGuard public app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/orbitguard.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

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

## GitHub Pages Alternative

GitHub Pages is best for static sites. OrbitGuard has API endpoints, so GitHub Pages can host the frontend only, not the API. Use Vercel, Render, Railway, or Fly.io if you want the public API too.

## Good Review Post

```text
I’m a high school student building OrbitGuard, a space sustainability analyzer that uses orbital object data to measure congestion, debris risk, and launch impact. I’m looking for feedback on the science, UI, and code structure.
```

Ask:

- Is the sustainability scoring clear?
- Are the launch simulator inputs realistic?
- Does the dashboard explain orbital debris well?
- What feature would make this more useful?
- Is the API understandable?

