# Solutions and use-case pages: research and page briefs

Date: 21 Oct 2026. Branch: `docs/solutions-pages-plan`.
Sources: bugherd.com, marker.io, spurtest.com, usesuperflow.ai, Semrush (US database, pulled 21 Oct 2026), open PRs #95 and #136 in this repo.

## 1. The answer

Split solutions from use cases. PR #95 already did it: `/solutions` has two columns, "By agency" (who you are) and "By job" (what you need done). Use cases are the "By job" column. Fold the old `/use-case` pages into it over time and keep `/user-persona` for roles only.

Build these six next (batch 2):

| # | Page | Column | Why it is on the list |
| --- | --- | --- | --- |
| 1 | White-label agencies | By agency | Conference signal. No competitor has it. Custom domain and colors already ship. |
| 2 | Web design studios (Webflow, Framer, WordPress) | By agency | BugHerd splits web dev agencies from marketing agencies. We only have the marketing one. |
| 3 | Shopify and ecommerce agencies | By agency | Both competitors have an ecommerce page. Neither names Shopify. We have the Shopify install. |
| 4 | In-house web and brand teams | By agency | Our homepage names this audience. BugHerd and Marker both have a page for it. |
| 5 | Accessibility review | By job | Real search demand. Marker leads its monitoring page with it. |
| 6 | Brand compliance | By job | Only Superflow can write this page. Our blog already ranks for the term. |

Always-on monitoring, the second conference signal, is already covered twice: the `site-care` solutions page in PR #95 and the `/monitoring` feature page in PR #136. Do not add a third page. Sharpen `site-care` instead (section 8).

Pages 2, 3, 5 and 6 are already on the batch 2 list in `HANDOFF-app.md` from PR #95. Pages 1 and 4 are new. "Real estate marketing" from that list drops to batch 3 unless sales has pipeline for it.

## 2. What exists today

| Where | What | Notes |
| --- | --- | --- |
| Live site (usesuperflow.ai) | 5 use-case pages: bug reporting, client feedback, conversion optimization, UAT and QA testing, UX/UI optimization | Three more sit in `lib/listing-data.ts` but are not live: design reviews, marketing handoffs, stakeholder reviews |
| Live site | 9 persona pages: designers, developers, founders, marketers, marketing agencies, product companies, product managers, project managers, QA teams | Two of these are company types, not roles |
| Live site | Feature pages for white label, monitoring and review agents | `/white-label` says custom domains and colors are not included. They are. Fix the page. |
| Homepage `SolutionsSection` | Six cards: dental marketing agencies, medical and healthcare content, home-services marketing, real estate marketing, in-house content and brand teams, freelancers and studios | Real estate and freelancers have no page yet |
| PR #95 (open) | `/solutions` index and six pack pages: dental, healthcare, home services, pre-launch QA, site care, migration QA. One template, Sanity-backed, JSON seed fallback, copy checks in CI | Each page sells a pack of eight agents. A page cannot ship until its pack exists in the app. |
| PR #136 (open) | `/monitoring` feature page and a draft homepage. Hero, four steps, what you get, schedules, the report, one flat rate, testimonials, trust, integrations, FAQ | Defines 13 named agents in `components/home-new-2026/content.ts` |

One thing to settle before batch 2: PR #95 and PR #136 name agents differently. PR #95 packs use names like Broken Links, Palette Guard, Mobile Overflow. PR #136 uses Link Checker, Consistency Checker, Mobile Inspector. Pick one list and make the packs draw from it, or the site will show two agent catalogs.

## 3. What the competitors do

Both BugHerd and Marker split the same way we now do.

| Site | "Who it's for" | "Use cases" |
| --- | --- | --- |
| BugHerd | Marketing agencies, web development agencies, in-house teams | UAT testing, bug tracking, website feedback, online proofing, eLearning, ecommerce, website QA, new website build, plus a long tail of "X tool" pages |
| Marker.io | Ecommerce, enterprise, pharmaceuticals, agency, software development | Website annotations, website feedback, user acceptance testing, QA testing, bug tracker |
| Spur | None. Groups by agent type: exploratory, localization, UI/UX, functional, AI feature testing | Mobile app testing, merchandising QA |

Neither BugHerd nor Marker mentions white label, custom branding, retainers or maintenance plans on its agency page. Marker's agency page has a guest portal. BugHerd's has a partner program.

