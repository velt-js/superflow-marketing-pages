# Truth block: Userback (verified July 2026, from userback.io)

Researched from the vendor's own site only, dated July 2026. Userback sits in the
feedback-widget class next to Usersnap. In July 2026 it is a user feedback platform:
in-app feedback widget with annotated screenshots and video, session replay, NPS and
surveys, and a feature-request portal. Rules: facts from userback.io pages only.
Unverified stays a dash. Absence of evidence is "not yet verified", never a "no".

## Strengths
- Visual feedback widget captures annotated screenshots, video recordings, console logs, network requests, and browser/system metadata on one submission (userback.io/features/feedback-widget)
- Session replay ships with feedback so teams watch what the user did before the report (userback.io/features/session-replay)
- Reporters submit feedback with no seat and no account; seats are only for internal team members (userback.io/pricing)
- True two-way sync with Jira, Linear, and ClickUp; status changes sync both directions (userback.io/integrations)
- Native MCP server gives AI coding tools (Cursor, Claude, ChatGPT) read/write access to feedback, logs, and network requests (userback.io/blog/connect-ai-tools-to-user-feedback)

## Limits
- Nothing crawls or QAs the site on its own. A person reports every issue. Userback's AI only runs after a human submits (auto-categorize, sentiment, titles, semantic search, theme clustering) (userback.io/features/feedback-widget, /pricing)
- No persistent "memory" concept. AI Insights clusters themes inside a project but there is no cross-project memory that carries forward (checked July 2026, userback.io/pricing)
- Session replay, console logs, network requests, surveys, and AI Feedback & Insights are gated to Business and up (userback.io/pricing)
- Customer support integrations (Intercom, Zendesk), REST API, and webhooks are Business Plus only (userback.io/pricing)
- Free plan locks feedback after 7 days of availability (userback.io/pricing)
- Feedback export as CSV is not available on Free or Team plans (support.userback.io/en/articles/5209243)

## Open dashes (re-verify before rendering as fact)
- Formal client approval / sign-off flow gating feedback: not yet verified (site shows triage routing with a "hybrid: review then push approved items" option, not a client approval step) (userback.io/integrations)
- Authenticated / behind-login site behavior: partially verified. Widget embeds in your own app and the browser extension captures on any site incl. staging; exact behavior on third-party logins not spelled out (userback.io/features/browser-extension)
- Auto screen recording of every visit ("Record All User Sessions"): Business Plus, custom-priced, contact sales; not a standard tier (userback.io/pricing)

## Pricing (verified July 2026, userback.io/pricing)
- Free Forever: $0, 2 seats, 2 projects, 7-day feedback availability, unlimited feedback collection
- Team: $29/mo billed annually ($39 monthly), 5 seats, 2 projects, unlimited availability, PM integrations + Zapier
- Business: $79/mo billed annually ($99 monthly), unlimited seats, 25 projects, session replay, console/network logs, surveys, AI Feedback & Insights, JS SDK
- Business Plus: $159/mo billed annually ($199 monthly), unlimited seats, unlimited projects, Mobile SDK, advanced privacy masking, Intercom/Zendesk, REST API, webhooks, SSO
- Feature Portal add-on: $31/mo billed annually ($39 monthly)
- Reporters unlimited on all plans, no seat; 25% off for startups, education, and charities
- Session replay retention: replays linked to feedback are kept while the feedback exists; unlinked sessions kept 12 months

## Migration / import tooling
- CSV import of feature requests into the Feedback Portal, with column mapping, 4000-row cap (1000 on trial) (support.userback.io/en/articles/14696099)
- CSV export of feedback and survey responses (paid plans above Team) (support.userback.io/en/articles/5209243)
- No dedicated importer from rival feedback tools found on their own site (checked July 2026)

## Stay line
If you want one platform to collect visual feedback, run surveys, and manage a feature-request portal, and a human on your side reports each issue, Userback is a solid fit. Stay.

## Granted noun (vs-class H1)
feedback tool

## Sources
- userback.io -> product scope: widget, session replay, NPS/surveys, feature portal, email/API inbound, MCP
- userback.io/pricing -> tiers, prices, seats, projects, plan gates, retention, reporters, add-ons (verified July 2026)
- userback.io/features/feedback-widget -> AI auto-categorize/sentiment/titles run post-submission; captures screenshots, session replay, console logs, metadata
- userback.io/features/session-replay -> records clicks, mouse, scroll, form inputs, console/network/DOM, rage clicks; privacy masking
- userback.io/features/browser-extension -> Chrome/Firefox/Edge capture on any site incl. staging and third-party, screenshots, screen recording, console logs
- userback.io/integrations -> integration list, two-way sync (Jira, Linear, ClickUp), triage routing options
- userback.io/security -> SOC 2 Type II, GDPR/CCPA, AES-256 at rest, TLS in transit
- userback.io/blog/connect-ai-tools-to-user-feedback -> MCP scope and OAuth; AI reads/writes feedback, no site crawling
- support.userback.io/en/articles/14696099 -> CSV import of feature requests
- support.userback.io/en/articles/5209243 -> CSV export, not on Free/Team

## Eight labels
1. Who checks the site: humans report everything. AI only organizes/analyzes after a human submits (categorize, sentiment, titles, semantic search, theme clustering). No AI QA agent browses the site.
2. How the client says yes: any reporter can submit via widget, browser extension, or link with no account and no seat. No formal client approval flow verified.
3. Where you review: live-site widget embedded in your app, browser extension on any site (incl. staging), plus a dashboard inbox and kanban. Screenshot annotation and video included.
4. What stays private: internal comments exist. Team Comment Controls can restrict members (like developers) to internal-only comments (Business+).
5. What gets captured: annotated screenshots, video recordings, session replay, console logs, network requests, and browser/system metadata (replay + logs are Business+).
6. What it remembers: no persistent memory concept. AI Insights clusters themes within a project; MCP exposes feedback to AI tools on demand.
7. How it fits your stack: 20+ integrations; two-way sync with Jira, Linear, ClickUp; Slack/Teams alerts; MCP; PM integrations gated to Team+, support tools + REST API + webhooks to Business Plus.
8. What it costs: Free $0 / Team $29 / Business $79 / Business Plus $159 per month billed annually; seats scale to unlimited on Business+; unlimited reporters; Feature Portal add-on $31/mo (verified July 2026).
