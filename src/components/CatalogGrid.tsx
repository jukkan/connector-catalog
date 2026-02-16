import ConnectorCard from './ConnectorCard';
import type { Connector } from '../types';

interface CatalogGridProps {
  connectors: Connector[];
  totalCount: number;
}

export default function CatalogGrid({ connectors, totalCount }: CatalogGridProps) {
  return (
    <div>
      {/* Count Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Showing {connectors.length.toLocaleString()} of {totalCount.toLocaleString()} connectors
        </h2>
      </div>

      {/* Grid */}
      {connectors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No connectors found matching your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4" style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
        }}>
          {connectors.map(connector => (
            <ConnectorCard key={connector.id} connector={connector} />
          ))}
        </div>
      )}
    </div>
  );
}
