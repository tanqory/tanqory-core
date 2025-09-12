# API Standards & Guidelines

## 📋 **Table of Contents**
- [URL Naming Conventions](#url-naming-conventions)
- [HTTP Methods & Endpoints](#http-methods--endpoints)
- [Request Standards](#request-standards)
- [Response Standards](#response-standards)
- [Status Codes](#status-codes)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Filtering & Sorting](#filtering--sorting)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [AI Documentation Standards](#ai-documentation-standards)

---

## 🔗 **URL Naming Conventions**

### **Base URL Structure**
```
https://api.example.com/v1/{resource}
```

### **Resource Naming Rules**
- ✅ **Use plural nouns**: `/users`, `/products`, `/orders`
- ✅ **Use lowercase**: `/users` not `/Users`
- ✅ **Use hyphens for compound words**: `/user-profiles` not `/userProfiles`
- ✅ **Keep it simple**: `/users/{id}/orders` not `/users/{id}/user-orders`

### **URL Examples**
```bash
# Good Examples
GET /api/v1/users
GET /api/v1/users/123
GET /api/v1/users/123/orders
POST /api/v1/user-profiles
GET /api/v1/product-categories

# Bad Examples
GET /api/v1/getUsers
GET /api/v1/user
GET /api/v1/users/getUserById/123
POST /api/v1/createUser
```

### **Nested Resources**
```bash
# Collection under resource
GET /api/v1/users/{user-id}/orders
POST /api/v1/users/{user-id}/orders

# Single resource under resource  
GET /api/v1/users/{user-id}/profile
PUT /api/v1/users/{user-id}/profile

# Maximum 3 levels deep
GET /api/v1/users/{user-id}/orders/{order-id}/items
```

---

## 🛠️ **HTTP Methods & Endpoints**

### **Standard CRUD Operations**

| Method | Endpoint | Purpose | Success Code |
|--------|----------|---------|--------------|
| `GET` | `/users` | Get all users | 200 |
| `GET` | `/users/{id}` | Get specific user | 200 |
| `POST` | `/users` | Create new user | 201 |
| `PUT` | `/users/{id}` | Update entire user | 200 |
| `PATCH` | `/users/{id}` | Partial update user | 200 |
| `DELETE` | `/users/{id}` | Delete user | 200/204 |

### **Additional Actions**
```bash
# Action-based endpoints (use POST for actions)
POST /api/v1/users/{id}/activate
POST /api/v1/users/{id}/deactivate  
POST /api/v1/users/{id}/reset-password
POST /api/v1/orders/{id}/cancel
POST /api/v1/orders/{id}/fulfill

# Search endpoints
GET /api/v1/users/search?q=john&status=active
GET /api/v1/products/search?category=electronics&priceMin=100

# Bulk operations
POST /api/v1/users/bulk-create
PUT /api/v1/users/bulk-update
DELETE /api/v1/users/bulk-delete
```

---

## 📥 **Request Standards**

### **Headers**
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {accessToken}
X-Request-ID: {unique_request_id}
User-Agent: {application_name}/{version}
```

### **Request Body Format**

#### **Create Request (POST)**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "user",
  "profile": {
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "US"
    }
  }
}
```

#### **Update Request (PUT/PATCH)**
```json
{
  "name": "John Smith",
  "profile": {
    "phone": "+1234567899"
  }
}
```

#### **Bulk Operations**
```json
{
  "items": [
    {
      "id": "123",
      "name": "Updated Name 1"
    },
    {
      "id": "456", 
      "name": "Updated Name 2"
    }
  ],
  "options": {
    "validateAll": true,
    "stopOnError": false
  }
}
```

### **Query Parameters**

#### **Pagination**
```bash
GET /api/v1/users?page=1&limit=20
```

#### **Filtering**
```bash
GET /api/v1/users?role=admin&status=active&createdAfter=2024-01-01
```

#### **Sorting**
```bash
GET /api/v1/users?sort=name            # Ascending
GET /api/v1/users?sort=-createdAt     # Descending
GET /api/v1/users?sort=name,-createdAt # Multiple fields
```

#### **Field Selection**
```bash
GET /api/v1/users?fields=id,name,email
```

#### **Including Related Data**
```bash
GET /api/v1/users?include=profile,orders
```

---

## 📤 **Response Standards**

### **Success Response Structure (อ้างอิงจาก Google AIP Style)**

#### **Single Resource Response**
```json
{
  "name": "users/123",
  "displayName": "John Doe", 
  "email": "john.doe@example.com",
  "role": "user",
  "status": "active",
  "profile": {
    "phone": "+1234567890",
    "avatar": "https://cdn.example.com/avatars/123.jpg",
    "address": {
      "lines": ["123 Main St"],
      "city": "New York",
      "state": "NY",
      "country": "US",
      "zip": "10001"
    }
  },
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-01-15T09:30:00Z",
  "etag": "BwWWja0YfJA="
}
```

### **Collection Response (อ้างอิงจาก Stripe/Facebook Style)**

```json
{
  "data": [
    {
      "name": "users/123",
      "displayName": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    },
    {
      "name": "users/456", 
      "displayName": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "admin",
      "createdAt": "2024-01-02T11:00:00Z",
      "updatedAt": "2024-01-02T11:00:00Z"
    }
  ],
  "next": "CiAKGjBpNDd2Nmp2Zml2cXRwYjBpOXA",
  "total": 156
}
```

### **CRUD Operation Responses**

#### **Create Response (POST 201 Created)**
```json
{
  "name": "users/789",
  "displayName": "New User",
  "email": "new.user@example.com",
  "role": "user",
  "status": "active", 
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "etag": "BwWWja0YfJB="
}
```

#### **Update Response (PATCH 200 OK)**

**Request with ETag for conflict prevention:**
```
PATCH /api/users/123
If-Match: "BwWWja0YfJB="
Content-Type: application/json

{
  "displayName": "John Smith Updated"
}
```

**Success Response:**
```json
{
  "name": "users/123",
  "displayName": "John Smith Updated",
  "email": "john.smith@example.com",
  "role": "user",
  "status": "active",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "etag": "BwWWja0YfJC="
}
```

**Conflict Response (409 Conflict):**
```json
{
  "error": {
    "code": "PRECONDITION_FAILED",
    "message": "Resource has been modified by another request",
    "details": {
      "currentEtag": "BwWWja0YfJD=",
      "providedEtag": "BwWWja0YfJB="
    }
  }
}
```

#### **Delete Response (DELETE 200 OK - Soft Delete)**
```json
{
  "name": "users/123",
  "displayName": "John Smith",
  "email": "john.smith@example.com",
  "role": "user", 
  "status": "deleted",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "deletedAt": "2024-01-15T10:30:00Z",
  "etag": "BwWWja0YfJD="
}
```

#### **Delete Response (DELETE 204 No Content - Hard Delete)**
```
HTTP/1.1 204 No Content
Content-Length: 0
X-Request-ID: req_123abc
X-Response-Time: 90ms
```

### **Bulk Operation Response**
```json
{
  "data": {
    "processed": 150,
    "successful": 148,
    "failed": 2,
    "results": [
      {
        "name": "users/123",
        "status": "success",
        "displayName": "Updated Name 1"
      },
      {
        "name": "users/456",
        "status": "failed",
        "error": {
          "code": "VALIDATION_ERROR",
          "message": "Email format is invalid"
        }
      }
    ]
  },
  "message": "Bulk operation completed: 148 successful, 2 failed"
}
```

---

## 📊 **Status Codes**

### **Success Codes (2xx)**
| Code | Name | Usage | When to Use |
|------|------|-------|-------------|
| `200` | OK | GET, PUT, PATCH, DELETE | Request successful |
| `201` | Created | POST | Resource created successfully |
| `202` | Accepted | POST, PUT, PATCH | Request accepted for processing |
| `204` | No Content | DELETE, PUT | Successful, no response body |

### **Client Error Codes (4xx)**
| Code | Name | Usage | When to Use |
|------|------|-------|-------------|
| `400` | Bad Request | Invalid request format or data |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Valid auth but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `405` | Method Not Allowed | HTTP method not supported |
| `409` | Conflict | Resource already exists or conflict |
| `422` | Unprocessable Entity | Validation errors |
| `429` | Too Many Requests | Rate limit exceeded |

### **Server Error Codes (5xx)**
| Code | Name | Usage | When to Use |
|------|------|-------|-------------|
| `500` | Internal Server Error | Unexpected server error |
| `502` | Bad Gateway | Upstream server error |
| `503` | Service Unavailable | Service temporarily down |
| `504` | Gateway Timeout | Upstream server timeout |

---

## 🚨 **Error Handling**

### **Error Response Structure**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for one or more fields",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid",
        "value": "invalid-email",
        "code": "INVALID_FORMAT"
      },
      {
        "field": "age",
        "message": "Age must be between 18 and 100",
        "value": 150,
        "code": "OUT_OF_RANGE"
      }
    ]
  }
}
```

### **Common Error Codes**
```bash
# Validation Errors
VALIDATION_ERROR          # General validation failure
REQUIRED_FIELD_MISSING    # Required field not provided
INVALID_FORMAT           # Field format is invalid
OUT_OF_RANGE            # Value outside allowed range
INVALID_LENGTH          # String too long/short

# Authentication/Authorization Errors  
UNAUTHORIZED            # No valid authentication
FORBIDDEN              # Insufficient permissions
TOKEN_EXPIRED          # Authentication token expired
TOKEN_INVALID          # Authentication token invalid

# Resource Errors
NOT_FOUND              # Resource doesn't exist
ALREADY_EXISTS         # Resource already exists
CONFLICT               # Resource conflict
GONE                   # Resource permanently deleted

# Business Logic Errors
INSUFFICIENT_BALANCE    # Not enough balance for transaction
ACCOUNT_SUSPENDED      # User account is suspended
OPERATION_NOT_ALLOWED  # Business rule violation

# System Errors
INTERNAL_ERROR         # Unexpected server error
SERVICE_UNAVAILABLE    # Service temporarily down
RATE_LIMIT_EXCEEDED    # Too many requests
```

### **Specific Error Examples**

#### **Validation Error (422)**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The email field is required and must be a valid email address",
    "details": [
      {
        "field": "email",
        "message": "The email field is required",
        "code": "REQUIRED_FIELD_MISSING"
      }
    ]
  }
}
```

#### **Authentication Error (401)**
```json
{
  "error": {
    "code": "UNAUTHORIZED", 
    "message": "Valid authentication credentials are required",
    "details": {
      "reason": "missingToken",
      "suggestion": "Include Authorization header with Bearer token"
    }
  }
}
```

#### **Not Found Error (404)**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User with ID '123' was not found",
    "details": {
      "resource": "user",
      "resourceId": "123",
      "suggestion": "Check if the user ID is correct or if the user has been deleted"
    }
  }
}
```

#### **Rate Limit Error (429)**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later",
    "details": {
      "limit": 100,
      "window": "15 minutes", 
      "retryAfter": 900,
      "resetTime": "2024-01-15T10:45:00Z"
    }
  }
}
```

