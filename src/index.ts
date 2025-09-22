export { TanqoryApiClient } from './api-client';
export { TanqoryLogger } from './logger';
export { TokenManager } from './token-manager';
export { MemoryCache } from './cache';
export { SecurityUtils } from './security';
export { TanqoryError } from './errors';
export * from './types';

import { TanqoryApiClient } from './api-client';
import { TanqoryConfig } from './types';

// Factory function for creating client instances
export function createClient(config: TanqoryConfig): TanqoryApiClient {
  return new TanqoryApiClient(config);
}

// Default export for convenience
export { TanqoryApiClient as default } from './api-client';
