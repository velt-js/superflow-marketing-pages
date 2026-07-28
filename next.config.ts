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
      // Domain migration: usesuperflow.com → usesuperflow.ai. Host-based
      // 301 redirects that preserve the full path and query string 1:1
      // (explicit statusCode instead of `permanent`, which would emit
      // 308 — the platform-level redirect in the Vercel console is 301,
      // and these code-level backstops match it). The www hosts collapse
      // to the apex, matching the non-www canonical used site-wide.
      // Subdomains (app., docs., drive., demo.) are separate deployments
      // and are not touched. These run before the path redirects below,
      // so legacy paths on the old host hop to the new host first, then
      // to their new path.
      {
        source: "/:path*",
        has: [{ type: "host", value: "usesuperflow.com" }],
        destination: "https://usesuperflow.ai/:path*",
        statusCode: 301,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.usesuperflow.com" }],
        destination: "https://usesuperflow.ai/:path*",
        statusCode: 301,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.usesuperflow.ai" }],
        destination: "https://usesuperflow.ai/:path*",
        statusCode: 301,
      },
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
      // Integrations promoted from /preview/integrations to the live hub.
      {
        source: "/preview/integrations",
        destination: "/integrations",
        permanent: true,
      },
      {
        source: "/preview/integrations/:slug",
        destination: "/integrations/:slug",
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
