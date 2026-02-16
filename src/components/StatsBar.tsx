import type { Stats } from '../types';
import connectorsData from '../data/connectors.json';

interface StatsBarProps {
  stats: Stats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const totalOperations = connectorsData.reduce(
    (sum, connector) => sum + (connector.operationCount || 0),
    0
  );

  const categoryCount = Object.keys(stats.byCategory).length;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Connectors
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalOperations.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Operations
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {categoryCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Categories
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Last Updated
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(stats.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
}
