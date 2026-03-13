import { getBitGoInstance } from '@stealth/bitgo-client';

export type SupportedNetwork = 'tbtc' | 'btc';

export function getBitGoCoin(network?: string) {
  const bitgo = getBitGoInstance();
  const coin = (network || process.env.BITGO_COIN || 'tbtc') as SupportedNetwork;
  return bitgo.coin(coin);
}
