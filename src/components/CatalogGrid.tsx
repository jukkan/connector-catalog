import ConnectorCard from './ConnectorCard';
import SortDropdown from './SortDropdown';
import type { Connector, SortOption } from '../types';
import { getConnectorListKey } from '../utils/connectorUtils';

interface CatalogGridProps {
  connectors: Connector[];
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onConnectorClick: (connector: Connector) => void;
  search?: string;
  hasActiveFilters?: boolean;
  onClearAll?: () => void;
}

export default function CatalogGrid({
  connectors,
  totalCount,
  sortBy,
  onSortChange,
  onConnectorClick,
  search,
  hasActiveFilters,
  onClearAll,
}: CatalogGridProps) {
  return (
    <div>
      {/* Count + Sort Header */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {connectors.length.toLocaleString()} of {totalCount.toLocaleString()} connectors
        </p>
        <SortDropdown value={sortBy} onChange={onSortChange} />
      </div>

      {/* Grid */}
      {connectors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">
            No connectors found{search ? ` for "${search}"` : ''}
          </p>
          {hasActiveFilters && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try broadening your search or adjusting the active filters.
            </p>
          )}
          {hasActiveFilters && onClearAll && (
            <button
              onClick={onClearAll}
              className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
          {connectors.map(connector => (
            <ConnectorCard
              key={getConnectorListKey(connector)}
              connector={connector}
              onClick={() => onConnectorClick(connector)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
