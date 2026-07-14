"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SIGNUP_URL } from "@/lib/use-case-types";
import styles from "./CostSection.module.css";

const SECTION_HEADING = "See the leverage in your own numbers.";
const HEADING_ID = "cost-section-heading";

/** Section CTA pairing — mirrors the global footer (secondary + primary). */
const BOOK_DEMO_HREF = "/book-demo";
const SECONDARY_CTA_LABEL = "Book Demo";
const PRIMARY_CTA_LABEL = "Start Free";
/** Product visual exported from Figma node 582:5646 ("image 3021"). */
const PRODUCT_VISUAL_SRC = "/images/home-2026/cost/product-visual.png";
const PRODUCT_VISUAL_ALT =
  "Superflow display device showing the billings recovered per year from automated QA";
const RESULT_LABEL = "Billings recovered / yr";
const READY_LABEL = "READY";

/* ROI math replicated from the original Framer site's calculator
   (calcRoi in the exported home.html). */
/** Share of manual QA time the AI agents take over. */
const AI_SHARE = 0.7;
/** Working hours per month of one full-time reviewer. */
const REVIEWER_HOURS_PER_MONTH = 160;
const MONTHS_PER_YEAR = 12;

/**
 * Configuration for one draggable input metric: a labelled slider-style
 * track whose accent pill doubles as the value readout.
 */
interface CostSliderConfig {
  id: "assets" | "minutes" | "rate";
  label: string;
  /** Optional muted qualifier rendered after the label (e.g. "/ month"). */
  suffix?: string;
  min: number;
  max: number;
  step: number;
  /** Formats the raw numeric value for the pill readout. */
  formatValue: (value: number) => string;
}

/** Map of every slider id to its current numeric value. */
type CostInputs = Record<CostSliderConfig["id"], number>;

/** Ranges/steps mirror the Framer site's range inputs exactly. */
const COST_SLIDERS: CostSliderConfig[] = [
  {
    id: "assets",
    label: "Assets reviewed",
    suffix: "/ month",
    min: 10,
    max: 2000,
    step: 10,
    formatValue: (value) => String(value),
  },
  {
    id: "minutes",
    label: "QA Minutes",
    suffix: "/ asset",
    min: 5,
    max: 120,
    step: 5,
    formatValue: (value) => String(value),
  },
  {
    id: "rate",
    label: "Hourly Billing Rate",
    min: 40,
    max: 300,
    step: 5,
    formatValue: (value) => `$${value}`,
  },
];

/**
 * A named starting point for the calculator. Selecting a preset fills the
 * three sliders with representative numbers for that kind of team.
 * Values mirror the `presets` array in the exported Framer home.html.
 */
interface CostPreset {
  key: string;
  label: string;
  inputs: CostInputs;
}

/** Preset teams offered above the sliders (order matches the Framer site). */
const COST_PRESETS: CostPreset[] = [
  { key: "solo", label: "Solo studio", inputs: { assets: 40, minutes: 15, rate: 75 } },
  {
    key: "agency10",
    label: "10-person agency",
    inputs: { assets: 300, minutes: 20, rate: 125 },
  },
  {
    key: "scale50",
    label: "50+ / in-house QA",
    inputs: { assets: 1500, minutes: 25, rate: 150 },
  },
];

/** Preset selected on first render (the Framer default active preset). */
const DEFAULT_PRESET_KEY = "agency10";

/** Default slider values, sourced from the default preset. */
const DEFAULT_INPUTS: CostInputs =
  COST_PRESETS.find((preset) => preset.key === DEFAULT_PRESET_KEY)?.inputs ??
  COST_PRESETS[0].inputs;

/**
 * Rounds and formats a number with US thousands separators, matching the
 * Framer calculator's fmtNum.
 */
function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/**
 * Formats a number as a rounded US dollar amount, matching the Framer
 * calculator's fmtUsd.
 */
function formatUsd(value: number): string {
  return `$${formatNumber(value)}`;
}

/**
 * Converts a slider value into its position (0–100) within the range,
 * used to place the pill along the track.
 */
function toTrackPercent(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100;
}

/**
 * 06 / Cost — homepage section (2026 redesign) with an interactive ROI
 * calculator: three draggable metric sliders drive the "Billings recovered"
 * readout rendered on the product visual's screen.
 *
 * The screen face of the product image has static text baked in, so a CSS
 * overlay (positioned and scaled with container-query units) redraws the
 * whole screen area and hosts the live values.
 */