---

## 📄 **Pagination**

### **Standard Pagination (Page-based)**

#### **Query Parameters**
```bash
GET /api/v1/users?page=2&limit=20
```

#### **Page-based Response**
```json
{
  "data": [
    {
      "name": "users/123",
      "displayName": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    },
    {
      "name": "users/456",
      "displayName": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "admin",
      "createdAt": "2024-01-02T11:00:00Z",
      "updatedAt": "2024-01-02T11:00:00Z"
    }
  ],
  "page": 2,
  "limit": 20,
  "total": 156,
  "pages": 8,
  "hasNext": true,
  "hasPrev": true
}
```

### **MongoDB Cursor-based Pagination (Simple ObjectId)**

#### **Query Parameters**
```bash
# First page (no cursor)
GET /api/v1/users?limit=20

# Next page (using next from previous response)
GET /api/v1/users?next=507f1f77bcf86cd799439012&limit=20
```

#### **MongoDB Cursor Response**
```json
{
  "data": [
    {
      "name": "users/507f1f77bcf86cd799439011",
      "displayName": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2024-01-01T10:00:00Z"
    },
    {
      "name": "users/507f1f77bcf86cd799439012",
      "displayName": "Jane Smith",
      "email": "jane.smith@example.com", 
      "createdAt": "2024-01-02T11:00:00Z"
    }
  ],
  "next": "507f1f77bcf86cd799439012",
  "hasMore": true,
  "limit": 20
}
```

