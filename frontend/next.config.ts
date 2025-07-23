import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.EXPORT_MODE === 'static' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: process.env.EXPORT_MODE === 'static'
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  },
};

export default nextConfig;
