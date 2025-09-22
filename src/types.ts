export interface TanqoryConfig {
  baseURL: string;
  storeId?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  apiKey?: string;
  tokenStorage?: 'memory' | 'env';
  logLevel?: LogLevel;
  enableCaching?: boolean;
  cacheTTL?: number;
  hmacSecret?: string;
  enableTokenRefresh?: boolean;
  autoRetry?: boolean;
  autoRefreshToken?: boolean;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface TokenSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: 'Bearer';
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  response?: {
    data: unknown;
    status: number;
    statusText: string;
  };
}

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  skipAuth?: boolean;
  skipCache?: boolean;
  retries?: number;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
