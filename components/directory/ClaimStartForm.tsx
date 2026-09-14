"use client";

// The magic-link box: one email field, one button.
//
// Deliberately one field. Everything an agency could tell us waits until
// after the link is clicked, because this step exists to answer a single
// question - is this person at the agency - and adding a "tell us about
// yourself" box here would put work in front of the only thing that has
// to happen first.
//
// The domain rule is enforced server-side (lib/directory/claim-validation.ts).
// This file does NOT pre-check it in the browser: the message a mismatch
// produces has to name the agency's real domain, that comes back with the
// response, and a second copy of the rule here would be one more place
// for it to drift.

import { useState } from "react";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import styles from "./DirectoryForm.module.css";

const ENDPOINT = "/api/directory/claim/start";

const EMAIL_LABEL = "Your work email";
const SUBMIT_LABEL = "Email me the link";
const SUBMIT_PENDING_LABEL = "Sending…";
const OVERRIDE_LABEL = "Use a different domain?";

/** What the form shows once the link is on its way. */
const SENT_HEADING = "Check your inbox";

/** Fallback error when the response carries none, which should not
 *  happen but must not leave a form that silently does nothing. */
const GENERIC_ERROR = "Something went wrong. Try again in a minute.";

/** What the endpoint answers with. */
type StartResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  sentTo?: string;
  expectedDomain?: string | null;
  overrideMailto?: string;
};

/**
 * Email-entry step of the claim flow, used by both /directory/claim and
 * /directory/edit.
 *
 * @param props - Component props.
 * @param props.slug - The agency being claimed.
 * @param props.agencyName - Its display name, for the copy.
 * @param props.expectedDomain - The domain the address has to be at, when
 *          the record has one. Shown up front so somebody about to type a
 *          Gmail address is told before they submit, not after.
 * @param props.isEdit - True on /directory/edit, which changes the copy
 *          from "claim" to "edit" but nothing else about the flow.
 */
export default function ClaimStartForm({
  slug,
  agencyName,
  expectedDomain,
  isEdit = false,
}: {
  slug: string;
  agencyName: string;
  expectedDomain: string | null;
  isEdit?: boolean;
}) {
  // Hooks first, outside the try - a throw between two hook calls leaves
  // React with a shorter hook list than the previous render and the next
  // render crashes somewhere unrelated.
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [overrideMailto, setOverrideMailto] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  try {
    /**
     * Requests the magic link.
     *
     * @param event - The form submit event.
     */
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (status === "sending") return;

      setStatus("sending");
      setError(null);
      setOverrideMailto(null);

      try {
        trackEvent(AnalyticsEvents.CLAIM_STARTED, { slug, isEdit });

        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, email, edit: isEdit }),
        });
        const payload = (await response.json().catch(() => null)) as StartResponse | null;

        if (!response.ok || !payload?.ok) {
          setStatus("idle");
          setError(payload?.error ?? GENERIC_ERROR);
          setOverrideMailto(payload?.overrideMailto ?? null);
          return;
        }

        setSentTo(payload.sentTo ?? email);
        setStatus("sent");
        trackEvent(AnalyticsEvents.CLAIM_EMAIL_SENT, { slug, isEdit });
      } catch {
        setStatus("idle");
        setError(GENERIC_ERROR);
      }
    }

    if (status === "sent") {
      return (
        <div className={styles.success}>
          <h2 className={styles.successHeading}>{SENT_HEADING}</h2>
          <p className={styles.successBody}>
            We sent a link to <strong>{sentTo}</strong>. Open it and you can fill in{" "}
            {agencyName}&rsquo;s budget, timeline and platforms. It works once and expires in 24
            hours.
          </p>
          <p className={styles.hint}>
            Nothing in the inbox after a minute? Check spam, then try again - some agency mail
            filters hold first-time senders.
          </p>
        </div>
      );
    }

    return (
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <p className={styles.intro}>
          {isEdit
            ? `We will email a link to edit ${agencyName}'s listing.`
            : `We will email a link to claim ${agencyName}'s listing.`}{" "}
          {expectedDomain
            ? `Use an address at ${expectedDomain} so we can verify you run it.`
            : "Use your work email so we can verify you run it."}
        </p>

        <div className={styles.field}>
          <label htmlFor="claim-email" className={styles.label}>
            {EMAIL_LABEL}
          </label>
          <input
            id="claim-email"
            className={styles.control}
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            placeholder={expectedDomain ? `you@${expectedDomain}` : "you@youragency.com"}
            onChange={(changeEvent) => setEmail(changeEvent.target.value)}
          />
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
            {overrideMailto && (
              <a className={styles.errorAction} href={overrideMailto}>
                {OVERRIDE_LABEL}
              </a>
            )}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submit}
            disabled={status === "sending" || email.trim().length === 0}
          >
            {status === "sending" ? SUBMIT_PENDING_LABEL : SUBMIT_LABEL}
          </button>
        </div>
      </form>
    );
  } catch {
    return null;
  }
}
