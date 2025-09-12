import { SecurityUtils } from '../security';

describe('SecurityUtils', () => {
  describe('HMAC Signature', () => {
    const testData = 'test-data-to-sign';
    const testSecret = 'test-secret-key';

    describe('generateHmacSignature', () => {
      it('should generate HMAC signature with default algorithm (sha256)', () => {
        const signature = SecurityUtils.generateHmacSignature(testData, testSecret);

        expect(signature).toBeDefined();
        expect(typeof signature).toBe('string');
        expect(signature.length).toBeGreaterThan(0);
      });

      it('should generate consistent signatures for same input', () => {
        const signature1 = SecurityUtils.generateHmacSignature(testData, testSecret);
        const signature2 = SecurityUtils.generateHmacSignature(testData, testSecret);

        expect(signature1).toBe(signature2);
      });

      it('should generate different signatures for different data', () => {
        const signature1 = SecurityUtils.generateHmacSignature('data1', testSecret);
        const signature2 = SecurityUtils.generateHmacSignature('data2', testSecret);

        expect(signature1).not.toBe(signature2);
      });

      it('should generate different signatures for different secrets', () => {
        const signature1 = SecurityUtils.generateHmacSignature(testData, 'secret1');
        const signature2 = SecurityUtils.generateHmacSignature(testData, 'secret2');

        expect(signature1).not.toBe(signature2);
      });

      it('should support different algorithms', () => {
        const sha256Signature = SecurityUtils.generateHmacSignature(testData, testSecret, 'sha256');
        const sha1Signature = SecurityUtils.generateHmacSignature(testData, testSecret, 'sha1');
        const md5Signature = SecurityUtils.generateHmacSignature(testData, testSecret, 'md5');

        expect(sha256Signature).not.toBe(sha1Signature);
        expect(sha256Signature).not.toBe(md5Signature);
        expect(sha1Signature).not.toBe(md5Signature);
      });
    });

    describe('verifyHmacSignature', () => {
      it('should verify valid signature', () => {
        const signature = SecurityUtils.generateHmacSignature(testData, testSecret);
        const isValid = SecurityUtils.verifyHmacSignature(testData, signature, testSecret);

        expect(isValid).toBeTruthy();
      });

      it('should reject invalid signature', () => {
        const invalidSignature = 'invalid-signature';
        const isValid = SecurityUtils.verifyHmacSignature(testData, invalidSignature, testSecret);

        expect(isValid).toBeFalsy();
      });

      it('should reject signature with wrong secret', () => {
        const signature = SecurityUtils.generateHmacSignature(testData, testSecret);
        const isValid = SecurityUtils.verifyHmacSignature(testData, signature, 'wrong-secret');

        expect(isValid).toBeFalsy();
      });

      it('should reject signature with wrong data', () => {
        const signature = SecurityUtils.generateHmacSignature(testData, testSecret);
        const isValid = SecurityUtils.verifyHmacSignature('wrong-data', signature, testSecret);

        expect(isValid).toBeFalsy();
      });

      it('should work with different algorithms', () => {
        const sha1Signature = SecurityUtils.generateHmacSignature(testData, testSecret, 'sha1');

        const isValidSha1 = SecurityUtils.verifyHmacSignature(
          testData,
          sha1Signature,
          testSecret,
          'sha1'
        );
        const isValidSha256 = SecurityUtils.verifyHmacSignature(
          testData,
          sha1Signature,
          testSecret,
          'sha256'
        );

        expect(isValidSha1).toBeTruthy();
        expect(isValidSha256).toBeFalsy();
      });

      it('should handle timing attack resistance', () => {
        const validSignature = SecurityUtils.generateHmacSignature(testData, testSecret);
        const invalidSignature = 'a'.repeat(validSignature.length);

        // Both should return quickly and consistently
        const start1 = Date.now();
        const result1 = SecurityUtils.verifyHmacSignature(testData, validSignature, testSecret);
        const time1 = Date.now() - start1;

        const start2 = Date.now();
        const result2 = SecurityUtils.verifyHmacSignature(testData, invalidSignature, testSecret);
        const time2 = Date.now() - start2;

        expect(result1).toBeTruthy();
        expect(result2).toBeFalsy();

        // Time difference should be minimal (within reasonable bounds)
        expect(Math.abs(time1 - time2)).toBeLessThan(10);
      });
    });
  });

  describe('Header Sanitization', () => {
    describe('sanitizeHeaders', () => {
      it('should sanitize sensitive headers', () => {
        const headers = {
          authorization: 'Bearer secret-token',
          'x-api-key': 'secret-api-key',
          cookie: 'session=secret-session',
          'x-auth-token': 'secret-auth-token',
          'content-type': 'application/json',
        };

        const sanitized = SecurityUtils.sanitizeHeaders(headers);

        expect(sanitized['authorization']).toBe('[REDACTED]');
        expect(sanitized['x-api-key']).toBe('[REDACTED]');
        expect(sanitized['cookie']).toBe('[REDACTED]');
        expect(sanitized['x-auth-token']).toBe('[REDACTED]');
        expect(sanitized['content-type']).toBe('application/json');
      });

      it('should handle case-insensitive header names', () => {
        const headers = {
          Authorization: 'Bearer secret-token',
          'X-API-Key': 'secret-api-key',
          Cookie: 'session=secret-session',
          'Content-Type': 'application/json',
        };

        const sanitized = SecurityUtils.sanitizeHeaders(headers);

        expect(sanitized['Authorization']).toBe('[REDACTED]');
        expect(sanitized['X-API-Key']).toBe('[REDACTED]');
        expect(sanitized['Cookie']).toBe('[REDACTED]');
        expect(sanitized['Content-Type']).toBe('application/json');
      });

      it('should handle empty headers', () => {
        const sanitized = SecurityUtils.sanitizeHeaders({});
        expect(sanitized).toEqual({});
      });

      it('should not modify original headers object', () => {
        const headers = {
          authorization: 'Bearer secret-token',
          'content-type': 'application/json',
        };

        const sanitized = SecurityUtils.sanitizeHeaders(headers);

        expect(headers['authorization']).toBe('Bearer secret-token');
        expect(sanitized['authorization']).toBe('[REDACTED]');
      });

      it('should handle custom sensitive headers', () => {
        const headers = {
          'x-custom-auth': 'secret-value',
          'normal-header': 'normal-value',
        };

        const sanitized = SecurityUtils.sanitizeHeaders(headers);

        expect(sanitized['x-custom-auth']).toBe('secret-value'); // Not in default list
        expect(sanitized['normal-header']).toBe('normal-value');
      });
    });
  });

  describe('URL Sanitization', () => {
    describe('sanitizeUrl', () => {
      it('should sanitize sensitive query parameters', () => {
        const url = 'https://api.example.com/users?api_key=secret123&token=secret456&normal=value';
        const sanitized = SecurityUtils.sanitizeUrl(url);

        expect(sanitized).toContain('api_key=%5BREDACTED%5D');
        expect(sanitized).toContain('token=%5BREDACTED%5D');
        expect(sanitized).toContain('normal=value');
        expect(sanitized).not.toContain('secret123');
        expect(sanitized).not.toContain('secret456');
      });

      it('should handle URLs without query parameters', () => {
        const url = 'https://api.example.com/users';
        const sanitized = SecurityUtils.sanitizeUrl(url);

        expect(sanitized).toBe(url);
      });

      it('should handle URLs with multiple sensitive parameters', () => {
        const url = 'https://api.example.com/data?api_key=key1&access_token=token1&auth=auth1';
        const sanitized = SecurityUtils.sanitizeUrl(url);

        expect(sanitized).toContain('api_key=%5BREDACTED%5D');
        expect(sanitized).toContain('access_token=%5BREDACTED%5D');
        expect(sanitized).toContain('auth=%5BREDACTED%5D');
      });

      it('should handle invalid URLs gracefully', () => {
        const invalidUrl = 'not-a-valid-url';
        const sanitized = SecurityUtils.sanitizeUrl(invalidUrl);

        expect(sanitized).toBe(invalidUrl);
      });

      it('should preserve URL structure', () => {
        const url = 'https://api.example.com:8080/v1/users?page=1&api_key=secret&limit=10';
        const sanitized = SecurityUtils.sanitizeUrl(url);

        expect(sanitized).toContain('https://api.example.com:8080/v1/users');
        expect(sanitized).toContain('page=1');
        expect(sanitized).toContain('limit=10');
        expect(sanitized).toContain('api_key=%5BREDACTED%5D');
      });

      it('should handle URLs with fragments', () => {
        const url = 'https://api.example.com/users?api_key=secret#section';
        const sanitized = SecurityUtils.sanitizeUrl(url);

        expect(sanitized).toContain('api_key=%5BREDACTED%5D');
        expect(sanitized).toContain('#section');
      });

      it('should handle empty query parameter values', () => {
        const url = 'https://api.example.com/users?api_key=&normal=value';
        const sanitized = SecurityUtils.sanitizeUrl(url);

        expect(sanitized).toContain('api_key=%5BREDACTED%5D');
        expect(sanitized).toContain('normal=value');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined inputs safely', () => {
      // These should not throw errors
      expect(() => SecurityUtils.generateHmacSignature('', '')).not.toThrow();
      expect(() => SecurityUtils.verifyHmacSignature('', '', '')).not.toThrow();
      expect(() => SecurityUtils.sanitizeHeaders({})).not.toThrow();
      expect(() => SecurityUtils.sanitizeUrl('')).not.toThrow();
    });

    it('should handle very long inputs', () => {
      const longData = 'a'.repeat(10000);
      const longSecret = 'b'.repeat(1000);

      const signature = SecurityUtils.generateHmacSignature(longData, longSecret);
      const isValid = SecurityUtils.verifyHmacSignature(longData, signature, longSecret);

      expect(isValid).toBeTruthy();
    });

    it('should handle special characters in data', () => {
      const specialData = '!@#$%^&*()_+-=[]{}|;:,.<>?`~\'"\\';
      const secret = 'test-secret';

      const signature = SecurityUtils.generateHmacSignature(specialData, secret);
      const isValid = SecurityUtils.verifyHmacSignature(specialData, signature, secret);

      expect(isValid).toBeTruthy();
    });
  });
});
