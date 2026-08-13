// Playwright config for the free-tools browser smoke suite.
//
// Defaults to a local production build, because that is the only way to catch
// the client-side crash class these tests exist for while still being able to
// run before a deploy. Point TOOLS_BASE_URL at a deployment to run the same
// suite against staging or production.

import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.TOOLS_BASE_URL ?? "http://127.0.0.1:3210";

/** True when we are driving a server we started ourselves. */
const IS_LOCAL = BASE_URL.includes("127.0.0.1") || BASE_URL.includes("localhost");

/** Derived so the managed server listens where baseURL actually points. */
const LOCAL_PORT = IS_LOCAL ? (new URL(BASE_URL).port || "3000") : "";

export default defineConfig({
  testDir: "./tests",
  // The tools call a live backend, so a failure is more often a slow run than
  // a flaky selector. One retry keeps that from paging anyone.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 90_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Chromium does not honour NO_PROXY, so in a proxied sandbox it will try
    // to tunnel localhost and get a 405 back from the relay. Talking to a
    // local server needs no proxy at all.
    launchOptions: IS_LOCAL ? { args: ["--no-proxy-server"] } : {},
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: IS_LOCAL
    ? {
        command: `npx next start -p ${LOCAL_PORT}`,
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
        // The tools proxy to the product backend, so the server needs the
        // endpoint and Node needs to be told to honour the proxy env.
        env: {
          NODE_USE_ENV_PROXY: "1",
          SUPERFLOW_ANONYMOUS_API_URL:
            process.env.SUPERFLOW_ANONYMOUS_API_URL ?? "",
        },
      }
    : undefined,
});
