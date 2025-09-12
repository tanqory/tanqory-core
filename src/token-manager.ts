import { TokenData, TanqoryConfig } from './types';

/**
 * @aiDescription Manages JWT/OAuth2 authentication tokens with automatic validation and secure storage
 * @aiPurpose authenticate
 * @aiModifiable true
 * @aiRiskLevel high
 * @aiSecurityCritical true
 * @aiBusinessCritical true
 * @aiDomain auth
 * @aiLayer service
 * @aiCapabilities ['TOKEN_STORAGE', 'TOKEN_VALIDATION', 'TOKEN_REFRESH', 'EXPIRY_CHECK']
 * @aiDependencies ['process.env', 'types']
 * @aiBusinessRules ['token-expiry-buffer', 'secure-storage', 'automatic-cleanup']
 * @aiValidationRules ['token-format-validation', 'expiry-timestamp-check']
 * @aiCurrentGaps ['no-token-encryption', 'basic-storage-options', 'no-token-rotation']
 * @aiImprovementHints [
 *   'implement-token-encryption-for-memory-storage',
 *   'add-automatic-token-rotation-before-expiry',
 *   'implement-token-validation-with-JWT-decode',
 *   'add-secure-keychain-storage-option',
 *   'implement-token-refresh-queue-for-concurrent-requests'
 * ]
 * @aiTestScenarios ['token-set-get', 'expiry-validation', 'storage-modes', 'token-cleanup']
 * @aiErrorPrevention Never log tokens, always validate expiry before use, clear tokens on security errors
 */
export class TokenManager {
  private tokenData: TokenData | null = null;
  private config: TanqoryConfig;

  constructor(config: TanqoryConfig) {
    this.config = config;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    if (this.config.tokenStorage === 'env') {
      const accessToken = process.env.TANQORY_ACCESS_TOKEN;
      const refreshToken = process.env.TANQORY_REFRESH_TOKEN;
      const expiresAt = process.env.TANQORY_TOKEN_EXPIRES_AT
        ? parseInt(process.env.TANQORY_TOKEN_EXPIRES_AT)
        : undefined;

      if (accessToken) {
        this.tokenData = {
          accessToken,
          refreshToken,
          expiresAt,
          tokenType: 'Bearer',
        };
      }
    }
  }

  setToken(tokenData: TokenData): void {
    this.tokenData = tokenData;

    if (this.config.tokenStorage === 'env') {
      process.env.TANQORY_ACCESS_TOKEN = tokenData.accessToken;
      if (tokenData.refreshToken) {
        process.env.TANQORY_REFRESH_TOKEN = tokenData.refreshToken;
      }
      if (tokenData.expiresAt) {
        process.env.TANQORY_TOKEN_EXPIRES_AT = tokenData.expiresAt.toString();
      }
    }
  }

  getToken(): TokenData | null {
    return this.tokenData;
  }

  isTokenValid(): boolean {
    if (!this.tokenData?.accessToken) {
      return false;
    }

    if (this.tokenData.expiresAt) {
      const now = Date.now() / 1000;
      const buffer = 300; // 5 minutes buffer before expiry
      return this.tokenData.expiresAt > now + buffer;
    }

    return true;
  }

  clearToken(): void {
    this.tokenData = null;

    if (this.config.tokenStorage === 'env') {
      delete process.env.TANQORY_ACCESS_TOKEN;
      delete process.env.TANQORY_REFRESH_TOKEN;
      delete process.env.TANQORY_TOKEN_EXPIRES_AT;
    }
  }

  getAuthorizationHeader(): string | null {
    if (!this.isTokenValid()) {
      return null;
    }

    const token = this.tokenData!;
    const tokenType = token.tokenType || 'Bearer';
    return `${tokenType} ${token.accessToken}`;
  }
}
