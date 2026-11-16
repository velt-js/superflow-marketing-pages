// Next.js client instrumentation entry point (App Router, v15.3+). Runs once
// after the HTML document loads but before React hydration.
//
// Amplitude is NOT started here any more: it needs Analytics consent, so
// components/consent/ConsentScripts.tsx calls initAmplitude() and
// skipIdentification() once the visitor grants it. Until then the analytics
// service only buffers events in memory - nothing leaves the browser.

import { analytics } from "@/lib/analytics/analytics-service";

try {
  analytics.setDefaultProperties({ sourcePlatform: "marketingSite" });
} catch (error) {
  console.error("[Analytics] Client instrumentation bootstrap failed:", error);
}
