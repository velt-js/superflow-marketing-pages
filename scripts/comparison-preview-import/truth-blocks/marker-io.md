# Truth block: Marker.io (verified July 2026, from marker.io)

Researched only from the vendor's own site (marker.io, marker.io/pricing, marker.io/ai,
marker.io/features, marker.io/integrations, marker.io/features/session-replay,
marker.io/jira-bug-tracking-tool). Rules: facts from the vendor's own pages only, dated.
Unverified stays a dash. Aggregator review sites rejected. Absence of evidence is "not yet verified".

## Strengths
- Deep two-way tracker integrations. Feedback becomes a ticket in your tracker, and status syncs back (Done in Jira flips the issue to Resolved in Marker.io). Two-way "Issue sync" is a Team plan feature.
- Rich technical capture. Console logs, network requests, and session replay attach to reports on the Team plan and up. Environment details (browser, OS, webpage, screen size) auto-attach on every plan.
- Session replay video. Records the last three minutes before submit automatically, with a link to watch inside the widget or the connected tracker.
- Free reporting. Reporters are free and unlimited, no account needed, and can follow up on their own issues.

## Limits
- Nothing checks the site on its own. A person finds every issue, then reports it. Its AI edits, triages, and translates report text; it does not look at the site to find issues (checked marker.io/ai, July 2026).
- No memory concept in product. Each project starts blank (checked July 2026).
- Console logs, network requests, and session replay are gated to the Team plan ($149/mo) and up.
- No free plan. Entry is a paid Starter tier with a 15-day trial, no card.
- Page-view caps apply (Starter 5k/mo, Team 25k/mo).

## Open dashes (re-verify before rendering as fact)
- Formal client approval / recorded sign-off flow: not yet verified (none found on marker.io; copy mentions "revisions and approval" but no formal sign-off feature)
- Behind-login / authenticated-site review behavior: not yet verified (widget installs on local, staging, and live; extension reports on any webpage; specific authenticated behavior not stated)
- Azure DevOps plan gate: not yet verified (listed in the integrations marketplace; plan not stated on marker.io/pricing)
- "Agency" plan: not present on marker.io/pricing, July 2026 (see pricing note below)

## Pricing (verified July 2026, marker.io/pricing)
- Three tiers now: Starter, Team, Business. No "Agency" tier on the page.
- Starter: $39/mo billed annually, $59 monthly. 3 users (extra at $4/mo annual, $6/mo monthly), up to 10 projects, 10 guests, 5k page views/mo.
- Team: $149/mo billed annually, $199 monthly. 15 users (extra at $6/mo annual, $9/mo monthly), up to 50 projects, 50 guests, 25k page views/mo.
- Business: Custom, yearly billing only. Adds SSO SAML, audit logs, sensitive data masking, admin roles, user groups.
- All plans: unlimited feedback, unlimited reporters, 15-day free trial, no credit card. Annual billing is four months free (-33%).

## Stay line
If a careful human pass filed into the tracker you already run works for your team, and your developers want console logs, network requests, and session replay attached to every report, Marker.io is a strong fit. Stay.

## Granted noun (vs-class H1)
bug reporting tool

## Eight labels
1. Who checks the site: A person finds every issue, then reports it. No automatic site checking. AI scope by July 2026 is translation (200+ languages, beta, free), Magic Rewrite, and Title Generation, plus a Marker.io MCP that feeds bug context to external AI agents (Claude, Cursor) for triage, fix suggestions, and pull requests. The AI does not look at the site to find issues. (verified marker.io/ai)
2. How the client says yes: Reporters submit free from the widget, no account, and follow their own issues. Ongoing external collaborators are paid Guest seats (view a project, get assigned, comment, update status). Formal approval flow: none found (not yet verified).
3. Where you review: You annotate a high-fidelity screenshot capture of the live page; the report carries the picture. Widget on the live site (snippet or CMS plugin); browser extension for members on any webpage. Session replay adds a video of the last three minutes. Behind-login behavior: not yet verified.
4. What stays private: Internal comments on every plan, including Starter. (verified marker.io/pricing)
5. What gets captured: Screenshot plus environment details (browser, OS, webpage, screen size) on every plan. Console logs, network requests, and session replay (last three minutes) on the Team plan and up. (verified marker.io/pricing, marker.io/features)
6. What it remembers: No memory concept. Each project starts blank. (checked July 2026)
7. How it fits your stack: Feedback becomes a ticket in your tracker. Integrations include Jira, GitHub, GitLab, Bitbucket, Linear, Azure DevOps, Trello, Asana, ClickUp, Monday.com, Notion, Basecamp, Shortcut, Teamwork, Wrike, plus Slack, Intercom, Zendesk, and error/replay tools (Sentry, FullStory, LogRocket). Two-way "Issue sync" is a Team plan feature. Jira plan gate for two-way sync: Team. Azure DevOps plan gate: not yet verified. (verified marker.io/integrations, marker.io/pricing)
8. What it costs: Starter $39/mo annual ($59 monthly), 3 users, 10 projects, 10 guests, 5k page views/mo. Team $149/mo annual ($199 monthly), 15 users, 50 projects, 50 guests, 25k page views/mo. Business Custom, yearly only. All plans 15-day free trial, no card. (verified marker.io/pricing)

## Sources
- https://marker.io -> product framing, "bug reporting tool" granted noun, two-way integrations, session replay, GDPR/SOC 2
- https://marker.io/pricing -> tiers (Starter/Team/Business), users, projects, guests, page-view caps, extra-user rates, internal comments on all plans, Issue sync and Zendesk/Intercom as Team features, annual = four months free
- https://marker.io/ai -> AI scope: Translation (beta, free, 200+ languages), Magic Rewrite, Title Generation, Marker.io MCP for external AI agents; AI does not look at the site; Amazon Bedrock, no model training
- https://marker.io/features -> widget/extension install, screenshot annotation, environment data auto-capture, network logs, session replay, AI features in beta
- https://marker.io/features/session-replay -> records last three minutes automatically, ~2.5 min link in tracker, role-based access, data masking
- https://marker.io/integrations -> full integrations marketplace list (Jira, GitHub, GitLab, Bitbucket, Linear, Azure DevOps, Trello, Asana, ClickUp, Monday.com, Notion, Basecamp, Shortcut, Teamwork, Wrike, Slack, Intercom, Zendesk, Sentry, FullStory, LogRocket, BrowserStack, LambdaTest, Zapier, Webhooks, WordPress, Shopify, browser extensions)
- https://marker.io/jira-bug-tracking-tool -> Jira two-way integration, data attached to Jira issues (screenshot, URL, browser/OS, screen size, console logs, session replay)
- https://marker.io/blog/jira-plugins-addons -> vendor blog confirming 2-way sync (Done in Jira updates to Resolved in Marker.io)
