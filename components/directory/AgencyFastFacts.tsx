import Link from "next/link";

import { platformLabel } from "@/lib/directory/claim-fields";
import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import type { EnrichedAgency } from "@/lib/directory/enrich";
import styles from "./AgencyFastFacts.module.css";

/** What a fact says when the agency has not answered it. */
const NOT_STATED = "Not stated";

/** Labels, in the order a founder asks these questions. Budget first
 *  because it is the one that ends the conversation. */
const FACT_LABELS = {
  minBudget: "Minimum budget",
  timeline: "Typical timeline",
  platforms: "Platforms",
  reply: "Replies within",
} as const;

/** The nudge under the row on an unclaimed listing. Addressed to the
 *  agency, not the visitor, and placed here on purpose: this is the row
 *  where an agency sees four "Not stated" cells with its own name above
 *  them, which is the moment claiming is worth two minutes. */
const CLAIM_PROMPT_PREFIX = "Are you ";
const CLAIM_PROMPT_LINK = "Claim your listing";

/**
 * Formats a whole-dollar figure, e.g. "$25,000".
 *
 * @param amount - The figure, or null.
 * @returns The formatted figure, or null when there is nothing to show.
 */
function money(amount: number | null): string | null {
  try {
    if (typeof amount !== "number") return null;
    return `$${amount.toLocaleString("en-US")}`;
  } catch {
    return null;
  }
}

/**
 * Builds the four fast facts.
 *
 * Every fact renders even when empty, which is the opposite of how the
 * rest of this directory treats missing data (the old stat card dropped
 * anything it could not fill). The difference is that these four are a
 * FIXED set of questions the page promises to answer: a profile showing
 * only two of them looks like it answered both, when really it dodged
 * two. "Not stated" is a real answer and a founder can act on it.
 *
 * @param agency - The enriched agency.
 * @returns Four label/value pairs, in display order.
 */
function buildFacts(agency: EnrichedAgency): Array<{ label: string; value: string; stated: boolean }> {
  try {
    const minimum = money(agency.minBudgetUsd);
    const range =
      agency.typicalBudgetMin || agency.typicalBudgetMax
        ? `${money(agency.typicalBudgetMin) ?? "?"} to ${money(agency.typicalBudgetMax) ?? "?"}`
        : null;

    const platforms =
      agency.platforms.length > 0
        ? agency.platforms.map((platform) => platformLabel(platform)).join(", ")
        : null;

    const timeline = agency.typicalTimelineWeeks
      ? `${agency.typicalTimelineWeeks} week${agency.typicalTimelineWeeks === 1 ? "" : "s"}`
      : null;

    const reply = agency.responseSlaDays
      ? `${agency.responseSlaDays} business day${agency.responseSlaDays === 1 ? "" : "s"}`
      : null;

    return [
      {
        label: FACT_LABELS.minBudget,
        // The typical range rides along with the minimum rather than
        // taking a fifth cell: they answer one question ("what does this
        // cost"), and splitting them made the row read as two prices.
        value: minimum ? (range ? `${minimum} · typical ${range}` : minimum) : NOT_STATED,
        stated: Boolean(minimum),
      },
      { label: FACT_LABELS.timeline, value: timeline ?? NOT_STATED, stated: Boolean(timeline) },
      { label: FACT_LABELS.platforms, value: platforms ?? NOT_STATED, stated: Boolean(platforms) },
      { label: FACT_LABELS.reply, value: reply ?? NOT_STATED, stated: Boolean(reply) },
    ];
  } catch {
    return [];
  }
}

/**
 * The fast-facts row on an agency profile.
 *
 * Replaces the old three-stat card, which counted clients, awards and
 * team size. Those describe the agency's past; these four describe
 * whether a founder can work with it, which is what the page is for.
 *
 * @param props - Component props.
 * @param props.agency - The enriched agency.
 */
export default function AgencyFastFacts({ agency }: { agency: EnrichedAgency }) {
  try {
    const facts = buildFacts(agency);
    if (facts.length === 0) return null;

    return (
      <div className={styles.wrapper}>
        <dl className={styles.row}>
          {facts.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt className={styles.label}>{fact.label}</dt>
              <dd className={`${styles.value}${fact.stated ? "" : ` ${styles.valueMissing}`}`}>
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        {!agency.claimed && (
          <p className={styles.claimPrompt}>
            {CLAIM_PROMPT_PREFIX}
            {agency.name}?{" "}
            <Link
              href={`${DIRECTORY_BASE_PATH}/claim?agency=${agency.slug}`}
              className={styles.claimLink}
            >
              {CLAIM_PROMPT_LINK}
            </Link>{" "}
            to fill these in.
          </p>
        )}
      </div>
    );
  } catch {
    return null;
  }
}
