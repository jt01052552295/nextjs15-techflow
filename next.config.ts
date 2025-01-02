/**
 * @type {import('next').NextConfig}
 */
const path = require('path');
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    // unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'static.winetrip.co.kr',
      },
    ],
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
