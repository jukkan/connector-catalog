import { describe, it, expect } from 'vitest';
import type { Connector } from '../../types';
import {
  formatRelativeDate,
  formatFullDate,
  getConnectorListKey,
  getUpdateFreshness,
  sortConnectors,
  getRecentlyUpdated,
  getRecentlyAdded,
} from '../connectorUtils';

/** Build a partial Connector with sensible defaults. */
function makeConnector(overrides: Partial<Connector> = {}): Connector {
  return {
    id: 'test',
    displayName: 'Test Connector',
    description: 'A test connector',
    publisher: 'Test Publisher',
    type: 'certified',
    brandColor: '#000000',
    authType: 'apiKey',
    operationCount: 5,
    actionCount: 4,
    triggerCount: 1,
    hasTriggers: true,
    categories: 'Testing',
    website: null,
    contactUrl: null,
    contactName: null,
    firstCommitDate: null,
    lastCommitDate: null,
    apiVersion: null,
    privacyPolicy: null,
    capabilities: [],
    ...overrides,
  };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// formatRelativeDate
// ---------------------------------------------------------------------------
describe('formatRelativeDate', () => {
  it('returns "Today" for today\'s date', () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe('Today');
  });

  it('returns "Xd ago" for dates within last week', () => {
    expect(formatRelativeDate(daysAgo(3))).toBe('3d ago');
  });

  it('returns "Xw ago" for dates within last month', () => {
    expect(formatRelativeDate(daysAgo(14))).toBe('2w ago');
  });

  it('returns "Xmo ago" for dates within last year', () => {
    expect(formatRelativeDate(daysAgo(125))).toBe('4mo ago');
  });

  it('returns "Xy ago" for dates over a year old', () => {
    expect(formatRelativeDate(daysAgo(400))).toBe('1y ago');
  });

  it('returns "Unknown" for null input', () => {
    expect(formatRelativeDate(null)).toBe('Unknown');
  });

  it('returns "Unknown" for invalid date string', () => {
    expect(formatRelativeDate('not-a-date')).toBe('Unknown');
  });
});

// ---------------------------------------------------------------------------
// formatFullDate
// ---------------------------------------------------------------------------
describe('formatFullDate', () => {
  it('formats a valid date as "Month DD, YYYY"', () => {
    // Use a fixed date that is unambiguous
    const result = formatFullDate('2026-03-16T00:00:00Z');
    expect(result).toMatch(/March 1[56], 2026/);
  });

  it('returns "Unknown" for null', () => {
    expect(formatFullDate(null)).toBe('Unknown');
  });

  it('returns "Unknown" for invalid input', () => {
    expect(formatFullDate('garbage')).toBe('Unknown');
  });
});

// ---------------------------------------------------------------------------
// getConnectorListKey
// ---------------------------------------------------------------------------
describe('getConnectorListKey', () => {
  it('distinguishes connectors that share the same id across types', () => {
    const certifiedKey = getConnectorListKey(makeConnector({ id: 'CardPlatform', type: 'certified' }));
    const customKey = getConnectorListKey(makeConnector({ id: 'CardPlatform', type: 'custom' }));

    expect(certifiedKey).toBe('certified:CardPlatform');
    expect(customKey).toBe('custom:CardPlatform');
    expect(certifiedKey).not.toBe(customKey);
  });
});

// ---------------------------------------------------------------------------
// getUpdateFreshness
// ---------------------------------------------------------------------------
describe('getUpdateFreshness', () => {
  it('returns green for date 30 days ago', () => {
    const result = getUpdateFreshness(daysAgo(30));
    expect(result.color).toBe('bg-green-500');
    expect(result.label).toBe('Recently updated');
  });

  it('returns yellow for date 200 days ago', () => {
    const result = getUpdateFreshness(daysAgo(200));
    expect(result.color).toBe('bg-yellow-500');
    expect(result.label).toBe('Updated this year');
  });

  it('returns gray for date 400 days ago', () => {
    const result = getUpdateFreshness(daysAgo(400));
    expect(result.color).toBe('bg-gray-400');
    expect(result.label).toBe('Not recently updated');
  });

  it('returns gray with "Unknown" label for null', () => {
    const result = getUpdateFreshness(null);
    expect(result.color).toBe('bg-gray-300');
    expect(result.label).toBe('Unknown');
  });
});

