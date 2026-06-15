# Connector Catalog — Project Plan & Architecture

> **Purpose:** This document captures the vision, research findings, data architecture, and phased roadmap for the Power Platform Connector Catalog. It is intended as context for AI coding agents (GitHub Copilot, Claude Code) working in this repo, and as a reference for contributors.
>
> **Last updated:** June 2026

---

## 1. Vision

Microsoft maintains three architecturally distinct connector families — Power Platform connectors, Copilot connectors (formerly Graph connectors), and Power Query connectors — but provides no unified, modern catalog for discovering them. The existing resources are:

- **MS Learn connector reference** (`learn.microsoft.com/en-us/connectors/connector-reference/`) — a flat HTML table with tiny icons, no real search, no filtering beyond page-level links. The only "official" catalog.
- **PowerPlatformConnectors GitHub repo** (`github.com/microsoft/PowerPlatformConnectors`) — raw OpenAPI specs and metadata files for ~1,100 certified and independent publisher connectors. Developer-oriented, no UI.
- **Copilot connectors gallery** (`learn.microsoft.com/en-us/microsoftsearch/connectors-gallery`) — a simple markdown-rendered list. No API.
- **Power Query connectors list** (`learn.microsoft.com/en-us/power-query/connectors/`) — a documentation table with a per-product support matrix. No API.

This project builds a **fast, searchable, filterable, visually rich static site** on GitHub Pages that provides a better discovery experience than any of these. The MVP focuses on **Power Platform connectors only** (~1,100+), with Copilot connectors and Power Query connectors as future expansions.

### What "better" means concretely

1. **Instant client-side search** across name, description, publisher, category
2. **Faceted filtering** — combine type, tier, auth method, category, trigger support
3. **Visual brand discovery** — icon/color grid, "What's New" activity strip
4. **Deep links** — shareable URLs for filtered views and individual connectors
5. **Operation-level detail** — see all actions/triggers from the OpenAPI spec
6. **Auth type visibility** — immediately know OAuth, API key, etc.
7. **Independent publisher spotlight** — surface the ~450+ IP connectors alongside certified ones
8. **Ecosystem stats** — total counts, breakdowns, newest additions

---

## 2. Research Findings — Data Quality Assessment

A full analysis was run against the `microsoft/PowerPlatformConnectors` GitHub repo (branch: `dev`). Key findings:

### 2.1 Connector counts

| Directory | Count | Description |
|-----------|-------|-------------|
| `certified-connectors/` | ~664 | Partner-owned, certified by Microsoft, deployed to production |
| `independent-publisher-connectors/` | ~454 | Community-submitted, deployed as Premium tier |
| `custom-connectors/` | ~23 | Sample/template connectors |
| **Total in repo** | **~1,141** | |

### 2.2 Metadata coverage (from repo)

| Field | Source | Coverage | Notes |
|-------|--------|----------|-------|
| OpenAPI spec | `apiDefinition.swagger.json` | 99% (1,132/1,141) | Full operation definitions, auth schemas |
| Brand color | `apiProperties.json` → `properties.iconBrandColor` | 99% | Hex color, usable for card theming |
| Categories | `apiDefinition.swagger.json` → `x-ms-connector-metadata[].Categories` | 93% (1,056) | Semicolon-separated, ~19 categories |
| Publisher | `apiProperties.json` → `properties.publisher` | 93% (1,064) | |
| Description | `apiDefinition.swagger.json` → `info.description` | 98% | |
| Website URL | `x-ms-connector-metadata[].Website` | 92% (1,055) | |
| Auth type | `securityDefinitions` in swagger | 99% | OAuth2, ApiKey, Basic, None |
| **Icon file** | `icon.png` in connector directory | **2% (21/1,141)** | **Major gap — see §2.4** |

### 2.3 Operation statistics

- **Total operations across all connectors:** ~18,900
- **Total actions:** ~18,100
- **Total triggers:** ~810
- **Connectors with triggers:** 227
- **Average operations per connector:** ~16.5
- **Top connector by operations:** Encodian (219 ops)

### 2.4 Key data gaps

