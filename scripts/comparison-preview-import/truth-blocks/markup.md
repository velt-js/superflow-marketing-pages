# Truth block: Markup.io (verified July 2026, from markup.io and its official docs)

Researched from the vendor's own site only: markup.io product and pricing pages, plus the
official Ceros Educate help center linked from markup.io (educate.ceros.com) and the vendor
Chrome Web Store listing. Blogs and listicles on markup.io were not used as fact sources.
Rules: vendor facts only, dated. Absence of evidence stays a dash, not a "no".

## Strengths
- Flat price. Pro is $79 per month with unlimited users (admins, members, guests)
- Guests review free from a share link, no signup required
- Comment on 30+ file types in one place: live websites, images, PDFs, videos
- Statuses plus Sign off flow: Open for review, Editing content, On hold, Completed, with per-reviewer sign off
- Native integrations: Slack, Microsoft Teams, Loom, Zapier (5,000+ apps), plus a public API with webhooks
- Chrome extension auto-captures a screenshot on every comment or pin as an audit trail

## Limits
- Nothing checks the site on its own. A person finds every issue. No AI features found on the vendor's product, pricing, or docs pages (checked July 2026)
- Website review is proxy and iFrame based. Sites that block iFrames or require login can break, and may need the Chrome extension or a temporary auth change by your dev team
- Pro caps: 1 Workspace, 500GB storage, 100MB attachment size per comment
- No native two-way sync. Outbound flows run through Zapier (MarkUp is the trigger app), the API, or webhooks

## Open dashes (re-verify before rendering as fact)
- Internal or private comments the client cannot see: not yet verified (Private MarkUps means the whole MarkUp is private, a different concept)
- Auto screenshots without the Chrome extension: not yet verified
- Native video or screen recording capture: not yet verified (Loom integration attaches video)
- Browser, OS, or screen-size metadata capture: not yet verified
- Per-client memory or knowledge concept: not yet verified (none found in docs)
- Kanban board: not yet verified (statuses and a dashboard exist, no kanban found)
- Native two-way sync with a PM tool: not yet verified
- Migration or import tooling from other feedback tools: not yet verified (API can create MarkUps from a URL)

## Pricing (verified July 2026, markup.io/pricing and markup.io/pricing-page-faqs)
- Pro: $79 per month, flat, unlimited users (admins, members, guests), 1 Workspace, unlimited MarkUps, 500GB storage, 100MB attachment cap
- Enterprise: custom pricing, unlimited Workspaces and storage, SSO (SAML), SOC II documentation, custom DPA, 99% SLA, dedicated success manager
- Free tier after the 14-day trial: restricted to 5 MarkUps and 10GB, no Folders, no Private MarkUps
- 14-day free trial, credit card required to sign up
- No per-seat math (flat price). Guests free and unlimited. No page-view caps advertised

## Stay line
If flat-price, link-based visual commenting on websites and files, with a simple statuses and sign-off flow, is all you need, MarkUp.io is a fine tool. Stay.

## Granted noun (vs-class H1)
Feedback tool (the vendor calls itself a "visual commenting platform")

## Sources
- https://www.markup.io : product overview, 30+ file types, guests join with no registration, Chrome extension auto-includes screenshots with comments
- https://www.markup.io/pricing/ : Pro $79/mo unlimited users, 1 Workspace, 500GB, 100MB attachments; Enterprise custom with SSO (SAML), SOC II; feature comparison table
- https://www.markup.io/pricing-page-faqs/ : Pro and Enterprise details, roles (Owner, Admin, Member, Guest), unlimited users definition, Folders, Private MarkUps become public when downgraded, trial restrictions (5 MarkUps, 10GB), credit card required
- https://educate.ceros.com/en/articles/12454880-what-is-markup-io : self-description as a visual commenting platform for live websites and digital content
- https://educate.ceros.com/en/articles/12462018-statuses-sign-off : Statuses (Open for review, Editing content, On hold, Completed) and Sign off flow; only Admins and owners set status
- https://educate.ceros.com/en/articles/12464684-can-i-mark-up-a-password-protected-website : behind-login behavior, iFrame limits, extension helps, dev may disable auth temporarily
- https://educate.ceros.com/en/articles/12464815-how-does-markup-io-know-where-on-a-website-a-pin-is : pins keyed to page URL and query string, canonical URL handling
- https://educate.ceros.com/en/articles/12465257-cloudflare-challenge-testing-with-markup-proxy : confirms MarkUp uses a proxy (proxy IPs) to render sites
- https://educate.ceros.com/en/articles/12454966-settings-in-a-markup : per-MarkUp settings (email notifications, show pins in Browse mode); no internal-only comment setting found
- https://educate.ceros.com/en/articles/12463822-markup-io-chrome-extension : extension takes a screenshot every time a comment or pin is left
- https://chromewebstore.google.com/detail/markup-for-chrome/llbkdcpbiogplgmefnkbgcdfiopfphbc : extension auto-screenshots as audit trail, guests no signup, works with or without extension, updated July 13 2026
- https://educate.ceros.com/en/collections/15677212-integrations : integrations list (Microsoft Teams, Slack, Zapier, Loom, Chrome extension, Developer Hub, API)
- https://educate.ceros.com/en/articles/12463682-zapier-x-markup-io-integration : MarkUp is the Zapier trigger app; action app is the other tool (outbound automation)
- https://educate.ceros.com/en/articles/15692798-what-can-you-do-with-the-markup-api : public API can create MarkUps from a URL, retrieve feedback, plus webhooks for review events

## Eight labels
1. Who checks the site: A person checks it. Nothing checks the site automatically. No AI features found on vendor pages (checked July 2026).
2. How the client says yes: Guests comment free from a link with no account. Formal flow is Statuses plus a per-reviewer Sign off; only Admins and owners set status.
3. Where you review: Proxy and iFrame based rendering of the live URL, pins keyed to URL and query string. Chrome extension is optional and helps with authenticated or iFrame-blocked sites. Behind-login support is partial.
4. What stays private: Private MarkUps make a whole MarkUp private. Internal or private comments the client cannot see: not yet verified.
5. What gets captured: Chrome extension auto-captures a screenshot on every comment or pin. Native video or screen recording: not yet verified. Browser or OS metadata: not yet verified.
6. What it remembers: No per-client memory or knowledge concept found: not yet verified.
7. How it fits your stack: Workspaces, Folders (up to 5 deep), and Statuses on a dashboard (no kanban found). Native Slack, MS Teams, Loom, Zapier, and a public API with webhooks. Two-way sync: not yet verified.
8. What it costs: Pro $79 per month flat, unlimited users, 1 Workspace, 500GB, 100MB attachments. Enterprise custom with SSO and SOC II. Free tier after trial capped at 5 MarkUps and 10GB. Guests free. No page-view caps advertised.
