import BitGo from 'bitgo';

let _bitgo: InstanceType<typeof BitGo.BitGo> | null = null;

export function getBitGoInstance(): InstanceType<typeof BitGo.BitGo> {
  if (_bitgo) return _bitgo;

  const env = (process.env['BITGO_ENV'] ?? 'test') as 'test' | 'prod';
  _bitgo = new BitGo.BitGo({ env });

  const token = process.env['BITGO_ACCESS_TOKEN'];
  if (token) {
    _bitgo.authenticateWithAccessToken({ accessToken: token });
  }

  return _bitgo;
}

export type BitGoEnv = 'test' | 'prod';