Marker shipped a monitoring page this year. It runs accessibility checks only. Broken links, SEO, content quality and compliance are listed as coming soon. Superflow already ships all of those plus custom checks and scans on every deploy. That gap closes when they ship.

Spur sells a different thing: AI test automation for apps, mobile and merchandising QA. Its site matters for one reason: it sells "an agent per check type", which is the same shape as our 13 agents.

## 4. What the competitors' pages earn

Semrush estimates for non-blog pages, US, organic visits per month.

| Page | Visits |
| --- | --- |
| bugherd.com (homepage) | 1,876 |
| bugherd.com/use-case/website-feedback-tool | 164 |
| bugherd.com/visual-feedback-tool | 65 |
| bugherd.com/cp/marker-alternative | 54 |
| bugherd.com/use-case/bug-tracking-tool | 2 |
| bugherd.com/use-case/uat-testing-software | 0 |
| marker.io (homepage) | 557 |
| marker.io/website-annotation-tool | 59 |
| marker.io/website-design-feedback | 20 |
| marker.io/bug-tracker | 4 |
| marker.io/uat-tool | 1 |

The use-case and solutions pages on both sites bring almost no search traffic. Their traffic comes from the homepage, the blog and the alternatives pages. So treat solutions pages as sales and nav pages first. Pick them by how buyers buy. Two of the six below also have real search demand, which is a bonus, not the reason.

## 5. Search demand we can use

US monthly searches and keyword difficulty from Semrush. Volume under 50 is left out.

| Keyword | Volume | Difficulty | Feeds page |
| --- | --- | --- | --- |
| website maintenance services | 4,400 | 23 | site-care |
| website maintenance plan | 1,300 | 24 | site-care |
| website care plan | 590 | 3 | site-care |
| website maintenance agency | 480 | 16 | site-care |
| wordpress maintenance agency | 260 | 7 | site-care |
| monitor website changes | 590 | 50 | site-care |
| white label client portal | 320 | 16 | white-label-agencies |
| white label reporting | 480 | 21 | white-label-agencies |
| white label saas | 320 | 24 | white-label-agencies |
| white label platform | 260 | 25 | white-label-agencies |
| webflow agency | 1,300 | 27 | web-design-studios |
| ecommerce website testing | 90 | 7 | shopify-ecommerce |
| ecommerce qa testing | 70 | 5 | shopify-ecommerce |
| brand compliance software | 480 | 14 | brand-compliance |
| multi site management | 210 | 16 | in-house-web-teams |
| ada website compliance | 2,900 | 49 | accessibility-review |
| website accessibility checker | 1,900 | 67 | accessibility-review |
| european accessibility act | 880 | 41 | accessibility-review |
| web accessibility audit | 480 | 37 | accessibility-review |
| wcag compliance checker | 480 | 74 | accessibility-review |
| website launch checklist | 1,600 | 32 | pre-launch-qa |
| website qa testing | 140 | 18 | pre-launch-qa |

Terms with no demand, so do not build pages around them: "white label feedback tool", "white label bug tracker", "landing page feedback", "qa tool for agencies", "website governance tool", "post launch website monitoring".

## 6. Solutions, use cases and personas: the split

Three layers, each with one question:

| Layer | Question | Route | Keep or change |
| --- | --- | --- | --- |
| By agency | Who are you and how do you buy? | `/solutions/<slug>` (kind: agency) | Keep. Add pages 1 to 4 below. |
| By job | What do you need done? | `/solutions/<slug>` (kind: job) | Keep. Add pages 5 and 6. Fold `/use-case` into it. |
| Personas | What is your role? | `/user-persona/<slug>` | Keep roles only. Retire the two company-type personas into By agency. |

Migration map for the old use-case pages:

| Old page | Action |
| --- | --- |
| /use-case/uat-qa-testing | Redirect to /solutions/pre-launch-qa |
| /use-case/bug-reporting and /use-case/reporting-bugs | Two slugs for one page. The listing links to one, the footer to the other. Keep `bug-reporting`, redirect the other. Later redirect both to the Comments feature page. |
| /use-case/client-feedback | Keep until a "Client review and approval" job page exists, then redirect |
| /use-case/conversion-optimization and /use-case/ux-ui-optimization | Merge into one page or retire. Neither has demand. |
| /use-case/design-reviews, marketing-handoffs, stakeholder-reviews | Not live. Do not launch. |
| /user-persona/marketing-agencies | Redirect to a By agency page once one covers marketing agencies |
| /user-persona/product-companies | Redirect to /solutions/in-house-web-teams |

