# Consent audit — usesuperflow.ai (before)

Phase 1 of the consent-gating spec. **No site code has changed.** The only additions are this report and the audit script in `scripts/consent-audit/`.

- Audited: production `https://usesuperflow.ai`, 2026-09-25, from a US (Ohio) IP.
- Stack: Next.js 16 (App Router) + Sanity, on Vercel. `/docs` is Mintlify, reverse-proxied from `superflow.mintlify.dev` (see `next.config.ts`).
- Consent vendor: **Termly**, website `2bc67d1d-a9a0-4aab-8562-dcd9c354bff2`.
- GTM container: **`GTM-M6Q8QPG`** (live version 76, 32 tags). GTM tags are configured in GTM, not in this repo. We read the published container JS (`gtm.js?id=GTM-M6Q8QPG`) to list them. Tag names aren't published in that file, so each tag below is identified by its ID in the GTM UI (`…/tags/<id>`).
- Raw evidence: `scripts/consent-audit/results/audit-usesuperflow.ai.json`. Re-run with `node scripts/consent-audit/audit.mjs`, or set `CONSENT_BASE_URL=<preview url>` to audit a preview.

## Bottom line

Every page does all of the following before the visitor clicks anything:

- loads **13 non-essential tools**
- contacts **23 third-party hosts**
- sets **24 cookies**, including Meta, LinkedIn and X advertising cookies
- starts **both visitor deanonymizers** (RB2B and Claydar)
- starts an **Amplitude session-replay recording**

Clicking **Decline** changes nothing on the next page. Turning on **GPC** changes nothing. The Termly banner is decoration: it loads last, it runs with blocking turned off (`autoBlock=off`), and nothing on the site reads the choice it records.

## What fires before consent

"Fires" means a script or beacon request was observed in a fresh browser with no clicks, after network idle plus 5 seconds. Pages checked: `/`, `/pricing`, `/blog/bugherd-alternatives-comparison`, `/video-review`, `/use-case/client-feedback` (this site has no `/solutions`; use cases are the equivalent), `/tools`, `/tools/utm-builder`, `/directory`, `/book-demo`, `/state-of-agency-tools`, `/docs`.

The Category column is the category each tool **should** have under the agreed model (Necessary / Analytics / Marketing).

