"use client";

import { useId, useState } from "react";
import styles from "./Report.module.css";
import { CopyButton } from "./CopyButton";
import { EFFORT_LABELS, STATUS_STYLES } from "./status";
import type {
  Finding,
  FindingDetail,
  SerializableBotVerdict,
} from "@/lib/tools/ai-visibility/types";

/** Tick, exclamation, cross, or dash, matching the status. */
function StatusGlyph({ status }: { status: Finding["status"] }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={styles.statusDot}
      style={{ background: style.bg, color: style.fg }}
      title={style.label}
      aria-label={style.label}
      role="img"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {status === "pass" ? (
          <path d="M20 6 9 17l-5-5" />
        ) : status === "fail" ? (
          <path d="M18 6 6 18M6 6l12 12" />
        ) : status === "warn" ? (
          <path d="M12 7v6M12 17h.01" />
        ) : (
          <path d="M5 12h14" />
        )}
      </svg>
    </span>
  );
}

/** The bot allow/block table rendered under check A1. */
function BotTable({ verdicts }: { verdicts: SerializableBotVerdict[] }) {
  const answer = verdicts.filter((verdict) => verdict.tier === "answer");
  const training = verdicts.filter((verdict) => verdict.tier === "training");
  const notes = verdicts.filter((verdict) => verdict.note);

  /** One tier's rows, with a heading row above them. */
  function Section({
    heading,
    rows,
  }: {
    heading: string;
    rows: SerializableBotVerdict[];
  }) {
    if (rows.length === 0) return null;
    return (
      <>
        <tr className={styles.tierHeading}>
          <td colSpan={4}>{heading}</td>
        </tr>
        {rows.map((verdict) => (
          <tr key={verdict.token}>
            <td className={styles.botToken}>{verdict.token}</td>
            <td>{verdict.owner}</td>
            <td>
              <span
                className={`${styles.pill} ${
                  verdict.allowed ? styles.pillAllowed : styles.pillBlocked
                }`}
              >
                {verdict.allowed ? "Allowed" : "Blocked"}
              </span>
              {verdict.matchedRule ? (
                <div style={{ marginTop: 4, fontSize: 12, color: "#8a8a90" }}>
                  <code>{verdict.matchedRule}</code>
                </div>
              ) : null}
            </td>
            <td>{verdict.allowed ? verdict.feeds : verdict.consequence}</td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Crawler</th>
              <th>Owner</th>
              <th>Status</th>
              <th>What it means</th>
            </tr>
          </thead>
          <tbody>
            <Section
              heading="Answer engines: blocking these removes you from AI answers"
              rows={answer}
            />
            <Section
              heading="Training only: blocking these does not affect AI answers"
              rows={training}
            />
          </tbody>
        </table>
      </div>
      {notes.map((verdict) => (
        <p key={verdict.token} className={styles.footnote}>
          <strong>{verdict.token}:</strong> {verdict.note}
        </p>
      ))}
    </>
  );
}

/** Renders the per-check structured payload, when there is one. */
function DetailView({ detail }: { detail: FindingDetail }) {
  try {
    switch (detail.kind) {
      case "bot-table":
        return <BotTable verdicts={detail.verdicts} />;

      case "firewall":
        return (
          <ul className={styles.detailList}>
            <li>
              As a browser: <code>{detail.browserStatus ?? "no response"}</code>
            </li>
            <li>
              As GPTBot: <code>{detail.botStatus ?? "no response"}</code>
            </li>
          </ul>
        );

      case "js-dependency":
        return (
          <ul className={styles.detailList}>
            <li>
              Text in the raw HTML:{" "}
              <code>{detail.rawTextLength.toLocaleString()} characters</code>
            </li>
            {detail.heuristic ? (
              <li>
                We could not render the page, so this is an estimate from the
                HTML alone, not a measurement.
              </li>
            ) : (
              <li>
                Text after JavaScript runs:{" "}
                <code>
                  {detail.renderedTextLength.toLocaleString()} characters
                </code>
              </li>
            )}
          </ul>
        );

      case "headings":
        return (
          <ul className={styles.detailList}>
            <li>
              H1 count: <code>{detail.h1Count}</code>
            </li>
            {detail.skippedLevels.length > 0 ? (
              <li>Skipped levels: {detail.skippedLevels.join(", ")}</li>
            ) : null}
          </ul>
        );

      case "schema":
        return (
          <ul className={styles.detailList}>
            <li>
              {detail.types.length > 0
                ? `Types found: ${detail.types.join(", ")}`
                : "No schema types found."}
            </li>
            {detail.parseErrors.map((error) => (
              <li key={error}>
                <code>{error}</code>
              </li>
            ))}
          </ul>
        );

      case "answer-shape":
        return (
          <ul className={styles.detailList}>
            <li>
              Question-shaped headings: <code>{detail.questionHeadings}</code>
            </li>
            <li>List or table present: {detail.hasList || detail.hasTable ? "yes" : "no"}</li>
            <li>Published or updated date: {detail.hasDates ? "yes" : "no"}</li>
            <li>Author markup: {detail.hasAuthor ? "yes" : "no"}</li>
          </ul>
        );

      case "meta":
        return (
          <ul className={styles.detailList}>
            <li>
              Title:{" "}
              {detail.title ? (
                <>
                  <code>{detail.title}</code> ({detail.title.length} characters)
                </>
              ) : (
                "missing"
              )}
            </li>
            <li>
              Description:{" "}
              {detail.description ? (
                <>
                  <code>{detail.description}</code> ({detail.description.length}{" "}
                  characters)
                </>
              ) : (
                "missing"
              )}
            </li>
          </ul>
        );

      case "llms-txt": {
        const failed = detail.validation.rules.filter(
          (rule) => rule.status !== "pass",
        );
        if (failed.length === 0) return null;
        return (
          <ul className={styles.detailList}>
            {failed.map((rule) => (
              <li key={rule.id}>
                <strong>{rule.title}:</strong> {rule.detail}
              </li>
            ))}
          </ul>
        );
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * One finding: a collapsible row with the status, the title, why it matters,
 * and, when expanded, the fix, the platform steps, a copyable snippet, and
 * any structured detail.
 *
 * Failures start expanded. A visitor who scores badly should not have to
 * click to find out why.
 *
 * @param props - The finding to render.
 */
export function FindingCard({ finding }: { finding: Finding }) {
  const [isOpen, setIsOpen] = useState(finding.status === "fail");
  const panelId = useId();

  // A row is only expandable when there is something behind it. The backend
  // engine merges "why" and "fix" into one sentence and sends no detail, so a
  // finding from that path is fully readable collapsed. Opening it to an empty
  // panel would read as a broken control.
  const hasFixText = finding.fix.trim().length > 0;
  const hasBody =
    hasFixText ||
    finding.platformFix !== undefined ||
    finding.detail !== undefined ||
    finding.fixSnippet !== undefined;

  return (
    <div className={styles.finding}>
      <button
        type="button"
        className={styles.findingHeader}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        disabled={!hasBody}
      >
        <StatusGlyph status={finding.status} />
        <span className={styles.findingHeaderText}>
          <span className={styles.findingTitle}>{finding.title}</span>
          <span className={styles.findingWhy}>{finding.why}</span>
        </span>
        <span className={styles.findingMeta}>
          {finding.status !== "pass" && finding.effort ? (
            <span className={styles.effortChip}>
              {EFFORT_LABELS[finding.effort] ?? finding.effort}
            </span>
          ) : null}
          {hasBody ? (
            <svg
              className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          ) : null}
        </span>
      </button>

      {isOpen && hasBody ? (
        <div className={styles.findingBody} id={panelId}>
          {hasFixText ? (
            <>
              <p className={styles.fixLabel}>How to fix it</p>
              <p className={styles.fixText}>{finding.fix}</p>
            </>
          ) : null}

          {finding.platformFix ? (
            <p className={styles.platformFix}>{finding.platformFix}</p>
          ) : null}

          {finding.fixSnippet ? (
            <div className={styles.snippetWrap}>
              <pre className={styles.snippet}>
                <code>{finding.fixSnippet}</code>
              </pre>
              <CopyButton
                value={finding.fixSnippet}
                analyticsLabel={`snippet-${finding.id}`}
              />
            </div>
          ) : null}

          {finding.detail ? <DetailView detail={finding.detail} /> : null}
        </div>
      ) : null}
    </div>
  );
}
