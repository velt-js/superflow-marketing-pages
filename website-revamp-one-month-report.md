# Website revamp — one-month shipping report

**Source:** git history of `superflow-marketing-pages`, all branches after fetching all remotes, **Jun 21 – Jul 21 2026**.

**Scope:** 64 non-merge commits by two authors (miri-san 60, Rakesh 4) across 17 active days. Stash refs excluded. Commits that exist on multiple branches are counted once by hash.

---

## Headline stats

| Metric | Value |
| --- | --- |
| Commits pushed | 64 |
| Lines added | +115,000 |
| Lines removed | −10,000 |
| Files touched | 526 (458 text + 68 binary assets) |
| New page routes | 22 |
| New React components | 166 |
| New CSS modules | 107 |
| New public assets | 90 |
| New scripts | 56 |
| New Sanity schemas | 3 |
| Existing routes restyled in place | 17 |
| Total routes touched | 39 |

---

## Commit cadence

Commits per active day. A quiet tracking-scripts week in late June, then two clear pushes: the Jul 14 homepage go-live and the Jul 20–21 comparison + integrations sprint.

| Date | Commits |
| --- | ---: |
| Jun 24 | 2 |
| Jun 25 | 2 |
| Jun 26 | 2 |
| Jul 1 | 2 |
| Jul 6 | 1 |
| Jul 7 | 4 |
| Jul 8 | 8 |
| Jul 9 | 2 |
| Jul 10 | 2 |
| Jul 11 | 3 |
| Jul 12 | 2 |
| Jul 13 | 2 |
| Jul 14 | 9 |
| Jul 17 | 3 |
| Jul 19 | 1 |
| Jul 20 | 8 |
| Jul 21 | 11 |

---

## Lines added by area

| Area | Lines added |
| --- | ---: |
| `components/` | 92,960 |
| `scripts/` | 14,200 |
| `sanity/` | 2,945 |
| `app/` (routes) | 2,404 |
| Docs + config | 1,783 |
| `lib/` | 705 |

81% of all new code is UI components. `scripts/` is mostly the 15 Sanity seed + import pipelines (56 new script files).

---

## Lines added by file type

| File type | Lines added |
| --- | ---: |
| React components (`.tsx`) | 52,155 |
| Stylesheets (`.css`) | 42,205 |
| Scripts / data (`.ts` / `.js` / `.mjs`) | 12,393 |
| Docs, config, other | 8,244 |

Roughly 1 line of CSS for every 1.2 lines of TSX — the revamp is design-heavy, with hand-built artifacts instead of CMS imagery.

---

## New component families

New files created under `components/` per 2026 design family (tsx + css). `home-2026` includes the 44-file hero-artifact library reused by every other family.

| Family | New files |
| --- | ---: |
| `home-2026` | 174 |
| `case-study-2026` | 20 |
| `user-persona-2026` | 14 |
| `comparison-2026` | 13 |
| `checklist-2026` | 13 |
| `integration-2026` | 11 |
| `use-case-2026` | 9 |
| `blog-2026` | 7 |
| `pricing-2026` | 5 |
| `listing-2026` | 5 |
| Other 2026 families | 10 |

---

## How the month unfolded

### Jun 24 – Jul 1 — Tracking + analytics foundation

Claydar and RB2B visitor scripts (Rakesh), internal-link normalization, then the Amplitude integration with heatmap enrichment, later joined by GA4 pageview tracking.

### Jul 6 – 13 — 2026 homepage + feature-page system

New homepage preview, the reusable feature-page template, and a large library of product artifacts (Client Review, Analytics, Custom Agent, Recordings, Screenshots, Kanban, Review Workflows, Authenticated Pages…).

### Jul 14 — Go-live

The 2026 homepage and feature pages were promoted from `/preview` to the site root, plus a day of launch fixes (nav, testimonials, Calendly overflow).

### Jul 17 – 21 — Integrations hub + bespoke integration pages

Integrations hub redesign, then config-driven bespoke pages for Monday, Asana, ClickUp, Slack, Webflow, WordPress and Google Tag Manager, with unshipped Figma/API/webhook pages gated off.

### Jul 20 – 21 — Comparisons + remaining page families

28 comparison/alternatives pages on three new Sanity classes, plus 2026 restyles of use-case, persona, blog, pricing, book-demo, checklist, case-study and demo pages.

---

## Largest commits

| Date | Commit | Files | Added | Removed |
| --- | --- | ---: | ---: | ---: |
| Jul 11 | Client Review feature artifacts + related capabilities | 31 | +12,614 | −191 |
| Jul 10 | Toolbar fix with heavy asset churn | 60 | +11,961 | −355 |
| Jul 1 | Amplitude heatmaps: element interactions, URL enrichment | 92 | +11,617 | −2 |
| Jul 9 | FeatureSet refactor + new feature artifacts | 81 | +9,297 | −2,816 |
| Jul 8 | Hero artifacts: new components and styles | 46 | +5,852 | −345 |
| Jul 13 | Recordings + Screenshots artifact preview pages | 49 | +5,427 | −378 |
| Jul 20 | Product artifacts + glyphs on use-case/persona pages | 51 | +5,137 | −204 |
| Jul 12 | Authenticated Pages artifacts | 20 | +5,136 | −15 |

---

## New routes shipped (22 `page.tsx` files)

17 existing routes were also restyled in place (use-case, persona, blog, pricing, checklist, case-study, demo, book-demo…), bringing total routes touched to 39.

| Route(s) | What it serves |
| --- | --- |
| `/preview/comparison`, `/preview/comparison/[slug]`, `/preview/comparison/alternatives`, `/preview/alternative/[slug]` | Comparison + alternatives system (28 documents) |
| `/preview/integrations`, `/preview/integrations/[slug]` | Integrations hub + 7 bespoke integration pages |
| `/preview/features/[slug]` | Feature-page template (all feature pages) |
| `/home-preview` | 2026 homepage preview (promoted to `/` on Jul 14) |
| 12 artifact preview routes | custom-agent, custom-status, run-on-demand, workflow, versioning, live-site, private, record-walkthrough, recordings-, screenshots-, kanban-board-, review-workflows- and authenticated-pages-artifacts, hero-integrations |

---

## Method note

Stats are unioned across all branches, so work merged via staging/PRs is counted once per unique commit. Line counts exclude the 68 binary assets (images, logos) that git can't diff.
