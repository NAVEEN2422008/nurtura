/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // PWA support
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
  webpack: (config, { dev }) => {
    if (dev) {
      const ignored = [
        /[\\/]\\.next[\\/]/,
        /[\\/]node_modules[\\/]/,
        /[\\/]\\.git[\\/]/,
        /tsconfig\\.tsbuildinfo$/,
        /[\\/]public[\\/]\\.well-known[\\/]appspecific[\\/]/,
      ]
      if (!config.watchOptions) config.watchOptions = {}
      const current = config.watchOptions.ignored
      if (Array.isArray(current)) {
        config.watchOptions.ignored = [...current, ...ignored]
      } else if (current) {
        config.watchOptions.ignored = [current, ...ignored]
      } else {
        config.watchOptions.ignored = ignored
      }


    }
    return config
  },
}

const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

module.exports = withNextIntl(nextConfig)

