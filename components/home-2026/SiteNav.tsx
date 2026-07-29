"use client";

import Image from "next/image";
import Link from "next/link";
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
  UserCheckIcon,
  DevicesIcon,
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

/** A plain label + href row rendered inside the Assets list dropdown. */
type AssetLink = {
  label: string;
  href: string;
};

const BRAND_NAME = "Superflow";
/** Transparent Superflow logo mark (shared brand asset). */
const BRAND_MARK_SRC = "/images/home-2026/nav/superflow-mark.png";
const CTA_LABEL = "Get Started";
/** Destination for the "Get Started" CTA (shared by desktop bar + mobile menu). */
const CTA_HREF = "https://app.usesuperflow.com/signup";

/** Accessible labels for the mobile menu toggle in its two states. */
const MENU_OPEN_LABEL = "Open menu";
const MENU_CLOSE_LABEL = "Close menu";

/** Label of the nav item that owns the feature mega-menu. */
const PRODUCT_LABEL = "Product";
/** Label of the nav item that owns the review-formats list menu (Website /
    Video / Lottie / PDF / Image review) — matches the footer's "Supported
    Formats" column. */
const ASSETS_LABEL = "Formats";
/** Label of the nav item that owns the Integrations grouped menu. */
const INTEGRATIONS_LABEL = "Integrations";
/** Label of the nav item that owns the Resources list menu. */
const RESOURCES_LABEL = "Resources";
/** Shared route prefix for every feature detail page (served at the root slug). */
const FEATURE_ROUTE_PREFIX = "/";

/** ScrollY (px) past which the header switches to its solid white state. */
const SCROLL_THRESHOLD_PX = 48;

/** Grace period (ms) before a hovered dropdown closes, so a quick diagonal move
    from the trigger into the panel does not dismiss it. */
const DROPDOWN_CLOSE_DELAY_MS = 200;

