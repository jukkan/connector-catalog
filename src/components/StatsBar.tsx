type StatAction = 'all' | 'updated' | 'new' | 'triggers';

interface StatsBarProps {
  totalConnectors: number;
  updatedThisMonth: number;
  newConnectors: number;
  withTriggers: number;
  onStatClick: (action: StatAction) => void;
}

export default function StatsBar({
  totalConnectors,
  updatedThisMonth,
  newConnectors,
  withTriggers,
  onStatClick,
}: StatsBarProps) {
  const items: { label: string; action: StatAction }[] = [
    { label: `${totalConnectors.toLocaleString()} connectors`, action: 'all' },
    { label: `${newConnectors} new`, action: 'new' },
    { label: `${updatedThisMonth} updated this month`, action: 'updated' },
    { label: `${withTriggers.toLocaleString()} with triggers`, action: 'triggers' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap text-sm">
      {items.map(({ label, action }, i) => (
        <span key={action} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>}
          <button
            onClick={() => onStatClick(action)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors cursor-pointer"
          >
            {label}
          </button>
        </span>
      ))}
    </div>
  );
}
