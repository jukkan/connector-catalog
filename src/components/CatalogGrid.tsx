import ConnectorCard from './ConnectorCard';
import type { Connector } from '../types';

interface CatalogGridProps {
  connectors: Connector[];
  totalCount: number;
  onConnectorClick: (connector: Connector) => void;
}

export default function CatalogGrid({ connectors, totalCount, onConnectorClick }: CatalogGridProps) {
  return (
    <div>
      {/* Count Header */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {connectors.length.toLocaleString()} of {totalCount.toLocaleString()} connectors
        </p>
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
