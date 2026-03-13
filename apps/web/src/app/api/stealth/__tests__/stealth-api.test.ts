import { describe, expect, it } from 'vitest';
import * as secp from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import * as bitcoin from 'bitcoinjs-lib';
import fc from 'fast-check';

import { POST as postKeygen } from '../keygen/route';
import { POST as postId } from '../id/route';
import { POST as postAddress } from '../address/route';

type KeygenData = {
  id: string;
  metaAddress: string;
  privateViewKey: string;
  privateSpendKey: string;
  publicViewKey: string;
  publicSpendKey: string;
};

function jsonPost(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Stealth API routes', () => {
  describe('POST /api/stealth/keygen', () => {
    it('returns valid key material + deterministic id from meta address', async () => {
      const res = await postKeygen();
      const json = (await res.json()) as { data: KeygenData };

      expect(res.status).toBe(200);
      expect(json.data.privateViewKey).toMatch(/^[0-9a-f]{64}$/i);
      expect(json.data.privateSpendKey).toMatch(/^[0-9a-f]{64}$/i);
      expect(json.data.publicViewKey).toMatch(/^(02|03)[0-9a-f]{64}$/i);
      expect(json.data.publicSpendKey).toMatch(/^(02|03)[0-9a-f]{64}$/i);
      expect(json.data.metaAddress).toBe(
        `stealth:${json.data.publicViewKey}:${json.data.publicSpendKey}`
      );

      const expectedId = bytesToHex(sha256(new TextEncoder().encode(json.data.metaAddress)));
      expect(json.data.id).toBe(expectedId);
    });

    it('creates fresh key pairs across calls', async () => {
      const a = (await (await postKeygen()).json()) as { data: KeygenData };
      const b = (await (await postKeygen()).json()) as { data: KeygenData };

      expect(a.data.privateViewKey).not.toBe(b.data.privateViewKey);
      expect(a.data.privateSpendKey).not.toBe(b.data.privateSpendKey);
      expect(a.data.metaAddress).not.toBe(b.data.metaAddress);
      expect(a.data.id).not.toBe(b.data.id);
    });

    it('public keys must lie on secp256k1 curve', async () => {
      const res = await postKeygen();
      const json = (await res.json()) as { data: KeygenData };

      expect(() => secp.Point.fromHex(json.data.publicViewKey)).not.toThrow();
      expect(() => secp.Point.fromHex(json.data.publicSpendKey)).not.toThrow();
    });

    it('private keys must be within secp256k1 range', async () => {
      const res = await postKeygen();
      const json = (await res.json()) as { data: KeygenData };

      const view = BigInt(`0x${json.data.privateViewKey}`);
      const spend = BigInt(`0x${json.data.privateSpendKey}`);

      expect(view > 0n).toBe(true);
      expect(view < secp.CURVE.n).toBe(true);
      expect(spend > 0n).toBe(true);
      expect(spend < secp.CURVE.n).toBe(true);
    });
  });

  describe('POST /api/stealth/id', () => {
    it('returns deterministic id for the same meta address', async () => {
      const keygen = (await (await postKeygen()).json()) as { data: KeygenData };
      const req1 = jsonPost('http://localhost/api/stealth/id', {
        metaAddress: keygen.data.metaAddress,
      });
      const req2 = jsonPost('http://localhost/api/stealth/id', {
        metaAddress: keygen.data.metaAddress,
      });

      const res1 = await postId(req1 as never);
      const res2 = await postId(req2 as never);
      const body1 = (await res1.json()) as { data: { id: string; metaAddress: string } };
      const body2 = (await res2.json()) as { data: { id: string; metaAddress: string } };

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(body1.data.id).toBe(body2.data.id);
      expect(body1.data.metaAddress).toBe(keygen.data.metaAddress);
    });

    it('returns 400 for invalid meta address format', async () => {
      const req = jsonPost('http://localhost/api/stealth/id', { metaAddress: 'stealth:bad' });
      const res = await postId(req as never);
      const body = (await res.json()) as { error: { code: string; message: string } };

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when metaAddress is missing', async () => {
      const req = jsonPost('http://localhost/api/stealth/id', {});
      const res = await postId(req as never);
      expect(res.status).toBe(400);
    });

    it('parses metaAddress into stealth, viewKey, and spendKey parts', async () => {
      const keygen = (await (await postKeygen()).json()) as { data: KeygenData };
      const [scheme, viewKey, spendKey] = keygen.data.metaAddress.split(':');

      expect(scheme).toBe('stealth');
      expect(viewKey).toBe(keygen.data.publicViewKey);
      expect(spendKey).toBe(keygen.data.publicSpendKey);
    });

    it('property test: generated metaAddress always hashes deterministically', async () => {
      await fc.assert(
        fc.asyncProperty(fc.hexaString({ minLength: 64, maxLength: 64 }), async (hexTail) => {
          const viewPrefix = Number.parseInt(hexTail[0]!, 16) % 2 === 0 ? '02' : '03';
          const spendPrefix = Number.parseInt(hexTail[1]!, 16) % 2 === 0 ? '02' : '03';
          const viewKey = `${viewPrefix}${hexTail}`;
          const spendKey = `${spendPrefix}${hexTail.split('').reverse().join('')}`;
          const metaAddress = `stealth:${viewKey}:${spendKey}`;

          const reqA = jsonPost('http://localhost/api/stealth/id', { metaAddress });
          const reqB = jsonPost('http://localhost/api/stealth/id', { metaAddress });

          const resA = await postId(reqA as never);
          const resB = await postId(reqB as never);
          const bodyA = (await resA.json()) as { data: { id: string } };
          const bodyB = (await resB.json()) as { data: { id: string } };

          expect(resA.status).toBe(200);
          expect(resB.status).toBe(200);
          expect(bodyA.data.id).toBe(bodyB.data.id);
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('POST /api/stealth/address', () => {
    it('derives one-time key, shared secret, and bech32 address', async () => {
      const keygen = (await (await postKeygen()).json()) as { data: KeygenData };
      const req = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: keygen.data.publicViewKey,
        publicSpendKey: keygen.data.publicSpendKey,
      });

      const res = await postAddress(req as never);
      const body = (await res.json()) as {
        data: {
          oneTimePublicKey: string;
          ephemeralPublicKey: string;
          sharedSecret: string;
          bitcoinAddress: string;
        };
      };

      expect(res.status).toBe(200);
      expect(body.data.oneTimePublicKey).toMatch(/^(02|03)[0-9a-f]{64}$/i);
      expect(body.data.ephemeralPublicKey).toMatch(/^(02|03)[0-9a-f]{64}$/i);
      expect(body.data.sharedSecret).toMatch(/^[0-9a-f]{64}$/i);
      expect(body.data.bitcoinAddress).toMatch(/^bc1[ac-hj-np-z02-9]+$/i);

      // ECDH symmetry check: SHA256(r*A) == SHA256(a*R)
      const sharedFromReceiver = secp.getSharedSecret(
        keygen.data.privateViewKey,
        body.data.ephemeralPublicKey,
        true
      );
      const expectedShared = bytesToHex(sha256(sharedFromReceiver));
      expect(body.data.sharedSecret).toBe(expectedShared);

      const scalarS = BigInt(`0x${body.data.sharedSecret}`) % secp.CURVE.n;
      const expectedOneTimePoint = secp.Point.BASE.multiply(scalarS).add(
        secp.Point.fromHex(keygen.data.publicSpendKey)
      );
      const expectedOneTimePublicKey = bytesToHex(expectedOneTimePoint.toRawBytes(true));
      expect(body.data.oneTimePublicKey).toBe(expectedOneTimePublicKey);

      const payment = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(expectedOneTimePoint.toRawBytes(true)),
        network: bitcoin.networks.bitcoin,
      });
      expect(body.data.bitcoinAddress).toBe(payment.address);
    });

    it('returns different one-time outputs for repeated calls to same receiver keys', async () => {
      const keygen = (await (await postKeygen()).json()) as { data: KeygenData };

      const req1 = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: keygen.data.publicViewKey,
        publicSpendKey: keygen.data.publicSpendKey,
      });
      const req2 = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: keygen.data.publicViewKey,
        publicSpendKey: keygen.data.publicSpendKey,
      });

      const out1 = (await (await postAddress(req1 as never)).json()) as {
        data: { oneTimePublicKey: string; ephemeralPublicKey: string; bitcoinAddress: string };
      };
      const out2 = (await (await postAddress(req2 as never)).json()) as {
        data: { oneTimePublicKey: string; ephemeralPublicKey: string; bitcoinAddress: string };
      };

      expect(out1.data.ephemeralPublicKey).not.toBe(out2.data.ephemeralPublicKey);
      expect(out1.data.oneTimePublicKey).not.toBe(out2.data.oneTimePublicKey);
      expect(out1.data.bitcoinAddress).not.toBe(out2.data.bitcoinAddress);
    });

    it('bitcoin address must decode correctly', async () => {
      const keygen = (await (await postKeygen()).json()) as { data: KeygenData };

      const req = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: keygen.data.publicViewKey,
        publicSpendKey: keygen.data.publicSpendKey,
      });

      const res = await postAddress(req as never);
      const body = (await res.json()) as {
        data: { bitcoinAddress: string };
      };

      const decoded = bitcoin.address.fromBech32(body.data.bitcoinAddress);
      expect(decoded.prefix).toBe('bc');
    });

    it('bitcoin address must correspond to derived one-time key', async () => {
      const keygen = (await (await postKeygen()).json()) as { data: KeygenData };

      const req = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: keygen.data.publicViewKey,
        publicSpendKey: keygen.data.publicSpendKey,
      });

      const res = await postAddress(req as never);
      const body = (await res.json()) as {
        data: { oneTimePublicKey: string; bitcoinAddress: string };
      };

      const payment = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(body.data.oneTimePublicKey, 'hex'),
        network: bitcoin.networks.bitcoin,
      });

      expect(payment.address).toBe(body.data.bitcoinAddress);
    });

    it('ECDH symmetry holds', async () => {
      const keygen = (await (await postKeygen()).json()) as { data: KeygenData };

      const req = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: keygen.data.publicViewKey,
        publicSpendKey: keygen.data.publicSpendKey,
      });

      const res = await postAddress(req as never);
      const body = (await res.json()) as {
        data: { ephemeralPublicKey: string; sharedSecret: string };
      };

      const receiverShared = secp.getSharedSecret(
        keygen.data.privateViewKey,
        body.data.ephemeralPublicKey,
        true
      );

      const expected = bytesToHex(sha256(receiverShared));
      expect(body.data.sharedSecret).toBe(expected);
    });

    it('returns 400 for invalid public keys', async () => {
      const req = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: '02deadbeef',
        publicSpendKey: '03badc0de',
      });

      const res = await postAddress(req as never);
      const body = (await res.json()) as { error: { code: string; message: string } };

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects non-hex public keys', async () => {
      const req = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: 'zzzzzz',
        publicSpendKey: 'yyyyyy',
      });

      const res = await postAddress(req as never);
      expect(res.status).toBe(400);
    });

    it('rejects truncated public key', async () => {
      const req = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: '02abcd',
        publicSpendKey: '03abcd',
      });

      const res = await postAddress(req as never);
      expect(res.status).toBe(400);
    });

    it('rejects uncompressed public keys', async () => {
      const privA = secp.utils.randomPrivateKey();
      const privB = secp.utils.randomPrivateKey();
      const uncompressedView = bytesToHex(secp.getPublicKey(privA, false));
      const uncompressedSpend = bytesToHex(secp.getPublicKey(privB, false));

      const req = jsonPost('http://localhost/api/stealth/address', {
        publicViewKey: uncompressedView,
        publicSpendKey: uncompressedSpend,
      });

      const res = await postAddress(req as never);
      expect(res.status).toBe(400);
    });

    it('returns 400 when body fields are missing', async () => {
      const req = jsonPost('http://localhost/api/stealth/address', {});
      const res = await postAddress(req as never);
      expect(res.status).toBe(400);
    });

    it('generates unique addresses under concurrency', async () => {
      const keygen = (await (await postKeygen()).json()) as { data: KeygenData };

      const promises = Array.from({ length: 30 }).map(() =>
        postAddress(
          jsonPost('http://localhost/api/stealth/address', {
            publicViewKey: keygen.data.publicViewKey,
            publicSpendKey: keygen.data.publicSpendKey,
          }) as never
        )
      );

      const results = await Promise.all(promises);
      const addresses = new Set<string>();

      for (const response of results) {
        expect(response.status).toBe(200);
        const body = (await response.json()) as { data: { bitcoinAddress: string } };
        addresses.add(body.data.bitcoinAddress);
      }

      expect(addresses.size).toBe(30);
    });

    it('handles 100 stealth generations', async () => {
      const keygen = (await (await postKeygen()).json()) as { data: KeygenData };

      for (let i = 0; i < 100; i++) {
        const res = await postAddress(
          jsonPost('http://localhost/api/stealth/address', {
            publicViewKey: keygen.data.publicViewKey,
            publicSpendKey: keygen.data.publicSpendKey,
          }) as never
        );

        expect(res.status).toBe(200);
      }
    });
  });
});