// ---------------------------------------------------------------------------
// sortConnectors
// ---------------------------------------------------------------------------
describe('sortConnectors', () => {
  const connectors = [
    makeConnector({
      id: 'c',
      displayName: 'Charlie',
      publisher: 'Bravo',
      operationCount: 10,
      firstCommitDate: '2024-01-01T00:00:00Z',
      lastCommitDate: '2025-06-01T00:00:00Z',
    }),
    makeConnector({
      id: 'a',
      displayName: 'Alpha',
      publisher: 'Alpha',
      operationCount: 30,
      firstCommitDate: '2025-06-01T00:00:00Z',
      lastCommitDate: '2026-01-01T00:00:00Z',
    }),
    makeConnector({
      id: 'b',
      displayName: 'Bravo',
      publisher: 'Alpha',
      operationCount: 20,
      firstCommitDate: '2023-01-01T00:00:00Z',
      lastCommitDate: null,
    }),
  ];

  it('sorts by name ascending', () => {
    const result = sortConnectors(connectors, 'name-asc');
    expect(result.map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by name descending', () => {
    const result = sortConnectors(connectors, 'name-desc');
    expect(result.map((c) => c.id)).toEqual(['c', 'b', 'a']);
  });

  it('sorts by operations descending', () => {
    const result = sortConnectors(connectors, 'operations-desc');
    expect(result.map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by publisher ascending, then by name', () => {
    const result = sortConnectors(connectors, 'publisher-asc');
    expect(result.map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by updated (lastCommitDate) descending with nulls last', () => {
    const result = sortConnectors(connectors, 'updated');
    expect(result.map((c) => c.id)).toEqual(['a', 'c', 'b']);
  });

  it('sorts by added (firstCommitDate) descending with nulls last', () => {
    const result = sortConnectors(connectors, 'added');
    expect(result.map((c) => c.id)).toEqual(['a', 'c', 'b']);
  });

  it('does not mutate the original array', () => {
    const original = [...connectors];
    sortConnectors(connectors, 'name-desc');
    expect(connectors.map((c) => c.id)).toEqual(original.map((c) => c.id));
  });
});

// ---------------------------------------------------------------------------
// getRecentlyUpdated
// ---------------------------------------------------------------------------
describe('getRecentlyUpdated', () => {
  it('returns only connectors updated within the time window', () => {
    const connectors = [
      makeConnector({ id: 'recent', lastCommitDate: daysAgo(10) }),
      makeConnector({ id: 'old', lastCommitDate: daysAgo(100) }),
    ];
    const result = getRecentlyUpdated(connectors, 60);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('recent');
  });

  it('returns empty array when no connectors match', () => {
    const connectors = [
      makeConnector({ id: 'old', lastCommitDate: daysAgo(200) }),
    ];
    expect(getRecentlyUpdated(connectors, 30)).toEqual([]);
  });

  it('excludes connectors with null dates', () => {
    const connectors = [
      makeConnector({ id: 'null-date', lastCommitDate: null }),
      makeConnector({ id: 'recent', lastCommitDate: daysAgo(5) }),
    ];
    const result = getRecentlyUpdated(connectors, 60);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('recent');
  });

  it('uses 60 days as default window', () => {
    const connectors = [
      makeConnector({ id: 'within', lastCommitDate: daysAgo(50) }),
      makeConnector({ id: 'outside', lastCommitDate: daysAgo(70) }),
    ];
    const result = getRecentlyUpdated(connectors);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('within');
  });
});

// ---------------------------------------------------------------------------
// getRecentlyAdded
// ---------------------------------------------------------------------------
describe('getRecentlyAdded', () => {
  it('returns only connectors added within the time window', () => {
    const connectors = [
      makeConnector({ id: 'new', firstCommitDate: daysAgo(30) }),
      makeConnector({ id: 'old', firstCommitDate: daysAgo(200) }),
    ];
    const result = getRecentlyAdded(connectors, 90);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('new');
  });

  it('returns empty array when no connectors match', () => {
    const connectors = [
      makeConnector({ id: 'old', firstCommitDate: daysAgo(365) }),
    ];
    expect(getRecentlyAdded(connectors, 90)).toEqual([]);
  });

  it('excludes connectors with null dates', () => {
    const connectors = [
      makeConnector({ id: 'null-date', firstCommitDate: null }),
      makeConnector({ id: 'new', firstCommitDate: daysAgo(10) }),
    ];
    const result = getRecentlyAdded(connectors, 90);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('new');
  });

  it('uses 90 days as default window', () => {
    const connectors = [
      makeConnector({ id: 'within', firstCommitDate: daysAgo(80) }),
      makeConnector({ id: 'outside', firstCommitDate: daysAgo(100) }),
    ];
    const result = getRecentlyAdded(connectors);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('within');
  });
});
