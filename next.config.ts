import type {NextConfig} from 'next';

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Turbopack configuration: an empty object silences the "webpack config detected" error
  // when plugins inject a webpack config (e.g. next-pwa). If you migrate fully to Turbopack
  // later, add proper turbopack settings here.
  turbopack: {},
  // Image configuration: prefer `remotePatterns` (supports host+port and path patterns).
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'george-fx.github.io', pathname: '/**' },
      { protocol: 'https', hostname: 'admin.thomsonscasastore.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      // Allow images served from the backend IP with port (used in local/test environments)
      { protocol: 'http', hostname: '168.231.121.194', port: '8081', pathname: '/media/**' }
    ]
  },
};

module.exports = withPWA(nextConfig);
