/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable React Developer Tools in all environments
  // This ensures React DevTools can connect to the React instance
  crossOrigin: 'anonymous',

  // Note: Headers are defined in public/_headers for static export
  // This configuration is kept for development mode only
  async headers() {
    // Only apply headers in development mode, not in production with static export
    if (process.env.NODE_ENV === 'development') {
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
    }
    return []; // Return empty array in production
  },

  // Enable build caching for faster rebuilds
  experimental: {
    // Enable optimized CSS with critters for inlining critical CSS
    optimizeCss: true,
    // Enable memory cache for faster builds
    memoryBasedWorkersCount: true,
  },

  // Server external packages (moved from experimental.serverComponentsExternalPackages)
  serverExternalPackages: [],

  // Image configuration
  images: {
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
    // Configure allowed quality values for Next.js 16+ compatibility
    qualities: [75, 85, 90, 95, 100],
    // Unoptimize images in production for Cloudflare Pages
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure for production builds
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'export', // Static site generation
    distDir: '.next', // Output directory for intermediate files
    trailingSlash: true, // Add trailing slashes for better SPA routing
    // Skip specific pages with dynamic features
    skipTrailingSlashRedirect: true,
    // Exclude API routes and dynamic routes from static export
    images: {
      unoptimized: true, // Disable image optimization for static export
    }
  } : {}),

  // Turbopack configuration for development (now stable)
  turbopack: {
    // Turbopack-specific rules
    rules: {
      // Example: Include specific directories for processing
      include: ['src/**/*'],
      // Example: Exclude specific file patterns
      exclude: ['**/*.test.*', '**/__tests__/**']
    }
  },

  // Apply webpack configuration for both production and development modes
  // This will only be used when NOT using Turbopack (e.g., in production builds)
  webpack: (config, { dev, isServer }) => {
    // Production-specific configuration
    if (!dev) {
      // Only run on the client build once in production
      if (!isServer) {
        // Add a custom plugin to copy the necessary files after the build
        config.plugins?.push({
          apply: (compiler) => {
            compiler.hooks.afterEmit.tapPromise('CopySPAFilesPlugin', async () => {
              await copySPAFiles();
            });
          }
        });

        // Use deterministic names for better caching
        config.optimization.moduleIds = 'deterministic';

        // Enable tree shaking to remove unused code
        config.optimization.usedExports = true;

        // Use a simpler and more robust chunk splitting configuration
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
    }

    // Configuration for React Developer Tools to work properly
    // This ensures React is not minified in a way that breaks React DevTools
    if (dev) {
      // Ensure React DevTools can properly connect to React
      config.optimization.minimize = false;
    }

    return config;
  },

  // Add compiler options for production
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

// Helper function to copy SPA files
async function copySPAFiles() {
  const { promises: fs } = await import('fs');
  const path = await import('path');

  try {
    // Helper function to safely copy a file if it exists
    const safeCopyFile = async (sourceFile, destFile) => {
      try {
        // Check if source file exists
        await fs.access(sourceFile);

        // Read and write the file
        const content = await fs.readFile(sourceFile, 'utf8');
        await fs.writeFile(destFile, content);
        console.log(`Successfully copied ${path.basename(sourceFile)} to output directory`);
        return true;
      } catch (error) {
        // File doesn't exist or can't be read - this is now a non-fatal error
        console.log(`Note: ${path.basename(sourceFile)} not found or couldn't be copied. This is OK.`);
        return false;
      }
    };

    // Create the output directory if it doesn't exist
    const outDir = path.join(process.cwd(), 'out');
    try {
      await fs.access(outDir);
    } catch (error) {
      // If directory doesn't exist, create it
      await fs.mkdir(outDir, { recursive: true });
      console.log('Created output directory');
    }

    // Copy essential files if they exist
    await safeCopyFile(
      path.join(process.cwd(), 'public', '_redirects'),
      path.join(outDir, '_redirects')
    );

    await safeCopyFile(
      path.join(process.cwd(), 'public', '404.html'),
      path.join(outDir, '404.html')
    );

    await safeCopyFile(
      path.join(process.cwd(), 'public', 'spa-redirect.js'),
      path.join(outDir, 'spa-redirect.js')
    );

    // Only try to modify index.html if it exists and spa-redirect.js was copied
    const indexHtmlPath = path.join(outDir, 'index.html');
    try {
      await fs.access(indexHtmlPath);
      let indexHtmlContent = await fs.readFile(indexHtmlPath, 'utf8');

      // Check if the script is already included and if spa-redirect.js was copied
      if (!indexHtmlContent.includes('spa-redirect.js')) {
        // Add the script right after the <head> tag
        indexHtmlContent = indexHtmlContent.replace(
          '<head>',
          '<head>\n    <script src="/spa-redirect.js"></script>'
        );
        await fs.writeFile(indexHtmlPath, indexHtmlContent);
        console.log('Successfully added SPA redirect script to index.html');
      }
    } catch (error) {
      console.log('Note: index.html not found or couldn\'t be modified. This is OK.');
    }
  } catch (error) {
    console.error('Error in copySPAFiles:', error);
    // Continue with the build even if there's an error
  }
}

export default nextConfig;