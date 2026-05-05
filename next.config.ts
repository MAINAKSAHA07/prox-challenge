import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/apple-touch-icon.png",
        destination: "/product.webp",
      },
      {
        source: "/apple-touch-icon-precomposed.png",
        destination: "/product.webp",
      },
    ];
  },
};

export default nextConfig;
