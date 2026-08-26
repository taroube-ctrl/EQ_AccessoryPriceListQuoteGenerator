# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Equinix Accessory Price List Quote Generator**: a Vite + React 19 + TypeScript
single-page app plus a small Express API. Standard commands live in `package.json` `scripts`.

### Services

- **Frontend (required)** — Vite dev server on `http://127.0.0.1:5173` (`npm run dev`). This is the
  actual product. It works fully offline using a bundled local price list
  (`public/data/accessories-price-list.xlsx`); no Microsoft/Azure sign-in is needed to browse the
  catalog, add to cart, or build/save a quote.
- **Backend (optional)** — Express API on `http://localhost:3001` (`npm run server`, via nodemon).
  It only powers the *live OneDrive Excel* feature (`/api/excel/*`) through Microsoft Graph. Without
  Azure credentials it starts fine and returns `503` for those endpoints (`/api/health` reports
  `"graph": false`). The Vite dev server proxies `/api` to port 3001.
- Run both together with `npm run dev:full` (concurrently).

### Non-obvious notes

- **`npm run build` regenerates tracked data files.** `build:catalog` (part of `build`) rewrites
  `src/data/catalog-products.json` and `src/data/installation-costs.json` from the root
  `Accessories Price List (July24).xlsx`. After a build, `git checkout -- src/data/catalog-products.json src/data/installation-costs.json`
  to avoid committing regenerated output unless the price list actually changed.
- **`npm run lint` currently fails**: the `lint` script is `eslint .` but the repo has no
  `eslint.config.js` (ESLint 10 requires flat config). This is a pre-existing repo gap, not an
  environment issue.
- **`npm test` (vitest) reports "No test files found"** and exits non-zero — there are no test
  files in the repo yet. The runner itself is installed and working.
- Azure/Graph credentials go in `.env` (copy from `.env.example`). They are only needed for the
  optional live-Excel backend feature; leave placeholders for normal frontend development.
- The app uses `createHashRouter`, so routes look like `http://127.0.0.1:5173/#/products`.