#### **MongoDB Query Examples**
```javascript
// First page (no cursor)
db.users.find().sort({ _id: 1 }).limit(20);

// Next page (using next token)
db.users.find({ _id: { $gt: ObjectId("507f1f77bcf86cd799439012") } })
  .sort({ _id: 1 })
  .limit(20);
```

### **Pagination Method Comparison**

| Method | Use Case | Pros | Cons |
|--------|----------|------|------|
| **Page-based** | Small datasets, UI pagination | Simple, shows total pages | Performance issues with large datasets |
| **Cursor-based** | Large datasets, real-time data | High performance, consistent results | No total count, complex UI |

### **When to Use Each Method**

#### **Use Page-based Pagination when:**
- Dataset size < 10,000 records
- Need total count for UI
- Need random page access
- Building admin dashboards
- Simple table pagination

#### **Use Cursor-based Pagination when:**
- Dataset size > 10,000 records
- Real-time data with frequent updates
- Performance is critical
- Mobile apps with infinite scroll
- Data changes frequently

### **Pagination Rules**
- **Default limit**: `10`
- **Maximum limit**: `100`
- **Minimum limit**: `1`
- **Cursor format**: MongoDB ObjectId string (24-character hex)

### **Advanced MongoDB Pagination**

#### **With Custom Sort Field (Encoded Token)**
```bash
# Sort by createdAt with encoded cursor
GET /api/v1/users?next=eyJkYXRlIjoiMjAyNC0wMS0xNVQxMDozMDowMFoiLCJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSJ9&limit=20&sort=createdAt
```

