// Next.js client instrumentation entry point (App Router, v15.3+). Runs once
// after the HTML document loads but before React hydration — the ideal spot
// to bootstrap analytics, matching the source app's top-of-`main.ts` init.
//
// initAmplitude() no-ops outside production or when the API key is absent, so
// this is safe to run unconditionally. skipIdentification() flushes buffered
// events immediately because this marketing site has no login/identify step.

import { initAmplitude } from "@/lib/analytics/amplitude-client";
import { analytics } from "@/lib/analytics/analytics-service";

try {
  initAmplitude();
  analytics.setDefaultProperties({ sourcePlatform: "marketingSite" });
  analytics.skipIdentification();
} catch (error) {
  console.error("[Analytics] Client instrumentation bootstrap failed:", error);
}
