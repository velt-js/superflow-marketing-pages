# Handoff to the app team: solutions packs

Owner: Rakesh. Date: Sept 3, 2026. Source: the solutions pages spec, section 6.

The marketing site now has six solutions pages, each selling one pack of eight agents. A page must not ship until its pack exists in the app under the same name. This document lists what the app needs, and where to record the date each pack went live.

## 1. Saved agent groups

Create one saved agent group per pack. The group slug, name, agent names and one-line descriptions must match the site exactly (the site reads them from the Sanity `solutionPage` documents, seeded from `content/solutions/*.json` in this repo).

| Pack slug | Pack name | Site page |
| --- | --- | --- |
| `dental-launch` | Dental Launch Pack | /solutions/dental-marketing-agencies |
| `healthcare-content` | Healthcare Content Pack | /solutions/healthcare-marketing |
| `local-service` | Local Service Pack | /solutions/home-services-marketing |
| `launch` | Launch Pack | /solutions/pre-launch-qa |
| `site-care` | Site Care Pack | /solutions/site-care |
| `migration` | Migration Pack | /solutions/website-migration-qa |

## 2. Signup preselect

Every pack CTA on the site links to `https://app.usesuperflow.com/signup?pack=<pack slug>`. Signup should accept the `pack` query parameter, carry it through the flow, and preselect that saved group at the "Create Project" step of onboarding. Unknown or missing values fall back to the default group.

Related: the home page hero now lists five agents as the ones that "will run" on a pasted URL: Noindex Check, Broken Links, Palette Guard, Mobile Overflow, Claims Check. These should match the in-app default agent set so the demo matches what a new customer sees on day one. Confirm before the home page change ships.

## 3. Agents per pack

Every agent in the app is built from a plain-language check. For each agent below: the name, the one-line description shown on the site, and the check text to paste into the app. The check text is written so the finding comes out in the site's format: what is wrong, where, and why it matters, in plain words, two lines at most.

Findings should read like the examples on the site. Good: "noindex is still set on 14 pages. Google can't see the site." Bad: "Potential SEO configuration issue detected."

### Dental Launch Pack (`dental-launch`)

1. **Booking Link Check**. Checks every 'Book now' and 'Schedule' button resolves to the practice's scheduler.
   Check: Find every button or link whose text is about booking or scheduling. Open each one. If it does not land on the practice's scheduler, or it returns an error, flag it with the page, the button text, and what it opened instead.
2. **Location Consistency**. Checks name, address, phone, and hours match across every location page and the footer.
   Check: Collect the practice name, address, phone, and hours from every location page, the footer, and the Google listing if one was provided. If any two disagree, flag it with both places and the two values.
3. **Offer Expiry**. Finds new-patient specials and promos with a past date.
   Check: Find any special, promo, or discount that shows an end date. If the date is in the past, flag it with the page, the offer text, and the date.
4. **Claims Check**. Flags wording dental boards act on: guarantees, 'painless', 'best', specialty claims without board certification.
   Check: Find wording a state dental board acts on: guarantees, 'painless', 'best', 'top', or a specialty claim with no board certification shown on the page. Flag the page, the exact phrase, and suggest a plainer replacement.
5. **Consent Notes**. Checks before-and-after galleries carry a consent statement.
   Check: Find every before-and-after or patient photo gallery. If the page has no consent statement near it, flag the page and the number of photos.
6. **Secure Forms**. Flags forms collecting health details that aren't on a HIPAA-covered form provider.
   Check: Find every form that asks for health details, symptoms, or insurance. If it posts to a form provider that is not covered by a BAA, flag the page, the form name, and the provider it posts to.
7. **Noindex Check**. Finds pages still blocked from search after launch.
   Check: Find every page with a noindex meta tag or noindex header. Flag the count and list the pages.
8. **Mobile Overflow**. Checks nothing wraps, clips or pushes the CTA down on phone.
   Check: On a 375px wide screen, find any element that is cut off, wraps badly, or pushes the main CTA out of the first screen. Flag the page, the element, and what happens.

Build your own example: **New Patient Banner**. Check: Check that every page's header shows the text 'Now accepting new patients'. Flag each page where it is missing.

### Healthcare Content Pack (`healthcare-content`)

