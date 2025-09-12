import { CacheEntry } from './types';

/**
 * @aiDescription In-memory cache with TTL support and ETag-based conditional requests for API response optimization
 * @aiPurpose read
 * @aiModifiable true
 * @aiRiskLevel medium
 * @aiSecurityCritical false
 * @aiBusinessCritical false
 * @aiPerformanceCritical true
 * @aiDomain caching
 * @aiLayer service
 * @aiCapabilities ['CACHE_SET', 'CACHE_GET', 'TTL_MANAGEMENT', 'ETAG_SUPPORT', 'CACHE_CLEANUP']
 * @aiDependencies ['types']
 * @aiBusinessRules ['ttl-expiration', 'memory-efficient', 'etag-conditional-requests']
 * @aiValidationRules ['ttl-positive-value', 'cache-key-uniqueness']
 * @aiCurrentGaps ['no-memory-limits', 'no-lru-eviction', 'basic-cleanup-strategy']
 * @aiImprovementHints [
 *   'implement-lru-eviction-when-memory-limit-reached',
 *   'add-cache-statistics-and-hit-rate-metrics',
 *   'implement-cache-warming-strategies',
 *   'add-cache-compression-for-large-objects',
 *   'implement-background-cleanup-scheduler'
 * ]
 * @aiTestScenarios ['cache-hit-miss', 'ttl-expiration', 'etag-handling', 'memory-cleanup']
 * @aiErrorPrevention Validate TTL values, check for memory leaks, handle cache key collisions
 */
export class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) {
    // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  private generateKey(url: string, method: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramString}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  set<T>(
    url: string,
    method: string,
    data: T,
    params?: Record<string, any>,
    ttl?: number,
    etag?: string
  ): void {
    const key = this.generateKey(url, method, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      etag,
    };

    this.cache.set(key, entry);
  }

  get<T>(url: string, method: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(url, method, params);
    const entry = this.cache.get(key);

    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.cache.delete(key);
      }
      return null;
    }

    return entry.data as T;
  }

  getEtag(url: string, method: string, params?: Record<string, any>): string | undefined {
    const key = this.generateKey(url, method, params);
    const entry = this.cache.get(key);

    if (!entry || this.isExpired(entry)) {
      return undefined;
    }

    return entry.etag;
  }

  invalidate(url: string, method: string, params?: Record<string, any>): void {
    const key = this.generateKey(url, method, params);
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    });
  }
}
