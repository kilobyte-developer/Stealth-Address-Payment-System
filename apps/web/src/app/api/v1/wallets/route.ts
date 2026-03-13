import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@stealth/db';
import { generateStealthKeys } from '@stealth/crypto';
import { createBitGoWallet } from '@stealth/bitgo-client';
import { requireAuth } from '@/lib/auth';

const createWalletSchema = z.object({
  label: z.string().min(1).max(100),
  passphrase: z.string().min(8),
});

// GET /api/v1/wallets — list wallets for current user
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const wallets = await db.wallet.findMany({
    where: { userId: authResult.userId },
    select: {
      id: true,
      label: true,
      bitgoWalletId: true,
      network: true,
      publicViewKey: true,
      publicSpendKey: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: wallets, meta: { timestamp: new Date().toISOString() } });
}

// POST /api/v1/wallets — create wallet + stealth keys
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const body = await request.json();
  const parsed = createWalletSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { label, passphrase } = parsed.data;

  try {
    // 1. Generate stealth key pairs
    const stealthKeys = generateStealthKeys();

    // 2. Create BitGo wallet
    const { walletId: bitgoWalletId } = await createBitGoWallet(label, passphrase);

    // 3. Persist to DB (private keys stored here — encrypt in prod!)
    const wallet = await db.wallet.create({
      data: {
        userId: authResult.userId,
        label,
        bitgoWalletId,
        publicViewKey: stealthKeys.viewKey.publicKey,
        publicSpendKey: stealthKeys.spendKey.publicKey,
        // TODO: encrypt with KMS/passphrase before storing
        encryptedViewPrivKey: stealthKeys.viewKey.privateKey,
        encryptedSpendPrivKey: stealthKeys.spendKey.privateKey,
      },
    });

    return NextResponse.json(
      {
        data: {
          id: wallet.id,
          label: wallet.label,
          bitgoWalletId: wallet.bitgoWalletId,
          stealthAddress: {
            publicViewKey: wallet.publicViewKey,
            publicSpendKey: wallet.publicSpendKey,
          },
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/v1/wallets]', err);
    return NextResponse.json(
      { error: { code: 'WALLET_CREATION_FAILED', message: 'Failed to create wallet.' } },
      { status: 500 }
    );
  }
}
