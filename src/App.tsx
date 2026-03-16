import { useState, useMemo, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import CatalogGrid from './components/CatalogGrid';
import StatsBar from './components/StatsBar';
import ConnectorDetailModal from './components/ConnectorDetailModal';
import Footer from './components/Footer';
import connectorsData from './data/connectors.json';
import statsData from './data/stats.json';
import { sortConnectors } from './utils/connectorUtils';
import type { Connector, Stats, SortOption } from './types';

const connectors = connectorsData as Connector[];
const stats = statsData as Stats;

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Initialize state from URL params
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const sortParam = params.get('sort') as SortOption | null;
    const validSorts: SortOption[] = ['name-asc', 'name-desc', 'updated', 'added', 'operations-desc', 'publisher-asc'];
    return {
      search: params.get('q') || '',
      types: params.get('type')?.split(',').filter(Boolean) || [],
      authTypes: params.get('auth')?.split(',').filter(Boolean) || [],
      hasTriggers: params.get('triggers') === 'true' ? true : params.get('triggers') === 'false' ? false : null,
      categories: params.get('category')?.split(',').filter(Boolean) || [],
      sort: (sortParam && validSorts.includes(sortParam) ? sortParam : 'name-asc') as SortOption,
      connectorId: params.get('connector') || null,
    };
  };

  const [search, setSearch] = useState(getInitialState().search);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(getInitialState().types);
  const [selectedAuthTypes, setSelectedAuthTypes] = useState<string[]>(getInitialState().authTypes);
  const [hasTriggers, setHasTriggers] = useState<boolean | null>(getInitialState().hasTriggers);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(getInitialState().categories);
  const [sortBy, setSortBy] = useState<SortOption>(getInitialState().sort);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(() => {
    const { connectorId } = getInitialState();
    if (connectorId) {
      return (connectorsData as Connector[]).find(c => c.id === connectorId) ?? null;
    }
    return null;
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedTypes.length > 0) params.set('type', selectedTypes.join(','));
    if (selectedAuthTypes.length > 0) params.set('auth', selectedAuthTypes.join(','));
    if (hasTriggers !== null) params.set('triggers', String(hasTriggers));
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    if (sortBy !== 'name-asc') params.set('sort', sortBy);
    if (selectedConnector) params.set('connector', selectedConnector.id);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [search, selectedTypes, selectedAuthTypes, hasTriggers, selectedCategories, sortBy, selectedConnector]);

  // Update dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Extract all unique categories
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    connectors.forEach(connector => {
      if (connector.categories) {
        connector.categories.split(';').forEach(cat => {
          const trimmed = cat.trim();
          if (trimmed) categorySet.add(trimmed);
        });
      }
    });
    // Sort by priority categories first, then alphabetically
    const priorityCategories = [
      'Productivity', 'Data', 'AI', 'Content and Files', 'IT Operations',
      'Communication', 'Sales and CRM', 'Business Management', 'Collaboration',
      'Marketing', 'Finance', 'Security', 'Commerce', 'Human Resources', 'Social Media'
    ];
    const allCats = Array.from(categorySet);
    return [
      ...priorityCategories.filter(cat => allCats.includes(cat)),
      ...allCats.filter(cat => !priorityCategories.includes(cat)).sort()
    ];
  }, []);

  // Filter and sort connectors
  const filteredConnectors = useMemo(() => {
    const filtered = connectors.filter(connector => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          connector.displayName.toLowerCase().includes(searchLower) ||
          connector.description.toLowerCase().includes(searchLower) ||
          connector.publisher.toLowerCase().includes(searchLower) ||
          (connector.categories && connector.categories.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(connector.type)) {
        return false;
      }

      // Auth type filter
      if (selectedAuthTypes.length > 0 && !selectedAuthTypes.includes(connector.authType)) {
        return false;
      }

      // Triggers filter
      if (hasTriggers !== null && connector.hasTriggers !== hasTriggers) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        if (!connector.categories) return false;
        const connectorCategories = connector.categories.split(';').map(c => c.trim());
        const hasMatchingCategory = selectedCategories.some(selectedCat =>
          connectorCategories.includes(selectedCat)
        );
        if (!hasMatchingCategory) return false;
      }

      return true;
    });

    // Sort using utility function
    return sortConnectors(filtered, sortBy);
  }, [search, selectedTypes, selectedAuthTypes, hasTriggers, selectedCategories, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Connector Catalog
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Bar */}
        <StatsBar stats={stats} />

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <FilterBar
            selectedTypes={selectedTypes}
            selectedAuthTypes={selectedAuthTypes}
            hasTriggers={hasTriggers}
            selectedCategories={selectedCategories}
            allCategories={allCategories}
            onTypeChange={setSelectedTypes}
            onAuthTypeChange={setSelectedAuthTypes}
            onTriggersChange={setHasTriggers}
            onCategoryChange={setSelectedCategories}
          />
        </div>

        {/* Connector Grid */}
        <CatalogGrid
          connectors={filteredConnectors}
          totalCount={connectors.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onConnectorClick={setSelectedConnector}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Connector Detail Modal */}
      {selectedConnector && (
        <ConnectorDetailModal
          connector={selectedConnector}
          onClose={() => setSelectedConnector(null)}
        />
      )}
    </div>
  );
}

export default App;
