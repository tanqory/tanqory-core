import { TanqoryError } from '@/errors';

describe('TanqoryError', () => {
  describe('Constructor', () => {
    it('should create basic error with message', () => {
      const error = new TanqoryError('Test error message');

      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('TanqoryError');
      expect(error.status).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.response).toBeUndefined();
    });

    it('should create error with all properties', () => {
      const response = {
        data: { error: 'Not found' },
        status: 404,
        statusText: 'Not Found',
      };

      const error = new TanqoryError('Resource not found', 404, 'NOT_FOUND', response);

      expect(error.message).toBe('Resource not found');
      expect(error.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.response).toEqual(response);
    });

    it('should inherit from Error', () => {
      const error = new TanqoryError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TanqoryError);
    });
  });

  describe('fromAxiosError', () => {
    it('should create error from axios response error', () => {
      const axiosError = {
        response: {
          data: { message: 'Validation failed', code: 'VALIDATION_ERROR' },
          status: 400,
          statusText: 'Bad Request',
        },
        message: 'Request failed with status code 400',
      };

      const error = TanqoryError.fromAxiosError(axiosError);

      expect(error.message).toBe('Validation failed');
      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.response).toEqual({
        data: axiosError.response.data,
        status: 400,
        statusText: 'Bad Request',
      });
    });

    it('should handle axios error without response data message', () => {
      const axiosError = {
        response: {
          data: { error: 'Some error' },
          status: 500,
          statusText: 'Internal Server Error',
        },
        message: 'Request failed with status code 500',
      };

      const error = TanqoryError.fromAxiosError(axiosError);

      expect(error.message).toBe('Request failed with status code 500');
      expect(error.status).toBe(500);
    });

    it('should handle axios request error (no response)', () => {
      const axiosError = {
        request: {},
        message: 'Network Error',
      };

      const error = TanqoryError.fromAxiosError(axiosError);

      expect(error.message).toBe('No response received from server');
      expect(error.status).toBeUndefined();
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('should handle axios setup error', () => {
      const axiosError = {
        message: 'Request setup failed',
      };

      const error = TanqoryError.fromAxiosError(axiosError);

      expect(error.message).toBe('Request setup failed');
      expect(error.status).toBeUndefined();
      expect(error.code).toBe('REQUEST_SETUP_ERROR');
    });

    it('should handle axios error without message', () => {
      const axiosError = {
        response: {
          data: {},
          status: 403,
          statusText: 'Forbidden',
        },
      };

      const error = TanqoryError.fromAxiosError(axiosError);

      expect(error.message).toBe('Request failed');
      expect(error.status).toBe(403);
    });
  });

  describe('Helper Methods', () => {
    describe('isRetryable', () => {
      it('should return true for server errors (5xx)', () => {
        const error500 = new TanqoryError('Server error', 500);
        const error502 = new TanqoryError('Bad gateway', 502);
        const error503 = new TanqoryError('Service unavailable', 503);

        expect(error500.isRetryable()).toBeTruthy();
        expect(error502.isRetryable()).toBeTruthy();
        expect(error503.isRetryable()).toBeTruthy();
      });

      it('should return true for rate limiting (429)', () => {
        const error = new TanqoryError('Too many requests', 429);
        expect(error.isRetryable()).toBeTruthy();
      });

      it('should return false for client errors (4xx except 429)', () => {
        const error400 = new TanqoryError('Bad request', 400);
        const error401 = new TanqoryError('Unauthorized', 401);
        const error403 = new TanqoryError('Forbidden', 403);
        const error404 = new TanqoryError('Not found', 404);

        expect(error400.isRetryable()).toBeFalsy();
        expect(error401.isRetryable()).toBeFalsy();
        expect(error403.isRetryable()).toBeFalsy();
        expect(error404.isRetryable()).toBeFalsy();
      });

      it('should return false for errors without status', () => {
        const error = new TanqoryError('Generic error');
        expect(error.isRetryable()).toBeFalsy();
      });
    });

    describe('isAuthError', () => {
      it('should return true for 401 status', () => {
        const error = new TanqoryError('Unauthorized', 401);
        expect(error.isAuthError()).toBeTruthy();
      });

      it('should return false for other statuses', () => {
        const error403 = new TanqoryError('Forbidden', 403);
        const error404 = new TanqoryError('Not found', 404);

        expect(error403.isAuthError()).toBeFalsy();
        expect(error404.isAuthError()).toBeFalsy();
      });
    });

    describe('isForbidden', () => {
      it('should return true for 403 status', () => {
        const error = new TanqoryError('Forbidden', 403);
        expect(error.isForbidden()).toBeTruthy();
      });

      it('should return false for other statuses', () => {
        const error401 = new TanqoryError('Unauthorized', 401);
        const error404 = new TanqoryError('Not found', 404);

        expect(error401.isForbidden()).toBeFalsy();
        expect(error404.isForbidden()).toBeFalsy();
      });
    });

    describe('isNotFound', () => {
      it('should return true for 404 status', () => {
        const error = new TanqoryError('Not found', 404);
        expect(error.isNotFound()).toBeTruthy();
      });

      it('should return false for other statuses', () => {
        const error401 = new TanqoryError('Unauthorized', 401);
        const error500 = new TanqoryError('Server error', 500);

        expect(error401.isNotFound()).toBeFalsy();
        expect(error500.isNotFound()).toBeFalsy();
      });
    });

    describe('isRateLimited', () => {
      it('should return true for 429 status', () => {
        const error = new TanqoryError('Too many requests', 429);
        expect(error.isRateLimited()).toBeTruthy();
      });

      it('should return false for other statuses', () => {
        const error400 = new TanqoryError('Bad request', 400);
        const error500 = new TanqoryError('Server error', 500);

        expect(error400.isRateLimited()).toBeFalsy();
        expect(error500.isRateLimited()).toBeFalsy();
      });
    });
  });

  describe('Error Chain', () => {
    it('should maintain error stack trace', () => {
      const error = new TanqoryError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TanqoryError');
    });

    it('should work with instanceof checks', () => {
      const error = new TanqoryError('Test error');

      expect(error instanceof Error).toBeTruthy();
      expect(error instanceof TanqoryError).toBeTruthy();
    });
  });
});
