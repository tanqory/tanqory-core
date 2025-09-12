# OAuth 2.0 Authentication Setup

## Overview

This project uses NextAuth.js with a custom OAuth 2.0 provider (`https://accounts.tanqory.com`) for authentication.

## Required Configuration

### 1. Environment Variables

Create a `.env.local` file in the `apps/web` directory with:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000  # Your app URL (change for production)
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32

# OAuth Provider Configuration
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
OAUTH_AUTHORIZATION_URL=https://accounts.tanqory.com/oauth/authorize
OAUTH_TOKEN_URL=https://accounts.tanqory.com/api/v1/oauth/token
OAUTH_USERINFO_URL=https://accounts.tanqory.com/api/v1/oauth/userinfo
```

### 2. OAuth Provider Requirements

Your OAuth provider at `https://accounts.tanqory.com` must support:

#### Authorization Endpoint
- **URL**: `/oauth/authorize`
- **Method**: GET
- **Parameters**:
  - `client_id`: Your application's client ID
  - `redirect_uri`: `{NEXTAUTH_URL}/api/auth/callback/tanqory`
  - `response_type`: `code`
  - `scope`: `read write profile email`
  - `state`: Random state parameter (handled by NextAuth)

#### Token Endpoint
- **URL**: `/api/v1/oauth/token`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Parameters**:
  - `grant_type`: `authorization_code` or `refresh_token`
  - `client_id`: Your application's client ID
  - `client_secret`: Your application's client secret
  - `code`: Authorization code (for authorization_code grant)
  - `redirect_uri`: Same as authorization request
  - `refresh_token`: Refresh token (for refresh_token grant)

- **Response**:
```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "scope": "read write profile email"
}
```

#### UserInfo Endpoint
- **URL**: `/api/v1/oauth/userinfo`
- **Method**: GET
- **Authorization**: `Bearer {access_token}`

- **Response**:
```json
{
  "sub": "user-unique-id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user"
}
```

### 3. OAuth Client Registration

Register your application with the OAuth provider with these settings:

- **Redirect URI**: `{NEXTAUTH_URL}/api/auth/callback/tanqory`
  - Development: `http://localhost:3000/api/auth/callback/tanqory`
  - Production: `https://yourdomain.com/api/auth/callback/tanqory`
- **Scopes**: `read write profile email`
- **Grant Types**: `authorization_code`, `refresh_token`

## Usage

### 1. Sign In
Users can sign in by clicking the "เข้าสู่ระบบ" button, which redirects them to:
```
/api/auth/signin
```

### 2. Access User Session
```tsx
import { useSession } from 'next-auth/react';

function Component() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated') return <p>Not signed in</p>;
  
  return (
    <div>
      <p>Signed in as {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
      <p>Access Token: {session?.accessToken}</p>
    </div>
  );
}
```

### 3. Protect Pages
```tsx
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);
  
  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return null;
  
  return <div>Protected content</div>;
}
```

### 4. Server-Side Authentication
```tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ServerComponent() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello {session.user?.email}</div>;
}
```

## Error Handling

The application includes custom error pages:
- `/auth/signin` - Custom sign-in page
- `/auth/error` - Error handling page

Common errors:
- `OAuthSignin`: Cannot contact OAuth server
- `OAuthCallback`: Error in OAuth callback
- `AccessDenied`: User access denied
- `RefreshAccessTokenError`: Cannot refresh access token

## Security Notes

1. **NEXTAUTH_SECRET**: Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

2. **HTTPS**: Always use HTTPS in production

3. **Domain Validation**: Ensure redirect URIs match exactly

4. **Token Storage**: Access tokens are stored in JWT sessions (not in database)

5. **Token Refresh**: Automatic token refresh is implemented

## Development vs Production

### Development
```env
NEXTAUTH_URL=http://localhost:3000
```

### Production
```env
NEXTAUTH_URL=https://yourdomain.com
```

Make sure to update the redirect URI in your OAuth provider settings accordingly.