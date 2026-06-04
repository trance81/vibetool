# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install --legacy-peer-deps   # Install dependencies (legacy flag required)
npm run dev                      # Start dev server at http://localhost:3000
npm run build                    # Production build (Vite)
npm run lint                     # Type-check (tsc --noEmit)
npm run clean                    # Remove dist/
```

## Architecture

### Dual-server model

The project runs two different server setups depending on context:

- **Local dev (`npm run dev`)**: `server.ts` (Express + Vite middleware). Express handles API routes, then passes everything else to Vite's dev middleware. Entry: `server.ts` → `lib/exchange-service.ts`.
- **Vercel production**: Vite builds the SPA, and `api/` directory is served as Vercel Serverless Functions. `api/shorten.ts` and `api/exchange/` mirror the same API routes defined in `server.ts`.

This means API logic is duplicated: `server.ts` (local) and `api/*.ts` (Vercel). Keep them in sync.

### Tool registration flow

Adding a new tool requires changes in three places:

1. **`src/lib/tools-config.ts`** — Add entry to `ALL_TOOLS` array and to the appropriate group in `TOOL_GROUPS`.
2. **`src/pages/tools/`** — Create the tool component file.
3. **`src/App.tsx`** — Add a `<Route>` wrapped in `<ToolLayout>`.

### Layout

`ToolLayout` (`src/components/ToolLayout.tsx`) is the single shared wrapper for all pages. It renders the top nav bar, the page header (title + description from route), and the bottom status bar. Pass `title` and optional `description` as props from `App.tsx` routes.

### Path aliases

`@/*` resolves to the project root (not `src/`). So `@/src/components/...` and `@/components/ui/...` are both valid and used in the codebase.

### Styling

Dark-only theme. All CSS variables (colors, radius) are defined in `src/index.css` under `@theme` — there is no light mode. Primary accent is indigo (`#818cf8`). Tailwind v4 with `@tailwindcss/vite` plugin; no `tailwind.config.js`.

### Privacy model

Most tools process data entirely in the browser. The only server-side tools are URL shortener (proxies to is.gd) and currency converter (proxies to external exchange rate APIs with multi-provider fallback: Frankfurter → open.er-api → jsDelivr CDN).
