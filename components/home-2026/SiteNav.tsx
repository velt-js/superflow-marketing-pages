"use client";

import Image from "next/image";
import type { ComponentType, FocusEvent as ReactFocusEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./SiteNav.module.css";
import {
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  RobotIcon,
  HistoryIcon,
  SparklesIcon,
  ChartBarIcon,
  MessageIcon,
  LockIcon,
  VideoIcon,
  CameraIcon,
  KeyIcon,
  PaletteIcon,
  RouteIcon,
  LayoutKanbanIcon,
} from "./HeroIcons";

/** A single top-navigation entry. Chevron is shown for menu-style links. */
type NavItem = {
  label: string;
  href: string;
  hasMenu?: boolean;
};

/** Minimal props shared by the inline SVG icons reused from `HeroIcons`. */
type MenuIconComponent = ComponentType<{ size?: number; className?: string }>;

/** Colour theme applied to a feature group's heading, icon tiles and hover. */
type FeatureTone = "ai" | "review" | "ops";

/** A single feature link inside the Product mega-menu. */
type FeatureLink = {
  label: string;
  href: string;
  description: string;
  Icon: MenuIconComponent;
};

/** A titled group of feature links rendered as one mega-menu column. */
type FeatureGroup = {
  heading: string;
  tone: FeatureTone;
  links: readonly FeatureLink[];
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

/** Label of the nav item that owns the feature mega-menu. */
const PRODUCT_LABEL = "Product";
/** Shared route prefix for every feature detail page. */
const FEATURE_ROUTE_PREFIX = "/preview/features/";

/** ScrollY (px) past which the header switches to its solid white state. */
const SCROLL_THRESHOLD_PX = 48;

/** Grace period (ms) before the hovered Product mega-menu closes, so a quick
    diagonal move from the trigger into the panel does not dismiss it. */
const PRODUCT_MENU_CLOSE_DELAY_MS = 200;

const NAV_ITEMS: readonly NavItem[] = [
  { label: PRODUCT_LABEL, href: "#product", hasMenu: true },
  { label: "Integrations", href: "#integrations" },
  { label: "Resources", href: "#resources", hasMenu: true },
  { label: "Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
];

/**
 * Feature pages surfaced in the Product mega-menu, grouped into the same three
 * buckets used across the marketing site. Each link carries a small icon and a
 * benefit-oriented one-liner. Shared by the desktop dropdown and the mobile
 * accordion so both stay in sync.
 */
const FEATURE_GROUPS: readonly FeatureGroup[] = [
  {
    heading: "AI layer",
    tone: "ai",
    links: [
      {
        label: "AI Review Agents",
        href: `${FEATURE_ROUTE_PREFIX}review-agents`,
        description: "Autonomous agents that triage every review",
        Icon: RobotIcon,
      },
      {
        label: "Memory",
        href: `${FEATURE_ROUTE_PREFIX}memory`,
        description: "Persistent context across every review",
        Icon: HistoryIcon,
      },
      {
        label: "Ask AI",
        href: `${FEATURE_ROUTE_PREFIX}ask-ai`,
        description: "Answers in the exact spot you're working",
        Icon: SparklesIcon,
      },
      {
        label: "Analytics",
        href: `${FEATURE_ROUTE_PREFIX}analytics`,
        description: "Track review velocity and team health",
        Icon: ChartBarIcon,
      },
    ],
  },
  {
    heading: "Review anywhere",
    tone: "review",
    links: [
      {
        label: "Comments",
        href: `${FEATURE_ROUTE_PREFIX}comments`,
        description: "Pin feedback directly onto any page",
        Icon: MessageIcon,
      },
      {
        label: "Private Comments",
        href: `${FEATURE_ROUTE_PREFIX}private-comments`,
        description: "Notes only your team can see",
        Icon: LockIcon,
      },
      {
        label: "Recordings",
        href: `${FEATURE_ROUTE_PREFIX}recordings`,
        description: "Capture bugs with a quick screen record",
        Icon: VideoIcon,
      },
      {
        label: "Screenshots",
        href: `${FEATURE_ROUTE_PREFIX}screenshots`,
        description: "Snap and annotate the exact issue",
        Icon: CameraIcon,
      },
      {
        label: "Authenticated Pages",
        href: `${FEATURE_ROUTE_PREFIX}authenticated-pages`,
        description: "Review behind logins and gated flows",
        Icon: KeyIcon,
      },
      {
        label: "White Label",
        href: `${FEATURE_ROUTE_PREFIX}white-label`,
        description: "Make the review layer fully your own",
        Icon: PaletteIcon,
      },
    ],
  },
  {
    heading: "Workflow & ops",
    tone: "ops",
    links: [
      {
        label: "Review Workflows",
        href: `${FEATURE_ROUTE_PREFIX}review-workflows`,
        description: "Route approvals through your process",
        Icon: RouteIcon,
      },
      {
        label: "Kanban Board",
        href: `${FEATURE_ROUTE_PREFIX}kanban-board`,
        description: "Track every review from open to done",
        Icon: LayoutKanbanIcon,
      },
    ],
  },
];

/** Maps a group's colour tone to its CSS-module accent class. */
function toneClassName(tone: FeatureTone): string {
  try {
    if (tone === "ai") {
      return styles.toneAi;
    }
    if (tone === "review") {
      return styles.toneReview;
    }
    return styles.toneOps;
  } catch {
    return "";
  }
}

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
  const [isProductMenuOpen, setIsProductMenuOpen] = useState<boolean>(false);
  const [isMobileProductOpen, setIsMobileProductOpen] = useState<boolean>(false);
  const menuId = useId();
  const productMenuId = useId();
  const mobileProductId = useId();
  const headerRef = useRef<HTMLElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const productMenuRef = useRef<HTMLDivElement | null>(null);
  const productPanelRef = useRef<HTMLDivElement | null>(null);
  const productTriggerRef = useRef<HTMLButtonElement | null>(null);
  /* Pending hover-intent close timer id (see scheduleProductMenuClose). */
  const productCloseTimerRef = useRef<number | null>(null);
  /* Tracks whether the trigger was focused by a pointer press, so pointer-driven
     focus does not also open the menu (the hover/click handlers own that). */
  const productPointerFocusRef = useRef<boolean>(false);

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

  /** Clear any pending hover-intent close timer. */
  function clearProductCloseTimer() {
    try {
      if (productCloseTimerRef?.current) {
        window.clearTimeout(productCloseTimerRef.current);
      }
    } finally {
      productCloseTimerRef.current = null;
    }
  }

  /** Whether a node lives inside the Product trigger or the panel (one region). */
  function isWithinProductRegion(node: Node | null): boolean {
    try {
      const trigger = productMenuRef?.current;
      const panel = productPanelRef?.current;
      if (!node) {
        return false;
      }
      return Boolean(trigger?.contains(node)) || Boolean(panel?.contains(node));
    } catch {
      return false;
    }
  }

  /** Open the desktop Product mega-menu, cancelling any pending close. */
  function openProductMenu() {
    try {
      clearProductCloseTimer();
      setIsProductMenuOpen(true);
    } catch {
      setIsProductMenuOpen(false);
    }
  }

  /** Close the desktop Product mega-menu immediately (no grace period). */
  function closeProductMenu() {
    clearProductCloseTimer();
    setIsProductMenuOpen(false);
  }

  /** Close after a short grace period so a diagonal move to the panel is safe.
      Any subsequent re-enter of the trigger/panel cancels this pending close. */
  function scheduleProductMenuClose() {
    try {
      clearProductCloseTimer();
      productCloseTimerRef.current = window.setTimeout(() => {
        productCloseTimerRef.current = null;
        setIsProductMenuOpen(false);
      }, PRODUCT_MENU_CLOSE_DELAY_MS);
    } catch {
      setIsProductMenuOpen(false);
    }
  }

  /** Toggle the desktop Product mega-menu (click / Enter / Space). */
  function handleProductToggle() {
    try {
      clearProductCloseTimer();
      setIsProductMenuOpen((previous) => !previous);
    } catch {
      setIsProductMenuOpen(false);
    }
  }

  /** Note a pointer press so the following focus event does not double-open. */
  function handleProductPointerDown() {
    productPointerFocusRef.current = true;
  }

  /** Open on keyboard focus only; pointer focus is handled by hover/click. */
  function handleProductTriggerFocus() {
    try {
      if (!productPointerFocusRef?.current) {
        openProductMenu();
      }
    } catch {
      setIsProductMenuOpen(false);
    } finally {
      productPointerFocusRef.current = false;
    }
  }

  /** Close the mega-menu when focus leaves the trigger and the panel entirely. */
  function handleProductBlur(event: ReactFocusEvent<HTMLDivElement>) {
    try {
      const nextTarget = event?.relatedTarget as Node | null;
      if (nextTarget && !isWithinProductRegion(nextTarget)) {
        closeProductMenu();
      }
    } catch {
      setIsProductMenuOpen(false);
    }
  }

  /** Toggle the mobile Product accordion within the overlay menu. */
  function handleMobileProductToggle() {
    try {
      setIsMobileProductOpen((previous) => !previous);
    } catch {
      setIsMobileProductOpen(false);
    }
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
      const firstFocusable = mobileMenuRef.current?.querySelector<
        HTMLAnchorElement | HTMLButtonElement
      >("a, button");
      firstFocusable?.focus();
    } catch {
      /* no-op: focusing is a non-critical enhancement */
    }
  }, [isMenuOpen]);

  /* Collapse the mobile Product accordion whenever the overlay menu closes so
     it always reopens in its default (collapsed) state. */
  useEffect(() => {
    if (!isMenuOpen) {
      setIsMobileProductOpen(false);
    }
  }, [isMenuOpen]);

  /* While the desktop Product mega-menu is open, close it on Escape (restoring
     focus to its trigger) or on a pointer press outside the Product nav item. */
  useEffect(() => {
    if (!isProductMenuOpen) {
      return undefined;
    }

    /** Close the mega-menu and refocus the trigger when Escape is pressed. */
    function handleProductKeyDown(event: KeyboardEvent) {
      try {
        if (event?.key === "Escape") {
          closeProductMenu();
          productTriggerRef.current?.focus();
        }
      } catch {
        setIsProductMenuOpen(false);
      }
    }

    /** Close the mega-menu when a pointer press lands outside trigger + panel. */
    function handleProductPointer(event: PointerEvent) {
      try {
        const target = event?.target as Node | null;
        if (target && !isWithinProductRegion(target)) {
          closeProductMenu();
        }
      } catch {
        setIsProductMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleProductKeyDown);
    document.addEventListener("pointerdown", handleProductPointer);
    return () => {
      document.removeEventListener("keydown", handleProductKeyDown);
      document.removeEventListener("pointerdown", handleProductPointer);
    };
  }, [isProductMenuOpen]);

  /* Clear any outstanding hover-intent close timer when the component unmounts. */
  useEffect(() => {
    return () => {
      if (productCloseTimerRef.current) {
        window.clearTimeout(productCloseTimerRef.current);
        productCloseTimerRef.current = null;
      }
    };
  }, []);

  /* The bar wears its solid white treatment when scrolled AND, mirroring
     Asana's nav, whenever the Product mega-menu is open at the top of the page —
     so the full-width white sheet connects seamlessly to a white bar. */
  const isHeaderSolid = isScrolled || isProductMenuOpen;

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isHeaderSolid ? styles.scrolled : ""} ${
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
          {NAV_ITEMS.map((item) => {
            if (item?.label === PRODUCT_LABEL) {
              return (
                <div
                  key={item.label}
                  ref={productMenuRef}
                  className={styles.navItem}
                  onMouseEnter={openProductMenu}
                  onMouseLeave={scheduleProductMenuClose}
                  onBlur={handleProductBlur}
                >
                  <button
                    type="button"
                    ref={productTriggerRef}
                    className={`${styles.navLink} ${styles.navTrigger}`}
                    aria-expanded={isProductMenuOpen}
                    aria-controls={productMenuId}
                    onClick={handleProductToggle}
                    onPointerDown={handleProductPointerDown}
                    onFocus={handleProductTriggerFocus}
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={16}
                      className={`${styles.navChevron} ${
                        isProductMenuOpen ? styles.navChevronOpen : ""
                      }`}
                    />
                  </button>
                </div>
              );
            }

            return (
              <a key={item?.label} className={styles.navLink} href={item?.href}>
                {item?.label}
                {item?.hasMenu ? (
                  <ChevronDownIcon size={16} className={styles.navChevron} />
                ) : null}
              </a>
            );
          })}
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
        id={productMenuId}
        ref={productPanelRef}
        className={`${styles.megaMenu} ${
          isProductMenuOpen ? styles.megaMenuOpen : ""
        }`}
        aria-label={`${PRODUCT_LABEL} features`}
        onMouseEnter={openProductMenu}
        onMouseLeave={scheduleProductMenuClose}
        onBlur={handleProductBlur}
      >
        <div className={styles.megaInner}>
          {FEATURE_GROUPS.map((group) => (
            <div
              key={group.heading}
              className={`${styles.megaColumn} ${toneClassName(group.tone)}`}
            >
              <p className={styles.megaHeading}>{group.heading}</p>
              <div className={styles.megaLinks}>
                {group.links.map((link) => (
                  <a
                    key={link.href}
                    className={styles.megaLink}
                    href={link.href}
                    onClick={closeProductMenu}
                  >
                    <span className={styles.megaLinkIcon}>
                      <link.Icon size={20} />
                    </span>
                    <span className={styles.megaLinkText}>
                      <span className={styles.megaLinkLabel}>{link.label}</span>
                      <span className={styles.megaLinkDesc}>
                        {link.description}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        id={menuId}
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <nav className={styles.mobileMenuLinks} aria-label="Mobile">
          {NAV_ITEMS.map((item) => {
            if (item?.label === PRODUCT_LABEL) {
              return (
                <div key={item.label} className={styles.mobileNavGroup}>
                  <button
                    type="button"
                    className={`${styles.mobileNavLink} ${styles.mobileNavToggle}`}
                    aria-expanded={isMobileProductOpen}
                    aria-controls={mobileProductId}
                    onClick={handleMobileProductToggle}
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={18}
                      className={`${styles.mobileNavChevron} ${
                        isMobileProductOpen ? styles.navChevronOpen : ""
                      }`}
                    />
                  </button>

                  <div
                    id={mobileProductId}
                    className={`${styles.mobileSubMenu} ${
                      isMobileProductOpen ? styles.mobileSubMenuOpen : ""
                    }`}
                  >
                    {FEATURE_GROUPS.map((group) => (
                      <div
                        key={group.heading}
                        className={`${styles.mobileSubGroup} ${toneClassName(
                          group.tone
                        )}`}
                      >
                        <p className={styles.mobileSubHeading}>
                          {group.heading}
                        </p>
                        {group.links.map((link) => (
                          <a
                            key={link.href}
                            className={styles.mobileSubLink}
                            href={link.href}
                            onClick={closeMenu}
                          >
                            <span className={styles.megaLinkIcon}>
                              <link.Icon size={18} />
                            </span>
                            <span className={styles.mobileSubLinkText}>
                              <span className={styles.mobileSubLinkLabel}>
                                {link.label}
                              </span>
                              <span className={styles.mobileSubLinkDesc}>
                                {link.description}
                              </span>
                            </span>
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <a
                key={item?.label}
                className={styles.mobileNavLink}
                href={item?.href}
                onClick={closeMenu}
              >
                {item?.label}
              </a>
            );
          })}
        </nav>

        <a className={styles.mobileCta} href={CTA_HREF} onClick={closeMenu}>
          {CTA_LABEL}
        </a>
      </div>
    </header>
  );
}
