"use client";

// The enrich form: everything an agency tells a founder about how it
// takes work.
//
// FIELD ORDER IS DELIBERATE and matches the profile page it feeds. Budget
// comes second, right after the blurb, because it is the field the whole
// campaign was about and the one most likely to be the only thing
// somebody fills in. The YC offer sits near the end with a nudge, because
// it is the field agencies skip and the one founders filter on hardest.
//
// EVERY FIELD IS OPTIONAL. An agency that only wants to state a minimum
// should be able to submit after typing one number. The API applies the
// same caps this form counts against (lib/directory/claim-validation.ts);
// the counters here are a typing aid, not the enforcement.

import { useState } from "react";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import {
  DECLINES_MAX_CHARS,
  DESCRIPTION_MAX_CHARS,
  PLATFORM_OPTIONS,
  RESPONSE_SLA_OPTIONS,
  SERVICES_MAX,
  SERVICE_TAG_MAX_CHARS,
  STARTUP_CLIENTS_MAX,
  STARTUP_CLIENT_MAX_CHARS,
  YC_OFFER_MAX_CHARS,
} from "@/lib/directory/claim-fields";
import type { AgencyClaim, AgencyPlatform } from "@/lib/directory/types";
import TagInput from "./TagInput";
import styles from "./DirectoryForm.module.css";

const ENDPOINT = "/api/directory/claim/submit";

const SUBMIT_LABEL = "Save and publish";
const SUBMIT_PENDING_LABEL = "Saving…";
const GENERIC_ERROR = "Something went wrong. Your link still works, so try again in a minute.";

/** The one-line nudge under the YC offer field. Agencies leave this blank
 *  by default and then wonder why founders skip them; naming the lowest
 *  possible offer makes it answerable in five seconds. */
const YC_OFFER_NUDGE =
  "Founders filter by this. Even a free scoping call counts.";

/** What the submit endpoint answers with. */
type SubmitResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  profilePath?: string;
  verified?: boolean;
};

/** Everything the form holds, as strings - number inputs post strings and
 *  the API coerces, so keeping them as typed here avoids a controlled
 *  input flipping to uncontrolled when a field is cleared. */
interface FormState {
  description: string;
  minBudgetUsd: string;
  typicalBudgetMin: string;
  typicalBudgetMax: string;
  typicalTimelineWeeks: string;
  platforms: AgencyPlatform[];
  services: string[];
  declines: string;
  startupClients: string[];
  ycOffer: string;
  contactName: string;
  contactEmail: string;
  responseSlaDays: string;
  acceptingProjects: boolean;
}

/**
 * Seeds the form from whatever we already hold.
 *
 * Prefills from the claim when there is one, and from the scraped record
 * otherwise - an agency editing its listing should see what it wrote last
 * time, and one claiming for the first time should see the blurb its
 * source published rather than an empty box it has to fill from scratch.
 *
 * @param params - The existing claim, the scraped fallbacks, and the
 *                  claiming address.
 * @returns The initial form state.
 */
function buildInitialState(params: {
  claim: AgencyClaim | null;
  scrapedDescription: string | null;
  scrapedServices: string[];
  claimEmail: string;
}): FormState {
  const { claim, scrapedDescription, scrapedServices, claimEmail } = params;
  return {
    description: (claim?.description ?? scrapedDescription ?? "").slice(0, DESCRIPTION_MAX_CHARS),
    minBudgetUsd: claim?.minBudgetUsd ? String(claim.minBudgetUsd) : "",
    typicalBudgetMin: claim?.typicalBudgetMin ? String(claim.typicalBudgetMin) : "",
    typicalBudgetMax: claim?.typicalBudgetMax ? String(claim.typicalBudgetMax) : "",
    typicalTimelineWeeks: claim?.typicalTimelineWeeks ? String(claim.typicalTimelineWeeks) : "",
    platforms: claim?.platforms ?? [],
    services: (claim?.services?.length ? claim.services : scrapedServices).slice(0, SERVICES_MAX),
    declines: claim?.declines ?? "",
    startupClients: claim?.startupClients ?? [],
    ycOffer: claim?.ycOffer ?? "",
    contactName: claim?.contactName ?? "",
    // Defaults to the address that proved domain control: it is a real
    // inbox at the right company, so an agency that does not care where
    // leads go can leave it.
    contactEmail: claim?.contactEmail ?? claimEmail,
    responseSlaDays: claim?.responseSlaDays ? String(claim.responseSlaDays) : "",
    acceptingProjects: claim?.acceptingProjects ?? true,
  };
}

/** A character counter that turns red once the cap is passed. */
function Counter({ value, max }: { value: string; max: number }) {
  try {
    const over = value.length > max;
    return (
      <span className={`${styles.counter}${over ? ` ${styles.counterOver}` : ""}`}>
        {value.length}/{max}
      </span>
    );
  } catch {
    return null;
  }
}

