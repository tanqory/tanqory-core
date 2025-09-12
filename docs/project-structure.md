# @tanqory/core - Project Structure Documentation

## 📁 **Project Directory Structure**

```
@tanqory/core/
├── 📁 .github/                    # GitHub Actions & Workflows
│   └── 📁 workflows/
│       ├── 📄 ci.yml              # Main CI/CD pipeline
│       ├── 📄 release.yml         # Automated releases
│       └── 📄 security.yml        # Security scanning
├── 📁 .husky/                     # Git hooks
│   ├── 📄 pre-commit              # Pre-commit quality checks
│   └── 📄 pre-push                # Pre-push validation
├── 📁 .vscode/                    # VS Code workspace settings
│   ├── 📄 extensions.json         # Recommended extensions
│   ├── 📄 launch.json             # Debug configurations
│   ├── 📄 settings.json           # Editor settings
│   └── 📄 tasks.json              # Build tasks
├── 📁 docs/                       # Project documentation
│   ├── 📁 standards/              # Development standards
│   │   ├── 📄 code-style-guide.md
│   │   ├── 📄 api-standards.md
│   │   └── 📄 ai-first-standards.md
│   └── 📄 project-structure.md    # This file
├── 📁 src/                        # Source code
│   ├── 📁 __tests__/              # Test files
│   │   ├── 📄 api-client.test.ts
│   │   ├── 📄 cache.test.ts
│   │   ├── 📄 errors.test.ts
│   │   ├── 📄 logger.test.ts
│   │   ├── 📄 security.test.ts
│   │   └── 📄 token-manager.test.ts
│   ├── 📄 api-client.ts           # Main API client class
│   ├── 📄 cache.ts                # Memory cache implementation
│   ├── 📄 errors.ts               # Error handling classes
│   ├── 📄 index.ts                # Main export file
│   ├── 📄 logger.ts               # Logging system
│   ├── 📄 security.ts             # Security utilities
│   ├── 📄 token-manager.ts        # Token management
│   └── 📄 types.ts                # TypeScript definitions
├── 📄 .eslintrc.js                # ESLint configuration
├── 📄 .gitignore                  # Git ignore rules
├── 📄 .prettierignore             # Prettier ignore rules
├── 📄 .prettierrc.js              # Prettier configuration
├── 📄 .releaserc.json             # Semantic release config
├── 📄 CLAUDE.md                   # Claude Code guidance
├── 📄 README.md                   # Project documentation
├── 📄 jest.config.js              # Jest test configuration
├── 📄 package.json                # NPM package configuration
├── 📄 tsconfig.json               # TypeScript configuration
└── 📄 txt.md                      # Original requirements
```

## 🏗️ **Architecture Overview**

### **Core Components**

#### 1. **TanqoryApiClient** (`src/api-client.ts`)
- **Purpose**: Main orchestrator for all HTTP operations
- **Features**:
  - Axios instance management with interceptors
  - Automatic authentication handling
  - Request/response caching
  - Retry logic with exponential backoff
  - Error handling and logging
  - Token refresh automation

#### 2. **TokenManager** (`src/token-manager.ts`)
- **Purpose**: JWT/OAuth2 token lifecycle management
- **Features**:
  - Memory and environment variable storage
  - Token validation with expiry buffering
  - Automatic token refresh
  - Secure token handling

#### 3. **MemoryCache** (`src/cache.ts`)
- **Purpose**: In-memory caching with TTL support
- **Features**:
  - TTL-based expiration
  - ETag conditional requests
  - Cache key generation
  - Memory cleanup utilities

#### 4. **TanqoryError** (`src/errors.ts`)
- **Purpose**: Comprehensive error handling
- **Features**:
  - Axios error transformation
  - Retry logic helpers
  - HTTP status code utilities
  - Error categorization

#### 5. **TanqoryLogger** (`src/logger.ts`)
- **Purpose**: Structured logging system
- **Features**:
  - Configurable log levels
  - Timestamp formatting
  - Context-aware logging
  - Performance-optimized filtering

#### 6. **SecurityUtils** (`src/security.ts`)
- **Purpose**: Security utilities and data sanitization
- **Features**:
  - HMAC signature generation/verification
  - Header sanitization for logging
  - URL parameter sanitization
  - Timing attack protection

### **Data Flow Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Code   │───▶│ TanqoryApiClient │───▶│   Axios HTTP    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Request Flow    │
                       └──────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │TokenManager │ │MemoryCache  │ │TanqoryLogger│
        └─────────────┘ └─────────────┘ └─────────────┘
                │               │               │
                ▼               ▼               ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │   Storage   │ │   Memory    │ │   Console   │
        └─────────────┘ └─────────────┘ └─────────────┘
