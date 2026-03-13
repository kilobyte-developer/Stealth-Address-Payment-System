import { PrismaClient } from '@prisma/client';

// Prisma client singleton — prevents multiple instances in dev (Next.js hot-reload safe)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });
}

export const db: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = db;
}

export { PrismaClient } from '@prisma/client';
export type { Prisma } from '@prisma/client';
