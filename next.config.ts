import type {NextConfig} from 'next';

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during build
  },
  images: {
    domains: ['george-fx.github.io','admin.thomsonscasastore.com','lh3.googleusercontent.com'],
    // Allow images served from the backend IP with port (used in local/test environments)
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '168.231.121.194',
        port: '8081',
        pathname: '/media/**'
      }
    ]
  },
};

module.exports = withPWA(nextConfig);