| Tool | Where it loads from | Category | Fires before consent? | Sets cookies before consent? |
|---|---|---|---|---|
| Termly (consent banner) | `components/scripts/ThirdPartyScripts.tsx` — `next/script` afterInteractive, rendered **last**, `?autoBlock=off` | Necessary | Yes (expected) | `csrf_token` (1P); localStorage `TERMLY_API_CACHE` |
| **RB2B** (visitor deanonymizer) | `ThirdPartyScripts.tsx` — native inline `<script>`, runs during HTML parse, before hydration and before Termly | Marketing | **Yes, every page** — loads `ddwl4m2hdecbv.cloudfront.net/b/Q6J2RH2WVE6D/…` | Writes a `__test__` probe cookie and localStorage `test`. It sent no identify beacon within 5 s from our IP; it may be IP- or time-gated |
| **Claydar / Clay web intent** (visitor deanonymizer) | `ThirdPartyScripts.tsx` — native `<script defer>`, before hydration and before Termly | Marketing | **Yes, every page** — `static.claydar.com`, `cdn.claydar.com`, POST `api.claydar.com/tracker/event` | sessionStorage `claydar_device_id`, `claydar_session`, `radar_sn_*` (7 keys) |
| **Amplitude** (analytics, autocapture, heatmaps, **session replay**) | `instrumentation-client.ts` → `lib/analytics/amplitude-client.ts`. It runs before React hydration, outside the consent tool entirely. Events go to `cdn.velt.dev/am`, replays to `cdn.velt.dev/am-sr-t` (a proxy), and config comes from `sr-client-cfg.amplitude.com` | Analytics | **Yes, every page** — replay chunks (`type=replay`) are uploaded | `AMP_4b7ef064c6`, `AMP_MKTG_4b7ef064c6` (1P, 1 year); localStorage `AMP_*`, sessionStorage `AMP_URL_INFO` |
| Google Analytics 4 — `G-HFXRYF6WF8` | `ThirdPartyScripts.tsx` — hardcoded gtag.js, `config` called before any consent default exists | Analytics | **Yes, every page.** Usually a cookieless ping (`gcs=G100`). Intermittently it fires with **no consent state at all** (`gcd=13l3l3l3l1l1`) — see failure 3 | Usually no. **In 1 of 13 audited loads**, `_ga` and `_ga_HFXRYF6WF8` were set |
| Google Analytics 4 — `G-NKFPRQTBQY` (a **second** property) | GTM tag 63 (Google tag, fires on `gtm.init`) | Analytics | **Yes, every page** — same behaviour as above | Same race: `_ga_NKFPRQTBQY` was set in the same run |
| Google Ads — `AW-11181152032` (gtag config, remarketing tag, conversion linker) | `ThirdPartyScripts.tsx` gtag `config` + GTM tag 11 (Remarketing) + tag 7 (Conversion Linker), on every page | Marketing | **Yes, every page** — `pagead2.googlesyndication.com/ccm/collect`, plus `googleads.g.doubleclick.net`, `ad.doubleclick.net` and `www.google.com/ccm` when the race hits | Usually no. When the race hits: `_gcl_au` (1P) and `test_cookie` (doubleclick.net) |
| **Meta pixel** `825109945989286` | GTM tag 16 (Custom HTML), fires on every page | Marketing | **Yes, every page** — `fbevents.js`, `facebook.com/tr` PageView | `_fbp` (1P, 90 days), `fr` (facebook.com); localStorage `lastExternalReferrer*` |
| **LinkedIn Insight** partner `4956052` | GTM tag 32 (community template), fires on every page | Marketing | **Yes, every page** — `snap.licdn.com`, `px.ads.linkedin.com` | `bcookie`, `bscookie`, `lidc`, `li_sugr`, `UserMatchHistory`, `AnalyticsSyncHistory` (linkedin.com); localStorage `li_adsId` |
| **X (Twitter) pixel** `of55h` | GTM tag 28 (community template), fires on every page | Marketing | **Yes, every page** — `static.ads-twitter.com/uwt.js`, `t.co`, `analytics.twitter.com` | `_twpid`, `_twsid` (1P, 13 months); `guest_id`, `guest_id_ads`, `guest_id_marketing`, `personalization_id` (twitter.com), `muc_ads` (t.co) |
| Rewardful (affiliate attribution) | `ThirdPartyScripts.tsx` — `next/script`, every page | Marketing | **Yes, every page** — `r.wdfl.co/rw.js` | None seen without a `?via=` referral link (it sets `rewardful.referral` when there is one) |
| **Intercom** (chat) | `ThirdPartyScripts.tsx` — full widget loads on `window.load` on every page, even though only the custom `IntercomButton` opens it | Chat (load on click) | **Yes, every page** — `widget.intercom.io`, `js.intercomcdn.com`, `api-iam.intercom.io` pings | `intercom-id-gkjq60px`, `intercom-device-id-gkjq60px` (1P, 9 months), `intercom-session-gkjq60px`; localStorage `intercom.intercom-state-*` |
| Superflow toolbar (our own product, dogfooding) | `ThirdPartyScripts.tsx` — `cdn.velt.dev/lib/superflow.js`, every page | **Decision needed** | Yes, every page. It also pulls `fonts.googleapis.com` (Google Fonts) | localStorage `sfToolbarVersion` |
| **Calendly** embed | `components/book-demo-2026/CalendlyEmbed.tsx` — inline iframe + `widget.js` on `/book-demo` | Embed (click-to-load) | **Yes, on `/book-demo`.** The iframe itself pulls in Stripe, **Segment**, **Sprig**, **Braze (appboy)**, reCAPTCHA and Airbrake | `__cf_bm`, `_cfuvid` (calendly.com), `m` (m.stripe.com) |
| Tally embed | `components/agency-survey-2026/TallyEmbed.tsx` — iframe + `embed.js` on `/state-of-agency-tools` | Embed (click-to-load) | **Yes, on that page.** It also loads Google Fonts and **Sentry** inside the iframe | None seen |
| Google Tag Manager `GTM-M6Q8QPG` | `ThirdPartyScripts.tsx` — `next/script` afterInteractive; `<noscript>` iframe in `app/layout.tsx` | Loader for Analytics + Marketing | Yes, every page (it is the loader for the Meta, LinkedIn, X and Ads tags above) | Via its tags, above |
| Mintlify docs (`/docs`) | Reverse proxy in `next.config.ts` | Necessary | **No trackers observed** — only `mintcdn.com` and Mintlify's icon CDN. No Termly banner either | None |