const NAV_ITEMS: readonly NavItem[] = [
  { label: PRODUCT_LABEL, href: "#product", hasMenu: true },
  { label: ASSETS_LABEL, href: "#assets", hasMenu: true },
  { label: INTEGRATIONS_LABEL, href: "/integrations", hasMenu: true },
  { label: RESOURCES_LABEL, href: "#resources", hasMenu: true },
  { label: "Demo", href: "/demo" },
  { label: "Pricing", href: "/pricing" },
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
        href: `${FEATURE_ROUTE_PREFIX}ai-review-agents`,
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
        label: "Client Review",
        href: `${FEATURE_ROUTE_PREFIX}client-review`,
        description: "Clients approve from a link, no account",
        Icon: UserCheckIcon,
      },
      {
        label: "Cross-Device Review",
        href: `${FEATURE_ROUTE_PREFIX}cross-device-review`,
        description: "Review on real phones and tablets",
        Icon: DevicesIcon,
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

/**
 * Review surfaces grouped by asset type, surfaced in the Assets dropdown. Each
 * links to its dedicated `/<asset>-review` marketing page. Shared by the desktop
 * list dropdown and the mobile accordion so both stay in sync.
 */
const ASSET_LINKS: readonly AssetLink[] = [
  { label: "Website Review", href: "/website-review" },
  { label: "Video Review", href: "/video-review" },
  { label: "Lottie Review", href: "/lottie-files-review" },
  { label: "PDF Review", href: "/pdf-review" },
  { label: "Image Review", href: "/image-review" },
];

/** A titled category of connector links inside the Integrations dropdown. */
type IntegrationGroup = {
  heading: string;
  links: readonly AssetLink[];
};

/** Integrations hub index; connectors without a detail page link here. */
const INTEGRATIONS_INDEX_HREF = "/integrations";

/**
 * Connector links surfaced in the Integrations dropdown, grouped into the
 * four categories from the /integrations catalog (see CATEGORIES in
 * home-2026/IntegrationsSection) in nav-specific order, with the catalog's
 * "Delivery" group surfaced here as "Notifications". Connectors without a
 * public detail page fall back to the hub index, matching the catalog
 * chips. Shared by the desktop dropdown and the mobile accordion.
 */
const INTEGRATION_GROUPS: readonly IntegrationGroup[] = [
  {
    heading: "Installation",
    links: [
      { label: "Webflow", href: `${INTEGRATIONS_INDEX_HREF}/webflow` },
      { label: "WordPress", href: `${INTEGRATIONS_INDEX_HREF}/wordpress` },
      { label: "Shopify", href: `${INTEGRATIONS_INDEX_HREF}/shopify` },
      {
        label: "Google Tag Manager",
        href: `${INTEGRATIONS_INDEX_HREF}/google-tag-manager`,
      },
      { label: "Framer", href: INTEGRATIONS_INDEX_HREF },
    ],
  },
  {
    heading: "Task Management",
    links: [
      { label: "Asana", href: `${INTEGRATIONS_INDEX_HREF}/asana` },
      { label: "Trello", href: INTEGRATIONS_INDEX_HREF },
      { label: "Monday.com", href: `${INTEGRATIONS_INDEX_HREF}/monday` },
      { label: "ClickUp", href: `${INTEGRATIONS_INDEX_HREF}/clickup` },
      { label: "Jira", href: INTEGRATIONS_INDEX_HREF },
    ],
  },
  {
    heading: "Notifications",
    links: [
      { label: "Slack", href: `${INTEGRATIONS_INDEX_HREF}/slack` },
      { label: "Email", href: INTEGRATIONS_INDEX_HREF },
    ],
  },
  {
    heading: "Developer",
    links: [
      { label: "Webhooks", href: INTEGRATIONS_INDEX_HREF },
      { label: "REST API", href: `${INTEGRATIONS_INDEX_HREF}/api` },
    ],
  },
];

/** Footer row label in the Integrations dropdown linking to the hub. */
const INTEGRATIONS_ALL_LABEL = "All Integrations";

/** A single row in the Resources list dropdown. `badge` shows a small "$" chip
    (paid/tool cue), and off-site URLs open in a new tab. */
type ResourceLink = {
  label: string;
  href: string;
  badge?: boolean;
};

/**
 * Resource links surfaced in the Resources dropdown. Mirrors the legacy footer's
 * Resources column so both stay in sync; off-site entries (Docs, YouTube,
 * community) are absolute URLs opened in a new tab. Shared by the desktop list
 * dropdown and the mobile accordion.
 */
const RESOURCE_LINKS: readonly ResourceLink[] = [
  {
    label: "Docs",
    href: "https://docs.usesuperflow.com/no-code-platforms/webflow/setup",
  },
  { label: "Case Study", href: "/case-study/writesonic" },
  { label: "SEO Checklist", href: "/seo-checklist-2023" },
  { label: "Blog", href: "/blog" },
  { label: "Alternatives", href: "/alternative" },
  { label: "Comparisons", href: "/comparisons" },
  { label: "ROI Calculator", href: "/calculator", badge: true },
  { label: "YouTube", href: "https://www.youtube.com/@usesuperflow" },
  {
    label: "Join Community",
    href: "https://superflowusers.slack.com/ssb/redirect",
  },
];

/**
 * Extra anchor attributes for a link, opening off-site (http/https) URLs in a
 * new tab with a safe `rel`; same-origin routes get no extras.
 * @param href The link's destination.
 * @returns `target`/`rel` props to spread onto the anchor.
 */
function externalLinkProps(href: string): { target?: string; rel?: string } {
  try {
    return /^https?:\/\//i.test(href)
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};
  } catch {
    return {};
  }
}

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
/** Props for {@link SiteNav}. */
interface SiteNavProps {
  /**
   * When true, the header renders its solid white treatment from the top of
   * the page instead of waiting for the user to scroll past
   * {@link SCROLL_THRESHOLD_PX}. Use on routes with light-background heroes
   * (e.g. blog pages) where the default transparent bar's white links would
   * be unreadable.
   */
  solidAtTop?: boolean;
}

