import { ApiError } from './types';

export class TanqoryError extends Error implements ApiError {
  public status?: number;
  public code?: string;
  public response?: {
    data: any;
    status: number;
    statusText: string;
  };

  constructor(message: string, status?: number, code?: string, response?: any) {
    super(message);
    this.name = 'TanqoryError';
    this.status = status;
    this.code = code;
    this.response = response;
  }

  static fromAxiosError(error: any): TanqoryError {
    if (error.response) {
      return new TanqoryError(
        error.response.data?.message || error.message || 'Request failed',
        error.response.status,
        error.response.data?.code || error.code,
        {
          data: error.response.data,
          status: error.response.status,
          statusText: error.response.statusText,
        }
      );
    } else if (error.request) {
      return new TanqoryError('No response received from server', undefined, 'NETWORK_ERROR');
    } else {
      return new TanqoryError(
        error.message || 'Request setup failed',
        undefined,
        'REQUEST_SETUP_ERROR'
      );
    }
  }

  isRetryable(): boolean {
    if (!this.status) return false;

    // Retry on server errors (5xx) and rate limiting (429)
    return this.status >= 500 || this.status === 429;
  }

  isAuthError(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isRateLimited(): boolean {
    return this.status === 429;
  }
}
