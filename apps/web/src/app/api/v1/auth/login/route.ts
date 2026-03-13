import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '@stealth/db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env['JWT_SECRET'] as string,
      { expiresIn: process.env['JWT_EXPIRY'] ?? '24h' }
    );

    return NextResponse.json({
      data: { token, user: { id: user.id, email: user.email } },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[POST /api/v1/auth/login]', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Login failed.' } },
      { status: 500 }
    );
  }
}
