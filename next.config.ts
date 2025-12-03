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
  },
};

module.exports = withPWA(nextConfig);
