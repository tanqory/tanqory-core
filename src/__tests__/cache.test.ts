import { MemoryCache } from '@/cache';

describe('MemoryCache', () => {
  let cache: MemoryCache;
  const defaultTTL = 300000; // 5 minutes

  beforeEach(() => {
    cache = new MemoryCache(defaultTTL);
  });

  describe('Basic Operations', () => {
    it('should initialize with default TTL', () => {
      const defaultCache = new MemoryCache();
      expect(defaultCache).toBeDefined();
    });

    it('should store and retrieve data', () => {
      const testData = { id: 1, name: 'test' };
      cache.set('https://api.test.com/users', 'GET', testData);

      const retrieved = cache.get('https://api.test.com/users', 'GET');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent data', () => {
      const result = cache.get('https://api.test.com/nonexistent', 'GET');
      expect(result).toBeNull();
    });

    it('should handle different HTTP methods', () => {
      const getData = { id: 1, name: 'get' };
      const postData = { id: 2, name: 'post' };

      cache.set('https://api.test.com/users', 'GET', getData);
      cache.set('https://api.test.com/users', 'POST', postData);

      expect(cache.get('https://api.test.com/users', 'GET')).toEqual(getData);
      expect(cache.get('https://api.test.com/users', 'POST')).toEqual(postData);
    });

    it('should handle parameters in cache key', () => {
      const params1 = { page: 1, limit: 10 };
      const params2 = { page: 2, limit: 10 };
      const data1 = { users: ['user1'] };
      const data2 = { users: ['user2'] };

      cache.set('https://api.test.com/users', 'GET', data1, params1);
      cache.set('https://api.test.com/users', 'GET', data2, params2);

      expect(cache.get('https://api.test.com/users', 'GET', params1)).toEqual(data1);
      expect(cache.get('https://api.test.com/users', 'GET', params2)).toEqual(data2);
    });
  });

  describe('TTL and Expiration', () => {
    it('should use custom TTL', () => {
      const customTTL = 1000; // 1 second
      const testData = { id: 1, name: 'test' };

      cache.set('https://api.test.com/users', 'GET', testData, undefined, customTTL);

      // Should be available immediately
      expect(cache.get('https://api.test.com/users', 'GET')).toEqual(testData);
    });

    it('should expire data after TTL', (done) => {
      const shortTTL = 100; // 100ms
      const testData = { id: 1, name: 'test' };

      cache.set('https://api.test.com/users', 'GET', testData, undefined, shortTTL);

      // Should be available immediately
      expect(cache.get('https://api.test.com/users', 'GET')).toEqual(testData);

      // Should expire after TTL
      setTimeout(() => {
        expect(cache.get('https://api.test.com/users', 'GET')).toBeNull();
        done();
      }, shortTTL + 50);
    });

    it('should use default TTL when not specified', () => {
      const testData = { id: 1, name: 'test' };
      cache.set('https://api.test.com/users', 'GET', testData);

      // Should be available with default TTL
      expect(cache.get('https://api.test.com/users', 'GET')).toEqual(testData);
    });
  });

  describe('ETag Support', () => {
    it('should store and retrieve ETag', () => {
      const testData = { id: 1, name: 'test' };
      const etag = '"12345-abcde"';

      cache.set('https://api.test.com/users', 'GET', testData, undefined, undefined, etag);

      const retrievedEtag = cache.getEtag('https://api.test.com/users', 'GET');
      expect(retrievedEtag).toBe(etag);
    });

    it('should return undefined for non-existent ETag', () => {
      const etag = cache.getEtag('https://api.test.com/nonexistent', 'GET');
      expect(etag).toBeUndefined();
    });

    it('should return undefined for expired ETag', (done) => {
      const shortTTL = 100;
      const testData = { id: 1, name: 'test' };
      const etag = '"12345-abcde"';

      cache.set('https://api.test.com/users', 'GET', testData, undefined, shortTTL, etag);

      setTimeout(() => {
        const retrievedEtag = cache.getEtag('https://api.test.com/users', 'GET');
        expect(retrievedEtag).toBeUndefined();
        done();
      }, shortTTL + 50);
    });
  });

  describe('Cache Management', () => {
    it('should invalidate specific cache entry', () => {
      const testData = { id: 1, name: 'test' };
      cache.set('https://api.test.com/users', 'GET', testData);

      expect(cache.get('https://api.test.com/users', 'GET')).toEqual(testData);

      cache.invalidate('https://api.test.com/users', 'GET');
      expect(cache.get('https://api.test.com/users', 'GET')).toBeNull();
    });

    it('should clear all cache entries', () => {
      const testData1 = { id: 1, name: 'test1' };
      const testData2 = { id: 2, name: 'test2' };

      cache.set('https://api.test.com/users/1', 'GET', testData1);
      cache.set('https://api.test.com/users/2', 'GET', testData2);

      expect(cache.get('https://api.test.com/users/1', 'GET')).toEqual(testData1);
      expect(cache.get('https://api.test.com/users/2', 'GET')).toEqual(testData2);

      cache.clear();

      expect(cache.get('https://api.test.com/users/1', 'GET')).toBeNull();
      expect(cache.get('https://api.test.com/users/2', 'GET')).toBeNull();
    });

    it('should cleanup expired entries', (done) => {
      const shortTTL = 100;
      const longTTL = 5000;

      const expiredData = { id: 1, name: 'expired' };
      const validData = { id: 2, name: 'valid' };

      cache.set('https://api.test.com/expired', 'GET', expiredData, undefined, shortTTL);
      cache.set('https://api.test.com/valid', 'GET', validData, undefined, longTTL);

      setTimeout(() => {
        cache.cleanup();

        expect(cache.get('https://api.test.com/expired', 'GET')).toBeNull();
        expect(cache.get('https://api.test.com/valid', 'GET')).toEqual(validData);
        done();
      }, shortTTL + 50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined parameters', () => {
      const testData = { id: 1, name: 'test' };

      cache.set('https://api.test.com/users', 'GET', testData, undefined);
      expect(cache.get('https://api.test.com/users', 'GET', undefined)).toEqual(testData);
    });

    it('should handle empty parameters', () => {
      const testData = { id: 1, name: 'test' };

      cache.set('https://api.test.com/users', 'GET', testData, {});
      expect(cache.get('https://api.test.com/users', 'GET', {})).toEqual(testData);
    });

    it('should differentiate between different parameter combinations', () => {
      const testData1 = { id: 1, name: 'test1' };
      const testData2 = { id: 2, name: 'test2' };

      cache.set('https://api.test.com/users', 'GET', testData1, { page: 1 });
      cache.set('https://api.test.com/users', 'GET', testData2, { page: 1, sort: 'name' });

      expect(cache.get('https://api.test.com/users', 'GET', { page: 1 })).toEqual(testData1);
      expect(cache.get('https://api.test.com/users', 'GET', { page: 1, sort: 'name' })).toEqual(
        testData2
      );
    });
  });
});
