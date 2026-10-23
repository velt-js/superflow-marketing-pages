# Which blog posts to convert into 2026 articles

Research date: 23 October 2026. Site: usesuperflow.ai.

The blog holds 44 posts: 25 legacy posts imported from the Framer site
(written September 2023 to January 2024) and 19 written in 2026. This report
answers one question: of everything on the site that could become a 2026 blog
article, which pieces are worth the work, in what order, and why.

It covers three sources of articles:

1. The 25 legacy posts: rewrite, merge, or retire each one.
2. Non-blog assets already on the site (the Bug Book, the retired SEO
   checklist, the free tools, the agency survey) that can feed new articles.
3. Topics competitors' blogs rank for and ours does not.

## Data used

| Source | What it gave |
| --- | --- |
| Semrush Organic Research, US database, 23 Oct 2026 | Keywords and estimated monthly traffic per URL on usesuperflow.ai and the old usesuperflow.com |
| Semrush Keyword Overview, US | Volume, keyword difficulty (KD) and intent for about 180 candidate keywords |
| Semrush organic pages for bugherd.com, marker.io, ruttl.com, usersnap.com, filestage.io, atarim.io blogs | Which competitor posts earn traffic |
| Amplitude `Page View` by `[Amplitude] Page Path`, July to October 2026 | On-site views per post |
| A read of each legacy post body | Word count, framing, and whether it still fits the product |

All volumes are US monthly searches. "Traffic" is Semrush's estimate of
monthly organic visits, not measured visits.

## Headline findings

- **Semrush credits the whole domain with about 330 organic visits a month, and the blog with about 60.** Three posts earn most of the blog's share: the 2026 brand compliance comparison (22), the legacy top-20 annotation tools post (10), and the 2026 Ruttl alternatives post (7).
- **Six legacy posts still rank for queries worth having.** The other nineteen rank for nothing, or for queries unrelated to what Superflow sells.
- **Amplitude cannot pick winners here.** Every legacy post sits at 20 to 60 views a month, flat regardless of its rankings, which is the shape of crawler traffic rather than readers. A July burst (1,723 views of the Google Docs post in one month, then 36 in August) was a crawl. Semrush is the better signal for this decision.
- **Nine legacy posts duplicate pages that already exist** (the `/comparisons/superflow-vs-*` and `/alternative/*` templates, and 2026 blog posts on the same subject). They split link and ranking signals three ways. Merge and redirect them.
- **The best conversions sit in the website QA, feedback and annotation cluster**, where KD is 10 to 35 and the site already holds page-one or page-two positions.
- **The Bug Book is the most original asset on the site** and none of it is packaged as an article yet. Its 59 entries are first-hand evidence no competitor can copy.

## Part 1: the 25 legacy posts

Verdicts: **Rewrite** means a 2026 article at the same URL. **Merge** means fold
into another URL and 301 the old one. **Retire** means 301 to the nearest
live page, or noindex if there is none.

### Rewrite (six posts)

