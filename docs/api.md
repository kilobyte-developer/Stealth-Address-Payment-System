# API Documentation - Stealth Address Payment System

This document describes the API routes currently implemented in the Next.js App Router under apps/web.

## Base Paths

- Versioned routes: /api/v1/\*
- Current non-versioned stealth utility routes: /api/stealth/keygen, /api/stealth/id, /api/stealth/address

## Test Coverage

- Automated stealth API tests are documented in docs/api-tests.md.
- Current stealth API test suite includes crypto integrity checks, invalid-input checks, concurrency, and stress coverage.

## Response Conventions

### Success

Most endpoints return a success object in this shape:

```json
{
  "data": {},
  "meta": {
    "timestamp": "2026-03-13T10:00:00.000Z"
  }
}
```

Some endpoints return only data without meta.

### Error

Errors return:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Authentication

All /api/v1 routes except auth routes require bearer token auth.

Header:

```http
Authorization: Bearer <jwt_token>
```

---

## 1) Generate Stealth Keys

- Method: POST
- Route: /api/stealth/keygen
- Auth: No
- Purpose: Generate receiver stealth key pairs and derive deterministic ID from stealth meta address URI.

### Input

- No request body required.

### Output (200)

```json
{
  "data": {
    "id": "sha256(metaAddress)-hex-64",
    "metaAddress": "stealth:<publicViewKey>:<publicSpendKey>",
    "privateViewKey": "hex-64",
    "privateSpendKey": "hex-64",
    "publicViewKey": "compressed-pubkey-hex-66",
    "publicSpendKey": "compressed-pubkey-hex-66"
  }
}
```

### Deterministic ID Rule

- metaAddress format: stealth:<publicViewKey>:<publicSpendKey>
- id derivation: SHA256(metaAddress)
- Same metaAddress always yields the same id.

### Errors

- 500 KEYGEN_FAILED

---

## 2) Register

- Method: POST
- Route: /api/v1/auth/register
- Auth: No
- Purpose: Create a user account with Supabase auth.

### Input

```json
{
  "email": "user@example.com",
  "password": "min-8-chars"
}
```

