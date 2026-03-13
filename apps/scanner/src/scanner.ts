import { db } from '@stealth/db';
import { scanTransaction } from '@stealth/crypto';
import { getWalletTransfers } from '@stealth/bitgo-client';

/**
 * One full scan cycle:
 * - Fetches all wallets
 * - For each wallet, fetches recent BitGo transfers
 * - Runs stealth scan on each transfer output
 * - Writes new DetectedPayment records
 */
export async function runScanCycle(): Promise<void> {
  const startAt = Date.now();
  console.log('[scanner] Starting scan cycle...');

  const wallets = await db.wallet.findMany();
  let totalScanned = 0;
  let totalDetected = 0;

  for (const wallet of wallets) {
    try {
      const transfers = await getWalletTransfers(wallet.bitgoWalletId, 50);
      totalScanned += transfers.length;

      for (const transfer of transfers as Record<string, unknown>[]) {
        // Extract ephemeral key embedded in tx label/comment by the sender
        const label = (transfer['label'] ?? transfer['comment'] ?? '') as string;
        const ephemeralMatch = label.match(/stealth:ephemeral:([0-9a-fA-F]{66})/);
        if (!ephemeralMatch) continue;

        const ephemeralPublicKey = ephemeralMatch[1] as string;
        const txHash = transfer['txid'] as string;
        const outputs = (transfer['outputs'] ?? []) as Array<{ address: string; value: number }>;

        for (const output of outputs) {
          const result = scanTransaction(
            ephemeralPublicKey,
            wallet.encryptedViewPrivKey, // TODO: decrypt with KMS in production
            { publicViewKey: wallet.publicViewKey, publicSpendKey: wallet.publicSpendKey },
            output.address
          );

          if (result.match) {
            const existing = await db.detectedPayment.findUnique({ where: { txHash } });
            if (!existing) {
              await db.detectedPayment.create({
                data: {
                  walletId: wallet.id,
                  txHash,
                  oneTimeAddress: output.address,
                  ephemeralPublicKey,
                  amountSats: output.value,
                },
              });
              totalDetected++;
              console.log(`[scanner] ✓ Detected payment: ${txHash.slice(0, 12)}… +${output.value} sats → wallet ${wallet.id}`);
            }
          }
        }
      }

      // Update scanner state
      await db.scannerState.upsert({
        where: { walletId: wallet.id },
        create: { walletId: wallet.id, lastScannedBlock: 0 },
        update: { updatedAt: new Date() },
      });
    } catch (err) {
      console.error(`[scanner] Error scanning wallet ${wallet.id}:`, err);
    }
  }

  const elapsed = Date.now() - startAt;
  console.log(
    `[scanner] Cycle complete — scanned ${totalScanned} txs across ${wallets.length} wallets, detected ${totalDetected} new payments (${elapsed}ms)`
  );
}
