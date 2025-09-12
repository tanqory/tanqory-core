# Library Development Standards

## 🎯 **Overview**

This document provides a complete template for creating enterprise-grade NPM libraries using **TypeScript**. Use this as a checklist when building new packages to ensure consistency, quality, and maintainability.

### **Technology Stack**
- **Language**: TypeScript (primary) with JavaScript support
- **Runtime**: Node.js (16.x, 18.x, 20.x)
- **Package Manager**: NPM
- **Testing**: Jest with TypeScript support
- **Build**: TypeScript Compiler (tsc)

## 📁 **Project Structure Template**

### **Core Structure (Required)**
```
your-library-name/
├── 📁 src/                        # Source code directory
│   ├── 📄 index.ts                # Main entry point & exports
│   ├── 📄 types.ts                # TypeScript type definitions
│   └── 📁 __tests__/              # Test files directory
├── 📄 package.json                # NPM package configuration
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 README.md                   # Project documentation
└── 📄 .gitignore                  # Git ignore patterns
```

### **Quality Assurance (Recommended)**
```
├── 📄 .eslintrc.js                # ESLint configuration
├── 📄 .prettierrc.js              # Code formatting rules
├── 📄 .prettierignore             # Prettier ignore patterns
├── 📄 jest.config.js              # Testing configuration
└── 📄 .releaserc.json             # Semantic release setup
```

### **Development Workflow (Advanced)**
```
├── 📁 .github/workflows/          # CI/CD automation
├── 📁 .husky/                     # Git hooks (pre-commit, pre-push)
├── 📁 .vscode/                    # Editor configuration
├── 📁 docs/                       # Comprehensive documentation
└── 📄 CLAUDE.md                   # AI development guidance
```

### **Structure Guidelines**
- **TypeScript First**: All source code in `.ts` files with proper type definitions
- **Keep it minimal**: Start with core structure, add complexity as needed
- **Feature-based organization**: Group related functionality in modules
- **Clear separation**: Tests, docs, and config in dedicated directories
- **Conventional naming**: Follow NPM and TypeScript conventions
- **Build Output**: Compiled JavaScript goes to `dist/` directory

## 🔧 **Essential Configuration Files**

### **1. package.json Template**

```json
{
  "name": "@your-org/your-library",
  "version": "1.0.0",
  "description": "Brief description of your library",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "CHANGELOG.md"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "prepare": "npm run clean && npm run build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.{ts,js,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,js,json,md}\"",
    "typecheck": "tsc --noEmit",
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix"
  },
  "keywords": [
    "your-domain",
    "relevant-keywords"
  ],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-org/your-library.git"
  },
  "bugs": {
    "url": "https://github.com/your-org/your-library/issues"
  },
  "homepage": "https://github.com/your-org/your-library#readme",
  "dependencies": {
    // Only production dependencies
  },
  "devDependencies": {
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/commit-analyzer": "^11.1.0",
    "@semantic-release/git": "^10.0.1",
    "@semantic-release/github": "^9.2.6",
    "@semantic-release/npm": "^11.0.2",
    "@semantic-release/release-notes-generator": "^12.1.0",
    "@types/jest": "^29.5.8",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    "husky": "^8.0.3",
    "jest": "^29.7.0",
    "license-checker": "^25.0.1",
    "lint-staged": "^15.0.2",
    "prettier": "^3.0.3",
    "semantic-release": "^22.0.12",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "publishConfig": {
    "access": "public"
  },
  "lint-staged": {
    "src/**/*.{ts,js}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "src/**/*.{json,md}": [
      "prettier --write",
      "git add"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test && npm run typecheck"
    }
  }
}
```

