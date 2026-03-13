import { NextRequest, NextResponse } from 'next/server';
import { db } from '@stealth/db';
import { getWalletBalance } from '@stealth/bitgo-client';
import { requireAuth } from '@/lib/auth';

// GET /api/v1/wallets/[id]/balance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const wallet = await db.wallet.findFirst({
    where: { id: params.id, userId: authResult.userId },
  });

  if (!wallet) {
    return NextResponse.json(
      { error: { code: 'WALLET_NOT_FOUND', message: 'Wallet not found.' } },
      { status: 404 }
    );
  }

  try {
    const balance = await getWalletBalance(wallet.bitgoWalletId);
    return NextResponse.json({ data: balance, meta: { timestamp: new Date().toISOString() } });
  } catch (err) {
    console.error('[GET /api/v1/wallets/:id/balance]', err);
    return NextResponse.json(
      { error: { code: 'BITGO_ERROR', message: 'Failed to fetch balance.' } },
      { status: 502 }
    );
  }
}
