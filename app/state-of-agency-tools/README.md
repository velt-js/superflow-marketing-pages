# State of Agency Tools 2026

Survey landing page + results report for the annual agency-stack survey.

- `/state-of-agency-tools` - survey page (Tally form embedded)
- `/state-of-agency-tools/report` - results report (noindex until real data)

## Why Tally embed, not a custom form + Firebase

The question came up whether to build the questionnaire ourselves on Firebase
or embed existing form software. We embed, on purpose:

**The form is commodity; the report is the asset.** Everything the survey
needs - one question per screen, auto-advance on click, conditional logic
(Q3 gates four sections), "Other" write-ins, partial-response capture, spam
filtering, mobile polish, CSV export - is a solved problem in Tally's free
tier. Rebuilding it custom is 2-3 weeks of work plus a database, security
rules, abuse protection, and an ongoing maintenance surface. Worse, a bug in
custom survey infra silently loses responses, and a survey dataset with holes
in it cannot be re-collected. The one thing a custom build would buy -
pixel-perfect branding inside the form - is not worth that risk for a
5-minute survey.

**Firebase adds nothing this project needs.** There is no live dashboard
requirement: results publish once, in November, as a static report. Tally's
CSV export (or its webhook, if we ever want row-level capture) is the entire
"database". The custom-dev budget goes into the report page instead, which is
the piece that gets shared, linked, and remembered - and it lives in this
repo where we control every pixel.

If v2 ever needs live results or bespoke interactions, revisit then. Not for
v1.

## Launch checklist

1. Create the form via the API script (preferred - it builds all 32
   questions, pages, gate logic, hidden UTM fields, and settings):

   ```bash
   TALLY_API_KEY=tly-xxxx node scripts/agency-tools-survey/create-tally-form.mjs
   ```

   Keys come from https://tally.so/settings/api-keys (Pro). The form is
   created as a DRAFT; spot-check the gate rules in the editor (pages Q3,
   Q7, Q19-21), then publish. `--dry-run` prints the payload without
   calling the API; `--no-logic` omits the gate rules if you would rather
   click them together by hand. (Manual build guide below, as fallback.)
2. Paste the form ID into `lib/agency-tools-survey/config.ts`
   (`TALLY_FORM_ID`). Until then the page shows a "survey opens shortly"
   panel instead of the embed.
3. The survey page is already in the sitemap; the report page is noindex
   until real data lands.

## Tally build guide

Form settings:

- **One question per page** (Layout: one question at a time).
- **Auto-jump to next page** ON for single-select questions, so every answer
  is one tap. Multi-selects keep an explicit Next button.
- Intro page copy: "How does your stack compare to 500+ agencies? 5 minutes,
  all taps. Get the full report first, free, in November."
- Add hidden fields `utm_source`, `utm_medium`, `utm_campaign` so channel
  attribution survives into the export. The embed passes the page URL's
  params through automatically.
- Every tool list ends with "Other" as a write-in option.
- Collect partial submissions ON (Tally Pro) if available - the drop-off
  point is itself useful data.

Question flow (28 core + gated extras; worst case 36, full service). The
structure mirrors the categories an agency runs on - the crafts it sells,
then ops, finance, payroll, sales, client management, review & QA, AI,
firmographics. Q3 is the gate; "Full service" opens every gate. Review & QA
sits deliberately in the back half: it is the stat factory and lands better
on invested respondents.

