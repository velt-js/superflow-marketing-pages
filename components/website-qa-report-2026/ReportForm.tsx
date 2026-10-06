"use client";

// The report form, and the thank-you state that replaces it.
//
// Rendered twice on the page (hero and closing CTA). Both copies share one
// store, so submitting either flips both to the thank-you state.
//
// Progressive enhancement: the server-rendered <form> posts to the lead
// endpoint by itself, which answers a plain form post with the PDF. A browser
// whose JavaScript never hydrates (an old cached page, a blocked chunk) still
// gets the report. With JavaScript, the submit is intercepted, errors show
// inline, and the thank-you state appears in place with no redirect.

import { useId, useRef, useState, type FormEvent } from "react";
import { QaReportEvents } from "@/lib/analytics/events";
import {
  REPORT_FILES,
  REPORT_FORMAT_LINE,
  ROLE_OPTIONS,
  benchmarkLabel,
  signupUrl,
} from "@/lib/website-qa-report/report";
import {
  claimFormStart,
  getAttribution,
  setResult,
  trackReport,
  useReportState,
  utmParams,
  type SubmitResult,
} from "./report-store";
import styles from "./Report.module.css";

const ENDPOINT = "/api/leads/state-of-website-qa";
const HONEYPOT = "company_fax";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

type FieldErrors = Partial<Record<"email" | "website", string>>;

/** Starts a download without leaving the page. */
function startDownload(href: string): void {
  try {
    const link = document.createElement("a");
    link.href = href;
    link.download = "";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch {
    // The "Download the PDF" button is right there.
  }
}

/** Client-side check, for instant feedback. The server decides. */
function validate(email: string, website: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email) errors.email = "Enter your work email.";
  else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email, like you@youragency.com.";
  }
  if (website && (/\s/.test(website) || !website.includes("."))) {
    errors.website = "Enter a website like youragency.com, or leave it blank.";
  }
  return errors;
}

