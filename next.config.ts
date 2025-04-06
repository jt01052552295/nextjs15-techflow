/**
 * @type {import('next').NextConfig}
 */

import path from 'path';

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
        hostname: 'static.mymedia.work',
      },
    ],
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
