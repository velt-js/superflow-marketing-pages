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
- `npm run lint` must pass. `eslint.config.mjs` documents the two rules that
  are not plain defaults: `react-hooks/error-boundaries` is off because it
  contradicts this repo's `try { return <JSX/> } catch { return null }`
  convention, and `react-hooks/set-state-in-effect` is a warning because its
  28 hits are a real backlog rather than a style choice.

## Machine-readable surface

Every page publishes a Markdown copy for agents at its own path plus `.md`
(the homepage at `/index.md`), and the same document is returned from the
HTML page's own URL when the request sends `Accept: text/markdown`.

- `proxy.ts` (Next 16's renamed `middleware.ts`) routes both forms to
  `app/api/md/[[...path]]`. It deliberately skips `/tools/*` and `/docs/*`,
  which publish their own copies - see the comments in that file before
  widening its matcher.
- `lib/markdown/` builds the documents: one builder per Sanity document type
  in `pages/sanity-pages.ts`, the agency directory in `pages/directory-pages.ts`,
  hand-authored copy for the non-CMS routes in `pages/static-pages.ts`, and
  `render.ts` turning all of them into Markdown. A copy is a rewrite for a
  machine, not a transcription of the page.
- The free tools are the exception: their copies are hand-authored in
  `lib/tools/content/`, read by both the page and its `.md`. A new tool needs a
  module there and an entry in that directory's `index.ts`, or it ships with no
  Markdown copy.
- Numbers that also appear on a page (prices, credit costs) are read from the
  same data module the page renders, so the two cannot drift.
- Discovery lives in `app/.well-known/` (agent card, MCP server card, RFC 9727
  api-catalog), the `Link` headers in `next.config.ts`, and `app/robots.txt`.
- `tests/seo/agent-surface.spec.ts` covers all of it. Run it after touching
  any of the above: most of these failures are invisible in a browser.
