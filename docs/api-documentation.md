# API Documentation - @tanqory/core

## 🚀 **Quick Start**

```typescript
import { TanqoryApiClient } from '@tanqory/core';

const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key'
});

const response = await client.get('/users');
```

## 📚 **Core Classes**

### **TanqoryApiClient**

Main API client for interacting with Tanqory services.

#### **Constructor**

```typescript
new TanqoryApiClient(config: TanqoryConfig)
```

**Parameters:**
- `config` (TanqoryConfig): Client configuration options

**Example:**
```typescript
const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key',
  timeout: 30000,
  retries: 3,
  enableCaching: true,
  logLevel: 'info'
});
```

#### **HTTP Methods**

##### **GET Request**
```typescript
async get<T>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>
```

**Parameters:**
- `url` (string): Request URL path
- `config` (Partial<RequestConfig>, optional): Request configuration

**Returns:** Promise<ApiResponse<T>>

**Example:**
```typescript
// Simple GET request
const users = await client.get<User[]>('/users');

// GET with parameters
const user = await client.get<User>('/users/123', {
  params: { include: 'profile' }
});

// GET with custom headers
const data = await client.get('/protected', {
  headers: { 'X-Custom-Header': 'value' }
});
```

##### **POST Request**
```typescript
async post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>
```

**Parameters:**
- `url` (string): Request URL path
- `data` (any, optional): Request body data
- `config` (Partial<RequestConfig>, optional): Request configuration

**Example:**
```typescript
// Create new user
const newUser = await client.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// POST with custom config
const result = await client.post('/data', payload, {
  timeout: 60000,
  skipAuth: false
});
```

##### **PUT Request**
```typescript
async put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>
```

**Example:**
```typescript
// Update user
const updatedUser = await client.put<User>('/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});
```

##### **DELETE Request**
```typescript
async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>
```

**Example:**
```typescript
// Delete user
await client.delete('/users/123');
```

##### **PATCH Request**
```typescript
async patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>
```

**Example:**
```typescript
// Partial update
const updated = await client.patch<User>('/users/123', {
  email: 'newemail@example.com'
});
```

#### **Authentication Methods**

##### **Set Token**
```typescript
setToken(tokenData: TokenData): void
```

**Example:**
```typescript
client.setToken({
  accessToken: 'jwt-access-token',
  refreshToken: 'jwt-refresh-token',
  expiresAt: 1234567890,
  tokenType: 'Bearer'
});
```

##### **Clear Token**
```typescript
clearToken(): void
```

**Example:**
```typescript
client.clearToken(); // Removes all token data
```

#### **Cache Management**

##### **Clear Cache**
```typescript
clearCache(): void
```

**Example:**
```typescript
client.clearCache(); // Removes all cached responses
```

#### **Logging**

##### **Set Log Level**
```typescript
setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void
```

**Example:**
```typescript
client.setLogLevel('debug'); // Enable debug logging
```

---

### **TanqoryError**

Enhanced error class for API operations.

#### **Constructor**
```typescript
new TanqoryError(message: string, status?: number, code?: string, response?: any)
```

#### **Static Methods**

##### **From Axios Error**
```typescript
static fromAxiosError(error: any): TanqoryError
```

#### **Instance Methods**

##### **Error Type Checks**
```typescript
isRetryable(): boolean      // Can this error be retried?
isAuthError(): boolean      // Is this a 401 error?
isForbidden(): boolean      // Is this a 403 error?
isNotFound(): boolean       // Is this a 404 error?
isRateLimited(): boolean    // Is this a 429 error?
```

**Example:**
```typescript
try {
  const data = await client.get('/api/data');
} catch (error) {
  if (error instanceof TanqoryError) {
    if (error.isAuthError()) {
      // Handle authentication error
      console.log('Please login again');
    } else if (error.isRateLimited()) {
      // Handle rate limiting
      console.log('Too many requests, please wait');
    } else if (error.isRetryable()) {
      // Retry the request
      console.log('Retrying request...');
    }
  }
}
```