## 7. The next six solutions pages

Pages 2 to 6 use the PR #95 pack template, so each brief below fills the `solutionPage` fields: nav label and descriptor (under 60 characters), SEO, hero (h1 of 8 words or fewer, sub, client line), a pack of exactly eight agents with a sample finding each, build your own, four bullets each for what agents check and what you decide, platforms first, proof, three page FAQs, two related slugs.

Page 1 is not a pack. It is an offer. It uses the `/monitoring` feature template from PR #136: hero, four steps, what you get, the report, pricing, testimonials, trust, integrations, FAQ.

House rules from both PRs apply to every line: one idea per sentence, short, no em or en dashes, no idioms, no dollar figures in resell lines, and none of the banned words the copy check rejects.

### 7.1 White-label agencies

- Route: `/solutions/white-label-agencies`. Kind: agency. Template: feature page (like `/monitoring`).
- Nav label: White-label agencies. Descriptor: Your brand on the toolbar, the portal, the report.
- SEO title: White-label website QA for agencies | Superflow. Description: Put your logo, colors and domain on the review toolbar, the client portal and the monthly report. Clients approve on the page. They never see Superflow.
- Keywords: white label client portal, white label reporting, white label saas, white label platform.

Hero
- Headline lines: "Your brand on every review" / "your client sees"
- Subhead: Your logo, your colors, your domain. Clients approve on the page. The report carries your name.
- Visual: the review toolbar and the client portal with an agency logo (Northwind Studio) and the agency's color on the buttons, on a custom domain in the address bar.

Four steps, then every project carries your brand
1. Upload your logo and colors. One upload. Every project, current and future.
2. Connect your domain. Review links open on your domain, not ours.
3. Add client sites and pick the agents. Findings post under your brand.
4. Send the link and the report. Your client approves on the page.

What you get (four cards)
- Branded toolbar. The toolbar on the client's site carries your logo and colors.
- Branded portal. Contractors and new hires work inside your operation.
- Branded report. The weekly or monthly report has your logo on top and your client's name.
- Your domain. Every review link and every report opens on your domain.

What clients never see
- Superflow's name. Our pricing. An invoice from us.

Resell it (reuse `ResellSection`)
- You set the retail price for reviews and care plans.
- The report, the toolbar and the portal carry your logo, not ours.
- Superflow bills you per site. Your client never sees an invoice from us.

