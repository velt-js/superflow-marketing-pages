import * as amplitude from "@amplitude/analytics-browser";
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";

// Client-side Amplitude bootstrap. This is the Next.js equivalent of the
// top-of-file init block in the source Angular app's `main.ts`. It is
// invoked once, as early as possible, from `instrumentation-client.ts`
// (Next.js' client bootstrap entry point, which runs after the HTML loads
// but before React hydration).
//
// Amplitude Browser SDK keys are client-side by design (they end up in the
// bundled JS), so they are read from `NEXT_PUBLIC_`-prefixed env vars.
// Next.js inlines these at build time, so they MUST be referenced as static
// `process.env.NEXT_PUBLIC_*` lookups (never via a computed key) or they
// will not be replaced.

const LOG_PREFIX = "[Analytics]";

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

// Only production builds initialize Amplitude, so local `next dev` and test
// runs never pollute analytics with real traffic. Every non-dev deploy
// (staging, preview, production) runs `next build`, which sets NODE_ENV to
// "production", so this single check covers all prod-like environments.
const IS_PROD_LIKE_ENV = process.env.NODE_ENV === "production";

/**
 * Reads the Session Replay sample rate (0–1) from the environment, falling
 * back to 0 (recording disabled) for any missing or non-numeric value.
 *
 * @returns The parsed sample rate, clamped to a finite number.
 */
function getSessionReplaySampleRate(): number {
  try {
    const rawSampleRate = process.env.NEXT_PUBLIC_AMPLITUDE_SESSION_REPLAY_SAMPLE_RATE;
    const parsedSampleRate = Number(rawSampleRate);
    return Number.isFinite(parsedSampleRate) ? parsedSampleRate : 0;
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to read session replay sample rate:`, error);
    return 0;
  }
}

/**
 * Initializes the Amplitude Browser SDK plus the optional Session Replay
 * plugin. Safe to call once at app startup. No-ops when the API key is
 * missing or the current environment is not production, so local dev never
 * emits real analytics traffic.
 *
 * @returns Nothing; failures are logged and swallowed so a broken analytics
 * setup never breaks page rendering.
 */
export function initAmplitude(): void {
  try {
    if (!IS_PROD_LIKE_ENV || !AMPLITUDE_API_KEY) {
      return;
    }

    const sampleRate = getSessionReplaySampleRate();
    if (sampleRate > 0) {
      const sessionReplayTracking = sessionReplayPlugin({
        sampleRate,
        trackServerUrl:
          process.env.NEXT_PUBLIC_AMPLITUDE_SESSION_REPLAY_TRACK_PROXY_URL || undefined,
        configServerUrl:
          process.env.NEXT_PUBLIC_AMPLITUDE_SESSION_REPLAY_CONFIG_PROXY_URL || undefined,
      });
      amplitude.add(sessionReplayTracking);
    }

    amplitude.init(AMPLITUDE_API_KEY, {
      autocapture: {
        attribution: true,
        // Page views are tracked manually via `use-page-view.ts` so we can
        // attach custom properties (path, query, etc.) per navigation.
        pageViews: false,
        sessions: true,
        formInteractions: false,
        fileDownloads: false,
        elementInteractions: false,
        pageUrlEnrichment: false,
        frustrationInteractions: true,
        webVitals: true,
        networkTracking: {
          captureRules: [{ statusCodeRange: "400-599" }],
          ignoreAmplitudeRequests: true,
        },
      },
      // Optional same-origin/CDN reverse proxy to dodge ad blockers that
      // block amplitude.com/*. Blank falls back to Amplitude's endpoint.
      serverUrl: process.env.NEXT_PUBLIC_AMPLITUDE_EVENT_PROXY_URL || undefined,
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to initialize Amplitude:`, error);
  }
}
