import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { TanqoryConfig, RequestConfig, ApiResponse, TokenData } from './types';
import { TanqoryLogger } from './logger';
import { TokenManager } from './token-manager';
import { MemoryCache } from './cache';
import { SecurityUtils } from './security';
import { TanqoryError } from './errors';

/**
 * @aiDescription Main API client class for Tanqory e-commerce platform, orchestrating HTTP requests with authentication, caching, and error handling
 * @aiPurpose process
 * @aiModifiable true
 * @aiRiskLevel high
 * @aiSecurityCritical true
 * @aiBusinessCritical true
 * @aiPerformanceCritical true
 * @aiDomain api-client
 * @aiLayer service
 * @aiCapabilities ['HTTP_REQUEST', 'AUTHENTICATION', 'CACHING', 'RETRY_LOGIC', 'ERROR_HANDLING']
 * @aiDependencies ['axios', 'token-manager', 'cache', 'logger', 'security-utils']
 * @aiBusinessRules ['automatic-token-refresh', 'rate-limiting-respect', 'secure-header-handling']
 * @aiValidationRules ['config-validation', 'token-expiry-check', 'cache-ttl-validation']
 * @aiCurrentGaps ['no-circuit-breaker', 'basic-metrics', 'no-request-deduplication']
 * @aiImprovementHints [
 *   'implement-circuit-breaker-pattern-for-failing-services',
 *   'add-request-deduplication-for-identical-concurrent-requests',
 *   'implement-metrics-collection-for-request-performance',
 *   'add-request-timeout-strategies-per-endpoint',
 *   'implement-adaptive-retry-delays-based-on-service-response'
 * ]
 * @aiTestScenarios ['successful-requests', 'token-refresh', 'cache-hit-miss', 'retry-logic', 'error-handling']
 * @aiErrorPrevention Never log tokens in plain text, always sanitize headers before logging, validate config before axios instance creation
 */
export class TanqoryApiClient {
  private axiosInstance: AxiosInstance;
  private config: TanqoryConfig;
  private logger: TanqoryLogger;
  private tokenManager: TokenManager;
  private cache: MemoryCache;

  constructor(config: TanqoryConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      tokenStorage: 'memory',
      logLevel: 'info',
      enableCaching: false,
      cacheTTL: 300000,
      enableTokenRefresh: false,
      ...config,
    };

    this.logger = new TanqoryLogger(this.config.logLevel);
    this.tokenManager = new TokenManager(this.config);
    this.cache = new MemoryCache(this.config.cacheTTL);

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '@tanqory/core/1.0.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
        // Add authentication if available and not skipped
        if (!config.skipAuth) {
          const authHeader = this.tokenManager.getAuthorizationHeader();
          if (authHeader) {
            config.headers.Authorization = authHeader;
          } else if (this.config.apiKey) {
            config.headers['X-API-Key'] = this.config.apiKey;
          }
        }

        // Add conditional request headers for caching
        if (this.config.enableCaching && config.method === 'get') {
          const etag = this.cache.getEtag(config.url || '', config.method || 'GET', config.params);
          if (etag) {
            config.headers['If-None-Match'] = etag;
          }
        }

        // Log request
        this.logger.debug('Making request', {
          method: config.method?.toUpperCase(),
          url: SecurityUtils.sanitizeUrl(config.url || ''),
          headers: SecurityUtils.sanitizeHeaders(config.headers || {}),
        });

        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log successful response
        this.logger.debug('Response received', {
          status: response.status,
          statusText: response.statusText,
          url: SecurityUtils.sanitizeUrl(response.config.url || ''),
        });

        // Cache GET responses
        if (
          this.config.enableCaching &&
          response.config.method === 'get' &&
          response.status === 200
        ) {
          const etag = response.headers.etag;
          this.cache.set(
            response.config.url || '',
            'GET',
            response.data,
            response.config.params,
            this.config.cacheTTL,
            etag
          );
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - attempt token refresh (only if enabled)
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.config.enableTokenRefresh
        ) {
          originalRequest._retry = true;

          const tokenData = this.tokenManager.getToken();
          if (tokenData?.refreshToken) {
            try {
              await this.refreshToken(tokenData.refreshToken);
              // Retry original request with new token
              const authHeader = this.tokenManager.getAuthorizationHeader();
              if (authHeader) {
                originalRequest.headers.Authorization = authHeader;
              }
              return this.axiosInstance(originalRequest);
            } catch (refreshError) {
              this.logger.error('Token refresh failed', refreshError);
              this.tokenManager.clearToken();
            }
          }
        }

