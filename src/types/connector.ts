export interface Connector {
  id: string;
  displayName: string;
  description: string;
  publisher: string;
  type: string;
  brandColor: string | null;
  authType: string;
  operationCount: number;
  actionCount: number;
  triggerCount: number;
  hasTriggers: boolean;
  categories: string | null;
  website: string | null;
}