**Gap 1 — Icons:** Only 21 connectors include an `icon.png` in the repo. Connector icons are served from Microsoft's Azure CDN at URLs like:
```
https://connectoricons-prod.azureedge.net/releases/v1.0.{major}/1.0.{major}.{minor}/{connectorSlug}/icon.png
```
The version path and connector slug come from the Power Platform API response (`iconUri` field). These are **not available** without an authenticated API call or scraping the MS Learn connector reference HTML.

**Current workaround:** Use brandColor-based initial avatars (colored circle with first letter). This works well visually and requires no external data.

**Future resolution options (pick one):**
- Call the Power Platform API (`api.powerapps.com`) with a service principal to dump all `iconUri` values once, then refresh periodically
- Call the Azure ARM Managed APIs endpoint (`management.azure.com/.../managedApis`) with an Azure subscription
- Scrape/parse icon `<img>` URLs from the MS Learn connector reference page
- Use the CoE Starter Kit's connector inventory approach (Power Automate flow → Dataverse → export)

**Gap 2 — First-party Microsoft connectors:** The GitHub repo does not include Microsoft's own connectors. These are the most popular and most recognizable:

| Missing from repo | Status |
|---|---|
| SharePoint | ❌ Not in repo |
| Office 365 Outlook | ❌ |
| Microsoft Teams | ❌ |
| Dataverse / Microsoft Dataverse | ❌ |
| OneDrive for Business | ❌ |
| SQL Server | ❌ |
| Excel Online (Business) | ❌ |
| Approvals | ❌ |
| Microsoft Forms | ❌ |
| Azure Blob Storage | ❌ |
| HTTP / HTTP with Microsoft Entra ID | ❌ |
| Microsoft To Do | ❌ |
| Power BI | ✅ Found in repo |
| OneNote | ✅ |
| Planner | ✅ |

These connectors are only accessible via the Power Platform API or ARM API, or by parsing the MS Learn connector reference.

**Gap 3 — Tier classification (Standard vs Premium):** The repo does not include tier data. All independent publisher connectors are Premium by definition. For certified connectors, tier info comes from the API or MS Learn reference.

### 2.5 Category taxonomy (from `x-ms-connector-metadata`)

These categories are embedded in the swagger files and available for filtering without any external data:

| Category | Count | | Category | Count |
|----------|-------|-|----------|-------|
| Productivity | 273 | | Business Intelligence | 63 |
| Data | 258 | | Marketing | 53 |
| AI | 112 | | Finance | 42 |
| Content and Files | 111 | | Security | 39 |
| IT Operations | 105 | | Commerce | 32 |
| Communication | 105 | | Human Resources | 26 |
| Sales and CRM | 92 | | Social Media | 20 |
| Business Management | 88 | | Internet of Things | 17 |
| Collaboration | 86 | | | |
| Website | 86 | | | |
| Lifestyle and Entertainment | 73 | | | |

### 2.6 Auth type breakdown

| Auth Type | Count | % |
|-----------|-------|---|
| ApiKey | 586 | 51% |
| OAuth2 | 234 | 21% |
| None | 212 | 19% |
| Basic | 79 | 7% |
| Other/Unknown | 30 | 2% |

### 2.7 Top publishers by connector count

| Publisher | Count | Type |
|-----------|-------|------|
| Troy Taylor | 182 | Independent |
| Fördős András | 41 | Independent |
| Troy Taylor, Hitachi Solutions | 29 | Independent |
| Microsoft | 24 | Certified |
| Blackbaud, Inc. | 20 | Certified |
| Dan Romano | 15 | Independent |
| Richard Wilson | 14 | Independent |

---

## 3. Architecture

### 3.1 Tech stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Vite + React + TypeScript | Fast build, good DX, client-side rendering |
| Styling | Tailwind CSS | Rapid iteration, utility-first, dark mode support |
| Search | Client-side (includes-based or Fuse.js) | No backend needed, fast for ~1,100 items |
| Data | Static JSON imported at build time | No API server, instant load |
| Hosting | GitHub Pages | Free, custom domain support, CI/CD via Actions |
| Data refresh | GitHub Actions (weekly cron) | Clones repo, regenerates JSON, deploys |

### 3.2 Data pipeline

