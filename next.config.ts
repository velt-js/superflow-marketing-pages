import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          destination: "/pages-html/:path*/index.html",
        },
      ],
    };
  },
};

export default nextConfig;
