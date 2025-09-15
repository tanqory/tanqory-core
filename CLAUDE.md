# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Build the library
npm run build

# Development mode with file watching  
npm run dev

# Clean build artifacts
npm run clean

# Run tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint

# Full build preparation (clean + build)
npm run prepare
```

## Architecture Overview

This is the **@tanqory/core** library - an essential SDK for Tanqory's e-commerce platform. The architecture follows a modular design with clear separation of concerns:

### Core Components

**TanqoryApiClient** (`src/api-client.ts`) - The main client class that orchestrates all functionality:
- Manages an Axios instance with automatic interceptors
- Integrates TokenManager, MemoryCache, TanqoryLogger, and SecurityUtils
- Handles request/response lifecycle with automatic retries and error handling
- Supports JWT/OAuth2 token refresh on 401 errors
- Implements conditional caching with ETag support

**TokenManager** (`src/token-manager.ts`) - Handles authentication tokens:
- Supports both memory and environment variable storage (`tokenStorage: 'memory' | 'env'`)
- Automatic token validation with 5-minute expiry buffer
- Environment variables: `TANQORY_ACCESS_TOKEN`, `TANQORY_REFRESH_TOKEN`, `TANQORY_TOKEN_EXPIRES_AT`

**MemoryCache** (`src/cache.ts`) - In-memory caching with TTL:
- Cache keys generated from URL + method + parameters
- Supports ETag-based conditional requests (304 Not Modified)
- Automatic cleanup of expired entries

**Error Handling** (`src/errors.ts`) - Comprehensive error management:
- `TanqoryError` extends Error with status codes and response data
- Built-in retry logic for server errors (5xx) and rate limiting (429)
- Helper methods like `isRetryable()`, `isAuthError()`, `isRateLimited()`

### Configuration System

All components are configured through the `TanqoryConfig` interface:
- `baseURL` - API endpoint base URL
- `apiKey` - API key authentication (alternative to tokens)
- `timeout` - Request timeout (default: 30000ms)
- `retries` - Max retry attempts (default: 3)
- `tokenStorage` - Token storage method ('memory' | 'env')
- `enableCaching` - Enable response caching (default: false)
- `enableTokenRefresh` - Enable automatic token refresh on 401 errors (default: false)
- `logLevel` - Logging verbosity ('debug' | 'info' | 'warn' | 'error')
- `hmacSecret` - HMAC verification secret

### Request Flow

1. **Request Setup**: Authentication headers added via interceptor
2. **Cache Check**: GET requests check cache first (if enabled)  
3. **Execution**: Request sent with retry logic on failures
4. **Token Refresh**: Automatic token refresh on 401 errors
5. **Cache Storage**: Successful GET responses cached with ETag
6. **Error Handling**: Errors wrapped in TanqoryError with context

### Security Features

**SecurityUtils** (`src/security.ts`) provides:
- HMAC signature generation and verification
- Header sanitization for logging (removes sensitive data)
- URL sanitization for logging (redacts sensitive parameters)

### TypeScript Integration

All types defined in `src/types.ts` with full TypeScript support. Key interfaces:
- `TanqoryConfig` - Client configuration
- `RequestConfig` - Individual request options  
- `ApiResponse<T>` - Standardized response wrapper
- `TokenData` - Authentication token structure

The library exports from `src/index.ts` for both default and named imports.

## Important Documentation to Reference

When working on this project, always reference these files for coding standards and best practices:

### 1. Code Style Guide
- **File**: `docs/standards/code-style-guide.md`
- **Purpose**: Contains comprehensive coding standards, formatting rules, and best practices

### 2. API Standards
- **File**: `docs/standards/api-standards.md`
- **Purpose**: Defines API design patterns, error handling, and implementation guidelines

### 3. AI-First Development Standards
- **File**: `docs/standards/ai-first-standards.md`
- **Purpose**: Guidelines for AI-assisted development, documentation, and code generation

## Key Instructions for Claude Code

1. **Always follow the coding standards** defined in the above files
2. **Maintain consistency** with existing code patterns in the project
3. **Use proper TypeScript types** and avoid `any` when possible
4. **Follow the established project structure** in the monorepo
5. **Include proper error handling** as defined in api-standards.md
6. **Document code changes** following ai-first-standards.md guidelines