#!/usr/bin/env node
// Consent audit - Phase 1 runtime check. Read-only: it changes nothing on the
// site, it only records what the site does to a visitor.
//
// Scenario "none" (the one the spec asks for): every page in KEY_PAGES opens in
// a FRESH browser context, nothing is clicked, and after network idle plus 5
// seconds we record
//   - every request to a host we do not own (with the tool it belongs to),
//   - every cookie in the jar (first- and third-party),
//   - every localStorage / sessionStorage key on our origin,
//   - the Google consent calls in dataLayer and whether the banner is showing.
// Nothing is clicked, so everything recorded there happened BEFORE consent.
//
// Two extra scenarios check the claims the banner makes:
//   "decline" - open home, click the banner's Decline, then navigate to a
//               second page and record what that page loads.
//   "gpc"     - open home with Global Privacy Control on (Sec-GPC: 1 header and
//               navigator.globalPrivacyControl = true), click nothing.
//
//   node scripts/consent-audit/audit.mjs                      # production
//   CONSENT_BASE_URL=https://<preview>.vercel.app node scripts/consent-audit/audit.mjs
//
// Writes scripts/consent-audit/results/audit-<host>.json, plus a screenshot per
// page under results/screenshots/ (git-ignored).

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "@playwright/test";
import { chromiumLaunchOptions } from "./browser.mjs";
import { KEY_PAGES, isEssential, isOwned, vendorFor } from "./config.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = (process.env.CONSENT_BASE_URL ?? "https://usesuperflow.ai").replace(/\/$/, "");
const SETTLE_MS = 5_000;
const OUT_DIR = path.join(HERE, "results");
const SHOTS_DIR = path.join(OUT_DIR, "screenshots");

const GPC_INIT = () => {
  Object.defineProperty(Navigator.prototype, "globalPrivacyControl", { get: () => true, configurable: true });
};

/** Starts recording third-party requests on a tab. Returns the live array. */
function recordRequests(tab) {
  const requests = [];
  tab.on("request", (req) => {
    let host;
    try {
      host = new URL(req.url()).hostname;
    } catch {
      return;
    }
    if (!host || isOwned(host)) return;
    requests.push({ host, url: req.url().slice(0, 300), type: req.resourceType() });
  });
  return requests;
}

/** Loads a URL and lets it settle. Retries once on a 5xx or a failed load. */
async function visit(tab, url) {
  let last = { status: null, error: null };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await tab.goto(url, { waitUntil: "load", timeout: 60_000 });
      last = { status: res?.status() ?? null, error: null };
      await tab.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
      await tab.waitForTimeout(SETTLE_MS);
      if (last.status && last.status < 500) return last;
    } catch (e) {
      last = { status: null, error: String(e?.message ?? e).split("\n")[0] };
    }
  }
  return last;
}

/** Everything the page left behind: cookies, storage, consent calls, banner. */
async function snapshot(context, tab) {
  const cookies = (await context.cookies()).map((c) => ({
    name: c.name,
    domain: c.domain,
    firstParty: isOwned(c.domain.replace(/^\./, "")),
    expires: c.expires > 0 ? new Date(c.expires * 1000).toISOString().slice(0, 10) : "session",
  }));
  const dom = await tab
    .evaluate(() => {
      const keys = (s) => {
        try {
          return Object.keys(s);
        } catch {
          return [];
        }
      };
      const dl = Array.isArray(window.dataLayer) ? window.dataLayer : [];
      const gtagCalls = dl
        .map((e) => (e && typeof e === "object" && "0" in e ? [...e] : null))
        .filter(Boolean)
        .map((a) => `${a[0]}:${typeof a[1] === "string" ? a[1] : ""}`);
      // Termly renders its banner as a fixed element; it exists (hidden) before
      // it animates in, so require a real on-screen box.
      const banner = document.querySelector("[class*='termly-styles-termly-banner']");
      const r = banner?.getBoundingClientRect();
      return {
        localStorage: keys(localStorage),
        sessionStorage: keys(sessionStorage),
        gtagCallOrder: gtagCalls,
        bannerVisible: !!r && r.height > 30 && r.top < innerHeight,
        gpc: navigator.globalPrivacyControl ?? null,
      };
    })
    .catch((e) => ({ error: String(e).split("\n")[0] }));
  return { cookies, ...dom };
}

/** One row per host and tool, labelled with the tool and whether it is essential. */
function summariseHosts(requests) {
  const byHost = new Map();
  for (const r of requests) {
    const vendor = vendorFor(r.host, r.url);
    const key = `${r.host} ${vendor?.tool}`;
    const row = byHost.get(key) ?? {
      host: r.host,
      count: 0,
      essential: isEssential(r.host),
      tool: vendor?.tool ?? "UNKNOWN",
      category: vendor?.category ?? "UNKNOWN",
      sample: r.url,
      types: new Set(),
    };
    row.count += 1;
    row.types.add(r.type);
    byHost.set(key, row);
  }
  return [...byHost.values()].map((h) => ({ ...h, types: [...h.types] }));
}

