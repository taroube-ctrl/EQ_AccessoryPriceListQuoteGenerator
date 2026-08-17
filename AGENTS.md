# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Equinix Accessory Price List & Quote Generator**: a React 19 + Vite 8 (TypeScript) single-page catalog app with an optional Express 5 backend. Package manager is **npm** (Node 22, matching CI). There is no database — catalog/pricing data is prebuilt static JSON committed under `src/data/`.

### Services

- **Frontend (Vite dev server)** — the actual product; serves the whole catalog/cart/quote UI on `http://127.0.0.1:5173`. Runs entirely on bundled JSON data, so it is sufficient on its own for end-to-end testing of core flows. Start with `npm run dev`.
- **Express API (`server/index.js`)** — optional; on `http://localhost:3001`. Only powers the live-OneDrive-Excel feature (`/excel` route). Vite proxies `/api` → `:3001`. Start with `npm run server`, or run both services together with `npm run dev:full`.
- **Azure AD / Microsoft Graph** — external, optional. Without credentials the API logs `Graph application credentials: missing (live Excel API disabled)` and `/api/health` returns `{"status":"ok","graph":false}`; the frontend falls back to the bundled price list. No secrets are needed for core development or testing.

### Commands (see `package.json` scripts)

- Dev (frontend only): `npm run dev`
- Dev (frontend + API): `npm run dev:full`
- Build: `npm run build` (runs `build:catalog` then `vite build`)
- Tests: `npm test` (Vitest)

### Non-obvious caveats

- `npm run build` (and `npm run build:catalog`) regenerate `src/data/catalog-products.json` and `src/data/installation-costs.json`, which bumps their `generatedAt` timestamps. These are committed files, so building produces spurious diffs — revert them (`git checkout -- src/data/*.json`) unless the source `.xlsx` price list actually changed.
- **Lint is currently broken**: `npm run lint` fails with `ESLint couldn't find an eslint.config.(js|mjs|cjs) file`. There is no ESLint flat config in the repo; this is a pre-existing repo issue, not an environment problem.
- **No test files exist yet**: `npm test` (Vitest) runs but reports "No test files found". The test toolchain is installed and working; there is just no test suite.
- Routing is hash-based (`createHashRouter`) for GitHub Pages, so app URLs look like `http://127.0.0.1:5173/#/products`, `#/cart`, `#/request-quote`.
