# State of Agency Tools 2026

- `/state-of-agency-tools`: landing page and Tally embed.
- `/state-of-agency-tools/report`: report preview. Keep noindex while sample data is shown.
- Questionnaire source of truth: **published Tally form ODqdPK**, verified **2026-09-08**.

The questionnaire is maintained in Tally. This repo owns the marketing page,
report presentation and illustrative fixtures. Do not recreate or overwrite the
published form from the historical `scripts/agency-tools-survey/create-tally-form.mjs`
generator: it predates the consolidation, optional business module, AI matrix,
separate contact choices, and sales/support additions. Its option lists are not
the current specification.

## Landing-page promises

Keep the introduction short:

> Which agency tools are worth keeping?
> Share your team's tools. Get the free report in November 2026.
>
> By Superflow. Contact details are optional. We publish combined results only.

Do not advertise a fixed total question count, a tested completion time, an
all-single-click experience, or a participant count without evidence. Branches,
multi-selects, an AI matrix and optional write-ins make the paths different.
The business-tools opt-in currently opens **eight** optional questions.

Email is optional unless a respondent requests the report or product help. When
provided, it is stored with that response and used for the selected follow-up.
Report delivery and Superflow help are independent unchecked choices. Do not
promise unconditional anonymity or treat report-only signups as product leads.
Hidden `utm_source`, `utm_medium` and `utm_campaign` fields remain unchanged.

## Current question map

Names describe the current fields; numbering is not used for aggregation because
it changes when questions are added or consolidated. Only role, team size and
services are required research fields. Use exported field identifiers where
available and archive the questionnaire version with each export.

| Area | Question / measure | Routing |
| --- | --- | --- |
| Profile | Main role | All |
| Profile | Team size including self and contractors | All |
| Profile | Services offered | All; routes service questions |
| Websites | All platforms used for client sites | Website services / full service |
| Websites | Would choose the same platform stack again: all / some / none / unsure | Selected platforms |
| Design | Design tools | Relevant service branch |
| Video | Video editing and motion tools | Video branch; Runway/Descript are in AI production |
| Marketing | SEO and client reporting tools | SEO / paid ads branch |
| Marketing | Social media tools | Social branch |
| Marketing | Email platforms run for clients | Email/CRM branch |
| Operations | All project-management tools used | All |
| Operations | Would choose the same PM stack again: all / some / none / unsure | Tool selected, excluding no-tool answers |
| Optional module | Opt into operations, finance, sales and support | Opens the next eight questions |
| Business 1 | Time tracking and resourcing tools | Optional business module |
| Business 2 | How profit is tracked by client | Optional business module |
| Business 3 | Accounting and invoicing tools | Optional business module |
| Business 4 | Payroll / contractor payment tools | Optional business module |
| Business 5 | CRM and sales tracking for the agency itself | Optional business module |
| Business 6 | Finding and contacting potential clients for the agency itself | Optional business module |
| Business 7 | Proposals, contracts and e-signatures | Optional business module |
| Business 8 | Ongoing client support tools, not creative feedback | Optional business module |
| Clients | AI notetakers used on client calls | All |
| Review | How client feedback and approvals are collected | All |
| Review | Dedicated review/approval tool names | Selected dedicated review tool |
| Websites | Revision rounds on the most recent completed website project | Website branch |
| Websites | Written checklist / pre-launch checking practice | Website branch |
| AI | Assistant grid: not used / used agency-paid / used not agency-paid / used payment unknown | All; one status per tool |
| AI | Other assistant name | Other assistant used |
| AI | AI-powered tools for creating/editing client work | All |
| AI | AI share of deliverables completed in the past 30 days | All |
| AI | How often clients are told about AI involvement | Excludes 0%, no deliverables and skipped prior answer |
| Workflow | Where client work most often got held up in the past 30 days | All |
| Value | Which paid tool feels least worth its cost | Optional short write-in |
| Profile | 2025 revenue in USD | Optional |
| Profile | Agency location | Optional |
| Profile | Industry focus | Optional |
| Follow-up | Receive the November report | Optional checkbox |
| Follow-up | Request help trying Superflow on one site | Separate optional checkbox |
| Follow-up | Next website review timing | Product-help opt-in only |
| Contact | Email | Required only for either requested follow-up |

The broad open-ended "biggest challenge" question, workflow automation,
software spend, dropped tools and missing-tool catch-all were discussed but
are **not in the published form** at this verification date. Do not advertise
or invent report results for them until they are added in Tally.

### Sales/support options added

CRM retains HubSpot, Pipedrive, Close, Salesforce and Attio, and now includes
HighLevel (GoHighLevel), Zoho CRM, HoneyBook and Dubsado. Notion/spreadsheets,
no-CRM inbox use, Other and Not sure remain explicit alternatives.