1. **Claims Check**. Flags cure, guarantee, and outcome claims a regulator would act on.
   Check: Find claims that a treatment cures, guarantees, or reverses a condition, and any outcome claim with no evidence link. Flag the page, the phrase, and a plainer replacement. Note when the outcomes disclaimer is missing from that page.
2. **Credential Match**. Checks provider titles and certifications on bios match the source roster.
   Check: Compare each provider's title and certifications on the site with the roster the user uploaded. If they differ, flag the provider, the page, and both values.
3. **Disclaimer Present**. Checks every treatment page carries the results disclaimer.
   Check: Find every treatment page. If it has no 'results vary' or equivalent disclaimer, flag the page and name one page that does have it.
4. **Secure Forms**. Flags forms collecting health details that aren't on a HIPAA-covered form provider.
   Check: Same as the Dental Launch Pack.
5. **HIPAA Notice Link**. Checks the Notice of Privacy Practices link works on every page.
   Check: Find the Notice of Privacy Practices link on every page. If it is missing or returns an error, flag the page and the status code.
6. **Consent Notes**. Checks before-and-after galleries carry a consent statement.
   Check: Same as the Dental Launch Pack.
7. **Contact Consistency**. Checks phone, address and hours match across every page.
   Check: Collect the phone, address, and hours from every page. If any two disagree, flag both places and the two values.
8. **Contrast**. Checks text contrast meets WCAG AA.
   Check: Measure text contrast against its background on every page. If it is below 4.5:1 for body text or 3:1 for large text, flag the element, the ratio measured, and the ratio required.

Build your own example: **Label Links**. Check: Find every mention of a medication by brand or generic name. If the page has no link to that drug's FDA label, flag the page, the drug, and how many times it appears.

### Local Service Pack (`local-service`)

1. **City Page Consistency**. Checks each city page's body, title, and meta name the same city.
   Check: On each service area page, read the city named in the URL, the title, the meta description, the headings, and the body. If any of them names a different city, flag the page, the paragraph, and the wrong city.
2. **License Display**. Checks the license number appears where the state requires it.
   Check: Find the license number and the pages the state requires it on (the homepage and each service page unless the user says otherwise). Flag each page where it is missing and name the state rule when known.
3. **Tracking Number Match**. Checks call-tracking numbers per page match the assigned map.
   Check: Compare the phone number on each page with the tracking number map the user uploaded. If a page shows a number assigned to a different source, flag the page, the number shown, and the number expected.
4. **Emergency CTA**. Checks every emergency button on phone dials the number.
   Check: Find every emergency or 24/7 button. On phone, if it is not a tel: link, flag the page and the button text.
5. **Review Count Freshness**. Checks review counts on the site match the live Google listing.
   Check: Find every review count or star rating in the copy. Compare it with the Google listing if one was provided. If they differ, flag the page, the count on the site, and the live count.
6. **Financing Disclosure**. Checks every financing offer links to its terms.
   Check: Find every financing or 0% offer. If it has no link to terms on the same page, flag the page and the offer text, and count the pages affected.
7. **Broken Links**. Follows every link on every page and flags the ones that fail.
   Check: Follow every link on every page. Flag each one that returns an error or a 404, with the page and the link text.
8. **Tap Targets**. Checks tap targets on phone are big enough.
   Check: On phone, measure every link and button. If one is under 44px tall, flag the element, its size, and the minimum.

Build your own example: **Estimate CTA**. Check: On phone, check every service page has a 'Get a free estimate' button in the first screen. If the first CTA is below the fold, flag the page and how far down it sits.

### Launch Pack (`launch`)

1. **Noindex Check**. Finds pages still blocked from search after launch.
   Check: Same as the Dental Launch Pack.
2. **Staging Links**. Finds links pointing at staging or preview URLs.
   Check: Find every link, form action, and image URL that points at a staging, preview, or localhost domain. Flag the page, the element, and the URL.
3. **Tracking Check**. Confirms analytics and tag manager fire on every page.
   Check: Load every page and confirm the analytics tag and the tag manager fire. Flag each page where one does not, and say which one is missing and what stops counting.
4. **Broken Links**. Follows every link on every page and flags the ones that fail.
   Check: Same as the Local Service Pack.
5. **Lorem Ipsum**. Finds placeholder text left in the copy.
   Check: Find placeholder text such as 'lorem ipsum' or 'insert text here'. Flag the page and the paragraph.
