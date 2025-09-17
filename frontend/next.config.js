/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '../build/frontend',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