The report (reuse `MaintenanceReportSection` from PR #136)

Pricing
- White label is on the Scale plan. Sites are priced per site. Read the rate from the pricing data so it cannot drift.

FAQ
- Which parts carry my brand? The toolbar on the client's site, the portal your team and contractors use, every review link, and the report.
- Can I use my own domain? Yes. Connect it once. Review links and reports open on it.
- Does my client ever see Superflow? No. Not in the toolbar, the link, the report or the invoice.
- Can contractors use the portal under my brand? Yes. Invite them as members. They see your logo and your colors.
- Does the monthly report carry my logo? Yes. Your logo on top, your client's name, your schedule.
- Which plan includes it? Scale and Enterprise.

Proof needed: one agency quote that mentions reselling or client-facing branding. Wonderist fits if they resell.

Also fix `/white-label` (the feature page): it says custom domains and colors are not included. They are. Change the "Not included" block to "Also included" and list both.

### 7.2 Web design studios

- Route: `/solutions/web-design-studios`. Kind: agency. Template: pack.
- Nav label: Web design studios. Descriptor: Build, review, launch, then a care plan.
- SEO title: QA agents for Webflow, Framer and WordPress studios | Superflow. Description: Agents check the build against the Figma file and the brand guide, on desktop and phone. Your client approves from the staging link. Then the care plan starts.
- Keywords: webflow agency, framer agency, web design agency tools.

Hero
- h1: The build matches the Figma file. Every page.
- Sub: Agents compare each page to Figma and the brand guide, on desktop and phone. Your team decides what to fix. Your client approves from the staging link.
- Client line: Your client taps Approve on the webflow.io staging link from their phone.

Pack: Studio Handoff Pack (`studio-handoff`). Intro: Eight agents for the handoff. They run on every page of the staging site, desktop and phone, and post findings as comments.

| Agent | Checks | Sample finding | Category |
| --- | --- | --- | --- |
| Figma Match | Compares the built page to its Figma frame on desktop and phone. | Hero heading is 48px. Figma has 56px. | brand |
| Breakpoint Check | Finds overlap, clipping and side scroll at tablet and phone widths. | Pricing table scrolls sideways at 375px. | layout-devices |
| Font Guard | Checks every font on the page against the brand guide. | Footer uses Arial. The guide allows Inter only. | brand |
| Interaction Check | Opens menus, accordions and modals and checks hover and focus states. | Mobile menu opens but the close button does nothing. | launch-readiness |
| Staging Links | Finds links, forms and images that still point at staging. | Contact form posts to staging.northwind.dev. | links |
| Noindex Check | Finds pages still blocked from search after launch. | noindex is still set on 14 pages. | seo-social |
| Image Weight | Finds images large enough to slow the page on phone. | Hero image is 4.8 MB. Phone load passes six seconds. | launch-readiness |
| Share Image | Checks the favicon and share image render on every page. | Share image is the Webflow default on 9 pages. | seo-social |

Build your own: "Flag any page where the CTA button text is not 'Book a call'." Agent: CTA Wording. Finding: 6 pages use 'Get started'. The brief says 'Book a call'.

Agents check: The build matches the Figma file. No breakpoint clips or overlaps. Fonts and colors match the guide. No link points at staging.
You decide: Which Figma gaps are on purpose. What ships this round and what waits. When the client sees the staging link. Which findings become change orders.

Platforms first: webflow, framer, wordpress. Proof: wonderist-review. Related: pre-launch-qa, site-care.

FAQ
- Does Figma Match need the Figma file? Yes. Upload the file or paste a share link. The agent compares each page to its frame on desktop and phone.
- Does it work on Webflow and Framer staging domains? Yes. Agents check webflow.io and framer.website links, and pages behind a password.
- Can the client comment on the staging site? Yes. Send one link. They comment and approve on the page with no account.

### 7.3 Shopify and ecommerce agencies

- Route: `/solutions/shopify-ecommerce-agencies`. Kind: agency. Template: pack.
- Nav label: Shopify and ecommerce. Descriptor: Every product, price and checkout path checked.
- SEO title: QA agents for Shopify and ecommerce agencies | Superflow. Description: Agents check add to cart, prices, stock labels, tracking and checkout on every product page, desktop and phone, after every theme push. The merchant approves from a link.
- Keywords: ecommerce website testing, ecommerce qa testing, shopify qa.

Hero
- h1: Every add to cart adds the right thing.
- Sub: Agents check products, prices, stock labels and checkout on every page, desktop and phone. Your team decides what to fix. The merchant approves from a link.
- Client line: The merchant taps Approve on the fixes from their phone, before the campaign goes live.

Pack: Store Check Pack (`store-check`). Intro: Eight agents for the store. They run on every product and collection page after every theme push and post findings as comments.

| Agent | Checks | Sample finding | Category |
| --- | --- | --- | --- |
| Add to Cart | Checks every add to cart button adds the right product and variant. | 'Add to cart' on /products/oak-table adds the walnut variant. | launch-readiness |
| Checkout Path | Walks product to checkout on desktop and phone. | Checkout button sits under the cookie banner on phone. | layout-devices |
| Price Match | Checks prices on collection pages match the product page. | Oak Table is 899 on the collection page and 949 on its own page. | copy |
| Image Inspector | Finds missing, stretched or broken product images. | 12 products in /collections/sale have no image. | layout-devices |
| Stock Labels | Finds 'In stock' badges on sold-out products. | 4 sold-out products still show 'In stock'. | copy |
| Offer Expiry | Finds promos and discount codes with a past end date. | Banner says 'Free shipping ends Sept 30.' Today is Oct 21. | copy |
| Tracking Check | Confirms analytics, pixel and tag manager fire through checkout. | Meta pixel fires on product pages but not on the thank-you page. | launch-readiness |
| Policy Links | Checks shipping, returns and privacy links work from every page. | Footer 'Returns' link returns 404. | links |

Build your own: "Flag any product page with fewer than three photos." Agent: Photo Count. Finding: 28 products have one photo. The brief asks for three.

Agents check: Every add to cart adds the right variant. Prices match across every page. No sold-out product says in stock. Tracking fires through checkout.
You decide: Which findings go to the merchant. What waits for the next theme push. When a change needs the merchant's sign-off. What to charge for store checks each month.

Platforms first: shopify, wordpress, webflow. Proof: wonderist-review until an ecommerce quote lands, then that quote. Related: site-care, pre-launch-qa.

FAQ
- Does it check stores behind a password? Yes. Agents check password-protected stores and unpublished themes.
- Does it work on WooCommerce and BigCommerce? Yes. Agents check the live store from the outside. One-click install exists for Shopify and WordPress.
- Can agents run after every theme push? Yes. Fire a webhook on publish. The agents rerun on the pages that changed.

Proof needed: one ecommerce or Shopify customer quote. Until then this page sits fourth.

### 7.4 In-house web and brand teams

- Route: `/solutions/in-house-web-teams`. Kind: agency (the By agency column reads as company type). Template: pack.
- Nav label: In-house web teams. Descriptor: Every edit by every team, checked against the brand.
- SEO title: QA agents for in-house web and brand teams | Superflow. Description: Fifty editors publish every day. Agents check every change against the brand guide, the legal lines and WCAG. Each team sees its own findings. SSO and SCIM on Enterprise.
- Keywords: brand compliance software, multi site management, website governance.

Hero
- h1: Fifty editors. One brand. Every page checked.
- Sub: Agents check every change against the brand guide, the legal lines and WCAG. Your team decides what to fix. Each team sees its own findings.
- Client line: The brand lead taps Approve on the fixes before the campaign goes live.

Pack: Brand Site Pack (`brand-site`). Intro: Eight agents for a site many teams edit. They run on every change and post findings as comments to the team that owns the page.

| Agent | Checks | Sample finding | Category |
| --- | --- | --- | --- |
| Palette Guard | Checks every color on the page against the brand guide. | Careers page button uses #2F80ED. The guide allows #1E5BB8. | brand |
| Font Guard | Checks every font on the page against the brand guide. | Press page body text is Georgia. The guide allows Inter only. | brand |
| Tone Check | Reads copy against the voice guide: banned words, claims, tone. | Press page uses 'best-in-class'. The voice guide bans it. | copy |
| Legal Lines | Checks required disclaimers and trademark lines on every page. | Pricing page is missing the 'prices vary by region' line. | compliance |
| Broken Links | Follows every link on every page and flags the ones that fail. | 23 links under /resources return 404. | links |
| Meta Titles | Checks every page has a unique, specific title. | Six pages share the title 'Home'. | seo-social |
| Accessibility | Checks contrast, alt text, headings and form labels. | 41 images under /blog have no alt text. | accessibility |
| Consistency Checker | Finds spacing and components drifting across pages. | Three different card styles across /resources. | layout-devices |

Build your own: "Flag any page that still shows the old logo." Agent: Logo Check. Finding: The old logo appears on 11 pages, all under /blog.

Agents check: Every page uses the brand's colors and fonts. Every page carries the legal lines. No link is broken. Copy matches the voice guide.
You decide: Which teams own which findings. Which exceptions the brand allows. What gets fixed before the campaign. When a page needs a redesign, not a fix.

Platforms first: wordpress, hubspot, webflow. Proof: the validator forces agency pages onto the Wonderist quote. Add an "in-house" proof option, or use metrics-only until an in-house quote lands. Related: brand-compliance, accessibility-review.

FAQ
- Can different teams get different findings? Yes. Assign findings by section or by page. Each team sees its own.
- Does it work behind SSO? Yes. Agents check pages behind Okta and other SSO. Your team signs in with SSO on Enterprise.
- Can we keep data in our region? Yes. Enterprise plans offer data residency options.

### 7.5 Accessibility review

- Route: `/solutions/accessibility-review`. Kind: job. Template: pack.
- Nav label: Accessibility review. Descriptor: WCAG checks on every page, in plain words.
- SEO title: Accessibility checks on every page, to WCAG A, AA or AAA | Superflow. Description: Agents check contrast, alt text, headings, labels, focus and captions on every page and every change. Findings read in plain words. You pick the WCAG level per site.
- Keywords: ada website compliance, website accessibility checker, european accessibility act, web accessibility audit, wcag compliance checker, accessibility testing tools.

Hero
- h1: Every page checked to WCAG, in plain words.
- Sub: Agents check contrast, alt text, headings, labels, focus and captions on every change. Your team decides which level to hold and what to fix first.
- Client line: Your client sees the findings in plain words and taps Approve on the fixes.

Pack: Accessibility Pack (`accessibility`). Intro: Eight agents for WCAG. They run on every page, desktop and phone, on every change, and post findings as comments.

| Agent | Checks | Sample finding | Category |
| --- | --- | --- | --- |
| Contrast | Checks text contrast meets the level you set. | Body text is 3.1:1 against the background. AA needs 4.5:1. | accessibility |
| Alt Text | Finds images with no alt text or the file name as alt. | 41 images have no alt text. 12 use the file name. | accessibility |
| Heading Order | Checks each page has one H1 and headings nest in order. | /about has three H1s and skips from H2 to H4. | accessibility |
| Form Labels | Checks every input has a label a screen reader can read. | Newsletter email field has no label. | accessibility |
| Focus Order | Checks keyboard focus is visible and reaches every control in order. | Focus skips the main menu. Keyboard users cannot open it. | accessibility |
| Link Text | Finds 'click here', 'learn more' and empty links. | 19 links read 'Learn more'. Screen readers hear nothing else. | accessibility |
| Media Captions | Checks video has captions and audio has a transcript. | Homepage video has no captions. | accessibility |
| Tap Targets | Checks tap targets on phone are big enough. | 14 footer links are 28px tall. The minimum is 44px. | layout-devices |

Build your own: "Flag any PDF linked from the site that has no text layer." Agent: PDF Access. Finding: 7 linked PDFs are scans with no text layer.

Agents check: Contrast meets the level on every page. Every image has alt text. Every form field has a label. Keyboard focus reaches every control.
You decide: Which level to hold the site to: A, AA or AAA. Which findings are design and which are code. What to fix before the audit. What to tell the client about risk.

Platforms first: wordpress, webflow, shopify. Proof: headway. Related: in-house-web-teams, site-care.

FAQ
- Is this a WCAG audit? No. Agents check what a machine can check and report it in plain words. A human audit covers the rest.
- Which WCAG level? You pick A, AA or AAA per site. Most clients ask for AA.
- Does it cover the European Accessibility Act? Agents check the WCAG criteria the Act relies on. The legal call stays with you and your client.

Do not claim compliance or certification anywhere on the page. The Trust section already says WCAG 2.1 AA on client-facing surfaces; keep that claim there.

### 7.6 Brand compliance

- Route: `/solutions/brand-compliance`. Kind: job. Template: pack.
- Nav label: Brand compliance. Descriptor: Your brand guide, checked on every page.
- SEO title: Brand compliance checks on every page | Superflow. Description: Upload the brand guide. Agents check colors, fonts, logos, product names, tone and legal lines on every page and every change. Your team decides which exceptions stand.
- Keywords: brand compliance software, brand consistency.

Hero
- h1: Your brand guide, run on every page.
- Sub: Upload the guide. Agents check colors, fonts, logos, names, tone and legal lines on every change. Your team decides which exceptions stand.
- Client line: The brand owner taps Approve on each exception from their phone.

Pack: Brand Pack (`brand`). Intro: Eight agents built from the brand guide. They run on every page and every uploaded asset and post findings as comments.

| Agent | Checks | Sample finding | Category |
| --- | --- | --- | --- |
| Palette Guard | Checks every color on the page against the brand guide. | Primary button uses #2F80ED. The guide allows #1E5BB8. | brand |
| Font Guard | Checks every font on the page against the brand guide. | Footer uses Arial. The guide allows Inter only. | brand |
| Logo Use | Checks logo version, clear space and minimum size. | Footer logo is 18px wide. The guide sets 32px minimum. | brand |
| Tone Check | Reads copy against the voice guide: banned words, claims, tone. | Press page uses 'best-in-class'. The voice guide bans it. | copy |
| Term Check | Checks product names, capitalization and trademarks. | 'Superflow' is written 'SuperFlow' on 6 pages. | copy |
| Legal Lines | Checks required disclaimers and trademark lines on every page. | Pricing page is missing the 'prices vary by region' line. | compliance |
| Image Style | Finds stock photos, watermarks and off-brand imagery. | /careers uses a stock photo with a visible watermark. | brand |
| Consistency Checker | Finds spacing and components drifting across pages. | Three different card styles across /resources. | layout-devices |

Build your own: "Flag any page that mentions a competitor by name." Agent: Competitor Mentions. Finding: 3 blog posts name a competitor without the comparison disclaimer.

Agents check: Colors, fonts and logos match the guide. Product names are spelled the guide's way. Every page carries the legal lines. No stock or watermarked image slipped in.
You decide: Which exceptions the brand allows. Which findings go to the client. When the guide, not the page, is wrong. What to fix before the campaign.

Platforms first: wordpress, hubspot, webflow. Proof: harvey. Related: in-house-web-teams, site-care.

FAQ
- What does the agent read the brand from? Upload the brand guide as a PDF, or paste the rules. Superflow builds the agents from it.
- Can one workspace hold many brands? Yes. Each client project keeps its own guide and its own agents.
- Does it check PDFs, images and video too? Yes. Upload the asset and the same agents review it.

## 8. Changes to pages already written

### site-care (PR #95): make it the care-plan page

This is the always-on monitoring page agencies asked for at the conference. It already has the resell section. Three changes:

- Say "care plan" and "maintenance" on the page. The h1 and SEO title should carry "care plan". The search demand in section 5 is for those words, not for "site care".
- Lead the resell section with the branded report. The report goes to the client on the schedule with the agency's logo on top. That is the line that sells a retainer. Add the custom domain to the resell lines now that it ships.
- Link to `/monitoring` from the hero and the FAQ. The feature page explains schedules, scores and the report. The solutions page sells the retainer.

### /white-label (feature page)

Replace the "Not included: custom domains, colors" block. Both ship. List them as included and show the domain in the hero visual.

### Navigation

PR #95 adds the Solutions menu to `SiteNav`. PR #136 renames the Website Monitoring entry to Monitoring and points it at `/monitoring`. Both touch `SiteNav.tsx` and `SiteFooter.tsx`. Merge #136 first (smaller), then rebase #95 onto it.

### Agent names

See section 2. Pick one catalog. If the 13-agent list in PR #136 wins, map each pack agent to it: Broken Links to Link Checker, Palette Guard and Font Guard to Consistency Checker, Mobile Overflow to Mobile Inspector, Contrast to Accessibility, Meta Titles to AI Visibility, Lorem Ipsum to Proofreader. Packs can still name a narrower check under the agent that runs it.

## 9. Before a page ships

- The pack exists in the app under the same slug and agent names (`HANDOFF-app.md` section 4). Record the date there.
- The seed JSON passes `scripts/solutions-import/validate.mjs` and `scripts/check-copy-rules.mjs`.
- Every sample finding is one the app would really post. No made-up precision.
- The proof quote is real and approved by the customer.
- The page has an OG image in `scripts/og-image/solutions.json`.
- The index, nav and footer pick the page up from the seed or the CMS without a code change.

Open items
- Ecommerce quote: sales said they can get one. Page 3 waits for it.
- In-house quote: none yet. Page 4 uses metrics-only proof until one lands.
- Real estate marketing: on the homepage cards and the batch 2 list, but no evidence either way. Batch 3 unless sales has pipeline.
- Freelancers and studios: on the homepage cards. Covered by the free plan and page 2. No page needed.

## 10. Sources

- BugHerd nav and agency pages: https://bugherd.com/, https://bugherd.com/company-type/web-development-agencies, https://bugherd.com/use-case/new-website-build, https://bugherd.com/use-case/ecommerce
- Marker nav, agency, ecommerce and monitoring pages: https://marker.io/, https://marker.io/agency, https://marker.io/ecommerce, https://marker.io/website-monitoring
- Spur: https://spurtest.com/
- Superflow live pages: https://usesuperflow.ai/, https://usesuperflow.ai/pricing, https://usesuperflow.ai/white-label, https://usesuperflow.ai/website-monitoring, https://usesuperflow.ai/ai-review-agents, https://usesuperflow.ai/llms.txt
- Semrush: organic pages and keyword overview reports, US database, 21 Oct 2026
- PR #95: https://github.com/velt-js/superflow-marketing-pages/pull/95
- PR #136: https://github.com/velt-js/superflow-marketing-pages/pull/136