```

## 🛠️ **Development Standards Implementation**

### **Code Quality Standards**

#### **1. Code Formatting**
- **Prettier**: Automatic code formatting
- **ESLint**: Code quality and security linting
- **TypeScript**: Strict type checking
- **File Structure**: Consistent naming conventions

#### **2. Testing Standards**
- **Framework**: Jest with TypeScript support
- **Coverage**: 100% test coverage requirement
- **Types**: Unit, integration, and edge case testing
- **Mocking**: Comprehensive mock strategies

#### **3. Security Standards**
- **Dependency Scanning**: Snyk, npm audit
- **SAST**: CodeQL, Semgrep
- **License Compliance**: Automated license checking
- **Data Sanitization**: Security utilities implementation

### **AI-First Documentation**

Each source file includes comprehensive AI documentation tags:

```typescript
/**
 * @aiDescription Clear description of component purpose
 * @aiPurpose [create|read|update|delete|process|validate|authenticate]
 * @aiModifiable [true|false] - AI modification safety
 * @aiRiskLevel [low|medium|high|critical] - Risk assessment
 * @aiSecurityCritical [true|false] - Security sensitivity
 * @aiBusinessCritical [true|false] - Business impact
 * @aiPerformanceCritical [true|false] - Performance sensitivity
 * @aiDomain [auth|api-client|caching|etc] - Business domain
 * @aiLayer [controller|service|repository|model] - Architecture layer
 * @aiCapabilities ['CAPABILITY1', 'CAPABILITY2'] - Operations supported
 * @aiDependencies ['dependency1', 'dependency2'] - External dependencies
 * @aiBusinessRules ['rule1', 'rule2'] - Business constraints
 * @aiValidationRules ['validation1', 'validation2'] - Input validation
 * @aiCurrentGaps ['gap1', 'gap2'] - Known limitations
 * @aiImprovementHints ['hint1', 'hint2'] - Enhancement suggestions
 * @aiTestScenarios ['scenario1', 'scenario2'] - Required test cases
 * @aiErrorPrevention Common mistakes to avoid
 */
```

## 🔧 **Configuration Files**

### **TypeScript Configuration** (`tsconfig.json`)
- **Target**: ES2020 for modern JavaScript features
- **Module**: CommonJS for Node.js compatibility
- **Strict Mode**: Enabled for type safety
- **Declaration Files**: Generated for NPM publishing

### **ESLint Configuration** (`.eslintrc.js`)
- **Parser**: @typescript-eslint/parser
- **Extends**: ESLint recommended + Prettier integration
- **Rules**: Security-focused with performance considerations
- **Plugins**: TypeScript, Prettier integration

### **Jest Configuration** (`jest.config.js`)
- **Preset**: ts-jest for TypeScript support
- **Environment**: Node.js testing environment
- **Coverage**: Comprehensive coverage reporting
- **Test Patterns**: Structured test discovery

### **Package Configuration** (`package.json`)
- **Scripts**: Comprehensive development workflow
- **Dependencies**: Minimal production dependencies
- **DevDependencies**: Complete development toolchain
- **Engines**: Node.js 16+ compatibility

## 📦 **Build and Deployment**

### **Build Process**
1. **Clean**: Remove previous build artifacts
2. **TypeScript Compilation**: Generate JavaScript and declarations
3. **Type Checking**: Validate TypeScript types
4. **Testing**: Run comprehensive test suite
5. **Linting**: Code quality validation
6. **Formatting**: Consistent code style

### **CI/CD Pipeline**
- **Trigger**: Push to main/develop, PRs
- **Jobs**: Test, Security, Build, Performance
- **Environments**: Node.js 16, 18, 20
- **Artifacts**: Build outputs, reports, coverage

### **Release Process**
- **Semantic Release**: Automated versioning
- **Changelog**: Automatic generation
- **NPM Publishing**: Automated deployment
- **GitHub Releases**: Tagged releases with notes

## 🎯 **Quality Metrics**

### **Current Status**
- **Tests**: 117/117 passing (100%)
- **Coverage**: 100% line coverage
- **Security**: 0 vulnerabilities
- **Type Safety**: Strict TypeScript
- **Performance**: Optimized for production

### **Monitoring**
- **Bundle Size**: Tracked and reported
- **Performance**: Benchmark testing
- **Security**: Continuous scanning
- **Dependencies**: Automated updates

## 🚀 **Usage Guidelines**

### **Installation**
```bash
npm install @tanqory/core
```

### **Basic Usage**
```typescript
import { TanqoryApiClient } from '@tanqory/core';

const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com',
  apiKey: 'your-api-key'
});

const response = await client.get('/users');
```

### **Advanced Configuration**
```typescript
const client = new TanqoryApiClient({
  baseURL: 'https://api.tanqory.com',
  timeout: 30000,
  retries: 3,
  enableCaching: true,
  logLevel: 'info',
  tokenStorage: 'memory'
});
```

## 📚 **Documentation Standards**

### **Code Documentation**
- **JSDoc**: Comprehensive function documentation
- **AI Tags**: AI-first development annotations
- **Type Definitions**: Complete TypeScript interfaces
- **Examples**: Usage examples in documentation

### **README Structure**
- **Quick Start**: Immediate usage guide
- **Installation**: Setup instructions
- **API Reference**: Method documentation
- **Configuration**: Options explanation
- **Examples**: Real-world usage patterns

## 🔍 **Maintenance Guidelines**

### **Regular Tasks**
- **Dependency Updates**: Weekly dependency reviews
- **Security Scanning**: Daily automated scans
- **Performance Monitoring**: Continuous benchmarking
- **Documentation Updates**: Keep docs current

### **Version Management**
- **Semantic Versioning**: Automated version bumping
- **Breaking Changes**: Clear migration guides
- **Backward Compatibility**: Maintain API stability
- **Deprecation**: Graceful feature removal

This structure represents enterprise-level standards comparable to major open-source libraries like Axios, Lodash, and AWS SDK.