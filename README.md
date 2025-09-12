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
import { TanqoryApiClient } from '@tanqory/core';

const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key',
  logLevel: 'info'
});

// Make API requests
const response = await client.get('/products');
console.log(response.data);
```

## Configuration

```typescript
import { TanqoryApiClient, TanqoryConfig } from '@tanqory/core';

const config: TanqoryConfig = {
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  tokenStorage: 'memory', // or 'env'
  logLevel: 'info',
  enableCaching: true,
  cacheTTL: 300000, // 5 minutes
  hmacSecret: 'your-hmac-secret'
};

const client = new TanqoryApiClient(config);
```

## Authentication

### Using API Key

```typescript
const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key'
});
```

### Using JWT Tokens

```typescript
const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com'
});

// Set token data
client.setToken({
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
  expiresAt: 1234567890,
  tokenType: 'Bearer'
});
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
    
    if (error.isAuthError()) {
      // Handle authentication error
    } else if (error.isRateLimited()) {
      // Handle rate limiting
    }
  }
}
```

## Caching

Enable caching for improved performance:

```typescript
const client = new TanqoryApiClient({
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
const client = new TanqoryApiClient({
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

const signature = SecurityUtils.generateHmacSignature(data, secret);
const isValid = SecurityUtils.verifyHmacSignature(data, signature, secret);
```

## Environment Variables

When using `tokenStorage: 'env'`, the following environment variables are used:

- `TANQORY_ACCESS_TOKEN`: Access token
- `TANQORY_REFRESH_TOKEN`: Refresh token
- `TANQORY_TOKEN_EXPIRES_AT`: Token expiration timestamp

## License

MIT

## Contributing

Please read our contributing guidelines before submitting pull requests.

## Support

For support, email support@tanqory.com or create an issue on GitHub.