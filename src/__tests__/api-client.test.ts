import { TanqoryApiClient } from '@/api-client';
import { TanqoryConfig, TokenData } from '@/types';
import axios from 'axios';
import { TanqoryError } from '@/errors';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TanqoryApiClient', () => {
  const mockConfig: TanqoryConfig = {
    baseURL: 'https://api.test.com',
    timeout: 5000,
    retries: 2,
    logLevel: 'error',
  };

  let client: TanqoryApiClient;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock axios.create
    const mockAxiosInstance = {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    client = new TanqoryApiClient(mockConfig);
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      const defaultClient = new TanqoryApiClient({ baseURL: 'https://api.test.com' });
      expect(defaultClient).toBeDefined();
    });

    it('should merge provided config with defaults', () => {
      expect(client).toBeDefined();
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: mockConfig.baseURL,
        timeout: mockConfig.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': '@tanqory/core/1.0.0',
        },
      });
    });
  });

  describe('Token Management', () => {
    it('should set token data', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() / 1000 + 3600,
        tokenType: 'Bearer',
      };

      expect(() => client.setToken(tokenData)).not.toThrow();
    });

    it('should clear token data', () => {
      expect(() => client.clearToken()).not.toThrow();
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      expect(() => client.clearCache()).not.toThrow();
    });
  });

  describe('Logger Management', () => {
    it('should set log level', () => {
      expect(() => client.setLogLevel('debug')).not.toThrow();
      expect(() => client.setLogLevel('info')).not.toThrow();
      expect(() => client.setLogLevel('warn')).not.toThrow();
      expect(() => client.setLogLevel('error')).not.toThrow();
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      // Mock successful responses
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      client['executeWithRetry'] = jest.fn().mockResolvedValue(mockResponse);
    });

    it('should make GET request', async () => {
      const response = await client.get('/test');

      expect(response).toEqual({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      });
    });

    it('should make POST request with data', async () => {
      const testData = { name: 'test' };
      const response = await client.post('/test', testData);

      expect(response).toEqual({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      });
    });

    it('should make PUT request with data', async () => {
      const testData = { id: 1, name: 'updated' };
      const response = await client.put('/test/1', testData);

      expect(response).toBeDefined();
    });

    it('should make DELETE request', async () => {
      const response = await client.delete('/test/1');

      expect(response).toBeDefined();
    });

    it('should make PATCH request with data', async () => {
      const testData = { name: 'patched' };
      const response = await client.patch('/test/1', testData);

      expect(response).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      client['executeWithRetry'] = jest.fn().mockRejectedValue(networkError);

      await expect(client.get('/test')).rejects.toThrow();
    });

    it('should handle HTTP errors', async () => {
      const httpError = new TanqoryError('Not Found', 404, 'NOT_FOUND');
      client['executeWithRetry'] = jest.fn().mockRejectedValue(httpError);

      await expect(client.get('/test')).rejects.toThrow('Not Found');
    });
  });

  describe('Configuration', () => {
    it('should use custom timeout', () => {
      const customConfig: TanqoryConfig = {
        baseURL: 'https://api.test.com',
        timeout: 10000,
      };

      const customClient = new TanqoryApiClient(customConfig);
      expect(customClient).toBeDefined();
    });

    it('should use custom retry settings', () => {
      const customConfig: TanqoryConfig = {
        baseURL: 'https://api.test.com',
        retries: 5,
        retryDelay: 2000,
      };

      const customClient = new TanqoryApiClient(customConfig);
      expect(customClient).toBeDefined();
    });
  });
});