```
┌─────────────────────────────────────────────────┐
│  scripts/fetch-data.mjs                         │
│                                                 │
│  1. git clone --depth 1 PowerPlatformConnectors │
│  2. Scan certified-connectors/                  │
│  3. Scan independent-publisher-connectors/      │
│  4. Scan custom-connectors/                     │
│  5. Parse apiDefinition.swagger.json per each   │
│  6. Parse apiProperties.json per each           │
│  7. Merge into unified schema                   │
│  8. Write src/data/connectors.json              │
│  9. Write src/data/stats.json                   │
│  10. Cleanup temp clone                         │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  src/data/connectors.json (~490KB, ~160KB gz)   │
│                                                 │
│  Array of unified Connector objects             │
│  Imported statically by React app at build time │
└─────────────────────────────────────────────────┘
```

### 3.3 Unified connector schema

```typescript
interface Connector {
  id: string;                  // Folder name in repo (e.g. "Salesforce")
  displayName: string;         // From swagger info.title
  description: string;         // From swagger info.description
  publisher: string;           // From apiProperties.json or swagger annotation
  type: 'certified' | 'independent' | 'custom';
  brandColor: string | null;   // Hex from apiProperties (e.g. "#0066FF")
  authType: 'oauth2' | 'apiKey' | 'basic' | 'none';
  operationCount: number;
  actionCount: number;
  triggerCount: number;
  hasTriggers: boolean;
  categories: string | null;   // Semicolon-separated, normalized (e.g. "Sales and CRM;Data")
  website: string | null;      // From x-ms-connector-metadata
  contactUrl: string | null;   // From swagger info.contact.url
  contactName: string | null;  // From swagger info.contact.name
  firstCommitDate: string | null;  // ISO 8601 — first git commit touching this connector
  lastCommitDate: string | null;   // ISO 8601 — most recent git commit
  apiVersion: string | null;   // From swagger info.version
  privacyPolicy: string | null; // From x-ms-connector-metadata "Privacy policy"
  capabilities: string[];      // From apiProperties.json (e.g. ["actions", "triggers"])
}
```

Category values are normalized via `CATEGORY_CANONICAL` in `fetch-data.mjs` to handle case inconsistencies in upstream files (e.g. "website" → "Website").

### 3.4 URL structure and deep linking

All filter state is synced to URL search params:

```
/connector-catalog/?q=sales&type=certified&auth=OAuth2&category=Sales+and+CRM&triggers=yes&sort=ops-desc
/connector-catalog/?connector=Salesforce
```

---

## 4. Phased Roadmap

### Phase 1 — MVP ✅

- [x] Data pipeline: `fetch-data.mjs` clones repo, generates `connectors.json`
- [x] Vite + React + TypeScript + Tailwind scaffold
- [x] Catalog grid with connector cards
- [x] Search (text input, searches across name/description/publisher/category)
- [x] Filter chips (type, auth, triggers)
- [x] Category filter (select dropdown + active pill chips)
- [x] Basic card rendering with brandColor initials, publisher, description, operation count

### Phase 2 — Visual polish ✅

- [x] Stats bar: compact single-line text links (N connectors · N new · N updated this month · N with triggers), each clickable to apply matching filter/sort
- [x] Filter UX: inline pill chips with active state styling, "Clear all" button; all filter sections (Type, Auth, Triggers, Category) use consistent chip components
- [x] Category chip list scrollable at `max-h-44 overflow-y-auto` so the sidebar stays compact on short viewports
- [x] Card styling: brandColor 40×40 circle, type badge (green/blue/gray), trigger indicator (⚡), 2-line description clamp, freshness indicator bar (top edge color)
- [x] Grid: responsive 1/2/3 columns, max-width container, "Showing X of Y connectors" header
- [x] Sort dropdown: Name A-Z, Name Z-A, Most Operations, Publisher A-Z, Recently Updated, Recently Added
- [x] Dark mode toggle (sun/moon icon), persisted via `localStorage`, respects `prefers-color-scheme`
- [x] URL param sync for all filters and sort
- [x] InfoTip tooltips on "Type" (Premium licensing note) and "Triggers" (definition) section labels
- [x] Trigger chip labels: "Has triggers" / "Actions only" (replaces "Yes" / "No")
- [x] Empty state: shows search term, suggests broadening filters, and offers "Clear all filters" CTA