#### **Custom Sort Response**
```json
{
  "data": [
    {
      "name": "users/123",
      "displayName": "John Doe",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "next": "eyJkYXRlIjoiMjAyNC0wMS0xNVQxMDozMDowMFoiLCJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMiJ9",
  "hasMore": true,
  "limit": 20,
  "sortField": "createdAt",
  "sortDirection": "asc"
}
```

#### **MongoDB Query with Custom Sort**
```javascript
// Decode next token: {date: "2024-01-15T10:30:00Z", id: "507f1f77bcf86cd799439011"}
const decoded = JSON.parse(Buffer.from(nextToken, 'base64').toString());

db.users.find({
  $or: [
    { created_at: { $gt: new Date(decoded.date) } },
    { 
      created_at: new Date(decoded.date),
      _id: { $gt: ObjectId(decoded.id) }
    }
  ]
}).sort({ created_at: 1, _id: 1 }).limit(20);
```

---

## 🔍 **Filtering & Sorting**

### **Filtering Examples**
```bash
# Basic filtering
GET /api/v1/users?status=active
GET /api/v1/users?role=admin&status=active

# Date filtering
GET /api/v1/users?createdAfter=2024-01-01
GET /api/v1/users?createdBetween=2024-01-01,2024-01-31

# Numeric filtering  
GET /api/v1/products?priceMin=100&priceMax=500
GET /api/v1/users?ageGte=18&ageLt=65

# Text filtering
GET /api/v1/users?search=john
GET /api/v1/users?nameContains=smith
GET /api/v1/users?emailEndsWith=@company.com

# Array filtering
GET /api/v1/users?roles=admin,manager
GET /api/v1/products?tags=electronics,mobile
```

### **Filter Operators**
```bash
field=value           # Exact match
fieldNot=value       # Not equal
fieldIn=val1,val2    # In array
fieldNotIn=val1,val2 # Not in array
fieldContains=text   # Contains text
fieldStartsWith=text # Starts with text
fieldEndsWith=text  # Ends with text
fieldGt=number       # Greater than
fieldGte=number      # Greater than or equal
fieldLt=number       # Less than
fieldLte=number      # Less than or equal
fieldBetween=min,max # Between values
fieldNull=true       # Is null
fieldNotNull=true   # Is not null
```

