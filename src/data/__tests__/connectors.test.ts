import { describe, it, expect } from 'vitest';
import connectors from '../connectors.json';

describe('connectors.json schema validation', () => {
  it('should have more than 1000 connectors', () => {
    expect(connectors.length).toBeGreaterThan(1000);
  });

  it('every connector has non-empty id, displayName, type', () => {
    for (const connector of connectors) {
      expect(connector.id).toBeTruthy();
      expect(connector.displayName).toBeTruthy();
      expect(connector.type).toBeTruthy();
    }
  });

  it('type is always one of certified, independent, custom', () => {
    const validTypes = ['certified', 'independent', 'custom'];
    for (const connector of connectors) {
      expect(validTypes).toContain(connector.type);
    }
  });

  it('authType is always one of oauth2, apiKey, basic, none', () => {
    const validAuthTypes = ['oauth2', 'apiKey', 'basic', 'none'];
    for (const connector of connectors) {
      expect(validAuthTypes).toContain(connector.authType);
    }
  });

  it('operationCount, actionCount, triggerCount are >= 0', () => {
    for (const connector of connectors) {
      expect(connector.operationCount).toBeGreaterThanOrEqual(0);
      expect(connector.actionCount).toBeGreaterThanOrEqual(0);
      expect(connector.triggerCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('hasTriggers is consistent with triggerCount', () => {
    for (const connector of connectors) {
      expect(connector.hasTriggers).toBe(connector.triggerCount > 0);
    }
  });

  it('more than 90% of connectors have non-null categories', () => {
    const withCategories = connectors.filter(c => c.categories !== null).length;
    expect(withCategories / connectors.length).toBeGreaterThan(0.9);
  });

  it('has no duplicate id values within the same type', () => {
    const seen = new Set<string>();
    for (const connector of connectors) {
      const key = `${connector.type}:${connector.id}`;
      expect(seen.has(key), `duplicate type:id "${key}"`).toBe(false);
      seen.add(key);
    }
  });

  it('brandColor is null or matches hex color pattern', () => {
    const hexPattern = /^#[0-9a-fA-F]{3,8}$/;
    for (const connector of connectors) {
      if (connector.brandColor !== null) {
        expect(connector.brandColor).toMatch(hexPattern);
      }
    }
  });

  it('publisher is non-empty for more than 90% of connectors', () => {
    const withPublisher = connectors.filter(c => c.publisher && c.publisher.length > 0).length;
    expect(withPublisher / connectors.length).toBeGreaterThan(0.9);
  });

  it('description is non-empty for more than 90% of connectors', () => {
    const withDescription = connectors.filter(c => c.description && c.description.length > 0).length;
    expect(withDescription / connectors.length).toBeGreaterThan(0.9);
  });
});
