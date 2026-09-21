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

## WebMCP

The site registers callable tools on the browser's WebMCP API
(`document.modelContext`), so an agent driving the browser a person is looking
at can use the page instead of scraping it. `components/webmcp/WebMcpProvider`
is mounted once in `app/layout.tsx` and derives the tool list from the path, so
every route is covered and no page wires anything up.

- Three site tools everywhere - read this page, read any page, list the pages -
  all answered from the `.md` copies above rather than the DOM.
- The free tools are built from `lib/tools/api-catalog.ts`, the same entries
  `/api/mcp` serves, so a tool cannot exist on one surface and not the other or
  drift in what it claims to take. A tool page registers its own tool; `/tools`
  and `/tools/mcp` register the whole live suite; nothing else registers extra.

WebMCP is an origin trial through Chrome 156 and the API has moved twice
(`window.agent` -> `navigator.modelContext` -> `document.modelContext`), so
`lib/webmcp/types.ts` feature-detects both surfaces and everything no-ops when
neither is present. Serving the trial token is opt-in per origin: register at
developer.chrome.com/origintrials and set `WEBMCP_ORIGIN_TRIAL_TOKEN` in the
build environment, which `next.config.ts` turns into an `Origin-Trial` header
on HTML pages only. Unset is a supported state - the tools stay reachable over
`/api/mcp` regardless.

`tests/webmcp/` stubs the API before page scripts run and asserts what gets
registered, that navigation unregisters it, and that the handlers really
return the page copy and call the real endpoints. Run it after touching the
registry, the `.md` surface, or the provider.

## Publishing from Sanity

CMS-backed pages are `export const revalidate = 60` and their Markdown copies
`revalidate = 3600`, so a publish is invisible for up to a minute (an hour for
the copy), and the first request after that window still serves the stale copy
while Next regenerates behind it - the edit only appears on the request after.
Checking a CMS change once, immediately, therefore reads as "nothing happened"
even when the write succeeded.

`app/api/revalidate/route.ts` is the fix: a signed Sanity webhook clears the
entries for the document's own path, its hubs, both Markdown copies, and the
sitemap/llms files the moment it is published. It needs two manual settings,
done together - `SANITY_REVALIDATE_SECRET` in the deployment environment, and a
webhook in manage.sanity.io carrying the same secret. The route comment has the
exact values. Until both exist the route answers 500 and the time-based windows
remain the only path, which is also the backstop if the webhook ever fails.

When you change CMS content yourself and want to confirm it, either fire the
webhook or request the page twice - a single `curl` reads the stale copy.
