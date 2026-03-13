import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '@stealth/db';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Email already in use.' } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({ data: { email, passwordHash } });

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env['JWT_SECRET'] as string,
      { expiresIn: process.env['JWT_EXPIRY'] ?? '24h' }
    );

    return NextResponse.json(
      { data: { token, user: { id: user.id, email: user.email } } },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/v1/auth/register]', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Registration failed.' } },
      { status: 500 }
    );
  }
}
