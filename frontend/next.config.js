/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,  // Disable strict mode to reduce hydration issues
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Suppress development indicators
  devIndicators: {
    buildActivity: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
