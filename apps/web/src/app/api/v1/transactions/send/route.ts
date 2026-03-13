import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@stealth/db';
import { generateEphemeralKeyPair, deriveOneTimeAddress } from '@stealth/crypto';
import { sendStealthTransaction } from '@stealth/bitgo-client';
import { requireAuth } from '@/lib/auth';

const sendSchema = z.object({
  senderWalletId: z.string().cuid(),
  receiverPublicViewKey: z.string().regex(/^(02|03)[0-9a-fA-F]{64}$/),
  receiverPublicSpendKey: z.string().regex(/^(02|03)[0-9a-fA-F]{64}$/),
  amountSats: z.number().int().positive().min(1000),
  walletPassphrase: z.string().min(1),
});

// POST /api/v1/transactions/send
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const body = await request.json();
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { senderWalletId, receiverPublicViewKey, receiverPublicSpendKey, amountSats, walletPassphrase } =
    parsed.data;

  // Verify wallet belongs to user
  const wallet = await db.wallet.findFirst({
    where: { id: senderWalletId, userId: authResult.userId },
  });
  if (!wallet) {
    return NextResponse.json(
      { error: { code: 'WALLET_NOT_FOUND', message: 'Sender wallet not found.' } },
      { status: 404 }
    );
  }

  try {
    // 1. Derive one-time address
    const ephemeral = generateEphemeralKeyPair();
    const derived = deriveOneTimeAddress(ephemeral.privateKey, {
      publicViewKey: receiverPublicViewKey,
      publicSpendKey: receiverPublicSpendKey,
    });

    // 2. Broadcast via BitGo
    const result = await sendStealthTransaction({
      walletId: wallet.bitgoWalletId,
      walletPassphrase,
      recipientAddress: derived.oneTimeAddress,
      amountSats,
      ephemeralPublicKey: derived.ephemeralPublicKey,
    });

    // 3. Record in DB
    const tx = await db.transaction.create({
      data: {
        walletId: wallet.id,
        txHash: result.txHash,
        direction: 'send',
        amountSats,
        ephemeralPublicKey: derived.ephemeralPublicKey,
        oneTimeAddress: derived.oneTimeAddress,
        status: 'pending',
      },
    });

    return NextResponse.json(
      {
        data: {
          txHash: tx.txHash,
          oneTimeAddress: tx.oneTimeAddress,
          ephemeralPublicKey: tx.ephemeralPublicKey,
          amountSats: tx.amountSats,
          status: tx.status,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/v1/transactions/send]', err);
    return NextResponse.json(
      { error: { code: 'TX_BUILD_FAILED', message: 'Transaction failed.' } },
      { status: 500 }
    );
  }
}
