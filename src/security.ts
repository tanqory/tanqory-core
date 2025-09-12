import { createHmac } from 'crypto';

export class SecurityUtils {
  static generateHmacSignature(data: string, secret: string, algorithm: string = 'sha256'): string {
    return createHmac(algorithm, secret).update(data).digest('hex');
  }

  static verifyHmacSignature(
    data: string,
    signature: string,
    secret: string,
    algorithm: string = 'sha256'
  ): boolean {
    const expectedSignature = this.generateHmacSignature(data, secret, algorithm);
    return this.constantTimeCompare(signature, expectedSignature);
  }

  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  static sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie', 'x-auth-token'];
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  static sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const sensitiveParams = ['api_key', 'token', 'access_token', 'auth'];

      for (const param of sensitiveParams) {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      }

      return urlObj.toString();
    } catch {
      return url;
    }
  }
}
