import 'dotenv/config';
import cron from 'node-cron';
import { runScanCycle } from './scanner.js';
import { db } from '@stealth/db';

const INTERVAL_MS = parseInt(process.env['SCAN_INTERVAL_MS'] ?? '30000', 10);

// Convert ms to a cron expression (minimum 1 minute for cron, use interval loop for <60s)
async function main(): Promise<void> {
  console.log('[scanner] Starting stealth payment scanner...');
  console.log(`[scanner] Scan interval: ${INTERVAL_MS}ms`);

  // Run immediately on startup
  await runScanCycle();

  // Then run on interval
  if (INTERVAL_MS >= 60_000) {
    const minutes = Math.floor(INTERVAL_MS / 60_000);
    cron.schedule(`*/${minutes} * * * *`, async () => {
      await runScanCycle();
    });
  } else {
    setInterval(async () => {
      await runScanCycle();
    }, INTERVAL_MS);
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[scanner] Shutting down...');
    await db.$disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[scanner] Shutting down...');
    await db.$disconnect();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[scanner] Fatal error:', err);
  process.exit(1);
});
