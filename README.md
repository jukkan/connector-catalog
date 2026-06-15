# connector-catalog

A static single-page application for searching, filtering, and exploring Microsoft Power Platform connectors. Data is sourced from the official [microsoft/PowerPlatformConnectors](https://github.com/microsoft/PowerPlatformConnectors) repository and presented in a fast, client-side catalog with no backend required.

Deployed to [https://connectors.jukkan.com](https://connectors.jukkan.com).

## Features

### Data Pipeline

- **Automated data extraction** — A Node.js script (`scripts/fetch-data.mjs`) shallow-clones the `dev` branch of the PowerPlatformConnectors repo, parses every connector's `apiDefinition.swagger.json` and `apiProperties.json`, and outputs two JSON files consumed by the frontend.
- **Connector metadata** — Extracts display name, description, publisher, brand color, auth type, operation/action/trigger counts, categories, website, and contact info for each connector.
- **Three connector pools** — Certified connectors, Independent Publisher connectors, and Custom connectors are each scanned from their respective directories.
- **Statistics generation** — Aggregates totals by type, category, and auth method with a timestamp.

### Search & Filtering

- **Real-time debounced search** (300 ms) across connector name, description, publisher, and categories.
- **Multi-select chip filters** for:
  - **Connector type** — Certified, Independent, Custom
  - **Authentication method** — OAuth 2.0, API Key, Basic, None
  - **Trigger support** — Has triggers / no triggers
  - **Categories** — All categories extracted from connector metadata, with priority categories displayed first
- **Composable filters** — All filters are AND-combined; search narrows results further within the active filter set.
- **Clear all** button to reset every active filter in one click.

### Connector Detail Modal

- Click any card to open a detail modal showing the full description, type badge, auth method, action count, trigger count, categories as pills, and external links.
- **External links** include the vendor/contact website, auto-generated Microsoft Learn documentation URL, and a direct link to the connector's source on GitHub.
- Modal closes on Escape key or clicking the backdrop.

### Stats Dashboard

- Displays four key metrics: total connectors, total operations, unique category count, and last data update date.

### Dark Mode

- Toggle between light and dark themes.
- Respects `prefers-color-scheme` on first visit.
- Persists preference via `localStorage`.

### Shareable URLs

- Filter state is synced bidirectionally with URL search parameters.
- Opening a URL with parameters restores the exact filter state.

### UI & Layout

- Responsive grid (1–4 columns) built with Tailwind CSS v4.
- Connector cards show brand color avatar, name, publisher, truncated description, operation count, trigger indicator, and type badge.
- Result count header (`Showing X of Y connectors`).
- Accessible: keyboard navigation on cards and modal (Enter/Space to open, Escape to close), proper `aria-label` attributes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5 (strict mode) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 via `@tailwindcss/postcss` |
| Hosting | GitHub Pages (custom domain `connectors.jukkan.com`) |
| Data source | microsoft/PowerPlatformConnectors (Git shallow clone) |

No runtime dependencies beyond React. No router, no state management library, no component library — all state is managed via `useState`/`useMemo`/`useEffect` hooks in `App.tsx`.

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- Git (required by the data fetch script to clone the connector repo)

### Installation

```bash
git clone https://github.com/jukkan/connector-catalog.git
cd connector-catalog
npm install
```

### Fetch Connector Data

```bash
npm run fetch-data
```

This clones the PowerPlatformConnectors repo into a temp directory, processes all connectors, writes `src/data/connectors.json` and `src/data/stats.json`, and cleans up the clone.

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173/`.

### Production Build

```bash
npm run build    # TypeScript check + Vite production build
npm run preview  # Serve the build locally
```

Output goes to `dist/`.

## Project Structure

```
├── scripts/
│   └── fetch-data.mjs          # Data pipeline: clone → parse → JSON output
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx        # Debounced search input
│   │   ├── FilterBar.tsx        # Chip-based multi-select filters
│   │   ├── ConnectorCard.tsx    # Card displaying connector summary
│   │   ├── ConnectorDetailModal.tsx  # Full connector detail overlay
│   │   ├── CatalogGrid.tsx      # Responsive grid with result count
│   │   └── StatsBar.tsx         # Aggregate statistics display
│   ├── data/
│   │   ├── connectors.json      # Generated connector data (git-ignored or committed)
│   │   └── stats.json           # Generated statistics
│   ├── App.tsx                  # Root component: state, filtering, URL sync, dark mode
│   ├── main.tsx                 # React DOM entry point
│   ├── types.ts                 # TypeScript interfaces (Connector, Stats, FilterState)
│   └── index.css                # Tailwind import + dark mode variant + base styles
├── index.html                   # HTML shell
├── vite.config.ts               # Vite config (React plugin, base path)
├── tsconfig.json                # TypeScript config (strict, ES2020, bundler resolution)
├── postcss.config.js            # PostCSS with @tailwindcss/postcss
└── package.json                 # Scripts: dev, build, preview, fetch-data
```

## URL Parameters

All filter state is reflected in the URL for sharing:

| Parameter | Values | Example |
|-----------|--------|---------|
| `q` | Free text search query | `?q=salesforce` |
| `type` | `certified`, `independent`, `custom` (comma-separated) | `?type=certified,independent` |
| `auth` | `oauth2`, `apiKey`, `basic`, `none` (comma-separated) | `?auth=oauth2` |
| `triggers` | `true` / `false` | `?triggers=true` |
| `category` | Category names (comma-separated) | `?category=AI,Data` |

Parameters can be combined: `?type=certified&auth=oauth2&q=sales&category=Productivity`

## Data Model

Each connector record contains:

```typescript
interface Connector {
  id: string;            // Directory name in the source repo
  displayName: string;   // From swagger info.title
  description: string;   // From swagger info.description
  publisher: string;     // From apiProperties or swagger annotation
  type: 'certified' | 'independent' | 'custom';
  brandColor: string;    // Icon brand color hex
  authType: 'oauth2' | 'apiKey' | 'basic' | 'none';
  operationCount: number;
  actionCount: number;
  triggerCount: number;
  hasTriggers: boolean;
  categories: string | null;   // Semicolon-separated
  website: string | null;
  contactUrl: string | null;
  contactName: string | null;
}
```

## License

MIT
