import path from "node:path";
import type { NextConfig } from "next";

// Superflow subdomains served by reverse-proxying a velt.dev provider page,
// so the Superflow hostname stays in the address bar. See `rewrites` below.
const PROXIED_HOSTS = {
  "status.usesuperflow.ai": "https://status.velt.dev",
  "trust.usesuperflow.ai": "https://trust.velt.dev",
};

type Redirect = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number];

// Next.js applies `redirects` before `rewrites`, so the marketing-site path
// redirects have to opt out of the proxied hosts — otherwise a request like
// trust.usesuperflow.ai/trust would be redirected to /security instead of
// reaching the upstream page. `missing` passes only when none of its
// conditions match, so this reads as "apply unless the host is proxied".
const notProxiedHost = Object.keys(PROXIED_HOSTS).map(
  (value) => ({ type: "host", value }) as const,
);

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
    const hostRedirects: Redirect[] = [
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
    ];

    // Path-only redirects for the marketing site. Every one of these is
    // scoped away from PROXIED_HOSTS below.
    const pathRedirects: Redirect[] = [
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
      // Comparisons + alternatives promoted from their preview routes to
      // the live hubs (2026 templates now serve at the root paths).
      {
        source: "/preview/comparison",
        destination: "/comparisons",
        permanent: true,
      },
      {
        source: "/preview/comparison/:slug",
        destination: "/comparisons/:slug",
        permanent: true,
      },
      {
        source: "/preview/alternative",
        destination: "/alternative",
        permanent: true,
      },
      {
        source: "/preview/alternative/:slug",
        destination: "/alternative/:slug",
        permanent: true,
      },
    ];

    return [
      ...hostRedirects,
      ...pathRedirects.map((redirect) => ({
        ...redirect,
        missing: notProxiedHost,
      })),
    ];
  },
  async rewrites() {
    return {
      // Host-based reverse proxies. These keep the Superflow hostname in the
      // address bar while the response is served by the upstream provider —
      // the browser never sees a redirect, so the URL stays superflow.
      //
      // Both upstreams are single-custom-domain products (Atlassian
      // Statuspage allows one custom domain per status page; Vanta allows one
      // per Trust Center), and both are already claimed by the velt.dev
      // hostnames. Proxying is the only way to serve them under a second
      // hostname without giving up the velt.dev ones.
      //
      // These are inert until DNS for the two subdomains is repointed from
      // the provider CNAMEs to Vercel and the domains are added to this
      // project. See the deploy notes in the PR/commit body.
      //
      // Note: the upstream HTML is Velt-branded and its canonical, RSS and
      // Atom links still point at velt.dev. That is deliberate — it keeps
      // Google from indexing the proxied copy as duplicate content.
      beforeFiles: Object.entries(PROXIED_HOSTS).map(([host, upstream]) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: `${upstream}/:path*`,
      })),
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