### **Sorting Examples**
```bash
# Single field ascending
GET /api/v1/users?sort=name

# Single field descending  
GET /api/v1/users?sort=-createdAt

# Multiple fields
GET /api/v1/users?sort=role,-createdAt,name

# Nested field sorting
GET /api/v1/users?sort=profile.createdAt
```

---

## 🔐 **Authentication**

### **Bearer Token Authentication**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Authentication Errors**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": {
      "type": "missingToken",
      "documentation": "/docs/authentication"
    }
  }
}
```

### **Token Refresh**
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Token Refresh Response**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

---

## ⚡ **Rate Limiting**

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642259400
X-RateLimit-Window: 3600
```

### **Rate Limit Exceeded Response**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "details": {
      "limit": 1000,
      "window": 3600,
      "retryAfter": 1800,
      "resetTime": "2024-01-15T11:30:00Z"
    }
  }
}
```

---

### **API Response Standards Summary**

#### **🏆 Our Standards (Hybrid Approach)**

| Component | Style | Source Reference |
|-----------|-------|------------------|
| **Single Resources** | Google AIP Style | `name`, `etag`, camelCase fields |
| **Collections** | Stripe/Facebook Style | `data` array wrapper |
| **Pagination** | MongoDB-optimized | `next` cursor, `total` count |
| **Field Naming** | camelCase | `createdAt`, `displayName` |
| **HTTP Status** | REST Standards | Proper 2xx, 4xx, 5xx codes |
| **Error Handling** | Industry Standard | Structured error responses |

#### **Key Design Principles**
- **Resource Naming**: Use `name` field for resource identification (users/123)
- **Collections**: Use `data` array for list responses (Stripe/Facebook pattern)
- **Timestamps**: Use `createdAt`, `updatedAt`, `deletedAt` (MongoDB compatible)
- **Pagination**: Use `next` cursor token and `total` count
- **Field Names**: Use camelCase consistently (`displayName`, `lastLoginAt`)
- **ETags**: Include for optimistic concurrency control and caching
  - **Purpose**: Prevent data conflicts when multiple clients modify the same resource
  - **Usage**: Client sends `If-Match: "etag_value"` header for updates
  - **Conflict**: Return `409 Conflict` if ETag doesn't match current version
- **Status Codes**: Always return appropriate HTTP status codes
- **Consistency**: Maintain format consistency across all endpoints

---

## 🚀 **Best Practices Summary (2025 Standards)**

### **✅ DO (อ้างอิงจาก Google AIP Style)**
- Use resource-oriented design with standard methods (Google AIP)
- Implement ETags for optimistic concurrency control (prevents data conflicts)
- Use camelCase field naming: `createdAt`, `updatedAt`, `displayName`
- Use `name` field for resource identification (users/123)
- Use `next` for cursor-based pagination (not `nextPageToken`)
- Use `total` for total count (not `totalSize`)
- Use camelCase for field names consistently
- Include comprehensive error details with suggestions
- Implement proper HTTP status codes (200, 201, 204, 404, etc.)
- Use semantic versioning with backward compatibility
- Support field selection and expansion
- Use ISO 8601 timestamps consistently
- Keep response structure minimal and efficient

### **❌ DON'T**
- Mix different response formats within same API
- Use `success: true/false` wrapper (deprecated pattern)
- Use long field names like `nextPageToken`, `createTime`
- Use snake_case for field names (use camelCase instead)
- Return inconsistent field names (`createdAt` vs `created`)
- Skip ETag implementation for updatable resources
- Use verbs in resource URLs
- Expose internal error details or stack traces
- Return sensitive data in responses
- Implement non-standard authentication schemes
- Skip proper error response structure
- Use inconsistent timestamp formats
- Add unnecessary nested structures (keep it flat when possible)

---

## 🤖 **AI Documentation Standards**

### **AI-Friendly Code Documentation**

#### **@aiDescription Tag**
Use `@aiDescription` to provide AI agents with context about code functionality:

```javascript
/**
 * @aiDescription Handles user authentication with JWT tokens
 * Validates credentials, generates access/refresh tokens
 * Returns user profile data on successful authentication
 */
