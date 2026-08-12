# Self-hosted fonts

These are the three faces the site uses, served from the repo instead of
fetched from Google at build time. Wired up in `app/layout.tsx` via
`next/font/local`.

## Why they live here

`next/font/google` downloads the woff2 files from `fonts.gstatic.com` during
the build. That makes every deploy depend on Google's CDN still serving the
exact file URLs Next resolved on a previous build and cached.

On 2026-08-12 that dependency broke the build. Google converted Urbanist to a
variable font and deleted the eight static instances (4 weights x 2 subsets)
that the Vercel build cache still pointed at. All eight returned 404, Turbopack
could not resolve the font module, and the build failed with eight
`Module not found` errors on a branch whose diff did not touch fonts. Every
deploy of the repo was affected, not one branch.

Self-hosting removes the build-time network dependency entirely. It also drops
a third-party connection from the runtime critical path, which matters for the
`/tools` pages: the brief sets an LCP budget of 1.5s.

## What is here

| File | Family | Weight | Bytes |
|---|---|---:|---:|
| `poppins-300.woff2` | Poppins | 300 | 7,844 |
| `poppins-400.woff2` | Poppins | 400 | 7,900 |
| `poppins-500.woff2` | Poppins | 500 | 7,740 |
| `poppins-600.woff2` | Poppins | 600 | 7,992 |
| `poppins-700.woff2` | Poppins | 700 | 7,848 |
| `urbanist-variable.woff2` | Urbanist | 100 to 900 | 27,812 |
| `adamina-400.woff2` | Adamina | 400 | 15,444 |

Total 82,580 bytes. All `latin` subset only, matching the previous
`subsets: ["latin"]` configuration, so the set of bytes a visitor downloads is
unchanged apart from the Urbanist saving below.

**Urbanist is one file, not four.** Google returns a separate `@font-face`
block per requested weight, but serves the same variable binary for all of
them. The four downloads were byte-identical (md5
`40fbb0c52f0de3ff98a350da4c858f4c`). Declaring it once as a variable font with
`weight: "100 900"` saves 83KB and three redundant requests.

Poppins is genuinely static on Google Fonts, so all five weights are distinct
files and all five are needed. Asking Google for a Poppins weight *range*
returns an error page, which is how you can tell.

## Refreshing them

Only needed if a design change wants a different weight or subset. There is no
routine reason to re-download these.

```bash
# The css2 endpoint needs a modern browser UA or it serves ttf instead of woff2.
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'

# Inspect what Google serves. Keep only the blocks under the /* latin */
# comment, to match subsets: ["latin"].
curl -s -A "$UA" 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'

# Check whether a family is variable before downloading one file per weight.
# A range request succeeds and reports "font-weight: 100 900" for a variable
# font, and returns an HTML error page for a static one.
curl -s -A "$UA" 'https://fonts.googleapis.com/css2?family=Urbanist:wght@100..900&display=swap'
```

Then download the woff2 URLs from the latin blocks, drop them here, and update
both the table above and the `src` arrays in `app/layout.tsx`.

## Licensing

All three are licensed under the SIL Open Font License 1.1, which permits
redistribution and requires the license to travel with the files. It is
committed here as `OFL.txt`, with the per-family copyright holders listed at
the top.