| Post | Semrush today | Target keywords (volume / KD) | Why |
| --- | --- | --- | --- |
| Top 20 website annotation tools | 42 keywords, 10 visits. Ranks 8 for "annotating website" (210), 14 for "annotation website" (1,000), 24 for "annotate website" (1,300) | website annotation tool 320 / 36; annotate website 590 / 18; online annotation tools 260 / 24 | The strongest legacy URL. The 2026 post "website-annotation-tools-comparison" targets the same query with 3 keywords and 4 visits. Keep the legacy URL because it holds the rankings, port the 2026 content and format into it, and 301 the 2026 slug to it. |
| How to annotate a website in 5 simple steps | 1 keyword, 0 visits | how to annotate a website 390 / 24; annotate a website 260 / 33 | Pure how-to intent with low KD, and the sister listicle already ranks. Rewrite as a method guide covering browser extensions, screenshots, PDFs and Superflow, not a product tour. |
| Website feedback for beginners: 5 practical use cases | 8 keywords, 4 visits. Ranks 3 for "website design review tool" (70), 15 for "feedback for websites", 18 for "web design feedback" (210) | website feedback 590 / 21; website feedback examples 320 / 15; web design feedback 210 / 19 | Already on page one for a small query and page two for two more. A rewrite with real feedback examples (the Bug Book supplies them) can take the 590 and 320 queries. |
| Website redesign: beginner's guide and 10-step checklist | 21 keywords, 1 visit. Ranks 16 for "website redesign strategy" (260), 40 for "website redesign" (4,400). Also the only legacy URL still ranking on usesuperflow.com (9 keywords) | website redesign checklist 590 / 17; website redesign strategy 320 / 11; website redesign project plan 320 / 27 | 4,530 words of 2023 generic advice. The rewrite should lead with the checklist (lowest KD) and frame redesign QA, before-and-after snapshots and post-launch monitoring around the product. |
| Website collaboration: a guide to getting it right, merged with Nine key practices for team and agency-client collaboration | 13 keywords, 4 visits. Ranks 14 for "collaborative website" (1,000, mixed intent) | client collaboration software 480 / 21; agency client collaboration 140 / 5; client collaboration 210 / 23 | Two posts on one subject. Fold the "nine practices" post (no rankings) into this URL and retarget to the agency-client angle, which has the cleanest intent and the lowest KD on the list. |
| Markup.io vs UsePastel | 13 keywords, 5 visits. Ranks 4 for "usepastel" (260), 5 for "markup.io alternatives" (140), 7 for "usepastel alternative" (110) | markup.io alternatives 140 / 1; usepastel alternative 110 / 0 | Out-ranks the site's own `/comparisons/markup-vs-pastel` page (6 keywords, 0 visits). Keep the URL, refresh pricing and screenshots to 2026, and link both ways with the comparison page. |

### Merge or rewrite with a different angle (five posts)

| Post | Semrush today | Verdict | Target |
| --- | --- | --- | --- |
| 10 best website project management tools (title says "for 2014") plus How to choose the right website project management tool | 7 keywords and 2 keywords, 0 visits. Its queries have KD 62 to 72 | Merge both into one article at the "10 best" URL, retargeted to a project plan template | website project plan template 590 / 27; website project plan 320 / 27. This is marker.io's top blog post (704 visits a month). Ship a downloadable template, not a tool list. |
| A guide to choosing the best Webflow agency | 4 keywords. Ranks 31 for "best webflow design agencies" (260) | Rewrite to feed the agency directory at `/directory` | webflow agency 1,300 / 27; best webflow agency 260 / 20; webflow agencies 320 / 33. The directory did not exist when this was written. Now it is the natural call to action, so the post earns its place. |
| Guide to choosing the best HubSpot development agency | 7 keywords. Ranks 21 for "best hubspot website design agency" (90, KD 4), 53 for "hubspot web development agency" (110) | Rewrite, same directory angle | hubspot development agency 260 / 21; hubspot partner agency 1,000 / 32 |
| How to choose the right marketing agency for your small business, merged with 5 factors for choosing a SaaS performance marketing agency | 0 keywords each | Merge into one directory-led post | how to choose a marketing agency 590 / 22. The SaaS post has one usable query (saas performance marketing agency, 90 / 6) that fits as a section. |

### Retire (fourteen posts)

Seven of these duplicate a live comparison or alternative page. Redirect each
to the page named. A stub for this exists at `lib/blog-redirects.ts`; it
returns nothing and is not yet imported by the Next config.

| Post | Redirect to | Note |
| --- | --- | --- |
| Superflow vs Ruttl (2023) | `/comparisons/superflow-vs-ruttl` | Also duplicates the 2026 "Top Ruttl alternatives" post |
| Superflow vs Markup.io | `/comparisons/superflow-vs-markup` | Also duplicates the 2026 Markup.io alternatives post |
| Superflow vs BugHerd (2023) | `/comparisons/superflow-vs-bugherd` | Two slugs exist for this post, one with parentheses and one with double dashes. Redirect both. |
| Superflow vs Pastel (title says "2003") | `/blog/superflow-pastel-feedback-tool-comparison` | The September 2026 post covers the same ground |
| Superflow vs Webflow comments | `/alternative/webflow-comments-alternative` | "webflow comments" has 20 searches a month |
| Superflow vs Vercel comments | `/alternative/vercel-comments-alternative` | "vercel comments" has 30 searches a month |
| Beyond Loom: 10 video communication alternatives | `/alternative/loom-alternative` | "loom alternatives" is 880 / 26, but the alternative page is the right home for it, not a 2023 listicle |
| Top Google Docs alternatives | `/alternative/google-docs-alternative` | 1,000 / 26, but off-topic. Amplitude's most-viewed URL, entirely from the July crawl. |

