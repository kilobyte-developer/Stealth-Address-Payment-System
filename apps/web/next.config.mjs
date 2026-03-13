/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // needed for workspace packages to be transpiled
    serverComponentsExternalPackages: ['@prisma/client', 'bitgo'],
  },
  transpilePackages: ['@stealth/shared', '@stealth/crypto', '@stealth/bitgo-client', '@stealth/db'],
};

export default nextConfig;