**Not found:**

- **Reddit pixel**: not in this repo, not in any active tag of the published GTM container, and no Reddit request on any page. The container does have **4 paused tags** (IDs 45, 75 and 82 are Custom HTML; 60 is a custom template). One of those may be the Reddit pixel. Paused tag bodies aren't published, so this needs checking in the GTM UI.
- Hotjar, Clarity, FullStory, PostHog, Segment and Koala: not on the marketing site. Segment appears only inside the Calendly iframe. Termly's cookie scan does list PostHog and Velt keys, but those come from the old `usesuperflow.com` domain (the logged-in app).
- YouTube, Vimeo, Loom and Wistia embeds: none. YouTube appears only as outbound links, and videos are self-hosted `<video>`.

## GTM container `GTM-M6Q8QPG` — tags as published (v76)

**No tag in the container has a consent requirement.** The non-Google tags (Meta, LinkedIn, X) ignore Consent Mode completely, so they fire even with every Consent Mode signal set to denied.

| GTM tag ID | What it is | Trigger | Consent setting |
|---|---|---|---|
| 7 | Conversion Linker (cross-domain to `usesuperflow.com`) | All pages (`gtm.js`) | Built-in only |
| 11 | Google Ads Remarketing `AW-11181152032` | All pages | Built-in only |
| 16 | Meta pixel base (Custom HTML, `825109945989286`) | All pages | **None** |
| 28 | X pixel base `of55h` | All pages | **None** |
| 32 | LinkedIn Insight `4956052` | All pages | **None** |
| 63 | GA4 config `G-NKFPRQTBQY` | `gtm.init` | Built-in only |
| 50 / 74 / 78 | Google Ads conversions (link clicks "Live Demo" / "Schedule a Call" / "Book Demo") | Outbound link clicks | Built-in only |
| 25, 26, 42 | Meta `Free_Signup` / `Install_Success` / `Purchase` | App events (`workspaceCreated` / `accountActivated` / `upgraded`) | **None** |
| 29, 30 | X events `of55n`, `of55r` | App events | **None** |
| 34, 35, 43 | LinkedIn conversions | App events | **None** |
| 64, 65, 66 | GA4 events `sign_up`, `install_sucess`, `purchase` | App events | Built-in only |
| 40 | Google Ads conversion (purchase) | App event `upgraded` | Built-in only |
| 13, 23, 45, 60, 75, 82 | **Paused** (2 Ads conversions, 3 Custom HTML, 1 custom template) | — | — |

⚠️ **This container is shared with the logged-in app.** The `accountActivated`, `workspaceCreated` and `upgraded` events come from the portal, so consent settings changed here affect the app too.

## What's wrong with the current setup

1. **Termly doesn't block anything.** It loads with `autoBlock=off`, and nothing in the code reads its consent state. Every tag above ignores the choice.
2. **Scripts are hardcoded outside the consent tool.**
   - RB2B and Claydar are native tags placed so they run before anything else. That is deliberate — the comment in `ThirdPartyScripts.tsx` explains it — but it is exactly what the spec rules out.
   - Amplitude, including session replay, starts from `instrumentation-client.ts` before hydration.
   - GA4 and Google Ads use a hardcoded gtag.js. Rewardful, Intercom and the toolbar are unconditional `next/script` tags.
