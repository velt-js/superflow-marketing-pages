"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./SiteNav.module.css";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "./HeroIcons";

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
/** Destination for the "Get Started" CTA (shared by desktop bar + mobile menu). */
const CTA_HREF = "#get-started";

/** Accessible labels for the mobile menu toggle in its two states. */
const MENU_OPEN_LABEL = "Open menu";
const MENU_CLOSE_LABEL = "Close menu";

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
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuId = useId();
  const headerRef = useRef<HTMLElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

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

  /** Toggle the mobile navigation menu open/closed. */
  function handleToggleMenu() {
    try {
      setIsMenuOpen((previous) => !previous);
    } catch {
      setIsMenuOpen(false);
    }
  }

  /** Close the mobile navigation menu (used by link/CTA taps). */
  function closeMenu() {
    setIsMenuOpen(false);
  }

  /* While the mobile menu is open, close it on Escape (restoring focus to the
     toggle) or on a pointer press outside the header. */
  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    /** Close the menu and refocus the toggle when Escape is pressed. */
    function handleKeyDown(event: KeyboardEvent) {
      try {
        if (event?.key === "Escape") {
          setIsMenuOpen(false);
          toggleButtonRef.current?.focus();
        }
      } catch {
        setIsMenuOpen(false);
      }
    }

    /** Close the menu when a pointer press lands outside the header. */
    function handlePointerDown(event: PointerEvent) {
      try {
        const headerElement = headerRef.current;
        const target = event?.target as Node | null;
        if (headerElement && target && !headerElement.contains(target)) {
          setIsMenuOpen(false);
        }
      } catch {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  /* Lock body scroll while the menu overlays the page, restoring the prior
     value on close/unmount. */
  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  /* Move focus into the menu when it opens so keyboard users land on the first
     link. Progressive enhancement — silently ignore if focusing fails. */
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    try {
      const firstLink =
        mobileMenuRef.current?.querySelector<HTMLAnchorElement>("a");
      firstLink?.focus();
    } catch {
      /* no-op: focusing is a non-critical enhancement */
    }
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isScrolled ? styles.scrolled : ""} ${
        isMenuOpen ? styles.menuOpen : ""
      }`}
    >
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

        <a className={styles.ctaButton} href={CTA_HREF}>
          {CTA_LABEL}
        </a>

        <button
          type="button"
          ref={toggleButtonRef}
          className={styles.menuToggle}
          aria-label={isMenuOpen ? MENU_CLOSE_LABEL : MENU_OPEN_LABEL}
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          onClick={handleToggleMenu}
        >
          {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </nav>

      <div
        id={menuId}
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <nav className={styles.mobileMenuLinks} aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <a
              key={item?.label}
              className={styles.mobileNavLink}
              href={item?.href}
              onClick={closeMenu}
            >
              {item?.label}
            </a>
          ))}
        </nav>

        <a className={styles.mobileCta} href={CTA_HREF} onClick={closeMenu}>
          {CTA_LABEL}
        </a>
      </div>
    </header>
  );
}
