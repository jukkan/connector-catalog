type StatAction = 'all' | 'updated' | 'new' | 'triggers';

interface StatsBarProps {
  totalConnectors: number;
  updatedThisMonth: number;
  newConnectors: number;
  withTriggers: number;
  onStatClick: (action: StatAction) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface StatCard {
  action: StatAction;
  count: number;
  label: string;
  accent: string;
  icon: React.ReactNode;
}

export default function StatsBar({
  totalConnectors,
  updatedThisMonth,
  newConnectors,
  withTriggers,
  onStatClick,
  collapsed,
  onToggleCollapse,
}: StatsBarProps) {
  const handleKeyDown = (action: StatAction) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStatClick(action);
    }
  };

  const cards: StatCard[] = [
    {
      action: 'all',
      count: totalConnectors,
      label: 'Total Connectors',
      accent: 'border-l-blue-500',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      action: 'updated',
      count: updatedThisMonth,
      label: 'Updated This Month',
      accent: 'border-l-green-500',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      action: 'new',
      count: newConnectors,
      label: 'New Connectors',
      accent: 'border-l-purple-500',
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      action: 'triggers',
      count: withTriggers,
      label: 'With Triggers',
      accent: 'border-l-amber-500',
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Catalog summary
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Quick shortcuts for popular connector views.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          aria-controls="stats-grid"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {collapsed ? 'Show cards' : 'Hide cards'}
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div id="stats-grid" className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map(({ action, count, label, accent, icon }) => (
              <div
                key={action}
                role="button"
                tabIndex={0}
                onClick={() => onStatClick(action)}
                onKeyDown={handleKeyDown(action)}
                className={`bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700
                  rounded-lg p-4 border-l-4 ${accent} cursor-pointer
                  hover:shadow-md hover:bg-white dark:hover:bg-gray-700 transition-all`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {icon}
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {count.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