Six are off-topic and rank for nothing. Redirect to `/blog`, or noindex:

| Post | Why retire |
| --- | --- |
| Top 5 AI SEO tools in 2024 | "ai seo tools" is 3,600 / 64 and the results are tool vendors. Not a fit. |
| Top 5 AI copywriters in 2024 | Same. 0 keywords. |
| AI writing tools for your website: Superflow's AI Copilot | A 2023 feature post for a ChatGPT-4 rewrite feature. Redirect to `/ask-ai`. |
| 13 Asana alternatives for startups and agencies | "asana alternatives" is 1,600 / 28, which is tempting, but Superflow is not a project management tool and the post ranks for 2 keywords. The project-manager persona page links here (added in the September audit), so repoint that link before retiring. |
| Nine key practices for team and agency-client collaboration | Merged above |
| 5 factors for choosing a SaaS performance marketing agency | Merged above |

## Part 2: non-blog assets that can become articles

### The Bug Book (59 entries, none packaged)

Each entry is one incident. Grouped, they become articles with evidence no
competitor has. Suggested compilations, in order of search upside:

| Article | Entries to draw on | Target keyword (volume / KD) |
| --- | --- | --- |
| How clients spot AI copy on their own site, and what to do before they do | no-em-dashes, ai-copy-detected, gpt-notes, content-machine-benched, inexperienced-intern, ai-rewrote-the-docs | em dash ai 1,600 / 52; how to spot ai writing 480 / 47. High KD, but the first-hand client quotes are the differentiator. |
| Client feedback examples: what good and bad website feedback looks like | its-centered, lighter-blue-darker-hex, very-particular, kindly-do-the-needful, no-this-is-what-the-client-wants, correct-the-icons-are-wrong | client feedback examples 320 / 25; how to give design feedback 50 / 19. Also feeds the rewrite of "Website feedback for beginners". |
| The placeholder bugs that go live: a pre-launch pass | add-new-button, first-second-third-service, dr-first-last-name, book-now-goes-nowhere, someone-elses-privacy-policy, wrong-dentist-wrong-city, og-image-sliver | Strengthens the existing "Website QA checklist" post (website launch checklist 1,600 / 32) rather than competing with it. Add as a section and link. |
| Typos that shipped: what a spell-check agent catches on real sites | counsultation, dumpters, hippa-notice, medusa-services, duperflow, makes-no-since, google-australian-spelling, text-shits-left | website spell checker 170 / 62. Low search upside, high share upside. |
| "Make the logo bigger": why the request never dies | make-the-logo-bigger, wife-hates-the-hair, very-particular | make the logo bigger 170 / 16. Cheap, on-brand, low KD. |
| We ran our QA agents on our own site. Here is what they found. | our-own-slow-app, our-homepage-no-json-ld, og-image-sliver, this-is-live, duperflow | No keyword target. A trust piece that links to the JSON-LD validator and social preview checker tools. |

### Other assets

| Asset | Conversion | Target |
| --- | --- | --- |
| `/seo-checklist-2023` (live but noindexed, retired by editorial choice) | Rewrite as a website audit checklist, as a new blog post, and keep the old page noindexed | website audit checklist 1,300 / 33; website content audit 1,000 / 37. Avoid "website launch checklist", which the 2026 QA checklist post already targets. |
| State of Agency Tools 2026 survey (report publishes November 2026) | Three to five findings posts once the report is out. Original data earns links even where search volume is small. | agency tech stack 40 / 11; web agency tools 110 / 9 |
| Free tools | How-to articles that each end at a tool. The favicon checker already earns 18 visits a month from 7 keywords with no article behind it. | how to find broken links on a website 140 / 47 (website status checker, QA agents); website migration checklist 1,000 / 32 (tech stack detector); social preview checker pairs with the OG image Bug Book entry |
| The three "What's new in Superflow" changelogs | Do not convert. Keep them under the product-update category. They are release notes, not articles. | none |
| Writesonic case study | Leave as a case study. | none |