export function ReportForm({ id }: { id: string }) {
  const { benchmark, result } = useReportState();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const website = String(form.get("website") ?? "").trim();
    const role = String(form.get("role") ?? "");

    const found = validate(email, website);
    setErrors(found);
    if (found.email) return emailRef.current?.focus();
    if (found.website) return websiteRef.current?.focus();

    setSubmitting(true);
    const attribution = getAttribution();
    let outcome: SubmitResult = { downloadUrl: REPORT_FILES.pdf, emailSent: false, from: id };

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website,
          role,
          ...attribution,
          benchmark_rounds: benchmark,
          page: "/state-of-website-qa",
          [HONEYPOT]: String(form.get(HONEYPOT) ?? ""),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: FieldErrors;
        downloadUrl?: string;
        emailSent?: boolean;
      };

      if (response.status === 400 && body.errors) {
        setErrors(body.errors);
        setSubmitting(false);
        if (body.errors.email) emailRef.current?.focus();
        else websiteRef.current?.focus();
        return;
      }

      if (response.ok && body.ok) {
        outcome = {
          downloadUrl: body.downloadUrl || REPORT_FILES.pdf,
          emailSent: Boolean(body.emailSent),
          from: id,
        };
        trackReport(QaReportEvents.SUBMITTED, {
          role: role || null,
          has_website: website.length > 0,
          benchmark_rounds: benchmark || null,
        });
      } else {
        console.error(`[qa-report] lead endpoint answered ${response.status}`);
      }
    } catch (error) {
      // Network or server failure. Never leave someone stuck: they still get
      // the report, just without the email copy.
      console.error("[qa-report] lead submit failed:", error);
    }

    setResult(outcome);
    setSubmitting(false);
    startDownload(outcome.downloadUrl);
    trackReport(QaReportEvents.DOWNLOADED, { location: "page", trigger: "auto" });
  }

  try {
    if (result) {
      return <ThankYou id={id} result={result} benchmark={benchmark} />;
    }

    const emailError = `${uid}-email-error`;
    const websiteError = `${uid}-website-error`;

    return (
      <form
        id={id}
        className={styles.form}
        action={ENDPOINT}
        method="post"
        onSubmit={onSubmit}
        // Inline errors replace the browser's bubbles once the script runs.
        // Set here rather than as an attribute so a page without JavaScript
        // keeps native validation.
        ref={(node) => {
          if (node) node.noValidate = true;
        }}
        aria-label="Get the report"
      >
        <div className={styles.field}>
          <label htmlFor={`${uid}-email`} className={styles.label}>
            Work email
          </label>
          <input
            ref={emailRef}
            id={`${uid}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            required
            maxLength={254}
            placeholder="you@youragency.com"
            className={styles.input}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? emailError : undefined}
            onFocus={() => {
              if (claimFormStart()) trackReport(QaReportEvents.FORM_STARTED);
            }}
            onChange={() => errors.email && setErrors((e) => ({ ...e, email: undefined }))}
          />
          {errors.email ? (
            <p id={emailError} className={styles.fieldError}>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor={`${uid}-website`} className={styles.label}>
              Agency website <span className={styles.optional}>(optional)</span>
            </label>
            <input
              ref={websiteRef}
              id={`${uid}-website`}
              name="website"
              type="text"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={200}
              placeholder="youragency.com"
              className={styles.input}
              aria-invalid={errors.website ? true : undefined}
              aria-describedby={errors.website ? websiteError : undefined}
              onChange={() => errors.website && setErrors((e) => ({ ...e, website: undefined }))}
            />
            {errors.website ? (
              <p id={websiteError} className={styles.fieldError}>
                {errors.website}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor={`${uid}-role`} className={styles.label}>
              Your role <span className={styles.optional}>(optional)</span>
            </label>
            <select id={`${uid}-role`} name="role" className={styles.select} defaultValue="">
              <option value="">Choose one</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hidden fields, for a post made without JavaScript. With it, the
            same values are read from the URL at submit time. */}
        <input type="hidden" name="page" value="/state-of-website-qa" />
        <input type="hidden" name="benchmark_rounds" value={benchmark} />

        {/* Honeypot. Off-screen, unlabelled for people, skipped by tab. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label>
            Fax number
            <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <button type="submit" className={styles.primaryButton} disabled={submitting}>
          {submitting ? "Getting your report..." : "Get the report"}
        </button>
        <p className={styles.formNote}>{REPORT_FORMAT_LINE}</p>
      </form>
    );
  } catch {
    return null;
  }
}

function ThankYou({
  id,
  result,
  benchmark,
}: {
  id: string;
  result: SubmitResult;
  benchmark: ReturnType<typeof useReportState>["benchmark"];
}) {
  const focused = useRef(false);

  try {
    const { source } = getAttribution();
    const scanHref = signupUrl({ source, ...utmParams() });

    return (
      <div id={id} className={styles.thanks}>
        <h3
          ref={(node) => {
            // Move focus to the new content in the copy that was submitted,
            // so a keyboard or screen reader user is not left on a button
            // that no longer exists. The other copy changes silently.
            if (node && result.from === id && !focused.current) {
              focused.current = true;
              node.focus({ preventScroll: true });
            }
          }}
          tabIndex={-1}
          className={styles.thanksTitle}
        >
          Your report is ready.
        </h3>
        <a
          href={result.downloadUrl}
          download
          className={styles.primaryButton}
          onClick={() => trackReport(QaReportEvents.DOWNLOADED, { location: "page" })}
        >
          Download the PDF
        </a>
        {result.emailSent ? (
          <p className={styles.thanksLine}>We also sent a copy to your inbox.</p>
        ) : null}
        {benchmark ? (
          <p className={styles.thanksLine}>
            You said your sites take {benchmarkLabel(benchmark)} rounds. Chapter 7 shows what fills
            them.
          </p>
        ) : null}

        <div className={styles.scanCard}>
          <p className={styles.scanTitle}>Want to see what the agents would catch on your site?</p>
          <p className={styles.scanLine}>Start free. 500 AI credits included.</p>
          <a
            href={scanHref}
            className={styles.secondaryButton}
            onClick={() => trackReport(QaReportEvents.SCAN_CLICKED)}
          >
            Scan your website
          </a>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
