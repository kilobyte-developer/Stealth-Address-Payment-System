# API Test Documentation - Stealth Routes

This document describes the automated tests added for the stealth API routes in apps/web.

## Test File

- Test suite: apps/web/src/app/api/stealth/**tests**/stealth-api.test.ts
- Test runner: Vitest
- Test type: API handler-level tests (direct route handler invocation)

## How To Run

From apps/web:

```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

## Covered Routes

- POST /api/stealth/keygen
- POST /api/stealth/id
- POST /api/stealth/address

## Coverage Summary

### 1) Key Generation Tests

- Returns valid response shape and key formats
- Deterministic id is SHA256(metaAddress)
- Fresh keypairs across multiple calls
- Public keys are valid secp256k1 points (curve validation)
- Private keys are valid scalars in range 0 < k < n

### 2) Deterministic ID Tests

- Same metaAddress always returns same id
- Rejects invalid metaAddress format
- Rejects missing metaAddress
- Meta address parser correctness: stealth:view:spend
- Property-based test with random generated meta addresses for determinism

### 3) One-Time Address Derivation Tests

- Derives one-time key, ephemeral key, shared secret, and SegWit address
- Verifies ECDH symmetry proof: H(rA) = H(aR)
- Verifies one-time key math: P = S\*G + B
- Verifies Bitcoin address is decodable Bech32 and has bc prefix
- Verifies returned bitcoinAddress corresponds to returned oneTimePublicKey

### 4) Security Edge Cases

- Rejects invalid public keys
- Rejects non-hex public keys
- Rejects truncated public keys
- Rejects uncompressed public keys (04 prefix)
- Rejects missing required fields

### 5) Concurrency and Stress

- 30 concurrent requests produce 30 unique stealth addresses
- 100 sequential derivations complete successfully

## Notes

- These tests prove both API contract correctness and core crypto invariants.
- Concurrency checks help ensure random ephemeral key generation is collision-resistant under parallel load.