## Part 3: gaps competitors fill and we do not

Ranked by fit with the product first, then by volume against KD. Each row
is a new article, not a conversion.

| Article | Evidence | Target keywords (volume / KD) |
| --- | --- | --- |
| Website QA testing: the complete guide | BugHerd's top blog post, 212 visits a month from 53 keywords | website qa testing 140 / 10; website quality assurance 110 / 15; website qa tools 70 / 28. Core product subject with the lowest KD in this list. |
| Bug report template and how to write one | marker.io, 279 visits | bug report template 390 / 19; how to write a bug report 90 / 23 |
| User acceptance testing template and checklist | marker.io, 194 visits; usersnap, 703 | user acceptance testing template 320 / 21; uat checklist 210 / 13; sit vs uat 260 / 20. Matches the UAT and QA testing use case page. |
| How to review a website, with a checklist | BugHerd "complete website review guide", 73 visits | website review checklist 110 / 5; how to review a website 70 / 24. Ties to the `/website-review` page. |
| Client proofing and online proofing software | Filestage's category | online proofing software 720 / 20; client proofing software 320 / 14. Fits the PDF, image and video review pages. |
| Website maintenance plan and checklist | Not in any competitor's top 25 | website maintenance plan 1,300 / 24; website maintenance checklist 320 / 27. Fits website monitoring. |
| Website design questionnaire for clients | marker.io, 27 visits | website design questionnaire 210 / 14; web design client questionnaire 110 / 17 |
| What is a staging environment, and how to review one | marker.io | staging environment 320 / 32. Fits authenticated-page review. |
| Website requirements document | BugHerd, 72 visits | website requirements 70 / 22; website requirements document 40 / 10 |
| Design collaboration tools | ruttl, 28 visits | design collaboration tools 480 / 34; design collaboration software 260 / 30 |
| Web design workflow | BugHerd | web design workflow 390 / 25; web design process 1,000 / 35 |
| Customer feedback tools | BugHerd, 63 visits | customer feedback tools 1,000 / 29; user feedback software 260 / 33. Broader than the product. Lower priority. |

Skip "broken link checker" (8,100 / 90) and "ai testing tools" (1,300 / 64).
Both are high-KD vendor results and the site has no foothold.

## Suggested order of work

Each item is one article. Effort is relative to a rewrite of an existing post.

1. Website annotation tools: merge the two posts into the legacy URL. Half the work is already done.
2. How to annotate a website. Rewrite.
3. Website feedback: rewrite, using Bug Book quotes as the examples.
4. Website QA testing guide. New.
5. Bug report template. New, with a download.
6. Website redesign checklist. Rewrite of the longest legacy post.
7. Client collaboration: merge the two legacy posts, retarget.
8. UAT template and checklist. New.
9. Website project plan template: merge the two project management posts.
10. How clients spot AI copy. Bug Book compilation.
11. The three agency-choice posts, rewritten to feed the directory.
12. The fourteen retirements, in one batch with the redirects.

## Housekeeping found on the way

- Two slugs serve the Superflow vs BugHerd post, one with parentheses in the URL. Fix in Sanity before adding redirects.
- Titles still carry "2024", "2023", "(2003)" and "for 2014". The last two are typos.
- Every legacy post description is a 60 to 90 word paragraph in the listing. The 2026 posts use one sentence. Trim during each rewrite.
- `lib/blog-redirects.ts` is the intended home for the 301s. It returns an empty list and nothing imports it yet, so the batch of retirements also needs it added to the `redirects()` block in `next.config.ts`.
- The Semrush position-tracking campaign for this project tracks one keyword. Adding the target keywords in this report, about 40, would make the next review of this plan a one-call job.
