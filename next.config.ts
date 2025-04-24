import type { NextConfig } from "next";

// Log environment variables for debugging
console.log('Next.js config - Available env vars:', Object.keys(process.env));
console.log('Next.js config - GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;
