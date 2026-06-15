import type { Connector, SortOption } from '../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / MS_PER_DAY);
}

/**
 * Format a date string as relative time: "3d ago", "2w ago", "5mo ago", "1y ago"
 * Returns "Unknown" for invalid/null input.
 */
export function formatRelativeDate(dateStr: string | null): string {
  const date = parseDate(dateStr);
  if (!date) return 'Unknown';

  const now = new Date();
  const days = daysBetween(now, date);

  if (days === 0) return 'Today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * Format a date string as full date: "March 16, 2026"
 * Returns "Unknown" for invalid/null input.
 */
export function formatFullDate(dateStr: string | null): string {
  const date = parseDate(dateStr);
  if (!date) return 'Unknown';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get freshness indicator for a connector's last commit date.
 * Returns Tailwind color class and label.
 */
export function getUpdateFreshness(dateStr: string | null): { color: string; label: string } {
  const date = parseDate(dateStr);
  if (!date) return { color: 'bg-gray-300', label: 'Unknown' };

  const days = daysBetween(new Date(), date);

  if (days < 90) return { color: 'bg-green-500', label: 'Recently updated' };
  if (days < 365) return { color: 'bg-yellow-500', label: 'Updated this year' };
  return { color: 'bg-gray-400', label: 'Not recently updated' };
}

/**
 * Build a stable React list key for connector cards.
 */
export function getConnectorListKey(connector: Pick<Connector, 'id' | 'type'>): string {
  return `${connector.type}:${connector.id}`;
}

/**
 * Sort connectors by the given sort option.
 * Returns a new sorted array (does not mutate the input).
 */
export function sortConnectors(connectors: Connector[], sortBy: SortOption): Connector[] {
  const sorted = [...connectors];

  switch (sortBy) {
    case 'updated':
      return sorted.sort((a, b) => {
        if (!a.lastCommitDate && !b.lastCommitDate) return 0;
        if (!a.lastCommitDate) return 1;
        if (!b.lastCommitDate) return -1;
        return new Date(b.lastCommitDate).getTime() - new Date(a.lastCommitDate).getTime();
      });

    case 'added':
      return sorted.sort((a, b) => {
        if (!a.firstCommitDate && !b.firstCommitDate) return 0;
        if (!a.firstCommitDate) return 1;
        if (!b.firstCommitDate) return -1;
        return new Date(b.firstCommitDate).getTime() - new Date(a.firstCommitDate).getTime();
      });

    case 'name-asc':
      return sorted.sort((a, b) => a.displayName.localeCompare(b.displayName));

    case 'name-desc':
      return sorted.sort((a, b) => b.displayName.localeCompare(a.displayName));

    case 'operations-desc':
      return sorted.sort((a, b) => b.operationCount - a.operationCount);

    case 'publisher-asc':
      return sorted.sort((a, b) =>
        a.publisher.localeCompare(b.publisher) || a.displayName.localeCompare(b.displayName)
      );
  }
}

/**
 * Filter connectors updated within the last N days (default 60).
 * Returns sorted by lastCommitDate descending.
 */
export function getRecentlyUpdated(connectors: Connector[], days: number = 60): Connector[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return connectors
    .filter((c) => {
      const date = parseDate(c.lastCommitDate);
      return date !== null && date >= cutoff;
    })
    .sort((a, b) =>
      new Date(b.lastCommitDate!).getTime() - new Date(a.lastCommitDate!).getTime()
    );
}

/**
 * Filter connectors first added within the last N days (default 90).
 * Returns sorted by firstCommitDate descending.
 */
export function getRecentlyAdded(connectors: Connector[], days: number = 90): Connector[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return connectors
    .filter((c) => {
      const date = parseDate(c.firstCommitDate);
      return date !== null && date >= cutoff;
    })
    .sort((a, b) =>
      new Date(b.firstCommitDate!).getTime() - new Date(a.firstCommitDate!).getTime()
    );
}
