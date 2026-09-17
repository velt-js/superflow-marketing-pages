# superflow-marketing-pages
Superflow Marketing Pages

## Brand assets

Anything under `public/` is served from the site root, so these are stable
public URLs suitable for handing to third parties (partner directories, OAuth
consent screens, app listings, embeds).

| Asset | Public URL | Spec |
| --- | --- | --- |
| `public/brand/logo.svg` | https://usesuperflow.ai/brand/logo.svg | 512×512 (1:1), white background plate, self-contained hex fills |
| `public/brand/logo.png` | https://usesuperflow.ai/brand/logo.png | 512×512 (1:1), white background plate, fully opaque |

Use these whenever an external form asks for a "1:1 logo with background
plate". They are built for foreign renderers: literal hex fills (no CSS
`var()` fallbacks), an explicit `width`/`height`, a square `viewBox`, and an
opaque plate so the mark never disappears on a dark surface.

The other logo files serve the site itself and are NOT drop-in replacements:

- `app/icon.svg` — favicon, non-square `viewBox` (20 × 19.5781)
- `public/images/nav/logo.svg` — in-page nav mark, non-square, `var()` fills
- `public/logo.png` — 512×512 but a fully transparent background, no plate

`usesuperflow.com` 301-redirects to `usesuperflow.ai`. Prefer the `.ai`
hostname when handing a URL to a third party — some consumers do not follow
redirects when fetching images.

### Regenerating the PNG

`logo.png` is rasterized from `logo.svg`, so edit the SVG and re-render:

```sh
rsvg-convert -w 512 -h 512 public/brand/logo.svg -o public/brand/logo.png
```
