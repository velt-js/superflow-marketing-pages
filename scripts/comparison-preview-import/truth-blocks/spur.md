# Truth block: Spur (verified August 2026, from spurtest.com)

Researched only from the vendor's own site (spurtest.com, spurtest.com/agents/ui-ux-feedback,
spurtest.com/agents/functional-testing, spurtest.com/bug-book-collection, spurtest.com/case-studies,
spurtest.com/spur-mcp, spurtest.com/book-a-demo). Rules: facts from the vendor's own pages only, dated.
Unverified stays a dash. Aggregator review sites rejected. Absence of evidence is "not yet verified".

Note on the class: Spur is not a feedback tool. It is agentic QA test automation sold to e-commerce
engineering and QA leaders, replacing Selenium and manual regression. The overlap with Superflow is one
of its five agents, the UI/UX agent, which explores a product like a real user and flags typos, content
inconsistencies, layout overflows, and broken interactions. Everything else in the product is a
different job. Write the page so the overlap is granted plainly and the fork is the buyer, not the tech.

## Strengths
- Autonomous agents that plan, execute, and report tests. Five named agent types: exploratory,
  localization, UI/UX, functional, and AI feature testing, plus native mobile app testing.
- Real journeys, not page checks. Functional tests cover "complex multi-step user journey scenarios",
  including logged-in states, "end to end checkout with credit card information & payment methods", and
  email inbox testing. Tests chain: "sign in --> checkout --> placing a return".
- Plain English, no code. "Spur is a no-code testing platform, so you write all your tests in plain
  English instead of code."
- No codebase access needed. "Spur tests from the outside, like a real user. You provide a URL (and a
  build file for native apps)."
- Evidence is video. "Every run produces full video playback and step-level evidence, so you can see
  exactly what the agent saw. Customers report ~80% fewer false positives than scripted suites."
- Handles the hard auth cases: "logins, MFA/OTP, and CAPTCHA ... with standard setup: test accounts,
  whitelisted IPs, and OTP handling. For sites with strict bot protection we work with your security team."
- Low maintenance claim: "Mostly no one - intent-based tests adapt. When something does need updating,
  it's a plain-English edit, and our team helps."
- Scale: "Run 100s of tests in parallel across Web and Native Mobile Tests." Native mobile is "iOS and
  Android, using your build file. Tests are written once in natural language and run across web, iOS,
  and Android."
- CI: "Spur currently supports CI/CD integration through GitHub Actions. You can run Spur tests as part
  of your GitHub workflows (for example, on each pull request)."
- Spur MCP "wires Cursor, Claude, and Copilot to your validation agent", drafts plain-English tests from
  a pull request diff, runs tests from chat, and reads run history. "Pair Spur with GitHub, Jira, Linear or Slack."
- Public proof. The Bug Book is "a library of real production bugs caught by Spur on live sites before
  reaching users, with full forensic details: test, failure step, screenshot, and cost", 35+ documented
  bugs, severity-rated Critical to Mild, categorised Checkout, Interactions, Payment, Pricing, UI/UX,
  Copy, Accessibility, Localization, AI Feature Error.
- Enterprise logos on the homepage: True Religion, Fever, Bombas, Murad, Vuori, Abercrombie & Fitch,
  Factor, Moose Knuckles, Docusign, OurPlace, Uncommon Goods, HelloFresh, Alo Yoga, Nextdoor, Living Spaces.
- Named results on spurtest.com/case-studies: Living Spaces "0 to 80% coverage in 1 month" (Chloe Lu,
  Manager, E-commerce Quality Assurance); Alo "spent seven months trying to get Selenium running and
  still couldn't get a stable suite" (Vandana, Director of Engineering); UncommonGoods cut QA time in
  half; OneSafe four days to one day per release; Our Place launch-day regression from three or four
  people to one engineer; Wander 20x release velocity. Homepage claims: "95% of brands automate all core
  flows in first month", "80% fewer false positives than scripted tools", "20X faster release times".

## Limits
- No client layer at all. Runs report to the team that owns the site. A client-facing approval, sign-off,
  or share link: none found on spurtest.com (checked August 2026).
- No self-serve. There is no public pricing page (spurtest.com/pricing returns 404), no free plan, and
  no free trial stated. Every path is "Book a Demo" or the Pilot Program.
- Annual, sales-led contracts: "Annual plans based on test-run volume - not per seat", "Book a demo for
  a quote tailored to your release cadence."
- Web and native mobile apps only. No review of PDFs, images, video, or other creative formats
  (checked August 2026).
- No comment layer, so no internal-versus-client visibility distinction to speak of (checked August 2026).
- Buyer is a QA manager or engineering leader at a brand that owns its own product. Case-study titles are
  QA Manager, QA Engineer, Director of Quality Engineering, Director of Engineering, CTO, Product &
  Project Manager. Nothing on the site is addressed to an agency serving clients.

## Open dashes (re-verify before rendering as fact)
- A feedback loop that learns from human review decisions, a person accepting or rejecting a finding and
  that call changing what the next run checks: not yet verified (intent-based tests adapt to the site,
  and a customer says "the more you use Spur, the smarter it gets", but no such learning loop is
  described in product). This is the sharpest live difference against Superflow's Memory, so re-verify it
  specifically before the page renders anything stronger than a dash.
- Per-client brand memory that carries rules, taste, and decisions across projects: not yet verified
- Where results land beyond the run report and video playback (Slack/Jira/email delivery of findings):
  not yet verified. The MCP page says "Pair Spur with GitHub, Jira, Linear or Slack" but does not state
  what is delivered where.
