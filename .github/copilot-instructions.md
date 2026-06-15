# Copilot Instructions — connector-catalog

## Project Overview

This is a static React SPA that catalogs Microsoft Power Platform connectors. There is no backend or database — all data lives in two generated JSON files (`src/data/connectors.json`, `src/data/stats.json`) produced by a Node.js data-fetch script. The app is deployed to GitHub Pages at base path `/connector-catalog/`.

## Tech Stack & Versions

- **React 19** (functional components, hooks only — no class components)
- **TypeScript 5** with `strict: true` (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- **Vite 7** as bundler (config in `vite.config.ts`, base path `/` — deployed to custom domain `connectors.jukkan.com`)
- **Tailwind CSS 4** via `@tailwindcss/postcss` — styles applied exclusively through utility classes, no CSS modules or styled-components
- **No router, no state library, no component library** — state is plain React hooks in `App.tsx`

## Architecture & Conventions

### Component Structure
- All components are in `src/components/` as individual `.tsx` files.
- Each component is a default-exported function component with a typed props interface defined in the same file.
- Shared TypeScript types (`Connector`, `Stats`, `FilterState`) live in `src/types.ts`.
- `App.tsx` owns all application state and passes it down as props — there is no context, no Redux, no Zustand.

### Styling
- Use Tailwind utility classes directly on JSX elements. Do not add CSS files beyond `src/index.css`.
- Dark mode uses Tailwind's class-based strategy (`dark:` variants). The `dark` class is toggled on `<html>` by `App.tsx`.
- The dark mode custom variant is defined in `index.css` as `@custom-variant dark (&:where(.dark, .dark *))`.
- Color badges use consistent patterns: green for certified, blue for independent, gray for custom, purple for categories.

### Data Pipeline
- `scripts/fetch-data.mjs` is a standalone Node.js ESM script (no TypeScript).
- It shallow-clones `microsoft/PowerPlatformConnectors` `dev` branch, reads `apiDefinition.swagger.json` and `apiProperties.json` from each connector directory, and writes two JSON files.
- Connector types map to directories: `certified-connectors`, `independent-publisher-connectors`, `custom-connectors`.
- JSON files have BOM handling (`\uFEFF` removal) because some upstream files contain BOMs.
- The script runs via `npm run fetch-data` and is not part of the build pipeline.

### URL State Sync
- Filter state is synced to URL search parameters via `useEffect` + `window.history.replaceState`.
- Initial state is read from URL params in `getInitialState()`.
- Parameters: `q`, `type`, `auth`, `triggers`, `category` (comma-separated multi-values).

### Filtering Logic
- All filters are AND-combined in a single `useMemo` over the full connector array.
- Search is case-insensitive substring match across `displayName`, `description`, `publisher`, and `categories`.
- Category matching splits the semicolon-separated `categories` field per connector.

## Code Style Rules

- Prefer `interface` over `type` for object shapes.
- Props interfaces are named `{ComponentName}Props`.
- Use `useMemo` for derived/computed data (filtered results, extracted category lists).
- Use `useEffect` for side effects (URL sync, dark mode class, event listeners).
- Debouncing is implemented with `setTimeout` + cleanup in `useEffect` (see `SearchBar.tsx`, 300ms delay).
- Do not introduce `useCallback` unless there is a measurable render performance issue.
- Keyboard accessibility: interactive non-button elements must have `role="button"`, `tabIndex={0}`, and `onKeyDown` handling Enter/Space.
- External links use `target="_blank"` with `rel="noopener noreferrer"`.

## When Adding a New Filter Dimension

1. Add state in `App.tsx` (`useState`).
2. Read initial value from URL params in `getInitialState()`.
3. Sync to URL in the `useEffect` that calls `replaceState`.
4. Add filter logic in the `filteredConnectors` `useMemo`.
5. Add UI controls in `FilterBar.tsx` (follow existing chip pattern).
6. Update the `FilterState` interface in `types.ts` if it's referenced.

## When Adding a New Connector Field

1. Add to the `Connector` interface in `src/types.ts`.
2. Extract the field in `processConnector()` in `scripts/fetch-data.mjs`.
3. Re-run `npm run fetch-data` to regenerate JSON.
4. Display in `ConnectorCard.tsx` (summary) and/or `ConnectorDetailModal.tsx` (full detail).

## When Adding a New Component

1. Create `src/components/ComponentName.tsx` with a default export.
2. Define a `ComponentNameProps` interface in the same file.
3. Import and use in `App.tsx` or the appropriate parent.
4. Use Tailwind utilities for all styling; support `dark:` variants.

## File Roles

| File | Purpose |
|------|---------|
| `App.tsx` | Root component; all state, filtering, URL sync, dark mode toggle, layout |
| `types.ts` | Shared TypeScript interfaces |
| `SearchBar.tsx` | Debounced text input |
| `FilterBar.tsx` | Chip-based multi-select filters with clear-all |
| `ConnectorCard.tsx` | Card in the grid (summary view) |
| `ConnectorDetailModal.tsx` | Full detail modal with external links |
| `CatalogGrid.tsx` | Responsive grid wrapper with result count |
| `StatsBar.tsx` | Aggregate stats banner |
| `scripts/fetch-data.mjs` | Data pipeline (clone → parse → JSON) |
| `src/data/connectors.json` | Generated connector records |
| `src/data/stats.json` | Generated aggregate statistics |

## Common Pitfalls

- **Categories are semicolon-separated strings**, not arrays. Always `.split(';').map(c => c.trim())` before comparing.
- **Brand colors** can be `null`. Guard with fallback when using as `style.backgroundColor`.
- **The data files are generated** — do not hand-edit `connectors.json` or `stats.json`.
- **Vite base path** is `/connector-catalog/`. Asset references and routing must account for this.
- **Test framework is Vitest** (`vitest.config.ts`). Tests live in `src/data/__tests__/` and `src/utils/__tests__/`. Run with `npm test`.
- **Tailwind v4** uses `@import "tailwindcss"` instead of the v3 `@tailwind` directives. Do not use v3 syntax.
- **Categories are semicolon-separated strings** and are normalized to canonical casing by `normalizeCategories()` in `fetch-data.mjs`. Do not add new raw category strings — extend the `CATEGORY_CANONICAL` map instead.

## Build & Run Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run fetch-data` | Regenerate connector & stats JSON from upstream repo |
