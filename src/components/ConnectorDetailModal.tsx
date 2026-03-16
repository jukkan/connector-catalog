import { useEffect } from 'react';
import type { Connector } from '../types';

interface ConnectorDetailModalProps {
  connector: Connector;
  onClose: () => void;
}

const typeDirectoryMap: Record<string, string> = {
  certified: 'certified-connectors',
  independent: 'independent-publisher-connectors',
  custom: 'custom-connectors',
};

function getTypeBadgeColor(type: string) {
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
}

function getTypeBadgeLabel(type: string) {
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
}

function getAuthTypeLabel(authType: string) {
  switch (authType) {
    case 'oauth2':
      return 'OAuth 2.0';
    case 'apiKey':
      return 'API Key';
    case 'basic':
      return 'Basic';
    case 'none':
      return 'None';
    default:
      return authType;
  }
}

function buildMicrosoftLearnUrl(connectorId: string) {
  const slug = connectorId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  return `https://learn.microsoft.com/en-us/connectors/${encodeURIComponent(slug)}/`;
}

function buildGitHubSourceUrl(connectorId: string, type: string) {
  const dir = typeDirectoryMap[type] || 'certified-connectors';
  return `https://github.com/microsoft/PowerPlatformConnectors/tree/dev/${dir}/${encodeURIComponent(connectorId)}`;
}

export default function ConnectorDetailModal({ connector, onClose }: ConnectorDetailModalProps) {
  const categories = connector.categories
    ? connector.categories.split(';').map(c => c.trim()).filter(Boolean)
    : [];

  const vendorUrl = connector.contactUrl || connector.website;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: connector.brandColor }}
          >
            {connector.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {connector.displayName}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {connector.publisher}
              </p>
              {connector.apiVersion && (
                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  API v{connector.apiVersion}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label="Close detail view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {/* Vendor URL - prominently displayed */}
          {vendorUrl && (
            <a
              href={vendorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {vendorUrl}
            </a>
          )}

          {/* Description */}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {connector.description}
          </p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</span>
              <div className="mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(connector.type)}`}>
                  {getTypeBadgeLabel(connector.type)}
                </span>
              </div>
            </div>

            {/* Auth */}
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Authentication</span>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getAuthTypeLabel(connector.authType)}
              </p>
            </div>

            {/* Actions */}
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</span>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {connector.actionCount}
              </p>
            </div>

            {/* Triggers */}
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Triggers</span>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {connector.hasTriggers ? <><span aria-hidden="true">⚡</span> {connector.triggerCount}</> : 'None'}
              </p>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Categories</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {connector.capabilities && connector.capabilities.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Capabilities</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {connector.capabilities.map(cap => (
                  <span
                    key={cap}
                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">More Information</span>

            {connector.contactUrl && (
              <a
                href={connector.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {connector.contactName || 'Vendor Website'}
              </a>
            )}

            {connector.website && connector.website !== connector.contactUrl && (
              <a
                href={connector.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Vendor Website
              </a>
            )}

            {connector.privacyPolicy && (
              <a
                href={connector.privacyPolicy}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Privacy Policy
              </a>
            )}

            <a
              href={buildMicrosoftLearnUrl(connector.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Microsoft Learn Documentation
            </a>

            <a
              href={buildGitHubSourceUrl(connector.id, connector.type)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Connector Source (GitHub)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
