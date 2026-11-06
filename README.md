# Creative Technology Portfolio

A creative technology and AI product portfolio built with React, TypeScript, and Vite.

## Local development

```sh
npm ci
npm run dev
```

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` builds the site and deploys it to GitHub Pages whenever `main` is updated. The Vite base path is configured for the `showme_web` repository.

The deployment uses the optimized public media files. Original editing footage and internal project notes are excluded from the repository.
