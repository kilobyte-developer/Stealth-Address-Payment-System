import { NextResponse } from 'next/server';
import * as secp from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';
import { z } from 'zod';

const keygenResponseSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{64}$/i),
  metaAddress: z.string().regex(/^stealth:(02|03)[0-9a-f]{64}:(02|03)[0-9a-f]{64}$/i),
  privateViewKey: z.string().regex(/^[0-9a-f]{64}$/i),
  privateSpendKey: z.string().regex(/^[0-9a-f]{64}$/i),
  publicViewKey: z.string().regex(/^(02|03)[0-9a-f]{64}$/i),
  publicSpendKey: z.string().regex(/^(02|03)[0-9a-f]{64}$/i),
});

// POST /api/stealth/keygen
export async function POST(): Promise<NextResponse> {
  try {
    // @noble/secp256k1 uses cryptographically secure randomness.
    const privateViewKeyBytes = secp.utils.randomPrivateKey();
    const privateSpendKeyBytes = secp.utils.randomPrivateKey();

    const publicViewKeyBytes = secp.getPublicKey(privateViewKeyBytes, true);
    const publicSpendKeyBytes = secp.getPublicKey(privateSpendKeyBytes, true);

    const privateViewKey = bytesToHex(privateViewKeyBytes);
    const privateSpendKey = bytesToHex(privateSpendKeyBytes);
    const publicViewKey = bytesToHex(publicViewKeyBytes);
    const publicSpendKey = bytesToHex(publicSpendKeyBytes);
    const metaAddress = `stealth:${publicViewKey}:${publicSpendKey}`;
    const id = bytesToHex(sha256(utf8ToBytes(metaAddress)));

    const payload = keygenResponseSchema.parse({
      id,
      metaAddress,
      privateViewKey,
      privateSpendKey,
      publicViewKey,
      publicSpendKey,
    });

    return NextResponse.json({ data: payload }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/stealth/keygen]', err);
    return NextResponse.json(
      {
        error: {
          code: 'KEYGEN_FAILED',
          message: 'Failed to generate stealth keys.',
        },
      },
      { status: 500 }
    );
  }
}
