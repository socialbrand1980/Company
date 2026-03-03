# 🚀 Setup Guide for GitHub Deployment

## 1. GitHub Secrets Setup

Go to your repository on GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `7j4d6pbu` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |

## 2. Update basePath (If Needed)

If your GitHub repo name is **NOT** `Company`, update the `build:gh` script in `package.json`:

```json
"scripts": {
  "build:gh": "NEXT_PUBLIC_BASE_PATH=/YourRepoName next build"
}
```

Replace `YourRepoName` with your actual GitHub repository name.

## 3. Enable GitHub Pages

Go to your repository → **Settings** → **Pages**

- **Source**: GitHub Actions
- **Branch**: main

## 4. Sanity CORS Setup (After First Deploy)

After your first deployment, configure CORS in Sanity:

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project (`7j4d6pbu`)
3. Go to **Settings** → **API**
4. Under **CORS Origins**, add:
   - `https://<your-username>.github.io`
   - `https://<your-username>.github.io/Company` (or your repo name)

## 5. Push to GitHub

```bash
git add .
git commit -m "Setup Sanity CMS and GitHub Pages deployment"
git push origin main
```

## 6. Verify Deployment

- GitHub Actions: https://github.com/<your-username>/<repo>/actions
- Live site: https://<your-username>.github.io/Company
- Sanity Studio: https://<your-username>.github.io/Company/studio

---

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000