3. **The consent script loads last, and the Google tags race it.**
   - Termly is the last `<Script>` in the file and uses `afterInteractive`.
   - `gtag('config', G-HFXRYF6WF8)` and `gtag('config', AW-11181152032)` are pushed **before** Termly's `consent default`. The dataLayer order observed was `set linker > js > config GA4 > config Ads > consent default`.
   - Most of the time gtag.js arrives late enough to see the default. On a slow Termly load it doesn't: Google then sends hits with no consent state (`gcd=…l…`) and writes `_ga`, `_ga_*`, `_gcl_au` and DoubleClick cookies. That happened in 1 of 13 audited loads.
4. **Consent Mode defaults come from Termly, not from us, and too late.** Termly does push all-denied defaults, but after the tags above. `enable_google_consent_mode` is `false` in the Termly settings, and no `consent update` is ever sent on Accept or Decline.
5. **GTM tags have no consent requirements.** Meta, LinkedIn and X fire on every page regardless of Consent Mode.
6. **"Decline" doesn't stop anything.** After Decline on `/`, navigating to `/pricing` still loaded all 13 tools, contacted 23 hosts and set 24 cookies. The run recorded is the `decline` scenario in the results JSON.
7. **GPC is ignored.** `enable_gpc` is `false` in every Termly region. With `Sec-GPC: 1` and `navigator.globalPrivacyControl = true`, the homepage still loaded every Marketing tool. Termly's own GPC handling is also tied to its "Do Not Sell" (opt-out) mode, so on its own it won't give "Marketing off by default, and the banner says so" in opt-in mode.
8. **Regions are not a problem.** All 24 Termly regions (global, US, California, the other US states, EU, BR, CA) are set to `opt_in` with the banner on and a Decline button. The banner showed on every page audited. The failure is enforcement, not display.
9. **Tools are in the wrong categories, or none.**
   - Termly's cookie scan covers the **old domain `usesuperflow.com`**, not `usesuperflow.ai`, and marks 29 cookies "unclassified".
   - The X pixel's `adsct` is filed as Analytics instead of Advertising.
   - Amplitude, Claydar, RB2B and Rewardful don't appear in the scan at all.
   - Intercom is filed as "performance". That category is irrelevant here, because Intercom loads regardless.
10. **The banner doesn't match the spec.**
    - The buttons read "Preferences / Decline / Accept". Decline and Accept are the same weight, which is good.
    - The preferences view uses Termly's five fixed categories (Essential, Performance & Functionality, Analytics & Customization, Advertising, Social networking), not our three.
    - There's **no "Cookie settings" link in the footer**. The footer has Privacy and Terms only. Termly's floating preferences widget is enabled but wasn't visible.
11. **Embeds load third parties on page load.** Calendly drags in Stripe, Segment, Sprig, Braze, reCAPTCHA and Airbrake before the visitor interacts. Tally drags in Sentry and Google Fonts.
12. **CMS HTML can inject script.** `app/blog/[slug]/page.tsx` writes the Sanity `faqSchema` text field into a `<script type="application/ld+json">` through `dangerouslySetInnerHTML`, with no escaping. A `</script><script src=…>` in that field would run on the page. The site's own `JsonLd` helper escapes `<`; this path skips it. No other Sanity field renders raw HTML: legal pages use static HTML from `lib/legal-content.ts`, and Portable Text doesn't render HTML.
13. **Two GA4 properties run side by side.** `G-HFXRYF6WF8` is hardcoded and `G-NKFPRQTBQY` comes from GTM. Both send page views.
14. **/docs has no banner and no footer link.** Nothing there fires today, so there is nothing to consent to, but Mintlify pages can't reopen our banner.

