export interface TanqoryConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  apiKey?: string;
  tokenStorage?: 'memory' | 'env';
  logLevel?: LogLevel;
  enableCaching?: boolean;
  cacheTTL?: number;
  hmacSecret?: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  response?: {
    data: any;
    status: number;
    statusText: string;
  };
}

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  skipAuth?: boolean;
  skipCache?: boolean;
  retries?: number;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