export default function SiteNav({ solidAtTop = false }: SiteNavProps = {}) {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  /* Label of the desktop dropdown currently open, or null. A single value keeps
     the Product and Assets menus mutually exclusive. */
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  /* Label of the mobile accordion currently expanded, or null. */
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );
  const menuId = useId();
  const productMenuId = useId();
  const assetsMenuId = useId();
  const integrationsMenuId = useId();
  const resourcesMenuId = useId();
  const mobileProductId = useId();
  const mobileAssetsId = useId();
  const mobileIntegrationsId = useId();
  const mobileResourcesId = useId();
  const headerRef = useRef<HTMLElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const productMenuRef = useRef<HTMLDivElement | null>(null);
  const productPanelRef = useRef<HTMLDivElement | null>(null);
  const productTriggerRef = useRef<HTMLButtonElement | null>(null);
  const assetsMenuRef = useRef<HTMLDivElement | null>(null);
  const assetsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const integrationsMenuRef = useRef<HTMLDivElement | null>(null);
  const integrationsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const resourcesMenuRef = useRef<HTMLDivElement | null>(null);
  const resourcesTriggerRef = useRef<HTMLButtonElement | null>(null);
  /* Pending hover-intent close timer id (see scheduleDropdownClose). */
  const dropdownCloseTimerRef = useRef<number | null>(null);
  /* Tracks whether a trigger was focused by a pointer press, so pointer-driven
     focus does not also open the menu (the hover/click handlers own that). */
  const dropdownPointerFocusRef = useRef<boolean>(false);

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
  function clearDropdownCloseTimer() {
    try {
      if (dropdownCloseTimerRef?.current) {
        window.clearTimeout(dropdownCloseTimerRef.current);
      }
    } finally {
      dropdownCloseTimerRef.current = null;
    }
  }

  /** Whether a node lives inside any dropdown trigger or panel (one region). */
  function isWithinDropdownRegion(node: Node | null): boolean {
    try {
      if (!node) {
        return false;
      }
      return (
        Boolean(productMenuRef?.current?.contains(node)) ||
        Boolean(productPanelRef?.current?.contains(node)) ||
        Boolean(assetsMenuRef?.current?.contains(node)) ||
        Boolean(integrationsMenuRef?.current?.contains(node)) ||
        Boolean(resourcesMenuRef?.current?.contains(node))
      );
    } catch {
      return false;
    }
  }

  /** Open the given desktop dropdown, cancelling any pending close. */
  function openDropdownMenu(label: string) {
    try {
      clearDropdownCloseTimer();
      setOpenDropdown(label);
    } catch {
      setOpenDropdown(null);
    }
  }

  /** Close the open desktop dropdown immediately (no grace period). */
  function closeDropdownMenu() {
    clearDropdownCloseTimer();
    setOpenDropdown(null);
  }

  /** Close after a short grace period so a diagonal move to the panel is safe.
      Any subsequent re-enter of a trigger/panel cancels this pending close. */
  function scheduleDropdownClose() {
    try {
      clearDropdownCloseTimer();
      dropdownCloseTimerRef.current = window.setTimeout(() => {
        dropdownCloseTimerRef.current = null;
        setOpenDropdown(null);
      }, DROPDOWN_CLOSE_DELAY_MS);
    } catch {
      setOpenDropdown(null);
    }
  }

  /** Toggle the given desktop dropdown (click / Enter / Space). */
  function toggleDropdownMenu(label: string) {
    try {
      clearDropdownCloseTimer();
      setOpenDropdown((previous) => (previous === label ? null : label));
    } catch {
      setOpenDropdown(null);
    }
  }

  /** Note a pointer press so the following focus event does not double-open. */
  function handleDropdownPointerDown() {
    dropdownPointerFocusRef.current = true;
  }

  /** Open on keyboard focus only; pointer focus is handled by hover/click. */
  function handleTriggerFocus(label: string) {
    try {
      if (!dropdownPointerFocusRef?.current) {
        openDropdownMenu(label);
      }
    } catch {
      setOpenDropdown(null);
    } finally {
      dropdownPointerFocusRef.current = false;
    }
  }

  /** Close the open dropdown when focus leaves its trigger and panel entirely. */
  function handleDropdownBlur(event: ReactFocusEvent<HTMLDivElement>) {
    try {
      const nextTarget = event?.relatedTarget as Node | null;
      if (nextTarget && !isWithinDropdownRegion(nextTarget)) {
        closeDropdownMenu();
      }
    } catch {
      setOpenDropdown(null);
    }
  }

  /** Toggle the given mobile accordion within the overlay menu. */
  function handleMobileDropdownToggle(label: string) {
    try {
      setOpenMobileDropdown((previous) => (previous === label ? null : label));
    } catch {
      setOpenMobileDropdown(null);
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

  /* Collapse any expanded mobile accordion whenever the overlay menu closes so
     it always reopens in its default (collapsed) state. */
  useEffect(() => {
    if (!isMenuOpen) {
      setOpenMobileDropdown(null);
    }
  }, [isMenuOpen]);

  /* While a desktop dropdown is open, close it on Escape (restoring focus to its
     trigger) or on a pointer press outside every dropdown trigger + panel. */
  useEffect(() => {
    if (!openDropdown) {
      return undefined;
    }

    /** Close the dropdown and refocus its trigger when Escape is pressed. */
    function handleDropdownKeyDown(event: KeyboardEvent) {
      try {
        if (event?.key === "Escape") {
          const label = openDropdown;
          closeDropdownMenu();
          if (label === PRODUCT_LABEL) {
            productTriggerRef.current?.focus();
          } else if (label === ASSETS_LABEL) {
            assetsTriggerRef.current?.focus();
          } else if (label === INTEGRATIONS_LABEL) {
            integrationsTriggerRef.current?.focus();
          } else if (label === RESOURCES_LABEL) {
            resourcesTriggerRef.current?.focus();
          }
        }
      } catch {
        setOpenDropdown(null);
      }
    }

    /** Close the dropdown when a pointer press lands outside trigger + panel. */
    function handleDropdownPointer(event: PointerEvent) {
      try {
        const target = event?.target as Node | null;
        if (target && !isWithinDropdownRegion(target)) {
          closeDropdownMenu();
        }
      } catch {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("keydown", handleDropdownKeyDown);
    document.addEventListener("pointerdown", handleDropdownPointer);
    return () => {
      document.removeEventListener("keydown", handleDropdownKeyDown);
      document.removeEventListener("pointerdown", handleDropdownPointer);
    };
  }, [openDropdown]);

  /* Clear any outstanding hover-intent close timer when the component unmounts. */
  useEffect(() => {
    return () => {
      if (dropdownCloseTimerRef.current) {
        window.clearTimeout(dropdownCloseTimerRef.current);
        dropdownCloseTimerRef.current = null;
      }
    };
  }, []);

  /* The bar wears its solid white treatment when scrolled AND, mirroring
     Asana's nav, whenever a dropdown is open at the top of the page - so the
     white panel connects seamlessly to a white bar. Routes that opt in via
     `solidAtTop` (e.g. blog pages with light heroes) keep it solid throughout. */
  const isHeaderSolid = solidAtTop || isScrolled || openDropdown !== null;

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isHeaderSolid ? styles.scrolled : ""} ${
        isMenuOpen ? styles.menuOpen : ""
      }`}
    >
      <nav className={styles.inner} aria-label="Primary">
        <Link className={styles.brand} href="/" aria-label={`${BRAND_NAME} home`}>
          <Image
            className={styles.brandMark}
            src={BRAND_MARK_SRC}
            alt=""
            width={17}
            height={16}
          />
          {BRAND_NAME}
        </Link>

        <div className={styles.navLinks}>
          {NAV_ITEMS.map((item) => {
            if (item?.label === PRODUCT_LABEL) {
              return (
                <div
                  key={item.label}
                  ref={productMenuRef}
                  className={styles.navItem}
                  onMouseEnter={() => openDropdownMenu(PRODUCT_LABEL)}
                  onMouseLeave={scheduleDropdownClose}
                  onBlur={handleDropdownBlur}
                >
                  <button
                    type="button"
                    ref={productTriggerRef}
                    className={`${styles.navLink} ${styles.navTrigger}`}
                    aria-expanded={openDropdown === PRODUCT_LABEL}
                    aria-controls={productMenuId}
                    onClick={() => toggleDropdownMenu(PRODUCT_LABEL)}
                    onPointerDown={handleDropdownPointerDown}
                    onFocus={() => handleTriggerFocus(PRODUCT_LABEL)}
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={16}
                      className={`${styles.navChevron} ${
                        openDropdown === PRODUCT_LABEL
                          ? styles.navChevronOpen
                          : ""
                      }`}
                    />
                  </button>
                </div>
              );
            }

            if (item?.label === ASSETS_LABEL) {
              return (
                <div
                  key={item.label}
                  ref={assetsMenuRef}
                  className={styles.navItem}
                  onMouseEnter={() => openDropdownMenu(ASSETS_LABEL)}
                  onMouseLeave={scheduleDropdownClose}
                  onBlur={handleDropdownBlur}
                >
                  <button
                    type="button"
                    ref={assetsTriggerRef}
                    className={`${styles.navLink} ${styles.navTrigger}`}
                    aria-expanded={openDropdown === ASSETS_LABEL}
                    aria-controls={assetsMenuId}
                    onClick={() => toggleDropdownMenu(ASSETS_LABEL)}
                    onPointerDown={handleDropdownPointerDown}
                    onFocus={() => handleTriggerFocus(ASSETS_LABEL)}
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={16}
                      className={`${styles.navChevron} ${
                        openDropdown === ASSETS_LABEL
                          ? styles.navChevronOpen
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    id={assetsMenuId}
                    className={`${styles.listMenu} ${
                      openDropdown === ASSETS_LABEL ? styles.listMenuOpen : ""
                    }`}
                    aria-label={`${ASSETS_LABEL} links`}
                  >
                    {ASSET_LINKS.map((link) => (
                      <a
                        key={link.href}
                        className={styles.listLink}
                        href={link.href}
                        onClick={closeDropdownMenu}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              );
            }

            if (item?.label === INTEGRATIONS_LABEL) {
              return (
                <div
                  key={item.label}
                  ref={integrationsMenuRef}
                  className={styles.navItem}
                  onMouseEnter={() => openDropdownMenu(INTEGRATIONS_LABEL)}
                  onMouseLeave={scheduleDropdownClose}
                  onBlur={handleDropdownBlur}
                >
                  <button
                    type="button"
                    ref={integrationsTriggerRef}
                    className={`${styles.navLink} ${styles.navTrigger}`}
                    aria-expanded={openDropdown === INTEGRATIONS_LABEL}
                    aria-controls={integrationsMenuId}
                    onClick={() => toggleDropdownMenu(INTEGRATIONS_LABEL)}
                    onPointerDown={handleDropdownPointerDown}
                    onFocus={() => handleTriggerFocus(INTEGRATIONS_LABEL)}
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={16}
                      className={`${styles.navChevron} ${
                        openDropdown === INTEGRATIONS_LABEL
                          ? styles.navChevronOpen
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    id={integrationsMenuId}
                    className={`${styles.listMenu} ${styles.integrationsMenu} ${
                      openDropdown === INTEGRATIONS_LABEL
                        ? styles.listMenuOpen
                        : ""
                    }`}
                    aria-label={`${INTEGRATIONS_LABEL} categories`}
                  >
                    <div className={styles.integrationsGrid}>
                      {INTEGRATION_GROUPS.map((group) => (
                        <div
                          key={group.heading}
                          className={styles.integrationsGroup}
                        >
                          <p className={styles.integrationsHeading}>
                            {group.heading}
                          </p>
                          {group.links.map((link) => (
                            <a
                              key={link.label}
                              className={styles.listLink}
                              href={link.href}
                              onClick={closeDropdownMenu}
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                    <a
                      className={`${styles.listLink} ${styles.integrationsAllLink}`}
                      href={INTEGRATIONS_INDEX_HREF}
                      onClick={closeDropdownMenu}
                    >
                      {INTEGRATIONS_ALL_LABEL}
                    </a>
                  </div>
                </div>
              );
            }

            if (item?.label === RESOURCES_LABEL) {
              return (
                <div
                  key={item.label}
                  ref={resourcesMenuRef}
                  className={styles.navItem}
                  onMouseEnter={() => openDropdownMenu(RESOURCES_LABEL)}
                  onMouseLeave={scheduleDropdownClose}
                  onBlur={handleDropdownBlur}
                >
                  <button
                    type="button"
                    ref={resourcesTriggerRef}
                    className={`${styles.navLink} ${styles.navTrigger}`}
                    aria-expanded={openDropdown === RESOURCES_LABEL}
                    aria-controls={resourcesMenuId}
                    onClick={() => toggleDropdownMenu(RESOURCES_LABEL)}
                    onPointerDown={handleDropdownPointerDown}
                    onFocus={() => handleTriggerFocus(RESOURCES_LABEL)}
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={16}
                      className={`${styles.navChevron} ${
                        openDropdown === RESOURCES_LABEL
                          ? styles.navChevronOpen
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    id={resourcesMenuId}
                    className={`${styles.listMenu} ${
                      openDropdown === RESOURCES_LABEL ? styles.listMenuOpen : ""
                    }`}
                    aria-label={`${RESOURCES_LABEL} links`}
                  >
                    {RESOURCE_LINKS.map((link) => (
                      <a
                        key={link.href}
                        className={styles.listLink}
                        href={link.href}
                        onClick={closeDropdownMenu}
                        {...externalLinkProps(link.href)}
                      >
                        {link.label}
                        {link.badge ? (
                          <span
                            className={styles.listLinkBadge}
                            aria-hidden="true"
                          >
                            $
                          </span>
                        ) : null}
                      </a>
                    ))}
                  </div>
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
          openDropdown === PRODUCT_LABEL ? styles.megaMenuOpen : ""
        }`}
        aria-label={`${PRODUCT_LABEL} features`}
        onMouseEnter={() => openDropdownMenu(PRODUCT_LABEL)}
        onMouseLeave={scheduleDropdownClose}
        onBlur={handleDropdownBlur}
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
                    onClick={closeDropdownMenu}
                  >
                    <span className={styles.megaLinkIcon}>
                      <link.Icon size={20} />
                    </span>
                    <span className={styles.megaLinkLabel}>{link.label}</span>
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
                    aria-expanded={openMobileDropdown === PRODUCT_LABEL}
                    aria-controls={mobileProductId}
                    onClick={() => handleMobileDropdownToggle(PRODUCT_LABEL)}
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={18}
                      className={`${styles.mobileNavChevron} ${
                        openMobileDropdown === PRODUCT_LABEL
                          ? styles.navChevronOpen
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    id={mobileProductId}
                    className={`${styles.mobileSubMenu} ${
                      openMobileDropdown === PRODUCT_LABEL
                        ? styles.mobileSubMenuOpen
                        : ""
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

            if (item?.label === ASSETS_LABEL) {
              return (
                <div key={item.label} className={styles.mobileNavGroup}>
                  <button
                    type="button"
                    className={`${styles.mobileNavLink} ${styles.mobileNavToggle}`}
                    aria-expanded={openMobileDropdown === ASSETS_LABEL}
                    aria-controls={mobileAssetsId}
                    onClick={() => handleMobileDropdownToggle(ASSETS_LABEL)}
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={18}
                      className={`${styles.mobileNavChevron} ${
                        openMobileDropdown === ASSETS_LABEL
                          ? styles.navChevronOpen
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    id={mobileAssetsId}
                    className={`${styles.mobileSubMenu} ${
                      openMobileDropdown === ASSETS_LABEL
                        ? styles.mobileSubMenuOpen
                        : ""
                    }`}
                  >
                    {ASSET_LINKS.map((link) => (
                      <a
                        key={link.href}
                        className={styles.mobileListLink}
                        href={link.href}
                        onClick={closeMenu}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              );
            }

            if (item?.label === INTEGRATIONS_LABEL) {
              return (
                <div key={item.label} className={styles.mobileNavGroup}>
                  <button
                    type="button"
                    className={`${styles.mobileNavLink} ${styles.mobileNavToggle}`}
                    aria-expanded={openMobileDropdown === INTEGRATIONS_LABEL}
                    aria-controls={mobileIntegrationsId}
                    onClick={() =>
                      handleMobileDropdownToggle(INTEGRATIONS_LABEL)
                    }
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={18}
                      className={`${styles.mobileNavChevron} ${
                        openMobileDropdown === INTEGRATIONS_LABEL
                          ? styles.navChevronOpen
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    id={mobileIntegrationsId}
                    className={`${styles.mobileSubMenu} ${
                      openMobileDropdown === INTEGRATIONS_LABEL
                        ? styles.mobileSubMenuOpen
                        : ""
                    }`}
                  >
                    {INTEGRATION_GROUPS.map((group) => (
                      <div
                        key={group.heading}
                        className={styles.mobileSubGroup}
                      >
                        <p className={styles.mobileSubHeading}>
                          {group.heading}
                        </p>
                        {group.links.map((link) => (
                          <a
                            key={link.label}
                            className={styles.mobileListLink}
                            href={link.href}
                            onClick={closeMenu}
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    ))}
                    <a
                      className={styles.mobileListLink}
                      href={INTEGRATIONS_INDEX_HREF}
                      onClick={closeMenu}
                    >
                      {INTEGRATIONS_ALL_LABEL}
                    </a>
                  </div>
                </div>
              );
            }

            if (item?.label === RESOURCES_LABEL) {
              return (
                <div key={item.label} className={styles.mobileNavGroup}>
                  <button
                    type="button"
                    className={`${styles.mobileNavLink} ${styles.mobileNavToggle}`}
                    aria-expanded={openMobileDropdown === RESOURCES_LABEL}
                    aria-controls={mobileResourcesId}
                    onClick={() => handleMobileDropdownToggle(RESOURCES_LABEL)}
                  >
                    {item.label}
                    <ChevronDownIcon
                      size={18}
                      className={`${styles.mobileNavChevron} ${
                        openMobileDropdown === RESOURCES_LABEL
                          ? styles.navChevronOpen
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    id={mobileResourcesId}
                    className={`${styles.mobileSubMenu} ${
                      openMobileDropdown === RESOURCES_LABEL
                        ? styles.mobileSubMenuOpen
                        : ""
                    }`}
                  >
                    {RESOURCE_LINKS.map((link) => (
                      <a
                        key={link.href}
                        className={styles.mobileListLink}
                        href={link.href}
                        onClick={closeMenu}
                        {...externalLinkProps(link.href)}
                      >
                        {link.label}
                        {link.badge ? (
                          <span
                            className={styles.mobileListLinkBadge}
                            aria-hidden="true"
                          >
                            $
                          </span>
                        ) : null}
                      </a>
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