export default function CostSection() {
  const [inputs, setInputs] = useState<CostInputs>(DEFAULT_INPUTS);
  const [activePreset, setActivePreset] = useState<string | null>(
    DEFAULT_PRESET_KEY,
  );

  // Framer reference math: hours the AI hands back, reviewer FTE equivalent,
  // and yearly billings recovered ("billings" mode of the original toggle).
  const totalHours = (inputs.assets * inputs.minutes) / 60;
  const hoursBack = totalHours * AI_SHARE;
  const reviewerWorth = hoursBack / REVIEWER_HOURS_PER_MONTH;
  const billingsPerYear = hoursBack * inputs.rate * MONTHS_PER_YEAR;

  const handleSliderChange = (id: CostSliderConfig["id"], rawValue: string) => {
    setInputs((previous) => ({ ...previous, [id]: Number(rawValue) }));
    // A manual drag no longer matches a named preset, so drop the highlight.
    setActivePreset(null);
  };

  /**
   * Fills the three sliders with a preset's numbers and marks it as the
   * active selection (mirrors applyPreset in the Framer home.html).
   */
  const applyPreset = (preset: CostPreset) => {
    setInputs(preset.inputs);
    setActivePreset(preset.key);
  };

  return (
    <section className={styles.section} data-section="cost" aria-labelledby={HEADING_ID}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <h2 id={HEADING_ID} className={styles.heading}>
            {SECTION_HEADING}
          </h2>

          <div className={styles.calculator}>
            <div
              className={styles.presets}
              role="group"
              aria-label="Team size presets"
            >
              {COST_PRESETS.map((preset) => {
                const isActive = activePreset === preset.key;
                const buttonClassName = isActive
                  ? `${styles.presetButton} ${styles.presetButtonActive}`
                  : styles.presetButton;

                return (
                  <button
                    key={preset.key}
                    type="button"
                    className={buttonClassName}
                    aria-pressed={isActive}
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className={styles.metrics}>
            {COST_SLIDERS.map((slider) => {
              const value = inputs[slider.id];
              const percent = toTrackPercent(value, slider.min, slider.max);
              const ariaLabel = slider.suffix
                ? `${slider.label} ${slider.suffix}`
                : slider.label;

              return (
                <div key={slider.id} className={styles.metric}>
                  <p className={styles.metricLabel}>
                    {slider.label}
                    {slider.suffix ? (
                      <>
                        {" "}
                        <span className={styles.metricSuffix}>{slider.suffix}</span>
                      </>
                    ) : null}
                  </p>
                  <div className={styles.metricTrack}>
                    <span className={styles.trackCap} aria-hidden="true" />
                    <span className={styles.trackLine} aria-hidden="true" />
                    <span className={styles.trackCap} aria-hidden="true" />
                    <input
                      className={styles.rangeInput}
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={value}
                      onChange={(event) =>
                        handleSliderChange(slider.id, event.target.value)
                      }
                      aria-label={ariaLabel}
                      aria-valuetext={slider.formatValue(value)}
                    />
                    <span
                      className={styles.metricPill}
                      style={{
                        left: `${percent}%`,
                        transform: `translate(-${percent}%, -50%)`,
                      }}
                      aria-hidden="true"
                    >
                      <span className={styles.metricValue}>
                        {slider.formatValue(value)}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
            </div>

            <div className={styles.ctaButtons}>
              <Link
                href={BOOK_DEMO_HREF}
                className={`${styles.btn} ${styles.btnOutline}`}
              >
                {SECONDARY_CTA_LABEL}
              </Link>
              <Link
                href={SIGNUP_URL}
                className={`${styles.btn} ${styles.btnFilled}`}
              >
                {PRIMARY_CTA_LABEL}
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.visualFrame}>
            <Image
              className={styles.productImage}
              src={PRODUCT_VISUAL_SRC}
              alt={PRODUCT_VISUAL_ALT}
              width={846}
              height={713}
              sizes="(max-width: 900px) 100vw, 55vw"
            />
            {/* Redrawn screen face: covers the baked-in "$120,000" artwork
                and hosts the live calculator output. */}
            <div className={styles.screen}>
              <p className={styles.screenLabel}>{RESULT_LABEL}</p>
              <div aria-live="polite">
                <p className={styles.screenValue}>{formatUsd(billingsPerYear)}</p>
                <p className={styles.screenSubline}>
                  {`${formatNumber(hoursBack)} hours back monthly \u00b7 ${reviewerWorth.toFixed(1)} reviewers\u2019 worth`}
                </p>
              </div>
              <span className={styles.screenStatus}>
                <span className={styles.screenStatusDot} aria-hidden="true" />
                {READY_LABEL}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
