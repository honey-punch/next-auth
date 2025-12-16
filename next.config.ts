import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/back/:path*',
        destination: `${process.env.PROXY_PATH}/API/:path*`,
      },
    ];
  },
};

export default nextConfig;
