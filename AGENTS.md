<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Superflow marketing site

This repo migrates the Superflow Framer site to a Next.js + Sanity stack.
Mirror the patterns established in `velt-marketing-pages`:

- Homepage sections live in `components/home/` (hand-authored, prop-driven).
- Category templates (integrations / use-cases / libraries / comparisons / features) live in
  `components/<category>/` and render Sanity-backed documents via
  `app/<category>/[slug]/page.tsx`.
- `/public/pages-html/<category>/` holds the raw Framer HTML export as a
  fallback during migration — once a Sanity doc + route is wired up,
  delete the matching HTML directory.
- Use `scripts/transform-framer-jsx.mjs` to convert Framer HTML → JSX.
- All Sanity env config flows through `sanity/env.ts`.

## Standalone tools (`/tool/*`)

- `/tool/status` is a website status checker. The landing page lives in
  `app/tool/status/page.tsx`; `/tool/status/<host>/<path...>` is a catch-all
  route (`app/tool/status/[...site]/page.tsx`) that is `force-dynamic` and runs
  one live request from the server on every load via `lib/site-status/check.ts`.
  `lib/site-status/target.ts` is the shared (client + server) URL parser; it
  refuses private hosts and the checker re-checks the resolved address before
  fetching. Result pages are `noindex`; only the landing page is in the sitemap.