---

### **SecurityUtils**

Utility class for security operations.

#### **Static Methods**

##### **Generate HMAC Signature**
```typescript
static generateHmacSignature(data: string, secret: string, algorithm?: string): string
```

**Parameters:**
- `data` (string): Data to sign
- `secret` (string): Secret key
- `algorithm` (string, optional): Hash algorithm (default: 'sha256')

**Example:**
```typescript
const signature = SecurityUtils.generateHmacSignature(
  'data-to-sign',
  'secret-key',
  'sha256'
);
```

##### **Verify HMAC Signature**
```typescript
static verifyHmacSignature(data: string, signature: string, secret: string, algorithm?: string): boolean
```

**Example:**
```typescript
const isValid = SecurityUtils.verifyHmacSignature(
  'data-to-verify',
  'received-signature',
  'secret-key'
);
```

##### **Sanitize Headers**
```typescript
static sanitizeHeaders(headers: Record<string, string>): Record<string, string>
```

**Example:**
```typescript
const safeHeaders = SecurityUtils.sanitizeHeaders({
  'Authorization': 'Bearer token',
  'Content-Type': 'application/json'
});
// Result: { 'Authorization': '[REDACTED]', 'Content-Type': 'application/json' }
```

##### **Sanitize URL**
```typescript
static sanitizeUrl(url: string): string
```

**Example:**
```typescript
const safeUrl = SecurityUtils.sanitizeUrl(
  'https://api.com/data?api_key=secret&user=john'
);
// Result: 'https://api.com/data?api_key=[REDACTED]&user=john'
```

---

## 🔧 **Configuration Interfaces**

### **TanqoryConfig**

```typescript
interface TanqoryConfig {
  baseURL: string;                    // API base URL (required)
  timeout?: number;                   // Request timeout (default: 30000)
  retries?: number;                   // Max retry attempts (default: 3)
  retryDelay?: number;                // Retry delay in ms (default: 1000)
  apiKey?: string;                    // API key for authentication
  tokenStorage?: 'memory' | 'env';    // Token storage method (default: 'memory')
  logLevel?: LogLevel;                // Logging level (default: 'info')
  enableCaching?: boolean;            // Enable response caching (default: false)
  cacheTTL?: number;                  // Cache TTL in ms (default: 300000)
  hmacSecret?: string;                // HMAC secret for verification
}
```

### **RequestConfig**

```typescript
interface RequestConfig {
  url: string;                        // Request URL
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // HTTP method
  headers?: Record<string, string>;   // Request headers
  params?: Record<string, any>;       // Query parameters
  data?: any;                         // Request body
  timeout?: number;                   // Request timeout
  skipAuth?: boolean;                 // Skip authentication
  skipCache?: boolean;                // Skip caching
  retries?: number;                   // Max retries for this request
}
```

### **TokenData**

```typescript
interface TokenData {
  accessToken: string;                // JWT access token
  refreshToken?: string;              // JWT refresh token
  expiresAt?: number;                 // Unix timestamp expiration
  tokenType?: string;                 // Token type (default: 'Bearer')
}
```

### **ApiResponse<T>**

```typescript
interface ApiResponse<T = any> {
  data: T;                           // Response data
  status: number;                    // HTTP status code
  statusText: string;                // HTTP status text
  headers: Record<string, string>;   // Response headers
}
```

---

## 💡 **Usage Examples**

### **Basic Usage**

```typescript
import { TanqoryApiClient } from '@tanqory/core';

const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key'
});

// Get all users
const users = await client.get<User[]>('/users');

// Create a new user
const newUser = await client.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Update user
const updatedUser = await client.put<User>(`/users/${newUser.data.id}`, {
  name: 'Jane Doe'
});

// Delete user
await client.delete(`/users/${newUser.data.id}`);
```

