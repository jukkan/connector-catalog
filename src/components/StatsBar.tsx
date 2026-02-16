import type { Stats } from '../types';
import connectorsData from '../data/connectors.json';
import type { Connector } from '../types';

interface StatsBarProps {
  stats: Stats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const connectors = connectorsData as Connector[];

  const totalOperations = connectors.reduce(
    (sum, connector) => sum + (connector.operationCount || 0),
    0
  );

  // Count unique categories by splitting on ";" across all connectors
  const categoryCount = (() => {
    const categorySet = new Set<string>();
    connectors.forEach(connector => {
      if (connector.categories) {
        connector.categories.split(';').forEach(cat => {
          const trimmed = cat.trim();
          if (trimmed) categorySet.add(trimmed);
        });
      }
    });
    return categorySet.size;
  })();

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total Connectors
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {totalOperations.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total Operations
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {categoryCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Categories
          </div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Last Updated
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formatDate(stats.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
}