### **2. tsconfig.json Template**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### **3. .eslintrc.js Template**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'eqeqeq': ['error', 'always'],
    'curly': 'error',
    'no-eval': 'error',
  },
  env: {
    node: true,
    jest: true,
    es2020: true,
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
```

### **4. .prettierrc.js Template**

```javascript
module.exports = {
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  bracketSameLine: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
};
```

### **5. jest.config.js Template**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### **6. .gitignore Template**

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Build outputs
dist/
build/
lib/
es/

# Coverage directory
coverage/
*.lcov
.nyc_output

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm
.eslintcache
.stylelintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# Cache directories
.cache/
.parcel-cache

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Test results
junit.xml
test-results/

# Security scan results
snyk.sarif

# Reports
license-report.json
audit-report.json
```

## 🚀 **CI/CD Pipeline Template**

### **GitHub Actions CI (.github/workflows/ci.yml)**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  release:
    types: [published]

jobs:
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run type checking
        run: npm run typecheck
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run security audit
        run: npm audit --audit-level=moderate
          
  build:
    name: Build & Package
    runs-on: ubuntu-latest
    needs: [test, security]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build package
        run: npm run build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/
            
  publish:
    name: Publish to NPM
    runs-on: ubuntu-latest
    needs: [build]
    if: github.event_name == 'release' && github.event.action == 'published'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build package
        run: npm run build
        
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🧪 **Testing Standards**

### **Test Structure Template**

```typescript
// src/__tests__/example.test.ts
import { YourClass } from '../your-class';

describe('YourClass', () => {
  let instance: YourClass;

  beforeEach(() => {
    instance = new YourClass();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      expect(instance).toBeDefined();
    });

    it('should accept configuration options', () => {
      const config = { option: 'value' };
      const configuredInstance = new YourClass(config);
      expect(configuredInstance).toBeDefined();
    });
  });

  describe('Method Name', () => {
    it('should handle successful case', () => {
      // Arrange
      const input = 'test input';
      const expected = 'expected output';

      // Act
      const result = instance.method(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle error case', () => {
      expect(() => instance.method(null)).toThrow('Expected error message');
    });

    it('should handle edge case', () => {
      const edgeInput = '';
      const result = instance.method(edgeInput);
      expect(result).toBeDefined();
    });
  });
});
```

### **Coverage Requirements**
- **Line Coverage**: 90%+
- **Branch Coverage**: 90%+
- **Function Coverage**: 90%+
- **Statement Coverage**: 90%+

## 📝 **AI-First Documentation Template**

### **Component Documentation**

```typescript
/**
 * @aiDescription Brief description of what this component does
 * @aiPurpose [create|read|update|delete|process|validate|authenticate]
 * @aiModifiable [true|false] - Whether AI can safely modify this code
 * @aiRiskLevel [low|medium|high|critical] - Risk level for modifications
 * @aiSecurityCritical [true|false] - Contains security-sensitive logic
 * @aiBusinessCritical [true|false] - Contains critical business logic
 * @aiPerformanceCritical [true|false] - Performance-sensitive code
 * @aiDomain [domain-name] - Business domain this belongs to
 * @aiLayer [controller|service|repository|model|utility] - Architecture layer
 * @aiCapabilities ['CAPABILITY1', 'CAPABILITY2'] - What this component can do
 * @aiDependencies ['dep1', 'dep2'] - External dependencies
 * @aiBusinessRules ['rule1', 'rule2'] - Business constraints to follow
 * @aiValidationRules ['validation1', 'validation2'] - Input validation rules
 * @aiCurrentGaps ['gap1', 'gap2'] - Known limitations or missing features
 * @aiImprovementHints [
 *   'specific-improvement-1',
 *   'specific-improvement-2'
 * ]
 * @aiTestScenarios ['scenario1', 'scenario2'] - Required test scenarios
 * @aiErrorPrevention Common pitfalls and how to avoid them
 */
export class YourClass {
  // Implementation
}
```

## 🔒 **Security Standards Checklist**

### **Code Security**
- ✅ Input validation on all public methods
- ✅ Output sanitization for logging
- ✅ No hardcoded secrets or API keys
- ✅ Secure error messages (no sensitive data exposure)
- ✅ Protection against common vulnerabilities (injection, XSS, etc.)

### **Dependency Security**
- ✅ Regular dependency updates
- ✅ Vulnerability scanning in CI/CD
- ✅ License compliance checking
- ✅ Minimal dependency footprint

### **Build Security**
- ✅ Secure CI/CD pipeline
- ✅ Signed releases
- ✅ Protected main branch
- ✅ Required status checks

## 🎯 **Quality Gates**

### **Pre-commit Requirements**
- ✅ Code formatting (Prettier)
- ✅ Linting (ESLint) with no errors
- ✅ Type checking (TypeScript) with no errors

### **Pre-push Requirements**
- ✅ All tests passing
- ✅ Test coverage above threshold
- ✅ Build successful

### **Release Requirements**
- ✅ All CI checks passing
- ✅ Security scan clean
- ✅ Documentation updated
- ✅ Changelog generated

## 📚 **Documentation Requirements**

### **Essential Files**
1. **README.md** - Installation, usage, API reference
2. **CHANGELOG.md** - Auto-generated release notes
3. **docs/api-documentation.md** - Complete API reference
4. **docs/development-standards.md** - Development guidelines
5. **CLAUDE.md** - AI assistance configuration

### **README Template Structure**
```markdown
# Library Name

Brief description

## Installation
```bash
npm install @your-org/your-library
```

## Quick Start
```typescript
import { Library } from '@your-org/your-library';
const lib = new Library();
```

## API Reference
### Constructor
### Methods
### Examples

## Configuration
### Options
### Environment Variables

## Error Handling
### Error Types
### Best Practices

## Contributing
### Development Setup
### Testing
### Release Process

## License
MIT
```

## 🚀 **Release Process Template**

### **Semantic Versioning**
- **PATCH** (1.0.1): Bug fixes, documentation
- **MINOR** (1.1.0): New features, backward compatible
- **MAJOR** (2.0.0): Breaking changes

### **Commit Message Format**
```bash
type(scope): description

feat: add new feature
fix: resolve bug
docs: update documentation
test: add tests
refactor: improve code structure
perf: improve performance
ci: update CI/CD
chore: maintenance tasks

# Breaking changes
feat!: change API interface
BREAKING CHANGE: method signature changed
```

### **Release Automation**
```json
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

## ✅ **Pre-Launch Checklist**

### **Code Quality**
- [ ] TypeScript strict mode enabled
- [ ] ESLint configuration complete
- [ ] Prettier formatting applied
- [ ] Test coverage > 90%
- [ ] All tests passing
- [ ] Build successful

### **Documentation**
- [ ] README.md complete with examples
- [ ] API documentation comprehensive
- [ ] CHANGELOG.md initialized
- [ ] License file added
- [ ] Contributing guidelines created

### **CI/CD**
- [ ] GitHub Actions workflows configured
- [ ] Security scanning enabled
- [ ] Automated testing on multiple Node versions
- [ ] NPM publishing automated
- [ ] Release automation configured

### **Security**
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Dependencies audit clean
- [ ] License compliance verified
- [ ] Security scan passing

### **Publishing**
- [ ] NPM organization setup
- [ ] Package name available
- [ ] Scoped package configured
- [ ] Publishing permissions set
- [ ] 2FA enabled for publishing

### **VS Code Integration**
- [ ] Workspace settings configured
- [ ] Recommended extensions list
- [ ] Debug configurations
- [ ] Task definitions

This comprehensive template ensures every library you create meets enterprise-grade standards and can be easily maintained and extended.