### Phase 3 — Connector detail ✅

- [x] Modal when clicking a connector card (Escape or backdrop click to close)
- [x] Full description, publisher, auth type, categories as badges, capabilities as badges
- [x] Links: vendor website, contact URL, privacy policy, GitHub repo (constructed), MS Learn docs (constructed)
- [x] Action count + trigger count
- [x] Timeline: first published date + last updated date (relative and absolute)
- [x] API version badge
- [x] Deep link via `?connector={id}` URL param
- [x] Keyboard navigation (Escape to close)

### Phase 4 — CI/CD and automation ✅

- [x] Two separate GitHub Actions workflows:
  - `update-data.yml` — weekly Sunday cron + manual dispatch: clones repo, runs `fetch-data.mjs`, runs tests, verifies build, commits data if changed
  - `deploy.yml` — on push to main + manual dispatch: runs tests, builds, deploys to GitHub Pages
- [x] Deployed to custom domain `connectors.jukkan.com` via GitHub Pages
- [x] `base: '/'` in Vite config for custom domain

### Phase 5 — Recent activity hero (replaces featured brands) ✅

Featured brands were dropped in favour of surfacing connector freshness — more useful and requires no curation.

- [x] Page header with title, subtitle showing live connector count
- [x] Footer with attribution and repo link
- [x] OpenGraph and Twitter Card meta tags for social sharing
- [x] Favicon (SVG)
- [x] **Compact stats bar** — single line of clickable text links (N connectors · N new · N updated · N with triggers). Replaced the 4-card grid; freed vertical space for the activity strip.
- [x] **"What's New" strip** (`RecentConnectors.tsx`) — two horizontally scrollable rows of compact mini-cards:
  - *New connectors* — `firstCommitDate` within 90 days, sorted newest first, "View all →" applies `added` sort
  - *Recently updated* — `lastCommitDate` within 30 days and NOT new, sorted newest first, "View all →" applies `updated` sort
  - Strip is hidden when any filter (search, type, auth, triggers, category) is active, so it never competes with search results

### Phase 5.1 — UX polish (remaining from design critique)

Baseline design health score was 25/40 (June 2026). The P1 issues (empty state dead end, unexplained filter terms) and two P2 issues (category chip consistency, stats bar hover affordance) were fixed in Phase 5. Remaining items:

- [ ] **Freshness bar visibility** — the 2px top-edge color bar on cards goes unnoticed. Options: increase to 4px, add a hover tooltip showing the last-updated date, or lean into the date already shown in the card footer instead of the bar.
- [ ] **Cards as `<a>` elements** — connector cards are `<div>` with `onClick`; Cmd+click (new tab) doesn't work. Replace with `<a href="?connector={id}">` to give keyboard users and power users proper link behavior, while keeping the modal for primary navigation.
- [ ] **Keyboard shortcut to focus search** — no way to jump to the search box without clicking. Add Cmd+K (Mac) / Ctrl+K (Windows) listener in `App.tsx` that calls `.focus()` on the search input ref.
- [ ] **Dark mode contrast** — `dark:text-gray-400` on `dark:bg-gray-800` is approximately 4.1:1, borderline WCAG AA fail for body text. Bump secondary text to `dark:text-gray-300` (≈5.9:1) across cards and filter labels.
- [ ] **Fix `buildMicrosoftLearnUrl`** — strips all non-alphanumeric characters, which may produce broken MS Learn URLs for connectors with hyphens or spaces in their ID. Should preserve hyphens and URL-encode remaining special chars.
- [ ] **Clean up modal contact name** — the `contactName` field can render raw swagger strings (e.g. `"Name"`, `"Support"`, empty email addresses). Add a filter: only show if value looks like a real name (no `@`, no generic strings).
- [ ] **Re-run `/impeccable critique`** after the above to measure score improvement from the 25/40 baseline.

### Phase 6 — Icons (enhancement, requires external data)

