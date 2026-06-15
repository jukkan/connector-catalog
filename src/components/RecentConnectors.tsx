import { useMemo } from 'react';
import type { Connector } from '../types';
import { formatRelativeDate } from '../utils/connectorUtils';

interface RecentConnectorsProps {
  connectors: Connector[];
  onConnectorClick: (connector: Connector) => void;
  onViewNew: () => void;
  onViewUpdated: () => void;
}

const NEW_WINDOW_MS = 90 * 86400000;
const UPDATED_WINDOW_MS = 30 * 86400000;
const MAX_CARDS = 12;

function MiniCard({
  connector,
  date,
  onClick,
}: {
  connector: Connector;
  date: string | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-2.5 p-3 w-48 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-all text-left"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ backgroundColor: connector.brandColor ?? '#6B7280' }}
      >
        {connector.displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate leading-tight">
          {connector.displayName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {formatRelativeDate(date)}
        </p>
      </div>
    </button>
  );
}

function ConnectorRow({
  label,
  connectors,
  dateField,
  onConnectorClick,
  onViewAll,
}: {
  label: string;
  connectors: Connector[];
  dateField: 'firstCommitDate' | 'lastCommitDate';
  onConnectorClick: (c: Connector) => void;
  onViewAll: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all →
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {connectors.map(connector => (
          <MiniCard
            key={`${connector.type}:${connector.id}`}
            connector={connector}
            date={connector[dateField]}
            onClick={() => onConnectorClick(connector)}
          />
        ))}
      </div>
    </div>
  );
}

export default function RecentConnectors({
  connectors,
  onConnectorClick,
  onViewNew,
  onViewUpdated,
}: RecentConnectorsProps) {
  const { newList, updatedList } = useMemo(() => {
    const now = Date.now();
    const newCutoff = now - NEW_WINDOW_MS;
    const updatedCutoff = now - UPDATED_WINDOW_MS;

    const isNew = (c: Connector) =>
      c.firstCommitDate != null && new Date(c.firstCommitDate).getTime() >= newCutoff;

    const newList = connectors
      .filter(isNew)
      .sort((a, b) => new Date(b.firstCommitDate!).getTime() - new Date(a.firstCommitDate!).getTime())
      .slice(0, MAX_CARDS);

    const updatedList = connectors
      .filter(
        c =>
          !isNew(c) &&
          c.lastCommitDate != null &&
          new Date(c.lastCommitDate).getTime() >= updatedCutoff
      )
      .sort((a, b) => new Date(b.lastCommitDate!).getTime() - new Date(a.lastCommitDate!).getTime())
      .slice(0, MAX_CARDS);

    return { newList, updatedList };
  }, [connectors]);

  if (newList.length === 0 && updatedList.length === 0) return null;

  return (
    <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-5">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">What's New</h2>
      {newList.length > 0 && (
        <ConnectorRow
          label="New connectors"
          connectors={newList}
          dateField="firstCommitDate"
          onConnectorClick={onConnectorClick}
          onViewAll={onViewNew}
        />
      )}
      {updatedList.length > 0 && (
        <ConnectorRow
          label="Recently updated"
          connectors={updatedList}
          dateField="lastCommitDate"
          onConnectorClick={onConnectorClick}
          onViewAll={onViewUpdated}
        />
      )}
    </section>
  );
}
