# Truth block: Usersnap (verified July 2026, from usersnap.com)

Built from the vendor's own pages only (usersnap.com and help.usersnap.com).
Rules: facts from the vendor's own site only, dated. Unverified stays a dash. No
aggregator claims used (RG-ruled July 2026).

ANGLE: Usersnap is a user-feedback platform, not an agency client-review tool. It is a
widget you install on your site or app that lets end users send feedback, bug reports,
survey answers, and feature requests. Teams triage that feedback in a shared dashboard.
Verified as such July 2026 (usersnap.com, usersnap.com/bug-reporting).

## Strengths
- Visual feedback widget: users send annotated screenshots and screen recordings with voice, plus auto metadata (URL, browser, device, OS, screen size) (usersnap.com/bug-reporting)
- Guests send feedback with no account, and a public/limited board lets external users upvote and track tickets without a paid seat (usersnap.com/pricing, help.usersnap.com/docs/public-portal-for-your-guest-users)
- Two-way sync with Jira, Jira Product Discovery, Azure DevOps, and Linear; 50+ native integrations, plus 2,000+ via Zapier (usersnap.com/pricing, usersnap.com/bug-reporting)
- Internal notes stay team-only while replies email the reporter, so private collaboration is built in (help.usersnap.com/docs/feedback-restored)
- Surveys, feature-request portal, announcements, and changelog in one platform (usersnap.com, usersnap.com/pricing)

## Limits
- Nothing checks the site on its own. A person (usually the end user) reports every issue via the widget. AI only processes feedback that is already submitted (usersnap.com/pricing).
- AI scope is analysis, not QA: sentiment sensor, categorization labels, project summaries, smart replies, and hypotheses/solutions generation (both BETA). No AI that scans or tests the live site (usersnap.com/pricing).
- Screenshots are manual (the user triggers the widget). No automatic per-visit screenshot monitoring (usersnap.com/bug-reporting).
- Console/error logs auto-capture is gated to Professional and above (usersnap.com/pricing).
- No memory concept in product; nothing persists learned context across projects (checked July 2026, usersnap.com/pricing).

## Open dashes (re-verify before rendering as fact)
- Behind-login / authenticated-site review as a named feature: not yet verified (the snippet and browser extension run wherever installed, including logged-in pages, but no dedicated authenticated-preview flow is described)
- Formal client approval flow (approve/reject gate): not yet verified
- Competitor migration/import tooling: not yet verified (Channels can ingest conversations from connected tools like Zoom, Intercom, ServiceNow, Gong; REST API and CSV/JSON export exist, but no competitor importer is described)
- Screen recording on mobile SDK: not yet verified (mobile SDK notes visual feedback is not supported)

## Pricing (verified July 2026, usersnap.com/pricing)
- Free: first 20 feedback items free, 5 seats, 500 feedback storage; free accounts deactivate after 90 days if not upgraded
- Starter: $59/mo monthly or $49/mo billed yearly (EUR €49 / €39). 5 seats, 5 live projects, 500 feedback storage, 100,000 page views/mo
- Growth: $129/mo monthly or $109/mo billed yearly (EUR €109 / €89). 10 seats, 15 live projects, unlimited storage, 500,000 page views/mo
- Professional (most popular): $229/mo monthly or $189/mo billed yearly (EUR €199 / €159). 20 seats, 20 live projects, 1,000,000 page views/mo
- Premium: from $449/mo monthly or from $369/mo billed yearly (EUR €389 / €319). 50 seats, 50 live projects, 2,000,000 page views/mo
- Enterprise: custom, adds SSO (SAML, OIDC), roles/permissions, success manager, priority support
- Feedback items per month are unlimited on all paid plans. Seats are dashboard members; sending feedback needs no seat. NGO/education discount 30%.

## Stay line
If your goal is collecting user feedback, surveys, and feature requests through a widget, and a human reports each issue, Usersnap is a solid feedback platform. Stay.

## Granted noun (vs-class H1)
feedback tool

## Sources
- usersnap.com -> what Usersnap is (user-feedback platform), widgets/surveys/feature requests, integrations overview, security posture (GDPR, SOC 2), that senders need no account
- usersnap.com/pricing -> tiers, prices (USD/EUR, monthly/yearly), seats, project caps, page-view caps, feedback storage caps, AI sidekick scope, console-log gating, 2-way sync scope, mobile SDK, targeting, browser extension, CSV/JSON export, REST API, SSO
- usersnap.com/bug-reporting -> visual bug reports (annotated screenshots, screen recordings), auto metadata and JS errors, browser extension, 2,000+ integrations via Zapier
- usersnap.com/integrations -> 2-way status sync positioning, Jira and Azure DevOps sync, integration categories
- help.usersnap.com/docs/feedback-restored -> internal notes are dashboard-only, replies email the reporter (private comments verified)
- help.usersnap.com/docs/public-portal-for-your-guest-users -> guests view/comment/upvote on a board without a paid seat
- help.usersnap.com/docs/opportunities-board -> opportunity roadmapping, priority scoring, linking feedback and hypotheses

## Eight labels
1. Who checks the site: Humans report everything through the widget. AI only categorizes, scores sentiment, summarizes, and drafts replies/hypotheses on feedback already submitted. No AI scans the live site (usersnap.com/pricing).
2. How the client says yes: Anyone can submit via widget or survey with no account or seat. No formal approve/reject gate verified (usersnap.com/pricing FAQ).
3. Where you review: Feedback comes from a widget on your live site/app or a browser extension, with on-page screenshot annotation; team reviews in the dashboard. Authenticated-site review as a named feature is not yet verified (usersnap.com/bug-reporting).
4. What stays private: Yes. Internal notes are team-only; replies go to the reporter by email (help.usersnap.com/docs/feedback-restored).
5. What gets captured: Manual annotated screenshots, screen recordings with voice, auto metadata (URL, browser, device, OS, screen size), and auto JS/console error logs on Professional and up (usersnap.com/bug-reporting, usersnap.com/pricing).
6. What it remembers: No memory concept. Nothing persists learned context across projects (usersnap.com/pricing, checked July 2026).
7. How it fits your stack: 50+ native integrations plus 2,000+ via Zapier; two-way sync for Jira, Jira Product Discovery, Azure DevOps, and Linear; REST API, webhooks, PowerBI, CSV/JSON export (usersnap.com/pricing, usersnap.com/integrations).
8. What it costs: Free (20 items), then Starter $49, Growth $109, Professional $189, Premium from $369, per month billed yearly; Enterprise custom (usersnap.com/pricing, July 2026).