Prospecting/outreach includes LinkedIn Sales Navigator, Apollo, Clay,
Instantly, Smartlead, lemlist, Hunter, HeyReach, built-in CRM tools,
no prospecting software, Other and Not sure.

Ongoing support includes Zendesk, Freshdesk, Help Scout, Front, Intercom,
HubSpot Service Hub and Zoho Desk. Alternatives cover email/messaging,
project tools or a client portal, no ongoing support, Other and Not sure.

These are distinct workflows, not duplicate "main tool" questions. An agency
can use the same vendor across workflows; do not force exclusive vendor use.

## Report data contract and interpretation

`lib/agency-tools-survey/report-data.ts` supplies typed sections and chart
fixtures. Every chart has a stable ID, audience description, answer count,
single/multi-select flag and option percentages. AI assistant fixtures retain
**counts for all four statuses**, plus a per-row denominator. The paired view
is derived with `assistantUsePay`, not stored as a second source of truth.

- **Multi-select:** denominator is eligible respondents who answered that
  question. Count a respondent once per option, not once per selection.
  Totals can exceed 100%. Missing/skipped is not the same as None.
- **Optional business module:** do not use all submissions as the denominator.
  Non-opt-ins did not answer these questions. State n separately for CRM,
  outreach, proposals, support and each other business question.
- **Satisfaction:** the website and PM questions rate the entire selected
  stack. "Some, but not all" cannot be attributed to a specific product.
  Use adoption bars plus category-level satisfaction distributions, never
  the old per-tool usage/loyalty quadrants. The standalone legacy quadrant
  component is retained but is not used by the report.
- **Feedback:** the old broad client-communication question was removed.
  Use the combined feedback-and-approvals field; do not invent a second
  email/Slack communication dataset. Dedicated review-tool names are gated,
  so their n is only the respondents shown that follow-up who answered it.
- **Notetakers:** tool adoption by respondents, not percentage of client calls.
- **Profit:** tracking method, not knowledge of an exact client profit margin.
- **Revisions:** latest completed website project; retain 0, 4-5, 6+, Not sure
  and no completed project. Do not publish an exact average from open-ended
  or grouped ranges without explicit justified assumptions.
- **Website QA:** checklist/checking practice, not an automation split, bug
  rate, or proof that sites without written checklists get no QA.
- **AI assistants:** used = agency-paid + not agency-paid + payment unknown.
  Agency-paid includes reimbursements and paid bundles. Not agency-paid may
  mean personally paid, not necessarily free. Exclude skipped rows from n;
  keep the explicit Not used response. Never fill unknowns as zeros.
- **AI disclosure:** conditional audience, not every agency. Retain Not sure
  and Prefer not to say; remove the former client-policy response options.
- **Value:** normalize optional tool-name write-ins and count mentions. These
  are not negative ratings from all users of a vendor. Preview rankings use
  generic names to avoid fictional negative claims about real companies.
- **Segmentation:** use role, size, services, region, optional revenue and
  industry only when a useful, privacy-preserving sample exists. Report the
  sampling/recruitment method and do not claim population representativeness.
- **Contact fields:** exclude emails, contact opt-ins and product qualification
  answers from public report datasets.

## Publishing real results

1. Export completed responses from Tally with a questionnaire snapshot.
   Decide and document deduplication and eligibility rules. Do not silently
   mix partial submissions into completed-response counts.
2. Map fields/options by identifier and version. Old and new wording may
   measure different things; do not combine pre-edit answers blindly.
3. Aggregate into the typed report shapes using the rules above. Replace
   **all** illustrative values, audience counts and placeholder nominations.
   Current fixtures cover a fictional dataset, not current response counts.
4. Review every chart against the export, including nonresponses, exclusive
   None/Not-sure selections and routing. Flag contradictory selections
   rather than silently deciding what the respondent meant.
5. Run the checks below and the full application build. Only after reviewing
   actual results, set `sample: false`, update `respondents` and
   `publishedLabel`, and add the report route to the sitemap. The sample
   flag controls metadata noindex, title, banner and per-chart sample labels.

No form changes, emails or follow-up automations are performed by these pages.

## Checks

```bash
node --test scripts/agency-tools-survey/report.test.mjs
npm run build
```

The focused Node tests use the existing TypeScript dev dependency. They check
fixture consistency, current categories/options, removal of stale claims and
TS/TSX syntax. They do not replace a Next.js production build or browser QA.
Confirm the embed, optional module, mobile layout, table scrolling and links
in a deployed preview before merging.