- Pilot Program price, paid or free: not yet verified (three phases, "2 Spots Left for February 2026",
  no terms published)
- Scheduling and recurring runs: not yet verified

## Pricing (verified August 2026, spurtest.com FAQ and book-a-demo)
- No public price list. spurtest.com/pricing is a 404.
- "Annual plans based on test-run volume - not per seat."
- "Book a demo for a quote tailored to your release cadence."
- "Most teams start with a 1-2 week POC."
- Pilot Program: "a 3 phase initiative designed to dive deep into automating QA for your business"
  (Intro to Agentic QA, Use-Case Exploration, Process Integration), limited slots.
- "You're never auto-billed for overages - we flag usage and agree on any changes together."
- No free plan and no free trial stated.

## Stay line
If the question you need answered is whether the checkout still works on every release, and you have a
QA function to own it, Spur is the better tool. Stay.

## Granted noun (vs-class H1)
QA testing platform

## Eight labels
1. Who checks the site: Autonomous agents plan, execute, and report tests. Five agent types: exploratory
   ("tests unpredictable user paths automatically"), localization ("detects mixed-language UI elements
   and validates regional formatting"), UI/UX ("detects UI issues like typos, broken links, and layout
   problems"; explores "your product like a real user"; catches "typos, content inconsistencies, layout
   overflows, broken interactions" and "non-functional or misleading UI elements"), functional, and AI
   feature testing. Written in plain English, no code. This is the genuine overlap with Superflow's
   agents: grant it plainly. (verified spurtest.com, spurtest.com/agents/ui-ux-feedback)
2. How the client says yes: No client-facing approval or sign-off flow found (checked August 2026). Runs
   report to the team, with video playback and step-level evidence.
3. Where you review: The live product from the outside, "like a real user". A URL for web, a build file
   for iOS and Android. Logins, MFA/OTP and CAPTCHA handled with test accounts, whitelisted IPs, and OTP
   handling; strict bot protection worked through with the customer's security team. No non-website
   formats. (verified spurtest.com)
4. What stays private: Not applicable in the same sense. There is no client view and no comment layer,
   so every run is internal by construction. (checked August 2026)
5. What gets captured: "Full video playback and step-level evidence" on every run. The Bug Book format
   shows the shape of a finding: test, failure step, screenshot, and cost, severity-rated.
   (verified spurtest.com, spurtest.com/bug-book-collection)
6. What it remembers: Intent-based tests adapt when the site changes; plain-English edits when needed.
   That is adaptation to the site, not to a client. A per-client memory, and specifically any loop where a
   human's accept or reject on a finding teaches the next run: not yet verified. Superflow's side of this
   dimension is the Memory layer, where uploads go in once per client and every accept or reject on an
   agent comment teaches it, so the next review is grounded in that client's rules, taste, and past
   decisions and can flag a likely miss before review opens. (verified spurtest.com FAQ; Superflow side
   from the Memory feature page)
7. How it fits your stack: CI/CD through GitHub Actions, "for example, on each pull request". Spur MCP
   wires Cursor, Claude, Claude Code, ChatGPT, and VS Code Copilot to the agent, drafts tests from a PR
   diff, and runs them from chat. "Pair Spur with GitHub, Jira, Linear or Slack." Hundreds of tests run
   in parallel across web and native mobile. (verified spurtest.com, spurtest.com/spur-mcp)
   Do NOT concede the pipeline on this dimension. Superflow connects GitHub and Vercel as triggers: a
   push or deploy starts the review flow on its own, as do changes to the live site, with steps,
   conditions, and notifications and no YAML (integrations hub FAQ and the review-workflows page).
   Superflow also has an MCP: create and run agents on your site from any LLM. The honest difference is
   what the trigger produces, a merge gate versus a review that ends in a sign-off, not whether
   Superflow can hang off CI. An earlier draft of this page got that wrong.
8. What it costs: Annual plans priced on test-run volume, not seats. Demo required for a quote. Most
   teams start with a one to two week POC. Overages flagged, never auto-billed. No free plan, no public
   price list. (verified spurtest.com FAQ)

## Sources
- https://www.spurtest.com -> "Release Faster with Agentic QA", the five agents, customer logos, the FAQ
  (false positives, maintenance, CAPTCHA/MFA, codebase access, no-code, GitHub Actions, pricing model,
  POC length, overages, parallel runs, native mobile)
- https://www.spurtest.com/agents/ui-ux-feedback -> UI/UX agent scope: typos, content inconsistencies,
  layout overflows, broken interactions, non-functional or misleading UI elements; explores like a real user
- https://www.spurtest.com/agents/functional-testing -> multi-step journeys, logged-in states, end to end
  checkout with payment, email inbox testing, test chaining
- https://www.spurtest.com/bug-book-collection -> "The bugs that we caught in time", forensic format
  (test, failure step, screenshot, cost), 35+ bugs, severity and category taxonomy
- https://www.spurtest.com/case-studies -> Living Spaces 0 to 80% coverage in one month, Alo seven months
  on Selenium, UncommonGoods, OneSafe, Our Place, Wondr Health, Hue, August, Wander, with named titles
- https://www.spurtest.com/spur-mcp -> MCP scope, Cursor/Claude/Copilot, PR-diff test drafting, run from
  chat, "Pair Spur with GitHub, Jira, Linear or Slack"
- https://www.spurtest.com/book-a-demo -> Pilot Program, three phases, limited slots, no published terms