### **Authentication Flow**

```typescript
// Initialize without authentication
const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com'
});

// Login and get tokens
const loginResponse = await client.post<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}>('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Set tokens for future requests
client.setToken({
  accessToken: loginResponse.data.accessToken,
  refreshToken: loginResponse.data.refreshToken,
  expiresAt: loginResponse.data.expiresAt,
  tokenType: 'Bearer'
});

// Now all requests will include authentication
const protectedData = await client.get('/protected-endpoint');

// Logout
client.clearToken();
```

### **Error Handling**

```typescript
import { TanqoryError } from '@tanqory/core';

try {
  const data = await client.get('/api/data');
  console.log('Success:', data.data);
} catch (error) {
  if (error instanceof TanqoryError) {
    switch (true) {
      case error.isAuthError():
        console.log('Authentication required');
        // Redirect to login
        break;
        
      case error.isForbidden():
        console.log('Access denied');
        // Show permission error
        break;
        
      case error.isNotFound():
        console.log('Resource not found');
        // Show 404 message
        break;
        
      case error.isRateLimited():
        console.log('Rate limit exceeded');
        // Show rate limit message
        break;
        
      case error.isRetryable():
        console.log('Server error, retrying...');
        // Implement retry logic
        break;
        
      default:
        console.log('Unknown error:', error.message);
    }
  } else {
    console.log('Network error:', error.message);
  }
}
```

### **Advanced Configuration**

```typescript
const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com',
  
  // Performance settings
  timeout: 45000,           // 45 second timeout
  retries: 5,              // Retry up to 5 times
  retryDelay: 2000,        // 2 second initial delay
  
  // Caching settings
  enableCaching: true,     // Enable response caching
  cacheTTL: 600000,       // 10 minute cache TTL
  
  // Authentication settings
  tokenStorage: 'env',     // Store tokens in environment
  
  // Security settings
  hmacSecret: process.env.HMAC_SECRET,
  
  // Logging settings
  logLevel: 'debug'        // Verbose logging
});

// Custom request configuration
const response = await client.get('/data', {
  timeout: 10000,          // Override default timeout
  skipCache: true,         // Skip cache for this request
  retries: 1,             // Only retry once
  headers: {
    'X-Custom-Header': 'value'
  },
  params: {
    limit: 100,
    offset: 0
  }
});
```

### **Security Features**

```typescript
import { SecurityUtils } from '@tanqory/core';

// Generate webhook signature
const webhookData = JSON.stringify(payload);
const signature = SecurityUtils.generateHmacSignature(
  webhookData,
  'webhook-secret',
  'sha256'
);

// Verify webhook signature
const receivedSignature = request.headers['x-signature'];
const isValid = SecurityUtils.verifyHmacSignature(
  webhookData,
  receivedSignature,
  'webhook-secret'
);

if (!isValid) {
  throw new Error('Invalid webhook signature');
}
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Authentication Errors**
```typescript
// Problem: 401 Unauthorized
// Solution: Check token validity
const tokenData = client.getToken();
if (!tokenData || !client.isTokenValid()) {
  // Token expired or missing, refresh or re-authenticate
  await refreshAuthToken();
}
```

#### **Rate Limiting**
```typescript
// Problem: 429 Too Many Requests
// Solution: Implement exponential backoff
catch (error) {
  if (error.isRateLimited()) {
    const retryAfter = error.response?.headers['retry-after'] || 60;
    await sleep(retryAfter * 1000);
    // Retry request
  }
}
```

#### **Network Timeouts**
```typescript
// Problem: Request timeouts
// Solution: Increase timeout or optimize requests
const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com',
  timeout: 60000,  // Increase to 60 seconds
  retries: 3       // Enable retries
});
```

This comprehensive API documentation provides complete reference for all @tanqory/core functionality with practical examples and troubleshooting guidance.