# Truth block: Filestage (verified July 2026, from filestage.io)

Researched July 2026 from Filestage's own site (filestage.io, its pricing page, and
its help center at help.filestage.io). Rules: facts from the vendor's own site only,
dated. Unverified stays a dash. Aggregator review sites rejected.

Angle: Filestage is asset/online proofing. It reviews creative files (video, images,
designs, PDFs, documents, audio, interactive HTML) and can also review live websites
by URL. It is a review-and-approval hub, not a website QA tool. Lead with asset-review
dimensions, since that is what is true.

## Strengths
- Structured approval workflow: reviewer groups per stage, review statuses, due dates, automated reminders, one-click Approve / Request changes (filestage.io/pricing)
- Reviews many content types in one place: video, images, designs, PDFs, documents, audio, interactive HTML, and live websites (filestage.io/supported-file-types)
- AI Review Agents that scan files before humans start: text, grammar and spelling, image/logo presence, forbidden terms, compliance, barcode and QR (filestage.io/pricing)
- Contextual annotations with version compare, timestamps on video and audio, to-do lists from comments (filestage.io/pricing)
- Reviewers never need an account: they enter an email and comment or approve from a link (filestage.io/pricing FAQ)

## Limits
- Live-website review loads the original URL in real time and does not save website versions; a per-comment screenshot is kept only for context (help.filestage.io/en/articles/5755744)
- Reviewing private or authenticated sites is not per-reviewer login; you whitelist Filestage's static IPs and set X-Frame-Options so Filestage can embed the URL (help.filestage.io/en/articles/5755764)
- AI Review Agents are Business tier and up, gated by monthly Agent credits (50/month) that do not roll over (filestage.io/pricing)
- No product-wide project memory concept verified; agents only reference saved context you configure (brand guidelines, forbidden terms, uploaded compliance docs) (filestage.io/pricing)

## Open dashes (re-verify before rendering as fact)
- Formal client approval flow: VERIFIED. Reviewer groups per stage, statuses, due dates, reminders, Approve / Request changes, plus Verified approval (Approve and sign, FDA 21 CFR Part 11) on higher tiers (filestage.io/pricing)
- Private / internal comments: VERIFIED. Team-only comments keep discussion private between teammates and creatives (filestage.io/pricing, Starter and up)
- Automatic per-comment screenshots: VERIFIED for live websites only. A screenshot is saved for each website comment to preserve context; not verified for other file types (help.filestage.io/en/articles/5755744)
- Behind-login / authenticated-site behavior: PARTIAL. Private sites need IP whitelisting and header changes, not a reviewer login session (help.filestage.io/en/articles/5755764)
- Session recordings: not yet verified (no recording feature found on Filestage's site)
- Two-way issue sync: PARTIAL. Google Drive folder sync pulls new versions in; Jira and Monday push versions, due dates, and statuses out; full ticket-status writeback not verified (filestage.io/pricing)

## Pricing (verified July 2026, filestage.io/pricing)
- Free EUR 0 / Starter EUR 199 per month / Business EUR 329 per month / Enterprise custom
- Yearly billing gives 2 months free; homepage FAQ also cites paid plans "from $99/month" (re-verify currency and tier)
- Every plan includes 10 team members; add seats in bundles of 5 (+1 TB storage per bundle)
- Reviewers are unlimited and free, no account required
- File caps: Free is 1 active project and 5 new files per month; paid plans are unlimited files and projects
- AI Review Agents start on Business (EUR 329) with 50 Agent credits per month

## Stay line
If your team's real need is gathering feedback and formal sign-off on creative files and assets, Filestage is a strong proofing tool. Stay.

## Granted noun (vs-class H1)
proofing tool

## Sources
- filestage.io (home) -> positioning as AI-assisted online proofing; AI Review Agents scan creative assets for errors, brand inconsistencies, compliance risks; reviews designs, videos, HTML; due dates, reminders, approval tracking; annotations; integrations
- filestage.io/pricing -> tiers and prices (Free/Starter EUR199/Business EUR329/Enterprise), seats (10 + bundles of 5), reviewer economics (unlimited free), file caps, full feature matrix (team-only comments, review agents list, Verified approval, integrations, storage)
- filestage.io/supported-file-types -> content types reviewed: video, live websites (HTTPS URLs), HTML via ZIP, PDFs, designs, documents, audio
- help.filestage.io/en/articles/5755744 (Review live websites) -> live URL loaded in real time, no saved website versions, per-comment screenshot for context, metadata (URL, screen size, browser), browser extension optional for complex sites
- help.filestage.io/en/articles/5755764 (Setting up your website for live-review) -> HTTPS + X-Frame-Options required; private sites need Filestage IP whitelisting (not per-reviewer login)
- help.filestage.io/en/articles/5977284 (Review Interactive HTML) -> banner ads, emails, e-learning, animations via ZIP upload
- filestage.io/pricing FAQ -> reviewers need no account (email only); free reviewer account optional

## Eight labels
1. Who checks the content: mostly humans, but AI Review Agents (text, grammar/spelling, image/logo, forbidden terms, compliance, barcode/QR, voice summary) pre-scan files on Business+ using monthly credits (filestage.io/pricing)
2. How the client says yes: no reviewer account needed; formal workflow with reviewer groups per stage, due dates, reminders, and Approve / Request changes, plus Verified approval sign-off on higher tiers (filestage.io/pricing)
3. Where you review: file/asset proofing is the core; live-website review exists by URL (embedded, not behind a reviewer login; private sites need IP whitelisting) (filestage.io/supported-file-types, help.filestage.io/en/articles/5755764)
4. What stays private: yes, Team-only comments keep discussion private between teammates and creatives (Starter+) (filestage.io/pricing)
5. What gets captured: annotations on video (timestamped), images, documents, and live sites; per-comment screenshots on website reviews; no session recordings verified (filestage.io/pricing, help.filestage.io/en/articles/5755744)
6. What it remembers: no project-wide memory concept verified; agents only use saved context you configure (brand rules, forbidden terms, compliance docs) (filestage.io/pricing)
7. How it fits your stack: integrations with Jira, Monday, Slack, Teams, Zapier, Make, Adobe apps, Google Drive (folder sync inbound), plus API and webhooks; full two-way ticket sync not verified (filestage.io/pricing)
8. What it costs: Free EUR 0 / Starter EUR 199 / Business EUR 329 per month / Enterprise custom; 10 seats included, +5 bundles; reviewers free (filestage.io/pricing, July 2026)
