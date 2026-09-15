"use client";

// The founder's side of the directory: describe a project, reach three
// agencies.
//
// SHORT ON PURPOSE. Eight fields, four of them a single click. A founder
// filling this in is doing a chore between two other chores, and every
// field added here is one more reason to close the tab and go back to
// emailing one studio they half remember.
//
// The confirmation is rendered in place rather than on its own route.
// Sending the names of three agencies through a URL would either put a
// founder's brief in their history or need a lookup on a page that has
// nothing else to do, and the state is already here.

import { useState } from "react";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import {
  BRIEF_MAX_CHARS,
  BUDGET_BANDS,
  PLATFORM_OPTIONS,
  TIMELINE_BANDS,
} from "@/lib/directory/claim-fields";
import { DIRECTORY_CATEGORIES } from "@/lib/directory/constants";
import styles from "./DirectoryForm.module.css";

const ENDPOINT = "/api/directory/match";

const SUBMIT_LABEL = "Send my brief";
const SUBMIT_PENDING_LABEL = "Sending…";
const GENERIC_ERROR = "Something went wrong. Try again in a minute.";

const BRIEF_PLACEHOLDER = "What are you building and what does done look like?";

/** What the endpoint answers with. */
type MatchResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  field?: string;
  usedFallbacks?: boolean;
  agencies?: Array<{ slug: string; name: string; path: string }>;
};

/** Everything the form holds. */
interface FormState {
  founderName: string;
  founderEmail: string;
  company: string;
  companyUrl: string;
  ycBatch: string;
  category: string;
  budget: string;
  timeline: string;
  platform: string;
  brief: string;
}

/**
 * The match request form.
 *
 * @param props - Component props.
 * @param props.defaultCategory - Prefilled from `?category=`, or from the
 *          profile an intro was requested on.
 * @param props.pinnedAgencySlug - An agency the founder asked for by name
 *          via "Request intro". It takes one of the three slots when it
 *          qualifies; the routing rule ignores it silently when it does
 *          not, rather than telling a founder their pick was excluded on
 *          a budget rule they cannot see.
 * @param props.pinnedAgencyName - Its name, for the copy.
 */
