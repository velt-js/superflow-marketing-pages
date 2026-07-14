import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Pin Turbopack to this project so it doesn't walk up to ~/ and scan
  // the entire home directory (which was causing dev-server lag).
  turbopack: {
    root: path.resolve(__dirname),
  },
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
    return [
      {
        source: "/trust",
        destination: "/security",
        permanent: true,
      },
      // Launch redirects: short/legacy URLs → the live feature-page root slugs.
      {
        source: "/board",
        destination: "/kanban-board",
        permanent: true,
      },
      {
        source: "/brand-memory",
        destination: "/memory",
        permanent: true,
      },
      {
        source: "/workflows",
        destination: "/review-workflows",
        permanent: true,
      },
      {
        source: "/approval-workflows",
        destination: "/review-workflows",
        permanent: true,
      },
      {
        source: "/review-agents",
        destination: "/ai-review-agents",
        permanent: true,
      },
      // Retired preview routes → their promoted production destinations.
      {
        source: "/home-preview",
        destination: "/",
        permanent: true,
      },
      // No standalone features index — send it to the homepage.
      {
        source: "/features",
        destination: "/",
        permanent: true,
      },
      // Retired landing page → the homepage.
      {
        source: "/website-review",
        destination: "/",
        permanent: true,
      },
      {
        source: "/preview/features/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
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
