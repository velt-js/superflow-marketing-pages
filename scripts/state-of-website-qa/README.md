# The State of Website QA 2026

`/state-of-website-qa`: the report page, its lead form and the one email.

| Piece | Where |
| --- | --- |
| Numbers and report copy (page, `.md` copy, email, JSON-LD) | `lib/website-qa-report/report.ts` |
| Page | `app/state-of-website-qa/page.tsx` |
| Benchmark, form, thank-you, share buttons | `components/website-qa-report-2026/` |
| Lead endpoint | `app/api/leads/state-of-website-qa/route.ts` |
| Email download link (counts `qa_report_downloaded`, location `email`) | `app/state-of-website-qa/download/route.ts` |
| Lead store and email (Customer.io) | `lib/website-qa-report/customerio.ts`, `email.ts` |
| Tests | `tests/website-qa-report/report.spec.ts` |

Every number on the page must come from the approved table in the brief.
`report.ts` says so at the top; keep it that way. No em dashes in any copy.

## Swapping in the real files

The files in `public/reports/` are marked PLACEHOLDER. Replace them in place,
same names:

- `state-of-website-qa-2026.pdf`
- `state-of-website-qa-2026-cover.png` (portrait, 5.5 x 8.5; 1100 x 1700 px)
- `preview-1.png` (cover), `preview-2.png` (What reviewers flag),
  `preview-3.png` (Review rounds), same size as the cover

Then rebuild the social card from the real cover:

```bash
node scripts/state-of-website-qa/generate-assets.mjs
```

Do not pass `--placeholders` after that: it overwrites the real files.

## Turning on the lead store and the email

Until these are set the form still works and still hands over the PDF; it
just stores nothing and sends nothing, and logs that it skipped.

1. In Customer.io (workspace 130244), create a transactional message
   (Transactional > Create message, email). Its subject and body are
   replaced by the copy in `lib/website-qa-report/email.ts` on every send, so
   the template only needs a verified From address (Rakesh). Note its id.
2. In the Vercel project environment, set:
   - `CUSTOMERIO_SITE_ID`, `CUSTOMERIO_TRACK_API_KEY` (Track API credentials)
   - `CUSTOMERIO_APP_API_KEY` (App API key)
   - `CUSTOMERIO_QA_REPORT_MESSAGE_ID` (the id from step 1)
   - `CUSTOMERIO_REGION=eu` only if the workspace is in the EU region
3. Submit the form once on a preview deploy and check the person in
   Customer.io carries `lead_magnet: state-of-website-qa-2026` and a
   `qa_report_requested` event with every form field.

The lead is a person identified by email plus a `qa_report_requested` event.
The event holds all the fields (source, UTMs, referrer, role, website,
benchmark answer, page). The person gets only `lead_magnet` and
`qa_report_*` attributes, so it never overwrites attributes the app sets on
existing users. Check no running campaign is triggered by "person created"
before going live, or report leads will enter it.

`UPSTASH_REDIS_REST_URL` / `_TOKEN` (already used by the free tools) make the
10-per-hour per-IP limit shared across instances.

## Analytics

Events (`QaReportEvents` in `lib/analytics/events.ts`) go to the existing
Amplitude project. All carry `source`. `qa_report_downloaded` fires on the
automatic download after submit (`trigger: "auto"`), on the Download button,
and server-side from the email link (`location: "email"`).
