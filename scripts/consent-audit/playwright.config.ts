// Playwright config for the consent test (npm run consent:test).
//
// Separate from the root playwright.config.ts on purpose: this suite talks to
// real third-party vendors (Termly, and Google/Meta/etc. once consent is
// given), so it is slower and is run against a deployment before merge.
//
//   npm run consent:test                                      # local prod build
//   CONSENT_BASE_URL=https://<preview>.vercel.app npm run consent:test
//
// Locally it runs `next start` on the existing build, so run `next build`
// first.

import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { chromiumLaunchOptions } from "./browser.mjs";

const BASE_URL = (process.env.CONSENT_BASE_URL ?? "http://127.0.0.1:3211").replace(/\/$/, "");
const IS_LOCAL = /127\.0\.0\.1|localhost/.test(BASE_URL);
const launch = chromiumLaunchOptions();

export default defineConfig({
  testDir: ".",
  testMatch: "consent.spec.ts",
  // Vendors are live services; one retry absorbs a slow vendor, a second
  // failure is real.
  retries: 1,
  workers: 3,
  timeout: 150_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI ? "github" : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    launchOptions: {
      ...launch,
      // In a proxied sandbox the local server must not go through the proxy.
      ...(launch.proxy ? { proxy: { ...launch.proxy, bypass: "127.0.0.1,localhost" } } : {}),
    },
  },
  webServer: IS_LOCAL
    ? {
        command: `npx next start -p ${new URL(BASE_URL).port || "3211"}`,
        // Playwright runs webServer from this config's directory; Next needs
        // the repo root.
        cwd: path.resolve(__dirname, "../.."),
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
        env: { NODE_USE_ENV_PROXY: "1" },
      }
    : undefined,
});
