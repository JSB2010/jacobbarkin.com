// Initialize OpenNext Cloudflare for development
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Required for Cloudflare Workers deployment
  output: 'standalone',

  // Enable React Developer Tools in all environments
  crossOrigin: 'anonymous',

  // Security headers - applied in both dev and production
  // Workers will use these directly, no need for _headers file
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdn.honey.io; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://nyc.cloud.appwrite.io https://*.appwrite.io https://api.github.com https://www.google-analytics.com https://www.google.com; frame-src 'self' https://docs.google.com https://*.google.com https://1drv.ms https://*.onedrive.live.com https://*.office.com https://*.office365.com https://*.officeapps.live.com https://*.microsoftonline.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; manifest-src 'self'; worker-src 'self' blob:;"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  // Enable build caching for faster rebuilds
  experimental: {
    // Enable optimized CSS with critters for inlining critical CSS
    optimizeCss: true,
    // Enable memory cache for faster builds
    memoryBasedWorkersCount: true,
  },

  // Server external packages
  serverExternalPackages: [],

  // Image configuration - Cloudflare Workers supports image optimization via Cloudflare Images
  images: {
    // Define allowed image widths for optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Define allowed quality values (required in Next.js 15.5+)
    qualities: [75, 80, 85, 90, 95, 100],
    // Allow local images to be optimized
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.kentdenver.org',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
    ],
  },

  // TypeScript configuration
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // ESLint still runs but suppress circular structure warning during build logging
    // The actual linting still works - only the JSON serialization for logging fails
    ignoreDuringBuilds: false,
  },

  // Webpack configuration for production builds
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Use deterministic names for better caching
      config.optimization.moduleIds = 'deterministic';

      // Enable tree shaking to remove unused code
      config.optimization.usedExports = true;

      // Chunk splitting configuration
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true
          }
        }
      };
    }

    // Disable minification in dev for React DevTools
    if (dev) {
      config.optimization.minimize = false;
    }

    return config;
  },

  // Compiler options for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;