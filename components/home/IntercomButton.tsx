"use client";

// Custom Intercom launcher, and the only thing that loads Intercom.
//
// Intercom is not loaded on page load: chat widgets record what visitors
// type and are a target of the same wiretap claims as session replay, so the
// widget script is fetched only when the visitor clicks this button. The
// first click loads it and opens the messenger; later clicks just open it.
// `hide_default_launcher` keeps Intercom's own bubble from stacking on top of
// this one.

const INTERCOM_APP_ID = "gkjq60px";

type IntercomFn = ((...args: unknown[]) => void) & { q?: unknown[]; c?: (args: unknown) => void };
type WindowWithIntercom = Window & { Intercom?: IntercomFn; intercomSettings?: Record<string, unknown> };

/** Queues Intercom calls until its script arrives, then injects the script. */
function loadIntercom(w: WindowWithIntercom): IntercomFn {
  w.intercomSettings = {
    api_base: "https://api-iam.intercom.io",
    app_id: INTERCOM_APP_ID,
    hide_default_launcher: true,
  };
  const queue: IntercomFn = (...args: unknown[]) => queue.c?.(args);
  queue.q = [];
  queue.c = (args) => queue.q?.push(args);
  w.Intercom = queue;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://widget.intercom.io/widget/${INTERCOM_APP_ID}`;
  document.body.appendChild(script);
  return queue;
}

export default function IntercomButton() {
  const handleClick = () => {
    try {
      const w = window as WindowWithIntercom;
      const intercom = typeof w.Intercom === "function" ? w.Intercom : loadIntercom(w);
      intercom("show");
    } catch (err) {
      console.error("Intercom show failed:", err);
    }
  };

  return (
    <button
      type="button"
      aria-label="Open chat"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
      style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </button>
  );
}