- [ ] **Option A (preferred):** Add a secondary data source script that calls the Power Platform API with a service principal to get `iconUri` CDN URLs for all connectors, including first-party ones. Store as a supplementary `icons.json` mapping connector slug → CDN URL.
- [ ] **Option B:** Scrape the MS Learn connector reference page HTML for `<img>` elements and extract icon URLs.
- [ ] **Option C:** Download and cache all icons locally during build (adds ~5-10MB to repo but eliminates CDN dependency and CORS issues).
- [ ] Merge icon data into the catalog display — replace brandColor initials with actual icons where available, fall back to initials where not.

### Phase 7 — First-party Microsoft connectors (enhancement)

- [ ] Add first-party connectors (SharePoint, Teams, Dataverse, etc.) to the catalog. These are not in the GitHub repo.
- [ ] Source options: same API call as Phase 6 (the API returns all connectors including first-party), or parse MS Learn connector reference.
- [ ] Also adds **tier data** (Standard vs Premium) which is only available from the API or MS Learn.

### Phase 8 — Operations detail (enhancement)

- [ ] Expand `fetch-data.mjs` to extract full operation lists from swagger: operation name, summary, method, path, isTrigger, visibility
- [ ] Store in a separate `operations/` directory (one file per connector) to avoid bloating the main JSON
- [ ] Render in the detail panel: grouped list of actions and triggers with descriptions
- [ ] Search across operation names (not just connector-level fields)

### Phase 9 — Additional connector families (future)

- [ ] **Copilot connectors** (formerly Graph connectors): Parse gallery markdown from `MicrosoftDocs/OfficeDocs-MicrosoftSearch` repo. ~150+ connectors. Different schema: connector type (synced/federated), categories, publisher. Display in a separate tab or section with clear labeling that these are content-indexing connectors for M365 Copilot, not API-bridge connectors.
- [ ] **Power Query connectors**: Parse `MicrosoftDocs/powerquery-docs` repo (`connectors/index.md`). ~200-250 connectors. Different schema: per-product support matrix (Excel, Power BI, Fabric Dataflow Gen2, etc.). Display in a separate tab or section.
- [ ] Unified search across all three families with clear family labeling.

---

## 5. Three Connector Families — Reference

This section documents the architectural differences between the three connector types for anyone working on the catalog or writing documentation.

### 5.1 Power Platform connectors (MVP scope)

- **What they do:** Live API bridges — real-time read/write/trigger operations against external services
- **Used in:** Power Automate, Power Apps, Logic Apps, Copilot Studio
- **Architecture:** OpenAPI 2.0 definitions → Azure API Management → App Service runtime
- **Auth model:** Per-user connections (OAuth, API key, etc.) managed by API Hub
- **Governance:** DLP policies, connector blocking, environment-scoped
- **Tiers:** Standard (included with license) and Premium (require premium license or pay-as-you-go)
- **Publisher types:** Microsoft (first-party), Certified (partner-owned), Independent Publisher (community)
- **Count:** 1,000+ certified + ~450 independent publisher = ~1,500+ total

### 5.2 Copilot connectors (formerly Microsoft Graph connectors)

- **What they do:** Ingest and semantically index external content into Microsoft Graph for search and AI reasoning
- **Used in:** Microsoft 365 Copilot, Microsoft Search, Context IQ, Copilot Studio (as knowledge sources)
- **Architecture:** External content → Graph `externalConnections` API → Microsoft Search index
- **Auth model:** Admin-configured, tenant-scoped (not per-user)
- **Types:** Synced (periodic crawl, content copied to Graph) and Federated (real-time MCP-based, preview)
- **Key difference from Power Platform connectors:** Read-only content indexing, not live API calls. No actions or triggers. Admin-managed, not maker-managed.
- **Count:** ~50 Microsoft-built + ~100+ partner-built = ~150+ total

### 5.3 Power Query connectors

- **What they do:** Read tabular data from external sources for analytical/BI scenarios
- **Used in:** Power BI Desktop, Excel Get & Transform, Fabric Dataflow Gen2, Power BI Dataflows, Power Apps Dataflows, Customer Insights, Analysis Services
- **Architecture:** M language (Power Query formula language), packaged as `.mez`/`.pqx` files, entirely separate from Power Platform connectors
- **Key difference:** Completely unrelated codebase and developer model. Same data source names often appear across Power Platform and Power Query (e.g., "SQL Server", "Salesforce") but the implementations are entirely different.
- **Count:** ~200-250

