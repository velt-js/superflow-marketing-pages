// State of Agency Tools 2026 - survey configuration.
//
// The questionnaire itself lives in Tally (form software), not in this repo.
// We deliberately did NOT build a custom form + Firebase backend: the form is
// commodity infrastructure (conditional logic, auto-advance, partial-response
// handling, spam filtering, CSV export all come free), while the report is the
// marketing asset and gets the custom build. Rationale and the full Tally
// build guide: app/state-of-agency-tools/README.md.

/**
 * Tally form ID for the survey embed.
 *
 * Paste the ID from the form's share URL once the form is built in Tally:
 * https://tally.so/r/<ID>  ->  TALLY_FORM_ID = "<ID>"
 *
 * While this is empty the survey page renders a "survey opens soon" panel
 * instead of a broken iframe, so the page can ship ahead of the form.
 */
export const TALLY_FORM_ID = "";

/** Where the survey page lives. Shared by metadata, sitemap, and links. */
export const SURVEY_PATH = "/state-of-agency-tools";

/** Where the results report lives. Noindex until real data replaces sample. */
export const REPORT_PATH = "/state-of-agency-tools/report";
