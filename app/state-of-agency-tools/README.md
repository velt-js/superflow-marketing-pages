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

1. Build the form in Tally (guide below).
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

Question flow (23 core + gated extras; worst case 30). Q3 is the gate:

| # | Question | Type | Gate |
|---|---|---|---|
| 1 | What best describes you? | single | all |
| 2 | Team size, including contractors? | single | all |
| 3 | Which services do you offer? | multi | all - gates below |
| 4 | Which platforms do you build client sites on? | multi | web |
| 5 | Your primary platform? | single (from Q4) | web |
| 6 | Would you choose it again for your next project? | single | web |
| 7 | Which design tools does your team use? | multi | web OR branding |
| 8 | Which video tools do you use? | multi | video |
| 9 | How does client feedback on creative work usually reach you? | multi | all |
| 10 | Do you use a dedicated review/approval tool? | multi | all |
| 11 | On a typical website project, how many rounds of client revisions? | single | all |
| 12 | Do you QA websites before launch? | single | all |
| 13 | Which PM tools does your team use? | multi | all |
| 14 | Your primary PM tool? | single | all |
| 15 | Would you choose it again? | single | all |
| 16 | What do you use for time tracking, resourcing, profitability? | multi | all |
| 17 | Do you know your profit margin per client? | single | all |
| 18 | Do you use an AI notetaker on client calls? | multi | all |
| 19 | Where does day-to-day client communication happen? | multi | all |
| 20 | Which tools do you use for SEO and client reporting? | multi | SEO OR paid ads |
| 21 | Which social tools do you use? | multi | social |
| 22 | Which email platforms do you run for clients? | multi | email/CRM |
| 23 | Which AI assistants does your team use for work? | multi | all |
| 24 | Which do you actually pay for? | multi | all |
| 25 | Which AI creative/production tools do you use? | multi | all |
| 26 | Roughly what share of client deliverable work does AI touch today? | single | all |
| 27 | Do you tell clients when AI is involved in their work? | single | all |
| 28 | Which tool do you resent paying for? | open text, one line | all |
| 29 | Annual revenue? | single, optional | all |
| 30 | Where is your agency based? | single | all |
| 31 | Do you focus on specific industries? | multi, optional | all |
| 32 | Email to get the report first (optional) + "OK to contact me" checkbox | email | all |

Full option lists are in the survey spec (source of truth for options:
whoever builds the Tally form copies them from the spec doc). Gating in
Tally: add conditional logic on each gated page - "show this page if Q3
contains X". The AI section (23-27) deliberately runs late; firmographics
(29-31) come last.

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
