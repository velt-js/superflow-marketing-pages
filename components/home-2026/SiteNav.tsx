"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./SiteNav.module.css";
import { ChevronDownIcon } from "./HeroIcons";

/** A single top-navigation entry. Chevron is shown for menu-style links. */
type NavItem = {
  label: string;
  href: string;
  hasMenu?: boolean;
};

const BRAND_NAME = "Superflow";
/** Transparent Superflow logo mark (shared brand asset). */
const BRAND_MARK_SRC = "/images/home-2026/nav/superflow-mark.png";
const CTA_LABEL = "Get Started";

/** ScrollY (px) past which the header switches to its solid white state. */
const SCROLL_THRESHOLD_PX = 48;

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Product", href: "#product", hasMenu: true },
  { label: "Integrations", href: "#integrations" },
  { label: "Resources", href: "#resources", hasMenu: true },
  { label: "Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
];

/**
 * Sticky top navigation for the 2026 homepage.
 *
 * Sits transparent over the hero at the top of the page and, once the user
 * scrolls past a small threshold, transitions into a full-width white bar with
 * dark text, a hairline bottom border and a subtle shadow. It is `position:
 * fixed` with a high z-index so it stays pinned above every section's
 * sticky/pinned scroll stages for the whole page. The scroll handler is
 * rAF-throttled and cleaned up on unmount.
 */
export default function SiteNav() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    let frameId = 0;

    /** Sync the scrolled state to the current scroll offset (rAF-throttled). */
    function handleScroll() {
      try {
        if (frameId) {
          return;
        }
        frameId = window.requestAnimationFrame(() => {
          frameId = 0;
          setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
        });
      } catch {
        setIsScrolled(false);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <nav className={styles.inner} aria-label="Primary">
        <a className={styles.brand} href="#top">
          <Image
            className={styles.brandMark}
            src={BRAND_MARK_SRC}
            alt=""
            width={17}
            height={16}
          />
          {BRAND_NAME}
        </a>

        <div className={styles.navLinks}>
          {NAV_ITEMS.map((item) => (
            <a key={item?.label} className={styles.navLink} href={item?.href}>
              {item?.label}
              {item?.hasMenu ? (
                <ChevronDownIcon size={16} className={styles.navChevron} />
              ) : null}
            </a>
          ))}
        </div>

        <a className={styles.ctaButton} href="#get-started">
          {CTA_LABEL}
        </a>
      </nav>
    </header>
  );
}