/**
 * The claim enrich form, rendered behind a valid magic link.
 *
 * @param props - Component props.
 * @param props.token - The magic-link token; the entire authorisation for
 *          this submission. Posted with the body and never shown.
 * @param props.agencyName - For the copy.
 * @param props.claim - The existing claim, when this is an edit.
 * @param props.scrapedDescription - The source's blurb, as a prefill.
 * @param props.scrapedServices - The source's service list, as a prefill.
 * @param props.claimEmail - The verified claiming address.
 * @param props.slug - For analytics.
 */
export default function ClaimEnrichForm({
  token,
  agencyName,
  claim,
  scrapedDescription,
  scrapedServices,
  claimEmail,
  slug,
}: {
  token: string;
  agencyName: string;
  claim: AgencyClaim | null;
  scrapedDescription: string | null;
  scrapedServices: string[];
  claimEmail: string;
  slug: string;
}) {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState({ claim, scrapedDescription, scrapedServices, claimEmail }),
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [profilePath, setProfilePath] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  try {
    /** Updates one field. */
    function set<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
      setForm((current) => ({ ...current, [key]: value }));
    }

    /** Adds or removes a platform from the multi-select. */
    function togglePlatform(platform: AgencyPlatform) {
      set(
        "platforms",
        form.platforms.includes(platform)
          ? form.platforms.filter((entry) => entry !== platform)
          : [...form.platforms, platform],
      );
    }

    /**
     * Saves the claim.
     *
     * @param event - The form submit event.
     */
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (status === "saving") return;
      setStatus("saving");
      setError(null);

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, ...form }),
        });
        const payload = (await response.json().catch(() => null)) as SubmitResponse | null;

        if (!response.ok || !payload?.ok) {
          setStatus("idle");
          setError(payload?.error ?? GENERIC_ERROR);
          return;
        }

        setProfilePath(payload.profilePath ?? null);
        setStatus("saved");
        trackEvent(AnalyticsEvents.CLAIM_COMPLETED, {
          slug,
          verified: payload.verified ?? false,
          statedBudget: form.minBudgetUsd.trim().length > 0,
          statedYcOffer: form.ycOffer.trim().length > 0,
        });
      } catch {
        setStatus("idle");
        setError(GENERIC_ERROR);
      }
    }

    if (status === "saved") {
      return (
        <div className={styles.success}>
          <h2 className={styles.successHeading}>{agencyName} is live</h2>
          <p className={styles.successBody}>
            Your listing is updated and carries a Verified badge. We have emailed you a copy of
            what it now says, and a link to change it.
          </p>
          {profilePath && (
            <p className={styles.successBody}>
              <a className={styles.successLink} href={profilePath}>
                View your listing
              </a>
            </p>
          )}
        </div>
      );
    }

    return (
      <form className={`${styles.card} ${styles.cardWide}`} onSubmit={handleSubmit} noValidate>
        <p className={styles.intro}>
          Everything here is optional, and everything here is what founders filter on. Two minutes
          is enough.
        </p>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor="claim-description" className={styles.label}>
              Description <span className={styles.optional}>one paragraph</span>
            </label>
            <textarea
              id="claim-description"
              className={`${styles.control} ${styles.textarea}`}
              maxLength={DESCRIPTION_MAX_CHARS}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="What you do, and who you do it for."
            />
            <Counter value={form.description} max={DESCRIPTION_MAX_CHARS} />
          </div>

          <hr className={styles.divider} />
          <p className={styles.sectionLabel}>Money and time</p>

          <div className={styles.field}>
            <label htmlFor="claim-min-budget" className={styles.label}>
              Minimum project budget <span className={styles.optional}>USD</span>
            </label>
            <input
              id="claim-min-budget"
              className={styles.control}
              type="number"
              min={0}
              step={500}
              inputMode="numeric"
              value={form.minBudgetUsd}
              onChange={(event) => set("minBudgetUsd", event.target.value)}
              placeholder="25000"
            />
            <span className={styles.hint}>
              The smallest project you will take on. This is the single most used filter on the
              directory, and stating a high number is not penalised - saying nothing is.
            </span>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="claim-typical-min" className={styles.label}>
                Typical project, from <span className={styles.optional}>USD</span>
              </label>
              <input
                id="claim-typical-min"
                className={styles.control}
                type="number"
                min={0}
                step={500}
                inputMode="numeric"
                value={form.typicalBudgetMin}
                onChange={(event) => set("typicalBudgetMin", event.target.value)}
                placeholder="40000"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="claim-typical-max" className={styles.label}>
                Typical project, to <span className={styles.optional}>USD</span>
              </label>
              <input
                id="claim-typical-max"
                className={styles.control}
                type="number"
                min={0}
                step={500}
                inputMode="numeric"
                value={form.typicalBudgetMax}
                onChange={(event) => set("typicalBudgetMax", event.target.value)}
                placeholder="90000"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="claim-timeline" className={styles.label}>
              Typical timeline <span className={styles.optional}>weeks</span>
            </label>
            <input
              id="claim-timeline"
              className={styles.control}
              type="number"
              min={1}
              inputMode="numeric"
              value={form.typicalTimelineWeeks}
              onChange={(event) => set("typicalTimelineWeeks", event.target.value)}
              placeholder="10"
            />
          </div>

          <hr className={styles.divider} />
          <p className={styles.sectionLabel}>What you build</p>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Platforms</legend>
            <div className={styles.pills}>
              {PLATFORM_OPTIONS.map((option) => {
                const active = form.platforms.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.pill}${active ? ` ${styles.pillActive}` : ""}`}
                    aria-pressed={active}
                    onClick={() => togglePlatform(option.value)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <TagInput
            id="claim-services"
            label="Services"
            values={form.services}
            onChange={(values) => set("services", values)}
            maxItems={SERVICES_MAX}
            maxChars={SERVICE_TAG_MAX_CHARS}
            placeholder="Brand identity, then Enter"
          />

          <div className={styles.field}>
            <label htmlFor="claim-declines" className={styles.label}>
              What do you say no to?
            </label>
            <textarea
              id="claim-declines"
              className={`${styles.control} ${styles.textarea}`}
              maxLength={DECLINES_MAX_CHARS}
              value={form.declines}
              onChange={(event) => set("declines", event.target.value)}
              placeholder="Work you turn down, and why. Saves everyone a call."
            />
            <span className={styles.hint}>
              No other directory publishes this, and founders read it first.
            </span>
            <Counter value={form.declines} max={DECLINES_MAX_CHARS} />
          </div>

          <hr className={styles.divider} />
          <p className={styles.sectionLabel}>Startups</p>

          <TagInput
            id="claim-startup-clients"
            label="Startup clients"
            values={form.startupClients}
            onChange={(values) => set("startupClients", values)}
            maxItems={STARTUP_CLIENTS_MAX}
            maxChars={STARTUP_CLIENT_MAX_CHARS}
            placeholder="Company name, then Enter"
            hint="Names only. One is enough to show a founder you have done this before."
          />

          <div className={styles.field}>
            <label htmlFor="claim-yc-offer" className={styles.label}>
              YC founder offer <span className={styles.optional}>optional</span>
            </label>
            <input
              id="claim-yc-offer"
              className={styles.control}
              type="text"
              maxLength={YC_OFFER_MAX_CHARS}
              value={form.ycOffer}
              onChange={(event) => set("ycOffer", event.target.value)}
              placeholder="15% off the first project for YC companies"
            />
            <span className={styles.hint}>{YC_OFFER_NUDGE}</span>
            <Counter value={form.ycOffer} max={YC_OFFER_MAX_CHARS} />
          </div>

          <hr className={styles.divider} />
          <p className={styles.sectionLabel}>Where project requests go</p>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="claim-contact-name" className={styles.label}>
                Contact name
              </label>
              <input
                id="claim-contact-name"
                className={styles.control}
                type="text"
                autoComplete="name"
                value={form.contactName}
                onChange={(event) => set("contactName", event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="claim-contact-email" className={styles.label}>
                Contact email
              </label>
              <input
                id="claim-contact-email"
                className={styles.control}
                type="email"
                autoComplete="email"
                value={form.contactEmail}
                onChange={(event) => set("contactEmail", event.target.value)}
              />
              <span className={styles.hint}>
                Never shown on the site. Only used to send you a founder&rsquo;s brief.
              </span>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="claim-sla" className={styles.label}>
              Reply time
            </label>
            <select
              id="claim-sla"
              className={`${styles.control} ${styles.select}`}
              value={form.responseSlaDays}
              onChange={(event) => set("responseSlaDays", event.target.value)}
            >
              <option value="">Not stated</option>
              {RESPONSE_SLA_OPTIONS.map((days) => (
                <option key={days} value={days}>
                  Within {days} business day{days === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Accepting new projects</legend>
            <div className={styles.pills}>
              <button
                type="button"
                className={`${styles.pill}${form.acceptingProjects ? ` ${styles.pillActive}` : ""}`}
                aria-pressed={form.acceptingProjects}
                onClick={() => set("acceptingProjects", true)}
              >
                Yes, send me briefs
              </button>
              <button
                type="button"
                className={`${styles.pill}${!form.acceptingProjects ? ` ${styles.pillActive}` : ""}`}
                aria-pressed={!form.acceptingProjects}
                onClick={() => set("acceptingProjects", false)}
              >
                We are full right now
              </button>
            </div>
            <span className={styles.hint}>
              Turning this off keeps your listing up but stops project requests. Come back and turn
              it on whenever.
            </span>
          </fieldset>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={status === "saving"}>
            {status === "saving" ? SUBMIT_PENDING_LABEL : SUBMIT_LABEL}
          </button>
        </div>
      </form>
    );
  } catch {
    return null;
  }
}
