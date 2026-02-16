import type { Connector } from '../types';

interface ConnectorCardProps {
  connector: Connector;
}

export default function ConnectorCard({ connector }: ConnectorCardProps) {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'certified':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
      case 'independent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
      case 'custom':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeBadgeLabel = (type: string) => {
    switch (type) {
      case 'certified':
        return 'Certified';
      case 'independent':
        return 'Independent';
      case 'custom':
        return 'Custom';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all">
      {/* Header row: brand circle + displayName */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
          style={{ backgroundColor: connector.brandColor }}
        >
          {connector.displayName.charAt(0).toUpperCase()}
        </div>
        <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">
          {connector.displayName}
        </h3>
      </div>

      {/* Publisher */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {connector.publisher}
      </p>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
        {connector.description}
      </p>

      {/* Footer: operations + type badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          {connector.hasTriggers && (
            <span className="text-base">⚡</span>
          )}
          <span>{connector.operationCount} operation{connector.operationCount !== 1 ? 's' : ''}</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(connector.type)}`}>
          {getTypeBadgeLabel(connector.type)}
        </span>
      </div>
    </div>
  );
}