class AuthController {
  // Implementation
}
```

#### **@aiModifiable Tag**
Mark sections that AI agents can safely modify:

```javascript
/**
 * @aiModifiable
 * User validation rules - can be updated based on requirements
 * Add new validation rules here as needed
 */
const userValidationRules = {
  email: 'required|email',
  password: 'required|min:8',
  // AI can add more rules here
};
```

#### **@aiModificationZone**
Define specific areas where AI can make changes:

```javascript
class UserService {
  /**
   * @aiModificationZone: business-logic
   * Add new user business logic methods below
   */
  
  // AI can add methods here
  
  /**
   * @aiModificationZone: end
   */
}
```

### **AI Code Structure Guidelines**

#### **Repository Pattern Documentation**
```javascript
/**
 * @aiDescription Base repository providing CRUD operations
 * @aiModifiable Extend with domain-specific methods
 */
class BaseRepository {
  /**
   * @aiDescription Creates new record with validation
   * @param {Object} data - Record data to create
   * @returns {Promise<Object>} Created record with ID
   */
  async create(data) {
    // Implementation
  }
}
```

#### **Service Layer Documentation**
```javascript
/**
 * @aiDescription Business logic layer for user operations
 * @aiModifiable Add new business methods as needed
 */
class UserService {
  /**
   * @aiDescription Registers new user with email verification
   * @aiModifiable Update registration flow as requirements change
   */
  async registerUser(userData) {
    // AI can modify this logic
  }
}
```

#### **Controller Documentation**
```javascript
/**
 * @aiDescription REST API controller for user management
 * Follows standard CRUD patterns with proper error handling
 */
class UserController {
  /**
   * @aiDescription GET /api/v1/users - List all users with pagination
   * @aiModifiable Update query parameters and response format
   */
  async getUsers(req, res) {
    // AI can modify response structure
  }
}
```

### **AI Error Prevention Standards**

#### **Type Safety Documentation**
```javascript
/**
 * @aiDescription User data interface with strict typing
 * @aiModifiable Add new user properties with proper types
 */
interface UserData {
  id: string;           // @ai: UUID format required
  email: string;        // @ai: Must be valid email format
  password: string;     // @ai: Min 8 chars, hashed before storage
  role: 'user' | 'admin'; // @ai: Enum only, no custom roles
}
```

#### **Validation Documentation**
```javascript
/**
 * @aiDescription Input validation middleware
 * @aiModifiable Add validation rules for new endpoints
 */
const validateUserInput = {
  /**
   * @aiDescription Email validation with custom error messages
   * @ai: Always use this pattern for email validation
   */
  email: {
    required: true,
    type: 'email',
    message: 'Valid email address required'
  }
};
```

### **AI Testing Standards**

#### **Test Documentation**
```javascript
/**
 * @aiDescription User service test suite
 * @aiModifiable Add test cases for new user operations
 */
describe('UserService', () => {
  /**
   * @aiDescription Test user creation with validation
   * @ai: Always test both success and failure cases
   */
  describe('createUser', () => {
    // AI should follow this test pattern
  });
});
```

#### **Test Data Documentation**
```javascript
/**
 * @aiDescription Test fixtures for user data
 * @aiModifiable Add new test scenarios
 */
