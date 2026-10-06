"use client";

// Page-wide client state for /state-of-website-qa.
//
// The benchmark, the two copies of the form and the thank-you state are
// separate islands in a server-rendered page, and they share three things:
// the benchmark answer (sent with the form), whether the form has been
// submitted (so both copies flip to the thank-you state together), and the
// visitor's attribution. A tiny external store keeps that without a context
// provider wrapped around the whole page.

import { useSyncExternalStore } from "react";
import { isBenchmarkAnswer, type BenchmarkAnswer } from "@/lib/website-qa-report/report";
import { analytics } from "@/lib/analytics/analytics-service";

export type SubmitResult = {
  downloadUrl: string;
  emailSent: boolean;
  /** Id of the form copy that was submitted. */
  from: string;
};

type State = {
  benchmark: BenchmarkAnswer | "";
  result: SubmitResult | null;
};

const STORAGE_KEY = "sf:qa-report:benchmark";
const SERVER_STATE: State = { benchmark: "", result: null };

let state: State = SERVER_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

/** Restores the saved benchmark answer once, on first client read. */
function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (isBenchmarkAnswer(saved)) state = { ...state, benchmark: saved };
  } catch {
    // Storage blocked (private mode, settings). The answer just isn't kept.
  }
}

function emit(next: Partial<State>): void {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): State {
  hydrate();
  return state;
}

/** Reads the shared state. */
export function useReportState(): State {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
}

/** Records and saves a benchmark answer. */
export function setBenchmark(answer: BenchmarkAnswer): void {
  emit({ benchmark: answer });
  try {
    window.sessionStorage.setItem(STORAGE_KEY, answer);
  } catch {
    // See hydrate().
  }
}

/** Flips every copy of the form to the thank-you state. */
export function setResult(result: SubmitResult): void {
  emit({ result });
}

export type Attribution = {
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  referrer: string;
};

let attribution: Attribution | null = null;

/**
 * The visitor's source, UTM values and referrer, read once from the URL they
 * landed on, so a later in-page navigation cannot lose them.
 */
export function getAttribution(): Attribution {
  if (attribution) return attribution;
  try {
    const params = new URLSearchParams(window.location.search);
    const read = (key: string) => (params.get(key) ?? "").trim().slice(0, 120);
    attribution = {
      source: read("source") || "direct",
      utm_source: read("utm_source"),
      utm_medium: read("utm_medium"),
      utm_campaign: read("utm_campaign"),
      referrer: (document.referrer ?? "").slice(0, 500),
    };
  } catch {
    attribution = {
      source: "direct",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      referrer: "",
    };
  }
  return attribution;
}

/** The UTM values only, without empty ones. */
export function utmParams(): Record<string, string> {
  const { utm_source, utm_medium, utm_campaign } = getAttribution();
  return Object.fromEntries(
    Object.entries({ utm_source, utm_medium, utm_campaign }).filter(([, v]) => v),
  );
}

/** Tracks a report event with the visitor's source attached. */
export function trackReport(event: string, properties: Record<string, unknown> = {}): void {
  try {
    analytics.trackEvent(event, { source: getAttribution().source, ...properties });
  } catch {
    // Analytics never breaks the page.
  }
}

let formStarted = false;

/** True the first time it is called on this page view, false after. */
export function claimFormStart(): boolean {
  if (formStarted) return false;
  formStarted = true;
  return true;
}
