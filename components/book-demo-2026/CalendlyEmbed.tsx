import Script from "next/script";
import styles from "./CalendlyEmbed.module.css";

/**
 * Calendly inline-embed URL, themed for the light 2026 page: white
 * background, ink text and the site accent as the primary color.
 */
const CALENDLY_URL =
  "https://calendly.com/goyalrakesh/30min?embed_domain=usesuperflow.com&embed_type=Inline&hide_gdpr_banner=1&background_color=ffffff&text_color=1e1e1f&primary_color=433df3&hide_event_type_details=1&hide_landing_page_details=1";

/** Fallback link copy when the embed script fails to load. */
const FALLBACK_TEXT = "Not loading? Click here";

/**
 * Inline Calendly scheduling widget for /book-demo — a white card with the
 * 2026 hairline border, plus the external fallback link and the Calendly
 * widget script. The script scans for `.calendly-inline-widget` on load.
 */
export default function CalendlyEmbed() {
  try {
    return (
      <section className={styles.section} data-section="calendly-embed">
        <div className={styles.inner}>
          <div
            className={`calendly-inline-widget ${styles.widget}`}
            data-url={CALENDLY_URL}
          />
          <a
            className={styles.fallback}
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {FALLBACK_TEXT}
          </a>
        </div>
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="afterInteractive"
        />
      </section>
    );
  } catch {
    return null;
  }
}
