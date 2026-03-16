export interface Connector {
  id: string;
  displayName: string;
  description: string;
  publisher: string;
  type: 'certified' | 'independent' | 'custom';
  brandColor: string;
  authType: 'oauth2' | 'apiKey' | 'basic' | 'none';
  operationCount: number;
  actionCount: number;
  triggerCount: number;
  hasTriggers: boolean;
  categories: string | null;
  website: string | null;
  contactUrl: string | null;
  contactName: string | null;
}

export interface Stats {
  total: number;
  byType: {
    certified: number;
    independent: number;
    custom: number;
  };
  byCategory: Record<string, number>;
  byAuthType: {
    apiKey: number;
    none: number;
    oauth2: number;
    basic: number;
  };
  timestamp: string;
}

export type SortOption = 'name-asc' | 'name-desc' | 'operations-desc' | 'publisher-asc';

export interface FilterState {
  search: string;
  types: string[];
  authTypes: string[];
  hasTriggers: boolean | null;
  categories: string[];
  sort: SortOption;
}
