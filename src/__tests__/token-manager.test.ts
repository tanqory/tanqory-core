import { TokenManager } from '@/token-manager';
import { TanqoryConfig, TokenData } from '@/types';

describe('TokenManager', () => {
  const mockConfig: TanqoryConfig = {
    baseURL: 'https://api.test.com',
    tokenStorage: 'memory',
  };

  let tokenManager: TokenManager;

  beforeEach(() => {
    // Clear environment variables
    delete process.env.TANQORY_ACCESS_TOKEN;
    delete process.env.TANQORY_REFRESH_TOKEN;
    delete process.env.TANQORY_TOKEN_EXPIRES_AT;

    tokenManager = new TokenManager(mockConfig);
  });

  describe('Memory Storage', () => {
    it('should initialize with no token', () => {
      expect(tokenManager.getToken()).toBeNull();
      expect(tokenManager.isTokenValid()).toBeFalsy();
      expect(tokenManager.getAuthorizationHeader()).toBeNull();
    });

    it('should set and get token data', () => {
      const tokenData: TokenData = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() / 1000 + 3600, // 1 hour from now
        tokenType: 'Bearer',
      };

      tokenManager.setToken(tokenData);

      const retrievedToken = tokenManager.getToken();
      expect(retrievedToken).toEqual(tokenData);
    });

    it('should validate token expiry', () => {
      const validToken: TokenData = {
        accessToken: 'valid-token',
        expiresAt: Date.now() / 1000 + 3600, // 1 hour from now
      };

      tokenManager.setToken(validToken);
      expect(tokenManager.isTokenValid()).toBeTruthy();

      const expiredToken: TokenData = {
        accessToken: 'expired-token',
        expiresAt: Date.now() / 1000 - 3600, // 1 hour ago
      };

      tokenManager.setToken(expiredToken);
      expect(tokenManager.isTokenValid()).toBeFalsy();
    });

    it('should generate authorization header', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        tokenType: 'Bearer',
        expiresAt: Date.now() / 1000 + 3600,
      };

      tokenManager.setToken(tokenData);

      const authHeader = tokenManager.getAuthorizationHeader();
      expect(authHeader).toBe('Bearer test-token');
    });

    it('should use default token type', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() / 1000 + 3600,
      };

      tokenManager.setToken(tokenData);

      const authHeader = tokenManager.getAuthorizationHeader();
      expect(authHeader).toBe('Bearer test-token');
    });

    it('should clear token data', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() / 1000 + 3600,
      };

      tokenManager.setToken(tokenData);
      expect(tokenManager.getToken()).not.toBeNull();

      tokenManager.clearToken();
      expect(tokenManager.getToken()).toBeNull();
    });

    it('should handle token without expiry', () => {
      const tokenData: TokenData = {
        accessToken: 'test-token',
        tokenType: 'Bearer',
      };

      tokenManager.setToken(tokenData);
      expect(tokenManager.isTokenValid()).toBeTruthy();
    });

    it('should handle token expiry buffer', () => {
      const soonToExpireToken: TokenData = {
        accessToken: 'soon-to-expire-token',
        expiresAt: Date.now() / 1000 + 200, // 200 seconds from now (less than 5 min buffer)
      };

      tokenManager.setToken(soonToExpireToken);
      expect(tokenManager.isTokenValid()).toBeFalsy();
    });
  });

  describe('Environment Variable Storage', () => {
    beforeEach(() => {
      const envConfig: TanqoryConfig = {
        baseURL: 'https://api.test.com',
        tokenStorage: 'env',
      };
      tokenManager = new TokenManager(envConfig);
    });

    it('should load token from environment variables', () => {
      process.env.TANQORY_ACCESS_TOKEN = 'env-access-token';
      process.env.TANQORY_REFRESH_TOKEN = 'env-refresh-token';
      process.env.TANQORY_TOKEN_EXPIRES_AT = String(Date.now() / 1000 + 3600);

      const envConfig: TanqoryConfig = {
        baseURL: 'https://api.test.com',
        tokenStorage: 'env',
      };
      const envTokenManager = new TokenManager(envConfig);

      const token = envTokenManager.getToken();
      expect(token?.accessToken).toBe('env-access-token');
      expect(token?.refreshToken).toBe('env-refresh-token');
    });

    it('should save token to environment variables', () => {
      const tokenData: TokenData = {
        accessToken: 'new-env-token',
        refreshToken: 'new-refresh-token',
        expiresAt: Date.now() / 1000 + 3600,
      };

      tokenManager.setToken(tokenData);

      expect(process.env.TANQORY_ACCESS_TOKEN).toBe('new-env-token');
      expect(process.env.TANQORY_REFRESH_TOKEN).toBe('new-refresh-token');
      expect(process.env.TANQORY_TOKEN_EXPIRES_AT).toBe(String(tokenData.expiresAt));
    });

    it('should clear environment variables', () => {
      process.env.TANQORY_ACCESS_TOKEN = 'env-token';
      process.env.TANQORY_REFRESH_TOKEN = 'env-refresh';
      process.env.TANQORY_TOKEN_EXPIRES_AT = '123456789';

      tokenManager.clearToken();

      expect(process.env.TANQORY_ACCESS_TOKEN).toBeUndefined();
      expect(process.env.TANQORY_REFRESH_TOKEN).toBeUndefined();
      expect(process.env.TANQORY_TOKEN_EXPIRES_AT).toBeUndefined();
    });
  });
});
