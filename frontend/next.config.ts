import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.EXPORT_MODE === 'static' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: process.env.EXPORT_MODE === 'static'
  },
  env: {
    // NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://52.207.219.247:5001', // adding ec2 ip 
  },
};

export default nextConfig;
