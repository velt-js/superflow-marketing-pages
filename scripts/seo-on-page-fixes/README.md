# On-page SEO fixes (CMS side)

The copy in `values.json` answers the on-page-actions report for the 65 Sanity
documents behind `/blog`, `/comparisons`, `/alternative`, `/bug-book`,
`/user-persona`, `/use-case`, `/case-study` and `/seo-checklist-2023` - 116
findings in total. The code-owned pages in the same report were fixed directly
in the repo and need nothing from here.

## Running it

```sh
DRY_RUN=1 node scripts/seo-on-page-fixes/apply.mjs      # print every change
node --env-file=.env.local scripts/seo-on-page-fixes/apply.mjs
```

`SANITY_API_TOKEN` needs write access. The whole set goes in one transaction,
and re-running is safe: a document already holding the target values is
skipped.

## What is in values.json

Keyed by Sanity `_id`. Each entry records the page it fixes, the report
findings it answers, and the fields to set:

```json
"up-qa-teams": {
  "path": "/user-persona/qa-teams",
  "fixes": ["meta_description.too_long", "h1.too_long", "title_tag.too_long"],
  "set": { "title": "...", "metaTitle": "...", "metaDescription": "..." }
}
```

The field chosen is the one that reaches the surface being fixed, and only that
surface:

| Surface | Field | Why |
| --- | --- | --- |
| `<title>` | `metaTitle` | Every route prefers it over `title`. Written as the FINAL title, brand suffix included - `buildPageMetadata` detects the suffix and passes the value through verbatim rather than appending a second one. |
| meta description | `metaDescription` | Preferred over `description`, so the page's own visible copy is untouched. |
| H1 | `title`, or `headline` where the template renders one | These are the rendered heading. |

So a page flagged for both its title and its H1 gets two different strings on
purpose: the H1 can read like a sentence, the title has to survive a search
result.

`bugBookEntry` had no meta fields at all - its title was composed in the route
as `headline + " - The Superflow Bug Book"`, which runs to 90-126 characters
because the headline IS the entry (a verbatim client quote, usually). The
fields were added to the schema and the route now prefers them, so those
entries keep their headline and still get a title that fits.

## Validation

```sh
node scripts/seo-on-page-fixes/validate.mjs
```

This does not measure the raw field values. It reproduces what each route
renders from the patched document - brand-suffix handling, the per-slug titles
the routes hard-code, the H1 field per template - and measures that against the
bands the report itself applies: title 30-60, meta description 100-160, H1 <=
70. It also re-checks every OTHER surface of each patched document, because one
field often feeds two (`blogPost.title` is the H1 and the fallback `<title>`),
and fails if a patch pushes a surface that was in band out of it.

`apply.mjs` runs it first unless `SKIP_VALIDATE=1`.

## What was deliberately not applied

The report's own `acceptedSuggestion` values were not pasted in. Three reasons,
all visible in the report file:

- **Truncated suggestions.** Several end mid-sentence - `"No login, no"`,
  `"Favicon Checker: Test Your Favicon |"`, `"and where text"`. Shipping those
  is worse than the finding.
- **`Aug 2026` stamped into evergreen copy.** The suggestions add a month to
  titles and H1s that are not month-specific. It is stale in four weeks and
  reads as churn to a crawler that has seen the page before.
- **The `jsonld` suggestions are a downgrade.** For `BlogPosting` they replace
  the real `Person` author with a generic `Organization`, rewrite
  `datePublished` on 2023 posts to the crawl date, add a fabricated
  `wordCount: 2500`, and drop `image`, `publisher` and `mainEntityOfPage`. For
  the `/pricing` `Product` they drop offer names, URLs and
  `priceSpecification`. The real JSON-LD defect on the blog posts - two
  conflicting `BlogPosting` nodes per URL, one of them still naming the retired
  `usesuperflow.com` host - was fixed in `app/blog/[slug]/page.tsx` instead.

The six `slug.has_date` findings were skipped by decision: renaming a live URL
costs its accumulated links for a weak signal, and the year that actually dates
these pages is in the title, which these values fix.