### 5.4 Common confusion points

| Question | Answer |
|----------|--------|
| "Are Copilot connectors the same as Power Platform connectors used in Copilot Studio?" | **No.** Copilot Studio can use both: Copilot connectors as read-only knowledge sources, and Power Platform connectors for live actions. Different things. |
| "If I have a Power Platform connector for Salesforce, do I also have a Power Query connector for Salesforce?" | **Not necessarily.** They are independent ecosystems. Many overlap, but coverage differs. |
| "Are independent publisher connectors free to use?" | **No.** They are Premium tier and require a premium license or pay-as-you-go. |
| "Can I use Power Platform connectors in Power BI?" | **No.** Power BI uses Power Query connectors, which are a separate system. |

---

## 6. Data Source Reference

### 6.1 Primary source: PowerPlatformConnectors GitHub repo

- **URL:** `https://github.com/microsoft/PowerPlatformConnectors`
- **Branch:** `dev`
- **Access:** Public, no auth required
- **What it contains:** OpenAPI specs, apiProperties.json, icons (rare), readmes for certified, independent publisher, and custom connectors
- **What it does NOT contain:** First-party Microsoft connectors, tier classification, CDN icon URLs

### 6.2 Secondary source: Power Platform API

- **Endpoint:** `GET https://api.powerapps.com/providers/Microsoft.PowerApps/scopes/admin/apis?api-version=2023-06-01`
- **Auth:** Entra ID (requires admin consent or service principal)
- **Returns per connector:** `displayName`, `iconUri` (CDN URL), `apiTier` (Standard/Premium), `isOnPremiseConnection`, `isCustomApiConnection`, `id`
- **Includes first-party:** Yes — this is the only programmatic source for SharePoint, Teams, etc.

### 6.3 Secondary source: Azure ARM Managed APIs

- **Endpoint:** `GET https://management.azure.com/subscriptions/{sub}/providers/Microsoft.Web/locations/{location}/managedApis?api-version=2016-06-01`
- **Auth:** Azure subscription + OAuth token
- **Returns per connector:** Display name, description, `iconUrl`, `brandColor`, connection parameter schemas with full auth details, runtime URLs, capabilities, release tags
- **Richest metadata:** This is the most complete single API response per connector

### 6.4 Secondary source: MS Learn connector reference

- **URL:** `https://learn.microsoft.com/en-us/connectors/connector-reference/`
- **Access:** Public HTML page
- **Contains:** Every connector with icon, name, tier, product availability, publisher, link to detail page
- **Underlying repo:** Private (`MicrosoftDocs/connectors-docs`)
- **Use for:** Scraping icon URLs, tier data, and first-party connectors if API access is not available

### 6.5 Copilot connectors source

- **Gallery page:** `https://learn.microsoft.com/en-us/microsoftsearch/connectors-gallery`
- **Underlying repo:** `MicrosoftDocs/OfficeDocs-MicrosoftSearch` (public, markdown)
- **No API** for catalog listing (only tenant-scoped connection management)

### 6.6 Power Query connectors source

- **List page:** `https://learn.microsoft.com/en-us/power-query/connectors/`
- **Underlying repo:** `MicrosoftDocs/powerquery-docs` (public, markdown at `connectors/index.md`)
- **No API** for connector enumeration

---

## 7. File Structure