## Can Termly do the job? (decision 5)

Mostly yes, so this report does **not** propose switching vendors.

- **Blocking:** Termly supports manual blocking (`type="text/plain"` + `data-categories`) and its auto-blocker, and exposes a JS API (`Termly.getConsentState()`, consent events) plus a `termly-display-preferences` link class to reopen the banner. That covers the one-gate loading rule, the footer link and withdrawal.
- **Categories:** it cannot show exactly three categories. Its preference centre uses its fixed set. Plan: map Analytics → `analytics`, Marketing → `advertising` (plus `social_networking`), and leave `performance` unused.
- **GPC:** its GPC handling doesn't cover the spec's opt-in behaviour. Plan: a small first-party check. If `navigator.globalPrivacyControl` is true, treat Marketing as denied regardless of the banner choice, and show a one-line notice in the banner.
- **Button labels:** changing "Accept / Decline / Preferences" to "Accept all / Reject all / Manage preferences" is a Termly dashboard setting, if their copy editor allows it.

If "exactly three categories" or "the banner itself states GPC" is a hard requirement, Termly can't meet it on its own. That becomes a vendor-options question for you.

## Decisions needed before Phase 2

1. **There are two deanonymizers, RB2B and Claydar**, not one. Should both be kept and gated as Marketing, or should one be dropped? (Default: keep both, gate both.)
2. **Reddit pixel:** nothing to delete in code, and no active GTM tag. Please check the 4 paused GTM tags (45, 60, 75, 82) and delete Reddit if it's one of them. It goes on the GTM checklist either way.
3. **Superflow toolbar** (`cdn.velt.dev/lib/superflow.js`, our own product): Necessary, or gated? It loads Google Fonts and writes localStorage for every visitor. (Suggested: Analytics, or load it only for team members.)
4. **Two GA4 properties:** keep both, gated as Analytics, or consolidate? (Default: keep both, gate both. Consolidating isn't a removal we'd do without asking.)
5. **Business impact of gating, for your awareness:**
   - Google Ads click IDs (`_gcl_*`) and the cross-domain linker to `app.usesuperflow.com` won't run until Marketing consent, so ad-driven signups from visitors who decline will read as organic. Consent Mode's `url_passthrough` can recover part of this without cookies.
   - The same goes for Rewardful affiliate attribution if it's gated as Marketing.
6. **Chat:** I plan to load Intercom **on click** — the site already has its own `IntercomButton`, so this is clean. Visitors won't be recognised by Intercom until they open chat.
7. **Calendly on `/book-demo`:** click-to-load placeholder ("Load scheduler — this loads Calendly, which sets cookies") vs. gating behind Marketing/Analytics consent. (Default: click-to-load, per the spec's embed rule.) Same for Tally.
8. **Shared GTM container:** adding consent requirements to the Meta, LinkedIn and X event tags will also gate them in the logged-in app, which is out of scope. Is that acceptable, or should the app's tags move to their own container first?

## Phase 2 plan (for reference, not started)

- One gate: a `ConsentScripts` client component that reads Termly's consent state and renders `next/script` only for granted categories. Every non-essential tag moves behind it: RB2B, Claydar, gtag/GA4/Ads, GTM, Rewardful, Amplitude (removed from `instrumentation-client.ts`) and the toolbar (per decision 3).
- Termly loads first, in `<head>`, with a `beforeInteractive` inline Consent Mode v2 default (all four signals `denied`) ahead of GTM. Consent Mode is updated from Termly's consent events.
- Intercom loads on click. Calendly and Tally get click-to-load placeholders. The footer gets a "Cookie settings" link. GPC gets its first-party override. `faqSchema` gets escaped.
- The Phase 3 test builds on this script (`scripts/consent-audit/`, `npm run consent:test`), with the allowlist in `scripts/consent-audit/config.mjs`.
- Also in Phase 2: `gtm-checklist.md` and `tool-inventory.md`.
