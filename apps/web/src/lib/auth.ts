import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

type AuthResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; response: NextResponse };

/**
 * Extract and verify JWT from Authorization header.
 * Returns userId on success, or a 401 NextResponse on failure.
 */
export function requireAuth(request: NextRequest): AuthResult {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header.' } },
        { status: 401 }
      ),
    };
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env['JWT_SECRET'] as string) as JwtPayload;
    return { ok: true, userId: payload.sub, email: payload.email };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Token expired or invalid.' } },
        { status: 401 }
      ),
    };
  }
}
