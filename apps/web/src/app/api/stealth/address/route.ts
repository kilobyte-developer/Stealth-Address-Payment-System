import { NextRequest, NextResponse } from 'next/server';
import * as secp from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import * as bitcoin from 'bitcoinjs-lib';
import { z } from 'zod';

const deriveSchema = z.object({
  publicViewKey: z.string().regex(/^(02|03)[0-9a-fA-F]{64}$/, 'Invalid compressed public key'),
  publicSpendKey: z.string().regex(/^(02|03)[0-9a-fA-F]{64}$/, 'Invalid compressed public key'),
});

// POST /api/stealth/address
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = deriveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }

    const { publicViewKey, publicSpendKey } = parsed.data;

    // 1) Generate ephemeral scalar r and point R = r*G.
    const ephemeralPrivateKey = secp.utils.randomPrivateKey();
    const ephemeralPublicKey = secp.getPublicKey(ephemeralPrivateKey, true);

    // 2) ECDH shared point: shared = r*A, then hash to scalar S.
    const sharedPoint = secp.getSharedSecret(ephemeralPrivateKey, publicViewKey, true);
    const sharedSecretBytes = sha256(sharedPoint);
    const sharedSecret = bytesToHex(sharedSecretBytes);

    const scalarS = BigInt(`0x${sharedSecret}`) % secp.CURVE.n;
    if (scalarS === 0n) {
      throw new Error('Derived scalar is zero. Retry key derivation.');
    }

    // 3) One-time key P = S*G + B.
    const receiverSpendPoint = secp.Point.fromHex(publicSpendKey);
    const oneTimePoint = secp.Point.BASE.multiply(scalarS).add(receiverSpendPoint);
    const oneTimePublicKeyBytes = oneTimePoint.toRawBytes(true);
    const oneTimePublicKey = bytesToHex(oneTimePublicKeyBytes);

    // 4) Convert one-time pubkey to native SegWit address.
    const payment = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(oneTimePublicKeyBytes),
      network: bitcoin.networks.bitcoin,
    });

    if (!payment.address) {
      throw new Error('Failed to derive bitcoin address from one-time public key.');
    }

    return NextResponse.json(
      {
        data: {
          oneTimePublicKey,
          ephemeralPublicKey: bytesToHex(ephemeralPublicKey),
          sharedSecret,
          bitcoinAddress: payment.address,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[POST /api/stealth/address]', err);
    return NextResponse.json(
      {
        error: {
          code: 'DERIVE_STEALTH_ADDRESS_FAILED',
          message: 'Failed to derive one-time stealth address.',
        },
      },
      { status: 500 }
    );
  }
}