        // Handle 304 Not Modified - return cached data
        if (error.response?.status === 304) {
          const cachedData = this.cache.get(
            originalRequest.url,
            originalRequest.method?.toUpperCase() || 'GET',
            originalRequest.params
          );

          if (cachedData) {
            this.logger.debug('Returning cached data for 304 response');
            return {
              data: cachedData,
              status: 200,
              statusText: 'OK',
              headers: error.response.headers,
              config: originalRequest,
            };
          }
        }

        const tanqoryError = TanqoryError.fromAxiosError(error);
        this.logger.error('Request failed', {
          status: tanqoryError.status,
          message: tanqoryError.message,
          code: tanqoryError.code,
        });

        throw tanqoryError;
      }
    );
  }

  private async refreshToken(refreshToken: string): Promise<void> {
    try {
      const response = await axios.post(`${this.config.baseURL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const newTokenData: TokenData = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresAt: response.data.expires_at,
        tokenType: response.data.token_type || 'Bearer',
      };

      this.tokenManager.setToken(newTokenData);
      this.logger.info('Token refreshed successfully');
    } catch (error) {
      this.logger.error('Failed to refresh token', error);
      throw new TanqoryError('Token refresh failed', 401, 'TOKEN_REFRESH_FAILED');
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries: number = this.config.retries || 3
  ): Promise<AxiosResponse<T>> {
    let lastError: TanqoryError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error: unknown) {
        lastError = error instanceof TanqoryError ? error : TanqoryError.fromAxiosError(error);

        if (attempt === retries || !lastError.isRetryable()) {
          throw lastError;
        }

        const delay = lastError.isRateLimited()
          ? (error as { response?: { headers: Record<string, string> } })?.response?.headers[
              'retry-after'
            ]
            ? parseInt(
                (error as { response: { headers: Record<string, string> } }).response.headers[
                  'retry-after'
                ]
              ) * 1000
            : 60000
          : (this.config.retryDelay || 1000) * Math.pow(2, attempt);

        this.logger.warn(`Request failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries: retries,
          error: lastError.message,
        });

        await this.sleep(delay);
      }
    }

    if (!lastError) {
      throw new TanqoryError('Unknown error occurred', 500, 'UNKNOWN_ERROR');
    }
    throw lastError;
  }

  async request<T>(requestConfig: RequestConfig): Promise<ApiResponse<T>> {
    // Check cache first for GET requests
    if (this.config.enableCaching && !requestConfig.skipCache && requestConfig.method === 'GET') {
      const cachedData = this.cache.get<T>(
        requestConfig.url,
        requestConfig.method,
        requestConfig.params
      );
      if (cachedData) {
        this.logger.debug('Returning cached data');
        return {
          data: cachedData,
          status: 200,
          statusText: 'OK (cached)',
          headers: {},
        };
      }
    }

    const axiosConfig: AxiosRequestConfig & { skipAuth?: boolean } = {
      url: requestConfig.url,
      method: requestConfig.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch',
      headers: requestConfig.headers,
      params: requestConfig.params,
      data: requestConfig.data,
      timeout: requestConfig.timeout || this.config.timeout,
      skipAuth: requestConfig.skipAuth,
    };

    const response = await this.executeWithRetry(
      () => this.axiosInstance(axiosConfig),
      requestConfig.retries
    );

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    };
  }

  async get<T>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      ...config,
    });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config,
    });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config,
    });
  }

  async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...config,
    });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config,
    });
  }

  setToken(tokenData: TokenData): void {
    this.tokenManager.setToken(tokenData);
  }

  clearToken(): void {
    this.tokenManager.clearToken();
  }

  clearCache(): void {
    this.cache.clear();
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logger.setLevel(level);
  }
}
