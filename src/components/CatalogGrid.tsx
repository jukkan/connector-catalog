import ConnectorCard from './ConnectorCard';
import type { Connector, SortOption } from '../types';

interface CatalogGridProps {
  connectors: Connector[];
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onConnectorClick: (connector: Connector) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'operations-desc', label: 'Most Operations' },
  { value: 'publisher-asc', label: 'Publisher A–Z' },
];

export default function CatalogGrid({ connectors, totalCount, sortBy, onSortChange, onConnectorClick }: CatalogGridProps) {
  return (
    <div>
      {/* Count + Sort Header */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {connectors.length.toLocaleString()} of {totalCount.toLocaleString()} connectors
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Sort:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={e => onSortChange(e.target.value as SortOption)}
            className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {connectors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No connectors found matching your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {connectors.map(connector => (
            <ConnectorCard key={connector.id} connector={connector} onClick={() => onConnectorClick(connector)} />
          ))}
        </div>
      )}
    </div>
  );
}
