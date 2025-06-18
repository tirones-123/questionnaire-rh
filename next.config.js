/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuration pour Sharp sur Vercel
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ne pas inclure Sharp côté client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        sharp: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 