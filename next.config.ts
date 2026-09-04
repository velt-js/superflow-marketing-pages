import path from "node:path";
import type { NextConfig } from "next";

// Superflow subdomains served by reverse-proxying a velt.dev provider page,
// so the Superflow hostname stays in the address bar. See `rewrites` below.
const PROXIED_HOSTS = {
  "status.usesuperflow.ai": "https://status.velt.dev",
  "trust.usesuperflow.ai": "https://trust.velt.dev",
};

// Mintlify origin backing usesuperflow.ai/docs. The docs used to be a
// standalone site on docs.usesuperflow.com; they are now reverse-proxied
// under /docs so the marketing domain owns the whole surface, matching the
// velt.dev/docs setup.
//
// This must be Mintlify's per-project subdomain, NOT the retired
// docs.usesuperflow.com custom domain: that host now 301s back here (see
// `redirects`), so proxying to it would bounce the request straight into a
// redirect loop. velt.dev hit exactly this and had to switch its rewrite
// target to velt.mintlify.dev.
//
// Inert until the Mintlify dashboard serves the project under the /docs
// subpath — see the deploy notes in the commit body.
const MINTLIFY_ORIGIN = "https://superflow.mintlify.dev";

// Retired docs hosts that now fold onto usesuperflow.ai/docs. Kept as 301s
// so the ~96 indexed docs URLs pass their ranking to the new paths.
const RETIRED_DOCS_HOSTS = ["docs.usesuperflow.com", "docs.usesuperflow.ai"];

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
  // /api/og rasterizes social cards at request time and reads the committed
  // Urbanist TTFs off disk. Satori has no system fonts, so without these
  // traced into the function bundle the route 500s in production while
  // working fine locally.
  outputFileTracingIncludes: {
    "/api/og": ["./lib/og/fonts/**"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      // Agency logos in the /directory pages are hotlinked from the source
      // profile that each record links back to. Without this entry
      // next/image rejects the host with a 400 and every logo renders blank.
      // Kept at /awards/** rather than /awards/avatar/**: most profiles
      // serve an avatar, but a minority fall back to a submission still,
      // and both live under this prefix.
      {
        protocol: "https",
        hostname: "assets.awwwards.com",
        pathname: "/awards/**",
      },
    ],
  },
  async redirects() {
    const hostRedirects: Redirect[] = [
      // Docs migration: docs.usesuperflow.{com,ai} → usesuperflow.ai/docs.
      // First so it wins before the bare-domain rules below — those match
      // `usesuperflow.com` exactly and so never see the docs subdomain, but
      // the docs paths gain a /docs prefix that the generic rules would
      // drop, and ordering keeps that intent explicit.
      //
      // Inert until DNS for the docs host is repointed off Mintlify and onto
      // this Vercel project. See the deploy notes in the commit body.
      ...RETIRED_DOCS_HOSTS.map(
        (value): Redirect => ({
          source: "/:path*",
          has: [{ type: "host", value }],
          destination: "https://usesuperflow.ai/docs/:path*",
          statusCode: 301,
        }),
      ),
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
      // The MD5 endpoint moved from beside its page to where the other tool
      // endpoints live. `permanent` emits a 308, which — unlike a 301/302 —
      // preserves the method and the body, so a script that POSTs to the old
      // path still gets its hash rather than a GET-shaped usage error.
      {
        source: "/tools/md5",
        destination: "/api/tools/md5",
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
      beforeFiles: [
        ...Object.entries(PROXIED_HOSTS).map(([host, upstream]) => ({
          source: "/:path*",
          has: [{ type: "host" as const, value: host }],
          destination: `${upstream}/:path*`,
        })),
        // Docs, reverse-proxied from Mintlify so they serve as first-party
        // usesuperflow.ai/docs pages rather than a separate subdomain.
        //
        // These sit in `beforeFiles` for two reasons: they must outrank the
        // `fallback` rewrite below (which would otherwise try to serve
        // /docs/* out of public/pages-html and 404), and they must stay
        // *after* the PROXIED_HOSTS entries above so a request for
        // status.usesuperflow.ai/docs still reaches Statuspage.
        //
        // The last three rules are Mintlify's own asset and API surface.
        // They live at the domain root rather than under /docs, so proxying
        // only /docs/* would leave the docs shell without its JS, CSS and
        // search endpoint.
        { source: "/docs", destination: `${MINTLIFY_ORIGIN}/docs` },
        { source: "/docs/:path*", destination: `${MINTLIFY_ORIGIN}/docs/:path*` },
        {
          source: "/_mintlify/:path*",
          destination: `${MINTLIFY_ORIGIN}/_mintlify/:path*`,
        },
        {
          source: "/mintlify-assets/:path*",
          destination: `${MINTLIFY_ORIGIN}/mintlify-assets/:path*`,
        },
        { source: "/api/request", destination: `${MINTLIFY_ORIGIN}/_mintlify/api/request` },
      ],
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