const testData = {
  /**
   * @aiDescription Valid user data for positive tests
   * @ai: Use this as template for new valid data
   */
  validUser: {
    email: 'test@example.com',
    password: 'SecurePass123',
    role: 'user'
  },
  
  /**
   * @aiDescription Invalid user data for negative tests  
   * @ai: Add new invalid scenarios here
   */
  invalidUser: {
    email: 'invalid-email',
    password: '123',
    role: 'invalid-role'
  }
};
```

### **AI Architecture Guidelines**

#### **Module Structure**
```
src/
├── controllers/        # @aiDescription REST API endpoints
│   ├── *.controller.js # @aiModifiable Add new controllers
├── services/          # @aiDescription Business logic layer
│   ├── *.service.js   # @aiModifiable Add new services  
├── repositories/      # @aiDescription Data access layer
│   ├── *.repository.js # @aiModifiable Add new repositories
├── models/           # @aiDescription Data models and schemas
│   ├── *.model.js    # @aiModifiable Add new models
├── middleware/       # @aiDescription Request processing
│   ├── *.middleware.js # @aiModifiable Add new middleware
└── utils/            # @aiDescription Helper functions
    ├── *.util.js     # @aiModifiable Add new utilities
```

#### **Dependency Injection Documentation**
```javascript
/**
 * @aiDescription Dependency injection container
 * @aiModifiable Register new services and repositories
 */
class DIContainer {
  constructor() {
    /**
     * @aiModificationZone: service-registration
     * Register new services here following the pattern
     */
    this.userService = new UserService(this.userRepository);
    this.authService = new AuthService(this.userService);
    // AI can add more services here
    /**
     * @aiModificationZone: end
     */
  }
}
```

### **AI Security Guidelines**

#### **Authentication Documentation**
```javascript
/**
 * @aiDescription JWT authentication middleware
 * @ai: Never modify token validation logic without review
 */
const authenticateToken = async (req, res, next) => {
  /**
   * @aiDescription Extract and validate JWT token
   * @ai: Do not change token verification process
   */
  const token = req.headers.authorization?.split(' ')[1];
  // Critical security code - AI should not modify
};
```

#### **Validation Security**
```javascript
/**
 * @aiDescription Input sanitization for security
 * @ai: Always sanitize user input to prevent XSS/injection
 */
const sanitizeInput = {
  /**
   * @aiModifiable Add new sanitization rules
   * @ai: Follow security best practices for all new rules
   */
  email: 'trim|escape',
  password: 'trim', // Don't escape passwords
  name: 'trim|escape'
};
```

### **AI Performance Guidelines**

#### **Database Query Documentation**
```javascript
/**
 * @aiDescription Optimized database queries with indexing
 * @aiModifiable Add new queries with performance considerations
 */
class UserRepository {
  /**
   * @aiDescription Find users with pagination and filtering
   * @ai: Always use indexed fields for filtering
   * @ai: Include pagination to prevent memory issues
   */
  async findUsers(filters, pagination) {
    // AI should follow pagination patterns
  }
}
```

#### **Caching Documentation**
```javascript
/**
 * @aiDescription Redis caching for frequently accessed data
 * @aiModifiable Add caching for new data types
 */
const cacheService = {
  /**
   * @aiDescription Cache user profile with TTL
   * @ai: Set appropriate TTL based on data update frequency
   */
  async cacheUserProfile(userId, profileData) {
    // AI should consider cache invalidation
  }
};
```

### **AI Best Practices Summary**

#### **✅ AI DO**
- Use `@aiDescription` for all major code sections
- Mark modifiable areas with `@aiModifiable`
- Follow established patterns when adding new code
- Include comprehensive test cases
- Document security considerations
- Use type annotations for better AI understanding
- Follow repository-service-controller pattern
- Include error handling in all operations
- Use standardized response formats
- Implement proper validation for all inputs

#### **❌ AI DON'T**
- Modify authentication/security code without explicit permission
- Change database schema without understanding relationships
- Remove existing error handling
- Modify production configuration values
- Change established API response formats
- Remove existing tests without replacement
- Modify critical business logic without review
- Change logging or monitoring code
- Remove type definitions
- Modify dependency injection patterns without understanding

#### **🎯 AI Focus Areas**
- **Code Generation**: Follow established patterns and conventions
- **Error Prevention**: Use TypeScript/JSDoc for type safety
- **Testing**: Maintain comprehensive test coverage
- **Documentation**: Keep AI documentation tags updated
- **Performance**: Consider scalability in all implementations
- **Security**: Never compromise security for convenience
- **Maintainability**: Write self-documenting code with clear intent