import { NextRequest, NextResponse } from 'next/server';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';
import { z } from 'zod';

const requestSchema = z.object({
  metaAddress: z
    .string()
    .regex(
      /^stealth:(02|03)[0-9a-fA-F]{64}:(02|03)[0-9a-fA-F]{64}$/,
      'Invalid stealth meta address format'
    ),
});

// POST /api/stealth/id
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }

    const { metaAddress } = parsed.data;
    const id = bytesToHex(sha256(utf8ToBytes(metaAddress)));

    return NextResponse.json(
      {
        data: {
          id,
          metaAddress,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[POST /api/stealth/id]', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to derive deterministic ID.' } },
      { status: 500 }
    );
  }
}