### Output (201)

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {},
    "message": "Check your email to confirm your account."
  }
}
```

### Errors

- 400 VALIDATION_ERROR
- 400 INVALID_CREDENTIALS
- 500 INTERNAL_ERROR

---

## 1.1) Deterministic ID From Meta Address

- Method: POST
- Route: /api/stealth/id
- Auth: No
- Purpose: Convert stealth meta address into deterministic id using SHA256(metaAddress).

### Input

```json
{
  "metaAddress": "stealth:02ab...:03cd..."
}
```

### Output (200)

```json
{
  "data": {
    "id": "sha256(metaAddress)-hex-64",
    "metaAddress": "stealth:02ab...:03cd..."
  }
}
```

### Errors

- 400 VALIDATION_ERROR
- 500 INTERNAL_ERROR

---

## 1.2) Derive One-Time Stealth Address (Core Crypto)

- Method: POST
- Route: /api/stealth/address
- Auth: No
- Purpose: Derive one-time stealth destination key/address from receiver public keys using ECDH and point arithmetic.

### Input

```json
{
  "publicViewKey": "02ab...",
  "publicSpendKey": "03cd..."
}
```

### Crypto Flow

- r = random ephemeral private key
- R = r\*G (ephemeralPublicKey)
- shared = r\*A, where A is publicViewKey
- S = SHA256(shared)
- P = S\*G + B, where B is publicSpendKey

### Output (200)

```json
{
  "data": {
    "oneTimePublicKey": "...",
    "ephemeralPublicKey": "...",
    "sharedSecret": "...",
    "bitcoinAddress": "bc1..."
  }
}
```

### Errors

- 400 VALIDATION_ERROR
- 500 DERIVE_STEALTH_ADDRESS_FAILED

---

## 3) Login

- Method: POST
- Route: /api/v1/auth/login
- Auth: No
- Purpose: Authenticate and return access tokens.

### Input

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Output (200)

```json
{
  "data": {
    "token": "jwt",
    "refreshToken": "refresh-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "expiresAt": 1710000000
  },
  "meta": {
    "timestamp": "2026-03-13T10:00:00.000Z"
  }
}
```

### Errors

- 400 VALIDATION_ERROR
- 401 INVALID_CREDENTIALS
- 500 INTERNAL_ERROR

---

## 4) Wallets - List

- Method: GET
- Route: /api/v1/wallets
- Auth: Yes
- Purpose: List all wallets for current user.

### Input

- No request body.

### Output (200)

```json
{
  "data": [
    {
      "id": "cuid",
      "label": "Main Wallet",
      "bitgo_wallet_id": "bitgo-id",
      "network": "tbtc",
      "public_view_key": "02...",
      "public_spend_key": "03...",
      "created_at": "2026-03-13T10:00:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2026-03-13T10:00:00.000Z"
  }
}
```

### Errors

- 500 INTERNAL_ERROR

---

## 5) Wallets - Create

- Method: POST
- Route: /api/v1/wallets
- Auth: Yes
- Purpose: Create BitGo wallet and generate stealth keys.

### Input

```json
{
  "label": "My Wallet",
  "passphrase": "minimum-8-chars"
}
```

### Output (201)

```json
{
  "data": {
    "id": "cuid",
    "label": "My Wallet",
    "bitgoWalletId": "bitgo-id",
    "stealthAddress": {
      "publicViewKey": "02...",
      "publicSpendKey": "03..."
    }
  }
}
```

### Errors

- 400 VALIDATION_ERROR
- 500 WALLET_CREATION_FAILED

---

## 6) Wallet Balance

- Method: GET
- Route: /api/v1/wallets/:id/balance
- Auth: Yes
- Purpose: Fetch wallet balance from BitGo for a user-owned wallet.

### Input

- Path parameter:
  - id: wallet id (cuid)

### Output (200)

```json
{
  "data": {
    "balanceString": "...",
    "confirmedBalanceString": "...",
    "spendableBalanceString": "..."
  },
  "meta": {
    "timestamp": "2026-03-13T10:00:00.000Z"
  }
}
```

### Errors

- 404 WALLET_NOT_FOUND
- 502 BITGO_ERROR

---

## 7) Derive One-Time Address

- Method: POST
- Route: /api/v1/stealth/address
- Auth: Yes
- Purpose: Derive one-time destination address from receiver stealth public keys.

### Input

```json
{
  "publicViewKey": "02...",
  "publicSpendKey": "03..."
}
```

### Output (200)

```json
{
  "data": {
    "oneTimeAddress": "btc-address",
    "ephemeralPublicKey": "02..."
  },
  "meta": {
    "timestamp": "2026-03-13T10:00:00.000Z"
  }
}
```

### Errors

- 400 INVALID_STEALTH_ADDRESS

---

## 8) Send Transaction

- Method: POST
- Route: /api/v1/transactions/send
- Auth: Yes
- Purpose: Build and send stealth payment transaction via BitGo.

### Input

```json
{
  "senderWalletId": "cuid",
  "receiverPublicViewKey": "02...",
  "receiverPublicSpendKey": "03...",
  "amountSats": 1000,
  "walletPassphrase": "wallet-passphrase"
}
```

### Output (201)

```json
{
  "data": {
    "txHash": "tx-hash",
    "oneTimeAddress": "btc-address",
    "ephemeralPublicKey": "02...",
    "amountSats": 1000,
    "status": "pending"
  }
}
```

### Errors

- 400 VALIDATION_ERROR
- 404 WALLET_NOT_FOUND
- 500 TX_BUILD_FAILED

---

## 9) Scan Blockchain On Demand

- Method: POST
- Route: /api/v1/scan
- Auth: Yes
- Purpose: Trigger scan for stealth payments on wallet.

### Input

```json
{
  "walletId": "cuid"
}
```

### Output (200)

```json
{
  "data": {
    "walletId": "cuid",
    "scannedTxCount": 50,
    "detectedPayments": []
  },
  "meta": {
    "timestamp": "2026-03-13T10:00:00.000Z"
  }
}
```

### Errors

- 400 VALIDATION_ERROR
- 404 WALLET_NOT_FOUND
- 500 SCAN_FAILED

---

## 10) List Detected Payments

- Method: GET
- Route: /api/v1/scan
- Auth: Yes
- Purpose: List detected payments for user wallets.

### Input

- Optional query param:
  - walletId: wallet id to filter results

Example:

```http
GET /api/v1/scan?walletId=ckxxxxxxxxxxxxxxxxxxxx
```

### Output (200)

```json
{
  "data": [
    {
      "id": "...",
      "wallet_id": "...",
      "tx_hash": "...",
      "one_time_address": "...",
      "ephemeral_public_key": "...",
      "amount_sats": 12345,
      "created_at": "2026-03-13T10:00:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2026-03-13T10:00:00.000Z"
  }
}
```

### Errors

- Standard auth errors if token missing/invalid

---

## Notes

- Public keys are compressed secp256k1 keys (33 bytes, hex length 66, prefix 02 or 03).
- Private keys are 32-byte secp256k1 scalars (hex length 64).
- Current keygen route is non-versioned: /api/stealth/keygen.
