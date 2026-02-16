import type { Connector } from '../types';

interface ConnectorCardProps {
  connector: Connector;
}

export default function ConnectorCard({ connector }: ConnectorCardProps) {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'certified':
        return 'bg-green-600 text-white';
      case 'independent':
        return 'bg-blue-600 text-white';
      case 'custom':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
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

  const categories = connector.categories
    ? connector.categories.split(';').map(c => c.trim()).filter(Boolean)
    : [];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
      {/* Header with icon and type badge */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ backgroundColor: connector.brandColor }}
        >
          {connector.displayName.charAt(0).toUpperCase()}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(connector.type)}`}>
          {getTypeBadgeLabel(connector.type)}
        </span>
      </div>

      {/* Title and Publisher */}
      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
        {connector.displayName}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {connector.publisher}
      </p>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
        {connector.description}
      </p>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {categories.slice(0, 3).map((category, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {category}
            </span>
          ))}
          {categories.length > 3 && (
            <span className="px-2 py-0.5 text-gray-600 dark:text-gray-400 text-xs">
              +{categories.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{connector.operationCount} operations</span>
        {connector.hasTriggers && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Triggers
          </span>
        )}
      </div>
    </div>
  );
}
