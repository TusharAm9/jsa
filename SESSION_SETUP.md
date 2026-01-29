# Session Storage Setup

Session storage has been successfully implemented with JWT tokens and HTTP-only cookies.

## What was added:

1. **JWT Token Generation**: Users receive a JWT token upon login/signup that contains:
   - User ID
   - Email
   - Name
   - Role

2. **HTTP-Only Cookie Storage**: The token is stored in an HTTP-only cookie that:
   - Cannot be accessed by JavaScript (CSRF protection)
   - Is only sent over HTTPS in production
   - Expires after 7 days
   - Is set with SameSite=Lax protection

3. **Session Utilities** (`lib/auth.ts`):
   - `generateToken()`: Creates JWT tokens
   - `verifyToken()`: Validates tokens
   - `setSessionCookie()`: Stores tokens in cookies
   - `getSessionFromCookie()`: Retrieves sessions from cookies
   - `clearSessionCookie()`: Logs out users

## Environment Variables

Add this to your `.env.local` file:

```
JWT_SECRET=your-very-secure-secret-key-change-this-in-production
```

For production, generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Usage

### Get Current Session (Client Component)
```typescript
'use client';
import { useEffect, useState } from 'react';

export function useSession() {
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    // The session is automatically sent via cookies with each request
    // Decode it from your API response if needed
  }, []);
  
  return session;
}
```

### Get Current Session (Server Component/API)
```typescript
import { getSessionFromCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookie();
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  // Use session.userId, session.email, etc.
}
```

### Create Middleware for Protected Routes
Create a `middleware.ts` file in your project root:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = verifyToken(token);
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/work/:path*', '/api/protected/:path*'],
};
```

## Next Steps

1. Add `JWT_SECRET` to your `.env.local` file
2. Create a logout endpoint that calls `clearSessionCookie()`
3. Implement protected routes using the middleware pattern above
4. Update your frontend to check session on page load
