# Semrush audit remediation — September 7, 2026

Repository: velt-js/superflow-marketing-pages. Baseline: main at 4097db3.
Semrush project: 31129281 (usesuperflow.ai). Snapshot: 6a9f0925360b06655c4b6ec6.
Source: the supplied issue-summary CSV plus Semrush issue_details and page_info.

These changes are prepared for deployment. The production crawl has not been rerun; baseline counts below are not post-fix Semrush results.

| Baseline issue | Count | Resolution |
| --- | ---: | --- |
| 4xx errors | 1 | Legacy /integrations/api redirects to the published REST API reference. |
| Broken internal links | 75 | Shared navigation/footer links point directly to /docs/rest-apis/projects/create-project; live destination verified HTTP 200. |
| Incorrect sitemap pages | 1 | Exclude retired /website-review, which redirects to the homepage. |
| Structured-data errors | 53 items | Remove unsupported app rich-result claims from feature/review/home pages, preserve WebPage/FAQ/Organization markup, represent unrated tool pages as WebPage entries, and exclude the unpriced Enterprise quote from Product offers. Published numeric tier/credit offers remain. Correct the tools' publisher logo URL. |
| Long titles | 11 | Individually shorten the three persona, six comparison, robots checker, and Asana article titles. All audited titles now pass the 60-character regression check. |
| Multiple H1s | 5 | Combine each two-line review/security headline into one H1, preserving the visual treatment. Apply the same fix to the legacy homepage component. |
| Content not optimized | 3 | Correct the observed H1-to-H3 jumps: decorative preview labels become paragraphs, pricing tier names become H2s. Heading-order checks pass on all three flagged pages. Semrush returns errorType 1 without a human-readable subtype; confirmation requires a fresh crawl. |
| Nofollow external links | 172 | Remove blanket nofollow from editorial vendor citations in comparison/alternative templates; retain noopener/noreferrer. Regression checks confirm no nofollow links on the affected pages. |
| Only one incoming internal link | 1 | Add an appropriate link from the project-manager persona page to the Asana alternatives article. |
| Permanent redirects | 85 | Navigation/footer website-review links now go directly to the homepage. The legacy redirect remains available for inbound links. |
| Anchor-text notice | 4 | Replace four URL-only privacy-policy reference labels with descriptive link text; destinations and legal prose stay the same. |
| Blocked from crawling | 1 | /seo-checklist-2023 is explicitly noindex in CMS and the live response. Preserve that editorial choice; exclude noindexed/hidden checklists from the sitemap. This notice can remain intentionally. |
| Low text-to-HTML ratio | 92 | Mitigated, not claimed cleared: externalize the repeated Wonderist logo as a cacheable SVG and remove redundant schema payloads. The interactive site still has substantial React payloads and SVG markup. |

## Validation

- Production `npm run build` passed (604 generated pages).
- `npx tsc --noEmit` passed after adding the JSDOM type dependency for the tests.
- `npx playwright test tests/seo --workers=4 --grep-invert 'review heading and cached'`: 95 passed. Tests request the production-rendered HTML for the original audited URLs and verify the applicable fixes, sitemap exclusions, and legacy API redirect.
- In-app browser: review headline inspected at 390px and 1440px; one H1 confirmed. Cached Wonderist SVG rendered correctly in the pricing testimonial card.
- The separate Playwright visual test could not launch Chromium in the macOS sandbox (MachPortRendezvous permission denied); it is retained for ordinary local/CI environments. The in-app visual checks above were performed instead.
- `git diff --check` passed.
- Existing repository limitations: `npm run lint` has no ESLint configuration to load. Build emits a file-tracing warning from lib/legal-content.ts and an existing Sanity image-url deprecation warning.

Sample live-vs-local HTML bytes (uncompressed UTF-8, affected builds sampled during the work; not a controlled performance benchmark):

| Page | Live baseline | Local fixed | Reduction |
| --- | ---: | ---: | ---: |
| /pricing | 455,916 | 423,510 | 32,406 |
| /website-monitoring | 444,254 | 400,523 | 43,731 |
| /integrations/shopify | 484,104 | 441,371 | 42,733 |

## Follow-up after deployment

Rerun the Semrush Site Audit and compare these same issue IDs with the baseline. Verify /integrations/api redirects to working docs, and /sitemap.xml excludes retired/noindexed pages. Keep the checklist noindex unless an editor explicitly decides to republish it. Evaluate the remaining ratio warning as an architecture/performance signal; do not pad visible text or remove working interactions just to change the ratio.

App-rich-result markup was deliberately removed where the page cannot support it: Google's software-app rich results require an actual rating or review as well as an offer. This change does not fabricate ratings, free Enterprise prices, or testimonials for the individual free tools. See [Google's software-app requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app) and [Semrush's content-optimization issue definition](https://www.semrush.com/kb/542-site-audit-issues-list).
