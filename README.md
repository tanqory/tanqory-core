# @tanqory/core

Essential SDK for Tanqory's e-commerce platform with comprehensive API handling, authentication, and error management.

## Features

- **API Request Handling**: Full HTTP client with GET, POST, PUT, DELETE, PATCH support
- **Token Management**: Automatic JWT/OAuth2 token handling with refresh capabilities
- **Error Handling**: Comprehensive error handling with automatic retries
- **Rate Limiting**: Built-in rate limiting with 429 error handling
- **Caching**: Optional data caching with TTL and conditional requests
- **Request Logging**: Configurable logging with multiple levels
- **Security**: HMAC verification and secure token storage
- **TypeScript**: Full TypeScript support with type definitions

## Installation

```bash
npm install @tanqory/core
# or
yarn add @tanqory/core
```

## Quick Start

```typescript
import { createClient } from '@tanqory/core';
// or: import { TanqoryApiClient } from '@tanqory/core';

const client = createClient({
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key',
  storeId: 'your-store-id',
  autoRetry: true,
  autoRefreshToken: true,
  logLevel: 'info'
});

// Make API requests
const response = await client.get('/products');
console.log(response.data);
```

## Configuration

```typescript
import { createClient, TanqoryConfig } from '@tanqory/core';

const config: TanqoryConfig = {
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key',
  storeId: 'your-store-id',
  timeout: 30000,
  autoRetry: true, // alias for retries > 0
  autoRefreshToken: true, // alias for enableTokenRefresh
  retries: 3,
  retryDelay: 1000,
  tokenStorage: 'memory', // or 'env'
  logLevel: 'info',
  enableCaching: true,
  cacheTTL: 300000, // 5 minutes
  hmacSecret: 'your-hmac-secret'
};

const client = createClient(config);
```

## Advanced Configuration

### Per-Request Configuration

```typescript
// Override default settings for specific requests
const response = await client.get('/products', {
  timeout: 10000,          // Custom timeout
  skipAuth: true,          // Skip authentication
  skipCache: true,         // Skip caching
  retries: 1,             // Custom retry count
  headers: {
    'X-Custom-Header': 'value'
  },
  params: {
    page: 1,
    limit: 50
  }
});

## Authentication

### Using API Key

```typescript
const client = createClient({
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key'
});
```

### Using JWT Tokens

```typescript
const client = createClient({
  baseURL: 'https://api.tanqory.com',
  autoRefreshToken: true
});

// Set token data
client.setToken({
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
  expiresAt: 1234567890,
  tokenType: 'Bearer'
});

// Or use the convenience method for customer sessions
client.bindCustomerToken({
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
  expiresAt: 1234567890,
  tokenType: 'Bearer'
});

// Check token validity
if (!client.isTokenValid()) {
  // Handle token refresh or re-authentication
}
```

## API Methods

### GET Request

```typescript
const response = await client.get('/products', {
  params: { page: 1, limit: 10 }
});
```

### POST Request

```typescript
const response = await client.post('/products', {
  name: 'New Product',
  price: 99.99
});
```

### PUT Request

```typescript
const response = await client.put('/products/123', {
  name: 'Updated Product',
  price: 89.99
});
```

### DELETE Request

```typescript
const response = await client.delete('/products/123');
```

### PATCH Request

```typescript
const response = await client.patch('/products/123', {
  price: 79.99 // Only update specific fields
});
```

## Error Handling

```typescript
import { TanqoryError } from '@tanqory/core';

try {
  const response = await client.get('/products');
} catch (error) {
  if (error instanceof TanqoryError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Code:', error.code);

    // Comprehensive error type checking
    if (error.isAuthError()) {
      // Handle 401 Unauthorized
      console.log('Authentication required');
    } else if (error.isForbidden()) {
      // Handle 403 Forbidden
      console.log('Access denied');
    } else if (error.isNotFound()) {
      // Handle 404 Not Found
      console.log('Resource not found');
    } else if (error.isRateLimited()) {
      // Handle 429 Too Many Requests
      console.log('Rate limit exceeded');
    } else if (error.isRetryable()) {
      // Handle 5xx Server Errors
      console.log('Server error, can retry');
    }
  }
}
```

### Create Error from Axios

```typescript
import { TanqoryError } from '@tanqory/core';

try {
  // Some axios operation
} catch (axiosError) {
  const tanqoryError = TanqoryError.fromAxiosError(axiosError);
  throw tanqoryError;
}
```

## Caching

Enable caching for improved performance:

```typescript
const client = createClient({
  baseURL: 'https://api.tanqory.com',
  enableCaching: true,
  cacheTTL: 600000 // 10 minutes
});

// This request will be cached
const response1 = await client.get('/products');

// This will return cached data if within TTL
const response2 = await client.get('/products');

// Clear cache when needed
client.clearCache();
```

## Logging

Configure logging levels:

```typescript
const client = createClient({
  baseURL: 'https://api.tanqory.com',
  logLevel: 'debug' // 'debug', 'info', 'warn', 'error'
});

