import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Don't check types during builds (faster, check separately)
    ignoreBuildErrors: false,
  },
  // Enable experimental features for faster builds
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['react-markdown'],
  },
  // Configure images for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    unoptimized: true, // For static export compatibility
  },
};

export default nextConfig;
