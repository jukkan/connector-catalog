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
}

export default function CatalogGrid({ connectors, totalCount, sortBy, onSortChange, onConnectorClick }: CatalogGridProps) {
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
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No connectors found matching your filters.
          </p>
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