// Change log level at runtime
client.setLogLevel('error');
```

## Security

### HMAC Verification

```typescript
import { SecurityUtils } from '@tanqory/core';

// Generate HMAC signature
const signature = SecurityUtils.generateHmacSignature(
  'data-to-sign',
  'secret-key',
  'sha256' // Optional algorithm (default: sha256)
);

// Verify HMAC signature
const isValid = SecurityUtils.verifyHmacSignature(
  'data-to-verify',
  'received-signature',
  'secret-key'
);
```

### Data Sanitization

```typescript
import { SecurityUtils } from '@tanqory/core';

// Sanitize headers (removes sensitive data from logs)
const safeHeaders = SecurityUtils.sanitizeHeaders({
  'Authorization': 'Bearer secret-token',
  'Content-Type': 'application/json'
});
// Result: { 'Authorization': '[REDACTED]', 'Content-Type': 'application/json' }

// Sanitize URLs (removes sensitive query parameters)
const safeUrl = SecurityUtils.sanitizeUrl(
  'https://api.com/data?api_key=secret&user=john'
);
// Result: 'https://api.com/data?api_key=[REDACTED]&user=john'
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

### Core Interfaces

```typescript
import {
  createClient,
  TanqoryConfig,
  RequestConfig,
  TokenData,
  TokenSession,
  ApiResponse
} from '@tanqory/core';

// Configuration interface
const config: TanqoryConfig = {
  baseURL: string;
  storeId?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  apiKey?: string;
  tokenStorage?: 'memory' | 'env';
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  enableCaching?: boolean;
  cacheTTL?: number;
  hmacSecret?: string;
  enableTokenRefresh?: boolean;
  autoRetry?: boolean; // alias for retries > 0
  autoRefreshToken?: boolean; // alias for enableTokenRefresh
};

// Token data interface
const tokenData: TokenData = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
};

// Token session interface (for bindCustomerToken)
const session: TokenSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: 'Bearer';
};

// API response interface
const response: ApiResponse<MyDataType> = {
  data: MyDataType;
  status: number;
  statusText: string;
  headers: Record<string, string>;
};
```

## Environment Variables

When using `tokenStorage: 'env'`, the following environment variables are used:

- `TANQORY_ACCESS_TOKEN`: Access token
- `TANQORY_REFRESH_TOKEN`: Refresh token
- `TANQORY_TOKEN_EXPIRES_AT`: Token expiration timestamp

## Performance & Compatibility

### Performance Metrics
- **Bundle Size**: < 50KB gzipped
- **Load Time**: < 100ms initialization
- **Memory Usage**: Minimal memory footprint

### Node.js Support
- **Node.js**: 16.x, 18.x, 20.x
- **TypeScript**: 4.5+
- **Dependencies**: Minimal (only Axios)

## Real-World Examples

### E-commerce Product Management

```typescript
import { createClient } from '@tanqory/core';

const client = createClient({
  baseURL: 'https://api.tanqory.com',
  apiKey: process.env.TANQORY_API_KEY,
  storeId: process.env.TANQORY_STORE_ID,
  autoRetry: true,
  enableCaching: true,
  logLevel: 'info'
});

// Fetch product catalog with caching
async function getProducts(page = 1, limit = 50) {
  try {
    const response = await client.get('/products', {
      params: { page, limit, include: 'images,variants' }
    });
    return response.data;
  } catch (error) {
    if (error.isRateLimited()) {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, 5000));
      return getProducts(page, limit);
    }
    throw error;
  }
}
```

### Webhook Signature Verification

```typescript
import { SecurityUtils } from '@tanqory/core';

export function verifyWebhook(req, res, next) {
  const signature = req.headers['x-tanqory-signature'];
  const payload = JSON.stringify(req.body);

  const isValid = SecurityUtils.verifyHmacSignature(
    payload,
    signature,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}
```

## Troubleshooting

### Common Issues

#### Authentication Errors (401)
```typescript
// Check token expiration
if (!client.isTokenValid()) {
  // Refresh token or re-authenticate
  await refreshAuthToken();
}
```

#### Rate Limiting (429)
```typescript
catch (error) {
  if (error.isRateLimited()) {
    const retryAfter = error.response?.headers['retry-after'] || 60;
    await sleep(retryAfter * 1000);
    // Retry the request
  }
}
```

#### Network Timeouts
```typescript
// Increase timeout for large requests
const client = createClient({
  baseURL: 'https://api.tanqory.com',
  timeout: 60000  // 60 seconds
});
```

#### Bundle Size Issues
- Use tree shaking: `import { createClient } from '@tanqory/core'`
- Enable gzip compression on your server
- Consider lazy loading for large applications

## License

MIT

## Contributing

Please read our contributing guidelines before submitting pull requests.

## Support

For support, email support@tanqory.com or create an issue on GitHub.
