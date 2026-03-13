# Stealth Address Payment System

> Privacy-preserving Bitcoin payments built on top of **BitGo** institutional wallets.
> Every payment to the same receiver lands at a unique, unlinkable on-chain address — inspired by Monero's stealth address scheme, implemented on secp256k1.

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Setup](#setup)
5. [Environment Variables](#environment-variables)
6. [Running the Project](#running-the-project)
7. [API Reference](#api-reference)
8. [Project Structure](#project-structure)
9. [Scripts Reference](#scripts-reference)
10. [Contributing](#contributing)

---

## How It Works

```
Receiver publishes:  StealthAddress = (A = a·G,  B = b·G)

Sender derives:
  r  = random()
  R  = r·G                  ← ephemeral public key (in tx)
  S  = H(r·A)               ← ECDH shared secret
  P  = S·G + B              ← one-time destination address (unlinkable)

Receiver scans:
  S' = H(a·R)               ← same as H(r·A) by ECDH symmetry
  P' = S'·G + B
  if P' == P  →  payment detected!

Receiver spends:
  x  = S + b                ← private key for one-time address P
```

Two payments to the same receiver produce `P1 ≠ P2` — even with the same stealth address.

---

## Architecture

```
stealth-address-payment-system/
├── apps/
│   ├── web/       ← Next.js 14 (frontend + API routes — the full backend)
│   └── scanner/   ← Node.js cron daemon that detects incoming payments
├── packages/
│   ├── stealth-crypto/   ← Pure-TS secp256k1 stealth primitives
│   ├── bitgo-client/     ← BitGo SDK wrapper
│   ├── db/               ← Prisma schema + client singleton
│   └── shared/           ← Types, constants, utilities
└── docs/
```

**No separate Express server** — Next.js App Router API routes (`/api/v1/**`) serve as the entire backend.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20 LTS |
| pnpm | 10+ |
| Git | any |

Install pnpm globally if needed:
```bash
npm install -g pnpm
```

---

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd stealth-address-payment-system

pnpm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `BITGO_ACCESS_TOKEN` — from your BitGo dashboard → Settings → Access Tokens
- `BITGO_ENTERPRISE_ID` — from BitGo dashboard → Enterprise ID  
- `JWT_SECRET` — generate with `openssl rand -hex 32`

### 3. Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations (creates dev.db)
pnpm db:migrate
```

### 4. Start development

```bash
pnpm dev
```

| Service | URL |
|---|---|
| Web + API | http://localhost:3000 |
| API routes | http://localhost:3000/api/v1 |
| Scanner | runs in its own terminal |
| Prisma Studio | `pnpm db:studio` → http://localhost:5555 |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `BITGO_ENV` | No | `test` | `test` or `prod` |
| `BITGO_ACCESS_TOKEN` | **Yes** | — | BitGo long-term access token |
| `BITGO_ENTERPRISE_ID` | No | — | BitGo enterprise ID |
| `DATABASE_URL` | **Yes** | `file:./dev.db` | Prisma DB URL (SQLite or Postgres) |
| `JWT_SECRET` | **Yes** | — | Min 32 chars |
| `JWT_EXPIRY` | No | `24h` | Token lifetime |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed origins |
| `SCAN_INTERVAL_MS` | No | `30000` | Scanner polling interval |
| `SCAN_BLOCK_BATCH_SIZE` | No | `10` | Blocks per scanner cycle |
| `NEXT_PUBLIC_API_URL` | No | `/api/v1` | Frontend API base URL |

---

## Running the Project

### All services (parallel)
```bash
pnpm dev
```

### Individual services
```bash
# Next.js (web + API)
pnpm --filter @stealth/web dev

# Scanner daemon
pnpm --filter @stealth/scanner dev
```

### Production build
```bash
pnpm build
pnpm --filter @stealth/web start
pnpm --filter @stealth/scanner start
```

---

## API Reference

All routes are under `/api/v1`. Authenticated routes require:
```
Authorization: Bearer <jwt>
```

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/auth/register` | `{ email, password }` | Create account |
| `POST` | `/auth/login` | `{ email, password }` | Get JWT |

### Wallets

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/wallets` | List user's wallets |
| `POST` | `/wallets` | Create wallet + stealth keys |
| `GET` | `/wallets/:id/balance` | Get confirmed balance |

### Stealth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/stealth/address` | `{ publicViewKey, publicSpendKey }` | Derive one-time address |

### Transactions

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/transactions/send` | `{ senderWalletId, receiverPublicViewKey, receiverPublicSpendKey, amountSats, walletPassphrase }` | Send stealth payment |

### Scanner

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/scan` | Manual scan trigger `{ walletId }` |
| `GET` | `/scan?walletId=` | List detected payments |

### Response Envelopes

```json
// Success
{ "data": { ... }, "meta": { "timestamp": "2026-03-13T..." } }

// Error
{ "error": { "code": "WALLET_NOT_FOUND", "message": "Wallet not found." } }
```

---

## Project Structure

```
apps/
  web/
    src/
      app/
        api/v1/
          auth/login/route.ts
          auth/register/route.ts
          wallets/route.ts
          wallets/[id]/balance/route.ts
          stealth/address/route.ts
          transactions/send/route.ts
          scan/route.ts
        (app)/               ← authenticated route group
          layout.tsx
          dashboard/page.tsx
          receive/page.tsx
          send/page.tsx
          scan/page.tsx
        layout.tsx
        page.tsx             ← landing page
        globals.css
      components/
        providers.tsx        ← React Query + context
        nav-bar.tsx
        ui/                  ← shadcn/ui components (add via CLI)
      lib/
        auth.ts              ← JWT middleware for API routes
        api.ts               ← Axios client for frontend
        utils.ts             ← cn() utility
      store/
        auth.ts              ← Zustand auth store
  scanner/
    src/
      index.ts               ← cron scheduler entry point
      scanner.ts             ← scan cycle logic

packages/
  stealth-crypto/
    src/
      keygen.ts              ← key pair generation
      address.ts             ← deriveOneTimeAddress()
      scan.ts                ← scanTransaction()
      spend.ts               ← deriveSpendingKey()
      __tests__/
        stealth.test.ts      ← vitest unit tests
  bitgo-client/
    src/
      client.ts              ← BitGo SDK singleton
      wallet.ts              ← createWallet, getBalance, listWallets
      transaction.ts         ← sendStealthTransaction, getWalletTransfers
  db/
    prisma/
      schema.prisma          ← User, Wallet, Transaction, DetectedPayment, ScannerState
    src/
      index.ts               ← Prisma client singleton
  shared/
    src/
      types.ts               ← Shared TypeScript types
      constants.ts           ← Error codes, network names
      utils.ts               ← hex/sat/date utilities
```

---

## Scripts Reference

### Root

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in parallel (watch mode) |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Type-check all packages |
| `pnpm test` | Run all tests (vitest) |
| `pnpm clean` | Delete all build outputs |
| `pnpm format` | Run Prettier on all files |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:migrate` | Run DB migrations |
| `pnpm db:studio` | Open Prisma Studio |

### Filter-scoped

```bash
# Run tests only in stealth-crypto
pnpm --filter @stealth/crypto test

# Add a shadcn component to the web app
pnpm --filter @stealth/web dlx shadcn@latest add button card badge

# Build only the web app
pnpm --filter @stealth/web build
```

---

## Contributing

1. Branch off `main`: `git checkout -b feat/your-feature`
2. Make changes — Husky pre-commit hook runs Prettier automatically
3. Run tests: `pnpm test`
4. Push and open a PR

### Commit conventions

```
feat:   new feature
fix:    bug fix
chore:  tooling / deps
docs:   documentation only
test:   tests only
```

