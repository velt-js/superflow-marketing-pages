// State of Agency Tools 2026 - survey configuration.
//
// The questionnaire itself lives in Tally (form software), not in this repo.
// We deliberately did NOT build a custom form + Firebase backend: the form is
// commodity infrastructure (conditional logic, auto-advance, partial-response
// handling, spam filtering, CSV export all come free), while the report is the
// marketing asset and gets the custom build. Rationale and the full Tally
// build guide: app/state-of-agency-tools/README.md.

/**
 * Tally form ID for the survey embed (https://tally.so/r/<ID>).
 *
 * The form was created via scripts/agency-tools-survey/create-tally-form.mjs
 * and is a DRAFT until published in the Tally editor - the embed 404s until
 * then, so publish before merging this page live. Set to "" to fall back to
 * the "survey opens soon" panel.
 */
export const TALLY_FORM_ID = "ODqdPK";

/** Where the survey page lives. Shared by metadata, sitemap, and links. */
export const SURVEY_PATH = "/state-of-agency-tools";

/** Where the results report lives. Noindex until real data replaces sample. */
export const REPORT_PATH = "/state-of-agency-tools/report";