| # | Section | Question | Type | Gate |
|---|---|---|---|---|
| 1 | You | What best describes you? | single | all |
| 2 | You | Team size, including contractors? | single | all |
| 3 | You | Which services do you offer? | multi | all - gates below |
| 4 | Web | Which platforms do you build client sites on? | multi | web |
| 5 | Web | Your primary platform? | single | web |
| 6 | Web | Would you choose it again for your next project? | single | web |
| 7 | Design | Which design tools does your team use? | multi | web OR branding |
| 8 | Video | Which video tools do you use? | multi | video |
| 9 | SEO | Which tools do you use for SEO and client reporting? | multi | SEO OR paid ads |
| 10 | Social | Which social tools do you use? | multi | social |
| 11 | Email | Which email platforms do you run for clients? | multi | email/CRM |
| 12 | Ops | Which PM tools does your team use? | multi | all |
| 13 | Ops | Your primary PM tool? | single | all |
| 14 | Ops | Would you choose it again? | single | all |
| 15 | Finance | What do you use for time tracking and resourcing? | multi | all |
| 16 | Finance | Do you know your profit margin per client? | single | all |
| 17 | Finance | What do you use for accounting and invoicing? | multi | all |
| 18 | Finance | How do you pay your team and contractors? | multi | all |
| 19 | Sales | Which tools run your sales pipeline and CRM? | multi | all |
| 20 | Sales | What do you use for proposals, contracts, and e-signatures? | multi | all |
| 21 | Clients | Where does day-to-day client communication happen? | multi | all |
| 22 | Clients | Do you use an AI notetaker on client calls? | multi | all |
| 23 | Review & QA | How does client feedback on creative work usually reach you? | multi | all |
| 24 | Review & QA | Do you use a dedicated review/approval tool? | multi | all |
| 25 | Review & QA | On a typical website project, how many rounds of client revisions? | single | all |
| 26 | Review & QA | Do you QA websites before launch? | single | all |
| 27 | AI | Which AI assistants does your team use for work? | multi | all |
| 28 | AI | Which do you actually pay for? | multi | all |
| 29 | AI | Which AI creative/production tools do you use? | multi | all |
| 30 | AI | Roughly what share of client deliverable work does AI touch today? | single | all |
| 31 | AI | Do you tell clients when AI is involved in their work? | single | all |
| 32 | Last bits | Which tool do you resent paying for? | open text | all |
| 33 | Last bits | Annual revenue? | single, optional | all |
| 34 | Last bits | Where is your agency based? | single | all |
| 35 | Last bits | Do you focus on specific industries? | multi, optional | all |
| 36 | Last bits | Email for early report + consent checkbox | email, optional | all |

Option lists live in the generator script (the source of truth). Category
coverage was checked against agency-stack roundups: CRM/sales, PM, time and
resourcing, finance (accounting/invoicing), payroll and contractor
payments, proposals/contracts, communication, the delivery crafts, and AI
are each their own question or section.

Cut from v1, do not add back: sales/proposal tools, software spend per
seat, biggest review pain, AI pricing/hiring/blocker questions, trusted AI
tasks, primary notetaker, notetaker objections, "tool you'd fight to keep",
pricing model, client count. They are reserved for the 2-minute follow-up
survey to opted-in respondents, or v2 next year.

## Publishing the real report (November)

The report page renders `lib/agency-tools-survey/report-data.ts`. To
publish:

1. Export responses from Tally as CSV.
2. Aggregate into the `ReportData` shapes (percent shares per option;
   quadrants join usage share with the would-choose-again rate among that
   tool's users; use-vs-pay joins Q23 and Q24 by assistant; Q28 write-ins
   are normalized and counted by hand).
3. Replace the sample numbers, set `sample: false`, update `respondents`
   and `publishedLabel`.
4. `sample: false` automatically drops the banner and the noindex. Add the
   report to the sitemap's static page list at that point, and consider an
   OG image via `scripts/og-image`.

Chart conventions (see `components/agency-survey-2026/charts/`): series
palette `#2f8fe8 / #d95590 / #cc7a22`, validated with the dataviz
six-checks against both light and dark surfaces; bars are direct-labeled;
quadrants ship a table view. Keep new charts on those rails.

Editorial rule for the report: **review and QA is one section among
several, never the spine.** The page runs stack -> ops and money -> new
business -> client management -> review and QA -> AI -> most resented
tool, and the four headline tiles deliberately pull from four different
parts of the business. A report that bends every section back to review
reads as a Superflow pitch and stops being the industry benchmark
agencies want to share.