const shotName = (s) => path.join(SHOTS_DIR, `${s.replace(/\W+/g, "-")}.png`);

/**
 * True once React has hydrated the page. In this sandbox a page sometimes
 * loads its HTML but never its JS chunks, and a run like that under-reports
 * every tag that loads after hydration - so it is retried, not recorded.
 */
const hydrated = (tab) =>
  tab
    .evaluate(() =>
      [...document.body.querySelectorAll("*")].slice(0, 200).some((el) => Object.keys(el).some((k) => k.startsWith("__react"))),
    )
    .catch(() => false);

/** Runs a scenario up to three times until the page it ends on has hydrated. */
async function untilHydrated(run) {
  let result;
  for (let attempt = 1; attempt <= 3; attempt++) {
    result = await run();
    result.attempts = attempt;
    if (result.hydrated) return result;
  }
  return result;
}

async function scenarioNone(browser, page) {
  const context = await browser.newContext({ ...devices["Desktop Chrome"] });
  const tab = await context.newPage();
  const requests = recordRequests(tab);
  const url = `${BASE_URL}${page.path}`;
  const load = await visit(tab, url);
  load.hydrated = await hydrated(tab);
  const snap = await snapshot(context, tab);
  await tab.screenshot({ path: shotName(`none-${page.name}`) }).catch(() => {});
  await context.close();
  return { scenario: "none", ...page, url, ...load, ...snap, error: load.error ?? snap.error ?? null, hosts: summariseHosts(requests) };
}

async function scenarioDecline(browser) {
  const context = await browser.newContext({ ...devices["Desktop Chrome"] });
  const tab = await context.newPage();
  await visit(tab, `${BASE_URL}/`);
  if (!(await hydrated(tab))) {
    await context.close();
    return { scenario: "decline", hydrated: false, hosts: [], cookies: [] };
  }
  let clicked = false;
  try {
    await tab.getByRole("button", { name: /^(decline|reject)/i }).first().click({ timeout: 15_000 });
    clicked = true;
  } catch {
    // Reported below: a banner with no reachable reject button is itself a finding.
  }
  await tab.waitForTimeout(2_000);
  // Only what the SECOND page does after the refusal counts.
  const requests = recordRequests(tab);
  const url = `${BASE_URL}/pricing`;
  const load = await visit(tab, url);
  load.hydrated = await hydrated(tab);
  const snap = await snapshot(context, tab);
  await tab.screenshot({ path: shotName("decline-then-pricing") }).catch(() => {});
  await context.close();
  return {
    scenario: "decline",
    name: "home -> Decline -> /pricing",
    path: "/pricing",
    url,
    declineClicked: clicked,
    ...load,
    ...snap,
    error: load.error ?? snap.error ?? null,
    hosts: summariseHosts(requests),
  };
}

async function scenarioGpc(browser) {
  const context = await browser.newContext({ ...devices["Desktop Chrome"], extraHTTPHeaders: { "Sec-GPC": "1" } });
  await context.addInitScript(GPC_INIT);
  const tab = await context.newPage();
  const requests = recordRequests(tab);
  const url = `${BASE_URL}/`;
  const load = await visit(tab, url);
  load.hydrated = await hydrated(tab);
  const snap = await snapshot(context, tab);
  await tab.screenshot({ path: shotName("gpc-home") }).catch(() => {});
  await context.close();
  return { scenario: "gpc", name: "home with GPC on", path: "/", url, ...load, ...snap, error: load.error ?? snap.error ?? null, hosts: summariseHosts(requests) };
}

function report(r) {
  const nonEssential = r.hosts.filter((h) => !h.essential);
  console.log(
    `${String(r.status ?? r.error).slice(0, 60)}${r.hydrated ? "" : " (NEVER HYDRATED)"} | ${nonEssential.length} non-essential hosts | ${r.cookies.length} cookies | banner ${r.bannerVisible ? "shown" : "not shown"}`,
  );
}

async function main() {
  await mkdir(SHOTS_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...chromiumLaunchOptions() });
  const results = [];
  for (const page of KEY_PAGES) {
    process.stdout.write(`[none]    ${page.path} ... `);
    const r = await untilHydrated(() => scenarioNone(browser, page));
    results.push(r);
    report(r);
  }
  process.stdout.write(`[decline] / -> Decline -> /pricing ... `);
  const d = await untilHydrated(() => scenarioDecline(browser));
  results.push(d);
  report(d);
  process.stdout.write(`[gpc]     / ... `);
  const g = await untilHydrated(() => scenarioGpc(browser));
  results.push(g);
  report(g);
  await browser.close();

  const file = path.join(OUT_DIR, `audit-${new URL(BASE_URL).hostname}.json`);
  await writeFile(
    file,
    JSON.stringify({ baseUrl: BASE_URL, ranAt: new Date().toISOString(), settleMs: SETTLE_MS, results }, null, 2),
  );
  console.log(`\nwrote ${path.relative(process.cwd(), file)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
