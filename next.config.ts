/**
 * @type {import('next').NextConfig}
 */

import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

const getDomainConfig = () => {
  return [
    process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.split(':')[0],
  ].filter(Boolean);
};

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
      allowedOrigins: getDomainConfig(),
    },
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'scss')],
    prependData: `
    @import "node_modules/bootstrap/scss/functions";
    @import "node_modules/bootstrap/scss/variables";
    @import "node_modules/bootstrap/scss/variables-dark";
    @import "node_modules/bootstrap/scss/maps";
    @import "node_modules/bootstrap/scss/mixins";
    @import "utils/_variables"; 
  `, // 모든 SCSS 파일에 자동으로 포함
  },
  images: {
    unoptimized: isDev,
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
        hostname: 'static.mymedia.work',
        port: '8080',
      },
      {
        protocol: 'https',
        hostname: 'static.mymedia.work',
        port: '8443',
      },
    ],
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
