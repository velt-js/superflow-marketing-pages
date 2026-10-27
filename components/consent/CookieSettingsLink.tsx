"use client";

// "Cookie settings" - reopens the Termly preferences panel, so a visitor can
// change or withdraw consent from any page. Rendered in both site footers.
//
// Termly defines window.displayPreferenceModal once it has loaded. Before
// that (or if an ad blocker stops Termly), the click does nothing, and
// nothing non-essential is running either - ConsentScripts fails closed.

import type { CSSProperties } from "react";
import type { ConsentWindow } from "@/lib/consent/consent";

export function CookieSettingsLink({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <a
      href="#cookie-settings"
      data-cookie-settings
      className={className}
      style={style}
      onClick={(event) => {
        event.preventDefault();
        try {
          (window as ConsentWindow).displayPreferenceModal?.();
        } catch (error) {
          console.error("Opening cookie settings failed:", error);
        }
      }}
    >
      Cookie settings
    </a>
  );
}
