"use client";

import { useState } from "react";
import styles from "./IntegrationsHubSections.module.css";

const HEADING = "How the connectors behave.";
const VISIBLE_WHEN_COLLAPSED = 6;
const SHOW_ALL_LABEL = "Show all 7";
const SHOW_LESS_LABEL = "Show less";
const CTA_TEXT = "See your tools and Superflow in one flow.";
const CTA_ACTION = "Book a demo";
const CTA_MICRO = "30 min, with the founder.";
const DEMO_HREF = "/demo";

/** The connector-behavior guarantees, in display order (system of record). */
const CONNECTOR_RULES: readonly string[] = [
  "The snippet installs on any website. Platforms without a built-in path use it directly.",
  "A connector going down never blocks a review or a sign-off. It queues and retries.",
  "Superflow only writes review state. Your tool's own fields stay its own.",
  "No echo loops: a change syncs once, in the right direction.",
  "Client and guest activity never posts to internal channels unless you map it.",
  "Each connector asks for the minimum permissions its job needs, listed on its page.",
  "Connection health, sync history, and a webhook log live in settings.",
];

/**
 * Small check glyph shown before each connector rule.
 *
 * @returns The inline check SVG.
 */
function CheckGlyph() {
  try {
    return (
      <svg
        viewBox="0 0 16 16"
        width={14}
        height={14}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 8.5l3.2 3.2L13 4.5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * "How the connectors behave" — a collapsible list of connector guarantees.
 * Shows the first six rules with a "Show all 7" toggle, then a demo CTA banner.
 *
 * @returns The connectors section, or `null` on failure.
 */
export default function IntegrationsConnectors() {
  try {
    const [expanded, setExpanded] = useState(false);

    /** Toggle between the collapsed (six) and expanded (all seven) views. */
    function handleToggle() {
      try {
        setExpanded((prev) => !prev);
      } catch {
        // no-op: state toggle can't meaningfully fail
      }
    }

    return (
      <section
        className={`${styles.section} ${styles.sectionSoft}`}
        data-section="int-connectors"
      >
        <div className={styles.inner}>
          <div className={styles.headCenter}>
            <h2 className={styles.display}>{HEADING}</h2>
          </div>

          <ul className={styles.connList}>
            {CONNECTOR_RULES.map((rule, index) => {
              const isHidden = !expanded && index >= VISIBLE_WHEN_COLLAPSED;
              return (
                <li
                  key={rule}
                  className={`${styles.connItem} ${
                    isHidden ? styles.connItemHidden : ""
                  }`}
                >
                  <span className={styles.connCheck}>
                    <CheckGlyph />
                  </span>
                  <span>{rule}</span>
                </li>
              );
            })}
          </ul>

          {CONNECTOR_RULES.length > VISIBLE_WHEN_COLLAPSED && (
            <button
              type="button"
              className={styles.connToggle}
              onClick={handleToggle}
              aria-expanded={expanded}
            >
              {expanded ? SHOW_LESS_LABEL : SHOW_ALL_LABEL}
            </button>
          )}

          <div className={styles.ctaBanner}>
            <p className={styles.ctaBannerText}>{CTA_TEXT}</p>
            <div className={styles.ctaBannerActions}>
              <span className={styles.ctaMicro}>{CTA_MICRO}</span>
              <a className={styles.btnPrimary} href={DEMO_HREF}>
                {CTA_ACTION}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