6. **Placeholder Images**. Finds stock placeholders and empty image slots.
   Check: Find stock placeholder images, theme default images, and empty image slots. Flag the page and how many of its images are placeholders.
7. **OG Image**. Checks every page has a share image that renders.
   Check: Read the share image meta tag on every page. If it is missing, broken, or renders blank, flag the page.
8. **Mobile Overflow**. Checks nothing wraps, clips or pushes the CTA down on phone.
   Check: Same as the Dental Launch Pack.

Build your own example: **Favicon Check**. Check: Read the site favicon. If it is the platform default or missing, flag it and name the platform.

### Site Care Pack (`site-care`)

1. **Broken Links**. Follows every link on every page and flags the ones that fail.
   Check: Same as the Local Service Pack.
2. **Stale Dates**. Finds years, dates and copyright lines that are out of date.
   Check: Find years, dates, and copyright lines. If any is in the past when it should be current, flag the page and the text.
3. **Offer Expiry**. Finds any special, promo, or discount with a past end date.
   Check: Find any special, promo, or discount that shows an end date. If the date is in the past, flag it with the page, the offer text, and the date.
4. **Form Health**. Checks each form submits and reaches a thank-you state.
   Check: Submit a test entry on every form. If it does not reach a thank-you page or confirmation state, flag the page and the form.
5. **Tracking Check**. Confirms analytics and tag manager fire on every page.
   Check: Same as the Launch Pack.
6. **Palette Guard**. Checks every color on the page against the brand guide.
   Check: Compare every color used on the page with the brand guide the user uploaded. Flag each element using a color outside the guide, with the color used and the nearest allowed color.
7. **Meta Titles**. Checks every page has a unique, specific title.
   Check: Read the title of every page. If two or more pages share a title, or a title is generic like 'Home', flag the pages and the title.
8. **Contrast**. Checks text contrast meets WCAG AA.
   Check: Same as the Healthcare Content Pack.

Build your own example: **Stale Pages**. Check: Find pages that have not changed in 12 months, using last-modified dates and sitemap data. Flag the count and list them.

### Migration Pack (`migration`)

1. **Redirect Map**. Checks each old URL 301s to its mapped new URL.
   Check: For each old URL in the list the user uploaded, request it and follow redirects. If it does not end with a 301 at its mapped new URL, flag it. Summarize the count and attach the list of misses.
2. **Redirect Chains**. Finds URLs that hop through more than one redirect.
   Check: For each redirect, count the hops. If any URL redirects more than once before landing, flag the URL and the hop count.
3. **Missing Pages**. Finds old pages with no equivalent on the new site.
   Check: For each old URL with no mapped new URL, look for an equivalent page on the new site by title and content. If none exists, flag the old URL.
4. **Meta Preserved**. Compares titles and descriptions on the new site with the old ones.
   Check: Compare the title and meta description of each new page with its old version. If the title changed and the old target keyword is gone, flag the page and both titles. Summarize the counts.
5. **Alt Text**. Finds images with no alt text.
   Check: Find images with no alt text on the new site. Flag the count, and note when the old version of the page had alt text.
6. **Internal Links to Old Domain**. Finds internal links that still point at the old domain.
   Check: Find internal links that still point at the old domain. Flag the count and list the pages.
7. **Canonical Check**. Checks every canonical tag points at the new domain.
   Check: Read the canonical tag on every page. If it points at the old domain or the wrong URL, flag the page and the canonical value.
8. **Heading Order**. Checks each page has one H1 and headings nest in order.
   Check: Check each page has exactly one H1 and that headings nest in order. Flag the page and the heading that is out of order.

Build your own example: **Slug Match**. Check: For each old blog post, check the same slug exists under /blog/ on the new site. If it moved or is missing, flag the old and new URLs.

## 4. Go-live record

Do not ship a solutions page until its pack exists in the app under the same name. Confirm each slug with the app team and record the date here.

| Pack slug | Confirmed by | Date live in app | Page shipped |
| --- | --- | --- | --- |
| `dental-launch` | | | |
| `healthcare-content` | | | |
| `local-service` | | | |
| `launch` | | | |
| `site-care` | | | |
| `migration` | | | |

Batch 2 packs (build the groups when the pages are written): Webflow studios, Shopify agencies, real estate marketing, brand compliance, accessibility review.