```
connector-catalog/
├── .github/
│   ├── copilot-instructions.md        # AI coding agent context
│   └── workflows/
│       ├── update-data.yml            # Weekly Sunday cron: fetch-data → test → commit
│       └── deploy.yml                 # On push to main: test → build → deploy to Pages
├── scripts/
│   └── fetch-data.mjs                 # Data pipeline: clone repo → parse → normalize → JSON
├── src/
│   ├── components/
│   │   ├── CatalogGrid.tsx            # Responsive grid with result count header and empty-state recovery
│   │   ├── ConnectorCard.tsx          # Card with brandColor avatar, badges, freshness bar
│   │   ├── ConnectorDetailModal.tsx   # Full detail modal with links and timeline
│   │   ├── FilterBar.tsx              # Chip filters: type, auth, triggers, category; InfoTip tooltips
│   │   ├── Footer.tsx                 # Attribution footer
│   │   ├── RecentConnectors.tsx       # "What's New" hero strip: new + recently updated scrollable rows
│   │   ├── SearchBar.tsx              # Debounced text search (300ms)
│   │   ├── SortDropdown.tsx           # 6-option sort selector
│   │   └── StatsBar.tsx               # Compact single-line stat links (N connectors · N new · ...)
│   ├── data/
│   │   ├── connectors.json            # Generated by fetch-data.mjs (~490KB)
│   │   └── stats.json                 # Generated aggregate statistics
│   ├── utils/
│   │   ├── connectorUtils.ts          # Date formatting, sort, freshness, filter helpers
│   │   └── __tests__/
│   │       └── connectorUtils.test.ts
│   ├── data/
│   │   └── __tests__/
│   │       ├── connectors.test.ts
│   │       └── stats.test.ts
│   ├── types.ts                       # Connector, Stats, FilterState, SortOption
│   ├── App.tsx                        # Root: all state, filtering, URL sync, dark mode
│   ├── index.css                      # Tailwind import + dark mode variant
│   └── main.tsx                       # React DOM entry point
├── public/
│   └── favicon.svg
├── index.html                         # HTML shell with OG/Twitter meta tags
├── package.json
├── vite.config.ts                     # base: '/' for custom domain
├── postcss.config.js
├── tsconfig.json
├── vitest.config.ts
└── PLAN.md                            # ← This file
```

---

## 8. Key Decisions and Trade-offs

| Decision | Rationale |
|----------|-----------|
| **Static site, no backend** | Free hosting, fast, simple. ~1,140 connectors at ~490KB JSON is manageable client-side. |
| **BrandColor initials instead of icons** | Icons require an authenticated API call or scraping. Initials with brandColor look clean and work for all connectors. Fallback to neutral gray (`#6B7280`) when `brandColor` is null. |
| **GitHub repo as primary data source** | Public, no auth, rich metadata (OpenAPI specs). Covers ~1,140 of ~1,500 total connectors. |
| **Skip first-party connectors for now** | Requires API access or scraping. The ~1,140 repo connectors are still more than any other community catalog shows. |
| **Skip tier data for now** | All independent publisher connectors are Premium. Certified connectors have mixed tiers but the data isn't in the repo. Can be added when API/scrape source is integrated. |
| **Two separate CI/CD workflows** | `update-data.yml` commits JSON changes; `deploy.yml` deploys on every push to main. Separating them means a data update that produces no changes doesn't trigger a deploy, and a UI-only push doesn't wait for the data clone. |
| **Git history for connector dates** | `--filter=blob:none` clone includes full commit history without blob content. Parsing the log gives first-added and last-updated dates per connector without any external API, enabling "Recently Added" / "Recently Updated" sort and freshness indicators. |
| **Category normalization via canonical map** | Upstream connector files have inconsistent casing (e.g. "website" vs "Website"). A fixed `CATEGORY_CANONICAL` map in `fetch-data.mjs` normalizes at extraction time so the UI never sees duplicates. |
| **Weekly data refresh** | Connectors don't change daily. Weekly cron balances freshness vs. build cost. |
| **Power Platform only for now** | The three connector families are architecturally unrelated. Shipping one well beats shipping three poorly. |

---

## 9. Testing Checklist

For any PR that modifies the UI or data pipeline:

- [ ] `npm run fetch-data` completes without errors
- [ ] `connectors.json` contains > 1,000 connectors
- [ ] `npm run build` succeeds
- [ ] Dev server (`npm run dev`) loads the catalog
- [ ] Search returns results for "Salesforce", "Troy Taylor", "AI"
- [ ] Type filters work (Certified / Independent / Custom)
- [ ] Auth filters work (OAuth2 / ApiKey / Basic / None)
- [ ] Category filter works
- [ ] URL params update when filters change
- [ ] Loading a URL with params applies filters correctly
- [ ] Dark mode toggle works
- [ ] Grid is responsive (check 1-column on mobile width)
- [ ] No console errors
