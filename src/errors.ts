import { ApiError } from './types';

export class TanqoryError extends Error implements ApiError {
  public status?: number;
  public code?: string;
  public response?: {
    data: unknown;
    status: number;
    statusText: string;
  };

  constructor(
    message: string,
    status?: number,
    code?: string,
    response?: { data: unknown; status: number; statusText: string }
  ) {
    super(message);
    this.name = 'TanqoryError';
    this.status = status;
    this.code = code;
    this.response = response;
  }

  static fromAxiosError(error: unknown): TanqoryError {
    const axiosError = error as {
      response?: {
        data?: { message?: string; code?: string };
        status: number;
        statusText: string;
      };
      request?: unknown;
      message?: string;
      code?: string;
    };

    if (axiosError.response) {
      return new TanqoryError(
        axiosError.response.data?.message || axiosError.message || 'Request failed',
        axiosError.response.status,
        axiosError.response.data?.code || axiosError.code,
        {
          data: axiosError.response.data,
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
        }
      );
    } else if (axiosError.request) {
      return new TanqoryError('No response received from server', undefined, 'NETWORK_ERROR');
    } else {
      return new TanqoryError(
        axiosError.message || 'Request setup failed',
        undefined,
        'REQUEST_SETUP_ERROR'
      );
    }
  }

  isRetryable(): boolean {
    if (!this.status) {
      return false;
    }

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
