// Server-side Amplitude, for the one report event that happens off the page:
// a download from the lead email, which lands on a route handler and is
// redirected to the PDF before any page script could run.
//
// Same project and same gate as the browser SDK (amplitude-client.ts): the
// public API key, and production builds only, so local runs never send.

const AMPLITUDE_HTTP_API = "https://api2.amplitude.com/2/httpapi";
const TIMEOUT_MS = 2500;

/**
 * Sends one event. Never throws, never blocks for long.
 *
 * @param params - Event name, an id for the actor, and event properties.
 */
export async function trackServerEvent(params: {
  eventType: string;
  deviceId: string;
  properties: Record<string, unknown>;
  insertId?: string;
}): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey || process.env.NODE_ENV !== "production") return;

  try {
    await fetch(AMPLITUDE_HTTP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        events: [
          {
            event_type: params.eventType,
            device_id: params.deviceId,
            time: Date.now(),
            insert_id: params.insertId,
            event_properties: { sourcePlatform: "marketingSite", ...params.properties },
          },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[qa-report] Amplitude server event failed:", error);
  }
}
