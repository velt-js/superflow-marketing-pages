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
