import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@stealth/db';
import { scanTransaction } from '@stealth/crypto';
import { getWalletTransfers } from '@stealth/bitgo-client';
import { requireAuth } from '@/lib/auth';

const scanSchema = z.object({
  walletId: z.string().cuid(),
});

// POST /api/v1/scan — trigger on-demand blockchain scan
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const body = await request.json();
  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const wallet = await db.wallet.findFirst({
    where: { id: parsed.data.walletId, userId: authResult.userId },
  });
  if (!wallet) {
    return NextResponse.json(
      { error: { code: 'WALLET_NOT_FOUND', message: 'Wallet not found.' } },
      { status: 404 }
    );
  }

  try {
    // Fetch recent transfers from BitGo
    const transfers = await getWalletTransfers(wallet.bitgoWalletId, 50);
    const detected = [];

    for (const transfer of transfers as Record<string, unknown>[]) {
      // Extract ephemeral key from tx comment/label
      const label = (transfer['label'] ?? transfer['comment'] ?? '') as string;
      const ephemeralMatch = label.match(/stealth:ephemeral:([0-9a-fA-F]{66})/);
      if (!ephemeralMatch) continue;

      const ephemeralPublicKey = ephemeralMatch[1] as string;
      const outputs = (transfer['outputs'] ?? []) as Array<{ address: string; value: number }>;

      for (const output of outputs) {
        const result = scanTransaction(
          ephemeralPublicKey,
          wallet.encryptedViewPrivKey, // TODO: decrypt before use
          { publicViewKey: wallet.publicViewKey, publicSpendKey: wallet.publicSpendKey },
          output.address
        );

        if (result.match) {
          const existing = await db.detectedPayment.findUnique({
            where: { txHash: transfer['txid'] as string },
          });

          if (!existing) {
            const payment = await db.detectedPayment.create({
              data: {
                walletId: wallet.id,
                txHash: transfer['txid'] as string,
                oneTimeAddress: output.address,
                ephemeralPublicKey,
                amountSats: output.value,
              },
            });
            detected.push(payment);
          }
        }
      }
    }

    return NextResponse.json({
      data: {
        walletId: wallet.id,
        scannedTxCount: (transfers as unknown[]).length,
        detectedPayments: detected,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[POST /api/v1/scan]', err);
    return NextResponse.json(
      { error: { code: 'SCAN_FAILED', message: 'Scan failed.' } },
      { status: 500 }
    );
  }
}

// GET /api/v1/scan — list detected payments
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const walletId = searchParams.get('walletId');

  const payments = await db.detectedPayment.findMany({
    where: {
      wallet: { userId: authResult.userId },
      ...(walletId ? { walletId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ data: payments, meta: { timestamp: new Date().toISOString() } });
}
