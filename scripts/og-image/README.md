# Meta image generator

Generates Superflow social / Open Graph cards from the Figma template
([node 1112:1014](https://www.figma.com/design/aVubXS2jMWMDlRK42zvgoy/Superflow-Marketing---2026?node-id=1112-1014)):
blue gradient, centred logo lockup, big Urbanist Bold headline, `usesuperflow.ai`
footer.

No new dependencies - it renders through `next/og`, which ships with Next.

## Usage

```bash
# One card (writes public/og/monday-integration-with-superflow.png)
npm run og -- --title "Monday Integration with Superflow"

# Pick the output path
npm run og -- --title "Pricing" --out public/og/pricing.png

# Force a line break
npm run og -- --title "Private Comments\nfor client review"

# A whole set at once
npm run og -- --manifest scripts/og-image/manifest.example.json

# Full option list
npm run og -- --help
```

`node scripts/og-image/generate-og.mjs …` works identically if you would rather
skip the npm indirection.

## Options

| Flag | Default | Notes |
| --- | --- | --- |
| `--title <text>` | *required* | Headline. `\n` forces a line break. |
| `--out <path>` | `public/og/<slug>.png` | Slug is derived from the title. Parent dirs are created. |
| `--footer <text>` | `usesuperflow.ai` | Muted line at the bottom. |
| `--width <px>` | `1200` | |
| `--height <px>` | `630` | |
| `--max-lines <n>` | `3` | Lines allowed before the headline shrinks. |
| `--font-size <px>` | auto | Fixed headline size in 1280-wide base px; disables auto-fit. |
| `--no-balance` | off | Keep the greedy line break instead of evening line lengths. |
| `--manifest <path>` | – | Batch mode; see below. |
| `--skip-existing` | off | Leave already-generated files alone. Cards overwrite by default. |

Sizes default to **1200x630** - the canonical OG / `summary_large_image` ratio,
matching the existing site-wide `public/opengraph-image.png`. The Figma frame is
1280x720; pass `--width 1280 --height 720` to reproduce it exactly.

## Type scale

The comp's type runs large on a real timeline card, so the defaults sit ~20%
below Figma. Both values are recorded in `constants.mjs`:

| Token | Default | Figma |
| --- | --- | --- |
| `TITLE_FONT_SIZE_MAX` | 78 | 100 |
| `TITLE_FONT_SIZE_MIN` | 42 | 52 |
| `BRAND_FONT_SIZE` | 29 | 36 |
| `LOGO_HEIGHT` | 26 | 32 |
| `LOGO_GAP` | 15 | 18 |
| `FOOTER_FONT_SIZE` | 20 | 24 |

Scale all six together to resize the card; changing only some breaks the comp's
proportions.

## Batch mode

The manifest is a JSON array (or `{ "cards": [...] }`). Each entry takes the
same keys as the flags, camelCased:

```json
[
  { "title": "Monday Integration with Superflow", "out": "public/og/integrations/monday.png" },
  { "title": "Superflow vs Markup.io", "out": "public/og/comparisons/markup-io.png", "maxLines": 2 }
]
```

Flags passed alongside `--manifest` act as defaults for every entry, so
`--manifest cards.json --width 1280 --height 720` re-renders the whole set at
Figma size. Per-entry values win.

Copy `manifest.example.json` as a starting point. Cards **overwrite** whatever is
at `out` - `public/og/` already holds hand-made assets (`website-review.png` and
the other review cards), so pick paths that do not collide, or pass
`--skip-existing`. The example writes under `public/og/cards/` for that reason.

## The static-page card set

Every static marketing route has a committed card. Headlines live in
`pages.json`, the PNGs in `public/og/pages/`, and the paths in
`app/_seo/og-images.ts`. To change a headline, edit `pages.json` and re-run:

```bash
npm run og:pages
```

Routes covered: `/affiliate`, `/alternative`, `/blog`, `/book-demo`,
`/calculator`, `/case-study`, `/checklist`, `/comparisons`, `/demo`,
`/integrations`, `/pricing`, `/privacy`, `/security`, `/terms`, `/use-case`,
`/user-persona`, `/webflow-plugin`.

Two deliberate exclusions:

- **`/`** keeps the bespoke `/opengraph-image.png`. It is a designed asset and
  is still the site-wide fallback; a generated text card would be a downgrade.
- **CMS-backed `[slug]` routes** resolve their image from Sanity
  (`doc.ogImage` / `doc.thumbnail`) and fall back to `/opengraph-image.png`.
  `/integrations` is the one hybrid: `doc?.ogImage ?? PAGE_OG_IMAGES.integrations`.

Adding a card for a new static route means three edits: an entry in
`pages.json`, a key in `app/_seo/og-images.ts`, and `ogImage:` at the page's
`buildPageMetadata` call.

## Wiring a card into a page

`app/_seo/page-metadata.ts` already threads a per-page image through
`openGraph` and `twitter`:

```ts
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";

export const metadata = buildPageMetadata({
  title: "Affiliate Program",
  description: "…",
  path: "/affiliate",
  ogImage: PAGE_OG_IMAGES.affiliate,
});
```

Paths are relative to `public/`, and resolve against the `metadataBase` set in
`app/layout.tsx`.

## How it works

- **Rendering** - `next/og`'s `ImageResponse` (Satori + resvg) rasterizes a React
  element tree straight to PNG in plain Node. `template.mjs` builds that tree
  with `React.createElement` rather than JSX so the script needs no build step.
- **Scaling** - every measurement in `constants.mjs` is expressed against the
  1280x720 Figma frame and multiplied by `width / 1280`, so any output size keeps
  the design's proportions.
- **Auto-fit** - `measure.mjs` reads real glyph advances out of the Urbanist TTF
  (`head`/`hhea`/`hmtx`/`cmap`) and wraps the headline itself. The fitter walks
  78px down to 42px until the title fits both `--max-lines` and the vertical
  space between header and footer. Each wrapped line is emitted as its own
  element, so the rendered break points are exactly the measured ones. Titles
  that still do not fit at 42px render at 42px rather than shrinking further.
- **Balanced wrapping** - headlines get CSS `text-wrap: balance` behaviour: even
  line lengths rather than a full first line and a stranded orphan on the last.
  Satori implements no `text-wrap` property, so setting it in the template would
  be a no-op; since the template does its own line breaking, `balanceWrap` does
  it directly - greedy-wrap once for the natural line count, then binary-search
  the narrowest width that still fits in that many lines. Author-supplied `\n`
  breaks are preserved, and each paragraph is balanced on its own. `--no-balance`
  falls back to the greedy break.
- **Fonts** - Urbanist 400/700 are downloaded from Google Fonts on first run and
  cached in `scripts/og-image/.fonts/` (gitignored). Satori cannot read woff2, so
  these are the static TTFs. Later runs need no network; to work fully offline
  from the start, drop `urbanist-400.ttf` / `urbanist-700.ttf` in that folder.
- **Logo** - read from `public/images/nav/logo.svg`, the same asset the site nav
  uses, with its `var(--fill-0, …)` fills and percentage dimensions rewritten so
  the rasterizer can handle it. Change the logo once and the cards follow.

## Known deviation from the comp

Figma applies OpenType kerning; Satori does not. Glyph advances, tracking, line
breaks, and vertical placement match the comp within a pixel, but kern-heavy
pairs around spaces come out slightly wider - measured against node 1112:1014,
`"y I"` is ~12px looser at 100px type and `"h S"` ~2px. It is uniform and reads
as normal word spacing. A fixed word-gap correction was tried and rejected: it
fixes one pair, over-tightens every other, and visibly jams words together at
smaller sizes.
