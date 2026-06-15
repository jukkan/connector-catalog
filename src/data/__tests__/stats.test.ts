import { describe, it, expect } from 'vitest';
import stats from '../stats.json';
import connectors from '../connectors.json';

describe('stats.json consistency', () => {
  it('stats.total matches the length of connectors.json array', () => {
    expect(stats.total).toBe(connectors.length);
  });

  it('sum of stats.byType equals stats.total', () => {
    const sum = Object.values(stats.byType).reduce((a, b) => a + b, 0);
    expect(sum).toBe(stats.total);
  });

  it('sum of stats.byAuthType equals stats.total', () => {
    const sum = Object.values(stats.byAuthType).reduce((a, b) => a + b, 0);
    expect(sum).toBe(stats.total);
  });

  it('stats.timestamp is a valid ISO 8601 date string', () => {
    const date = new Date(stats.timestamp);
    expect(date.toString()).not.toBe('Invalid Date');
    expect(stats.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('stats.byType contains keys certified, independent, custom', () => {
    expect(stats.byType).toHaveProperty('certified');
    expect(stats.byType).toHaveProperty('independent');
    expect(stats.byType).toHaveProperty('custom');
  });

  it('stats.recentlyUpdated is a non-negative number', () => {
    expect(stats.recentlyUpdated).toBeGreaterThanOrEqual(0);
  });

  it('stats.recentlyAdded is a non-negative number', () => {
    expect(stats.recentlyAdded).toBeGreaterThanOrEqual(0);
  });

  it('stats.byCapability is an object', () => {
    expect(typeof stats.byCapability).toBe('object');
    expect(stats.byCapability).not.toBeNull();
  });

  it('stats.withPrivacyPolicy is a non-negative number', () => {
    expect(stats.withPrivacyPolicy).toBeGreaterThanOrEqual(0);
  });
});
