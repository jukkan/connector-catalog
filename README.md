# connector-catalog

Search, filter and visualize Microsoft's various connectors for low-code and AI apps and automation.

## Features

- **Search**: Real-time debounced search across connector names, descriptions, publishers, and categories
- **Filters**: Multi-select filters for connector type, authentication method, trigger support, and categories
- **Dark Mode**: Toggle between light and dark themes with localStorage persistence
- **Shareable URLs**: Filter states are synced to URL search parameters for easy sharing
- **Responsive Design**: Clean, modern UI built with Tailwind CSS that works on all screen sizes
- **Stats Dashboard**: View total connectors, operations, categories, and last update time

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Fetch the latest connector data:
   ```bash
   npm run fetch-data
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/           # React components
│   ├── SearchBar.tsx    # Search input with debouncing
│   ├── FilterBar.tsx    # Filter chips for type, auth, triggers, categories
│   ├── ConnectorCard.tsx # Card component for each connector
│   ├── CatalogGrid.tsx  # Responsive grid layout
│   └── StatsBar.tsx     # Statistics display
├── data/                # JSON data files
│   ├── connectors.json  # Connector data
│   └── stats.json       # Statistics data
├── App.tsx              # Main app component with state management
├── main.tsx             # Application entry point
├── types.ts             # TypeScript type definitions
└── index.css            # Global styles
```

## URL Parameters

The application supports the following URL parameters for shareable filtered views:

- `q` - Search query
- `type` - Connector types (comma-separated: certified, independent, custom)
- `auth` - Authentication types (comma-separated: oauth2, apiKey, basic, none)
- `triggers` - Has triggers filter (true/false)
- `category` - Categories (comma-separated)

Example: `?type=certified&auth=oauth2&q=sales`

## License

MIT