export default function MatchForm({
  defaultCategory,
  pinnedAgencySlug,
  pinnedAgencyName,
}: {
  defaultCategory?: string;
  pinnedAgencySlug?: string;
  pinnedAgencyName?: string;
}) {
  const [form, setForm] = useState<FormState>({
    founderName: "",
    founderEmail: "",
    company: "",
    companyUrl: "",
    ycBatch: "",
    category: defaultCategory ?? DIRECTORY_CATEGORIES[0]?.slug ?? "",
    budget: "",
    timeline: "",
    platform: "",
    brief: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [started, setStarted] = useState(false);
  const { trackEvent } = useAnalytics();

  try {
    /**
     * Updates one field, and reports the first interaction as the start
     * of the funnel.
     */
    function set<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
      setForm((current) => ({ ...current, [key]: value }));
      if (!started) {
        setStarted(true);
        try {
          trackEvent(AnalyticsEvents.MATCH_STARTED, {
            category: form.category,
            pinned: pinnedAgencySlug ?? null,
          });
        } catch {
          // Never let tracking interfere with typing.
        }
      }
    }

    /**
     * Submits the brief.
     *
     * @param event - The form submit event.
     */
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (status === "sending") return;
      setStatus("sending");
      setError(null);

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            pinnedAgency: pinnedAgencySlug ?? "",
            // Carried so a request that arrived from a campaign link is
            // attributable to it rather than lumped in with "directory".
            source: new URLSearchParams(window.location.search).get("utm_source") || "directory",
          }),
        });
        const payload = (await response.json().catch(() => null)) as MatchResponse | null;

        if (!response.ok || !payload?.ok) {
          setStatus("idle");
          setError(payload?.error ?? GENERIC_ERROR);
          return;
        }

        setResult(payload);
        setStatus("sent");
        trackEvent(AnalyticsEvents.MATCH_SUBMITTED, {
          category: form.category,
          budget: form.budget,
          timeline: form.timeline,
        });
        trackEvent(AnalyticsEvents.MATCH_ROUTED, {
          category: form.category,
          slugs: (payload.agencies ?? []).map((agency) => agency.slug),
          usedFallbacks: payload.usedFallbacks ?? false,
        });
      } catch {
        setStatus("idle");
        setError(GENERIC_ERROR);
      }
    }

    if (status === "sent" && result) {
      const names = (result.agencies ?? []).map((agency) => agency.name);
      return (
        <div className={styles.success}>
          <h2 className={styles.successHeading}>
            Sent to {names.join(", ")}.
          </h2>
          <p className={styles.successBody}>
            They have your brief and your email, and they will reach out directly. Expect replies
            within a few days.
          </p>
          <ul className={styles.successList}>
            {(result.agencies ?? []).map((agency) => (
              <li key={agency.slug} className={styles.successListItem}>
                <a className={styles.successLink} href={agency.path}>
                  {agency.name}
                </a>
              </li>
            ))}
          </ul>
          {result.usedFallbacks && (
            <p className={styles.hint}>
              Not all of these have claimed their listing yet, so their budgets and timelines are
              what their source directory published rather than what they told us. Worth confirming
              the numbers on your first call.
            </p>
          )}
        </div>
      );
    }

    return (
      <form className={`${styles.card} ${styles.cardWide}`} onSubmit={handleSubmit} noValidate>
        {pinnedAgencyName && (
          <p className={styles.intro}>
            We will put <strong>{pinnedAgencyName}</strong> at the top of your list and add two
            more agencies that fit the same brief.
          </p>
        )}

        <div className={styles.fields}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="match-name" className={styles.label}>
                Your name
              </label>
              <input
                id="match-name"
                className={styles.control}
                type="text"
                autoComplete="name"
                required
                value={form.founderName}
                onChange={(event) => set("founderName", event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="match-email" className={styles.label}>
                Email
              </label>
              <input
                id="match-email"
                className={styles.control}
                type="email"
                autoComplete="email"
                required
                value={form.founderEmail}
                onChange={(event) => set("founderEmail", event.target.value)}
              />
              <span className={styles.hint}>
                Shared with the three agencies so they can reply to you directly.
              </span>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="match-company" className={styles.label}>
                Company
              </label>
              <input
                id="match-company"
                className={styles.control}
                type="text"
                autoComplete="organization"
                required
                value={form.company}
                onChange={(event) => set("company", event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="match-company-url" className={styles.label}>
                Company URL <span className={styles.optional}>optional</span>
              </label>
              <input
                id="match-company-url"
                className={styles.control}
                type="text"
                inputMode="url"
                placeholder="yourcompany.com"
                value={form.companyUrl}
                onChange={(event) => set("companyUrl", event.target.value)}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="match-yc" className={styles.label}>
                YC batch <span className={styles.optional}>optional</span>
              </label>
              <input
                id="match-yc"
                className={styles.control}
                type="text"
                placeholder="W22"
                maxLength={12}
                value={form.ycBatch}
                onChange={(event) => set("ycBatch", event.target.value)}
              />
              <span className={styles.hint}>
                Unlocks the YC offers agencies have listed. Not required.
              </span>
            </div>
            <div className={styles.field}>
              <label htmlFor="match-category" className={styles.label}>
                What do you need?
              </label>
              <select
                id="match-category"
                className={`${styles.control} ${styles.select}`}
                value={form.category}
                onChange={(event) => set("category", event.target.value)}
                required
              >
                {DIRECTORY_CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="match-budget" className={styles.label}>
                Budget
              </label>
              <select
                id="match-budget"
                className={`${styles.control} ${styles.select}`}
                value={form.budget}
                onChange={(event) => set("budget", event.target.value)}
                required
              >
                <option value="">Pick a range</option>
                {BUDGET_BANDS.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="match-timeline" className={styles.label}>
                Timeline
              </label>
              <select
                id="match-timeline"
                className={`${styles.control} ${styles.select}`}
                value={form.timeline}
                onChange={(event) => set("timeline", event.target.value)}
                required
              >
                <option value="">Pick a timeline</option>
                {TIMELINE_BANDS.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="match-platform" className={styles.label}>
              Platform preference <span className={styles.optional}>optional</span>
            </label>
            <select
              id="match-platform"
              className={`${styles.control} ${styles.select}`}
              value={form.platform}
              onChange={(event) => set("platform", event.target.value)}
            >
              <option value="">No preference</option>
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="match-brief" className={styles.label}>
              Your brief
            </label>
            <textarea
              id="match-brief"
              className={`${styles.control} ${styles.textarea}`}
              maxLength={BRIEF_MAX_CHARS}
              required
              value={form.brief}
              onChange={(event) => set("brief", event.target.value)}
              placeholder={BRIEF_PLACEHOLDER}
            />
            <span
              className={`${styles.counter}${
                form.brief.length > BRIEF_MAX_CHARS ? ` ${styles.counterOver}` : ""
              }`}
            >
              {form.brief.length}/{BRIEF_MAX_CHARS}
            </span>
          </div>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={status === "sending"}>
            {status === "sending" ? SUBMIT_PENDING_LABEL : SUBMIT_LABEL}
          </button>
          <span className={styles.hint}>
            Goes to three agencies. No fee, and we take nothing from the project.
          </span>
        </div>
      </form>
    );
  } catch {
    return null;
  }
}
