# Cami Fang Portfolio

This repository is a static HTML portfolio, with separate About and project pages. It does not use React, Vite, or React Router. The existing navigation uses ordinary document navigation because each route has its own HTML asset.

## Local preview

`npm run dev`

## Cloudflare Workers Static Assets

Build command: `npm run build`

Deploy command: `npx wrangler deploy`

Run both from the repository root. `wrangler.jsonc` serves `ux-portfolio/dist` at the origin root and enables `assets.not_found_handling: single-page-application`. Keep `SITE_BASE_PATH` unset for Workers.

The build generates `about/index.html` and `work/{triply,fluffbud,m-echo,reedy}/index.html`, so direct project navigation resolves the correct project document. Unknown navigation paths fall back to the homepage; this repository has no client-side router to render unknown routes.

## GitHub Pages

The GitHub Actions workflow supplies `SITE_BASE_PATH=/portfolio` so existing GitHub Pages links and assets continue to work at https://cami99-star.github.io/portfolio/.
