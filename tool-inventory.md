# Tool inventory: usesuperflow.ai (marketing site)

This lists every third-party tool that still runs on the public marketing site (`usesuperflow.ai`, including `/tools`, `/directory` and `/docs`), for updating the privacy policy. It doesn't cover the logged-in app (`app.usesuperflow.com`).

It records what the code loads and what we saw each tool send in the audit (`consent-audit.md`). The "data sent" columns describe how each tool works, as observed and per its own documentation. They're for legal to confirm, not policy text.

**How consent works on the site:**

- Every visitor, everywhere, starts opted out.
- Nothing in **Analytics** or **Marketing** loads until the visitor accepts that category in the cookie banner (Termly).
- **Global Privacy Control** keeps Marketing off even after "Accept".
- Embeds and chat load only when the visitor clicks them.
- Visitors can change their choice from **Cookie settings** in the footer. Withdrawing consent deletes the first-party cookies those tools set and reloads the page without them.

The Reddit pixel isn't on the site (removal from GTM is tracked in `gtm-checklist.md`).

## Necessary: always on, no consent needed

| Tool | What it does | Data it sends | Cookies / storage |
|---|---|---|---|
| **Termly** (`app.termly.io`) | Shows the cookie banner and stores the visitor's choice | IP address and browser details (as with any web request); the consent choice and a consent ID; page-view counts for Termly's banner statistics | `csrf_token`; localStorage `TERMLY_API_CACHE` and Termly's consent record |
| **Vercel** (hosting) | Serves the site | Standard request data: IP address, URL, user agent | None set for visitors |
| **Sanity** (`cdn.sanity.io`) | Serves CMS images | Standard image requests | None |
| **Mintlify** (`/docs`, proxied) | Hosts the documentation pages | Standard requests. No analytics observed on `/docs` | None observed |
| **Superflow toolbar** (`cdn.velt.dev/lib/superflow.js`, our own product) | Loads our own feedback toolbar on our site (kept on by product decision) | Standard request data to our own Velt-hosted service | localStorage `sfToolbarVersion` |
| **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`) | Font files, requested by the Superflow toolbar | IP address and browser details (standard font request) | None |

## Analytics: only after the visitor accepts Analytics

| Tool | What it does | Data it sends | Cookies / storage |
|---|---|---|---|
| **Google Analytics 4**, property `G-HFXRYF6WF8` (gtag.js) | Website traffic analytics | Pages viewed, referrer, device and browser details, approximate location from IP, a pseudonymous client ID | `_ga`, `_ga_HFXRYF6WF8` |
| **Google Analytics 4**, property `G-NKFPRQTBQY` (via Google Tag Manager) | Second analytics property, includes sign-up / install / purchase events from the app | As above | `_ga`, `_ga_NKFPRQTBQY` |
| **Amplitude** (events and replays routed through `cdn.velt.dev`) | Product analytics: page views, sessions, marketing attribution (UTM / referrer), clicks and form-field changes for heatmaps, "frustration" clicks, page performance, failed network requests (4xx/5xx), and **session replay** (a recording of the page and the visitor's mouse, scroll and clicks; input fields are masked by default) | All of the above, linked to a pseudonymous device ID and session ID | `AMP_<key>`, `AMP_MKTG_<key>`; localStorage `AMP_*`; sessionStorage `AMP_URL_INFO` |

## Marketing: only after the visitor accepts Marketing (never under GPC)

| Tool | What it does | Data it sends | Cookies / storage |
|---|---|---|---|
| **Google Ads** `AW-11181152032` (gtag.js, plus remarketing, conversion and conversion-linker tags in GTM) | Ad click attribution across `usesuperflow.ai` → `app.usesuperflow.com`, remarketing audiences, conversion tracking for demo bookings and sign-ups | Pages viewed, ad click IDs (gclid), a pseudonymous ID, IP address and browser details | `_gcl_au`, `_gcl_aw`; DoubleClick cookies on `doubleclick.net` |
| **Google Tag Manager** `GTM-M6Q8QPG` | Loads the Meta, LinkedIn, X, Google Ads and second GA4 tags | Only what its tags send (listed in this table) | Via its tags |
| **Meta pixel** `825109945989286` (via GTM) | Ad measurement and audiences on Facebook / Instagram | Page views and events (sign-up, install, purchase from the app), pseudonymous browser ID, IP address and browser details; Meta may match these to Meta accounts | `_fbp` (ours); `fr` (facebook.com); localStorage `lastExternalReferrer*` |
| **LinkedIn Insight Tag** `4956052` (via GTM) | Ad measurement, conversion tracking and audiences on LinkedIn | Page views and conversions, IP address and browser details; LinkedIn may match these to LinkedIn members | `bcookie`, `bscookie`, `lidc`, `li_sugr`, `UserMatchHistory`, `AnalyticsSyncHistory` (linkedin.com); localStorage `li_adsId` |
| **X (Twitter) pixel** `of55h` (via GTM) | Ad measurement and conversion tracking on X | Page views and conversions, IP address and browser details; X may match these to X accounts | `_twpid`, `_twsid` (ours); `guest_id`, `guest_id_ads`, `guest_id_marketing`, `personalization_id` (twitter.com), `muc_ads` (t.co) |
| **RB2B** | **Visitor identification**: tries to match website visitors to individual people and their companies (B2B lead identification) | IP address, pages viewed, referrer, browser details | A test cookie `__test__`; small localStorage test key |
| **Claydar / Clay web intent** | **Visitor identification**: matches website visits to companies and people for sales follow-up | IP address, pages viewed, session and device IDs, browser details (sent to `api.claydar.com`) | sessionStorage `claydar_device_id`, `claydar_session`, `radar_sn_*` |
| **Rewardful** (`r.wdfl.co`) | Affiliate referral tracking: credits an affiliate when a visitor arrives through their link | The referral code from the link, pages viewed, browser details | `rewardful.referral` (only when arriving through an affiliate link) |

## Loaded only when the visitor clicks

| Tool | Where | What it does | Data it sends once clicked | Cookies / storage |
|---|---|---|---|---|
| **Intercom** (`widget.intercom.io`) | The chat button on most pages | Live chat and support messages | Messages and anything typed into the chat, pages viewed during the chat, IP address and browser details, a visitor ID | `intercom-id-gkjq60px`, `intercom-session-gkjq60px`, `intercom-device-id-gkjq60px`; localStorage `intercom.intercom-state-*` |
| **Calendly** | `/book-demo` ("Show available times") | Demo booking | Name, email and answers entered in the booking form; IP address and browser details. Calendly's page also loads its own vendors: Stripe, Segment, Sprig, Braze, Google reCAPTCHA, Airbrake | `__cf_bm`, `_cfuvid` (calendly.com), `m` (m.stripe.com), plus whatever those vendors set inside the Calendly frame |
| **Tally** | `/state-of-agency-tools` ("Start the survey") | The agency tools survey form | Survey answers, and contact details if the visitor gives them; IP address and browser details. Tally's page also loads Sentry (error reporting) and Google Fonts | Set by Tally inside its frame |

## Not on the site

These were checked for and not found: Reddit pixel (pending GTM cleanup), Hotjar, Microsoft Clarity, FullStory, PostHog, Segment (except inside the Calendly frame), Koala, Warmly, Clearbit Reveal, Leadfeeder, Apollo, and YouTube / Vimeo / Loom / Wistia embeds (videos are self-hosted).
