"use client";

// "Our Customers Trust Us" — wide dark section with section heading,
// subheading, and two CTA buttons above an auto-rotating marquee of large
// quote cards. Each card holds a customer logo, bold pull-quote heading, a
// multi-line body paragraph, and an avatar+name+role row at the bottom.
//
// Animation: CSS keyframe translateX on a doubled track (cards rendered
// twice back-to-back) so the loop wraps seamlessly. Hover slows playback
// to 10% via Web Animations API playbackRate so the user can read a card
// without jumping the position. prefers-reduced-motion disables animation
// and falls back to a manual horizontal scroll.

import Link from "next/link";
import { useEffect, useRef } from "react";

type CtaLink = {
  label?: string;
  href?: string;
  newTab?: boolean;
};

export type FeatureCustomerCarouselCard = {
  customerLogoSrc?: string;
  pullQuote: string;
  body?: string;
  authorName: string;
  authorRole?: string;
  authorAvatarSrc?: string;
};

export type FeatureCustomerCarouselProps = {
  heading?: string;
  subheading?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  cards?: FeatureCustomerCarouselCard[];
};

// Chrome defaults — used when the carousel is dropped onto a page as
// shared chrome (above the FAQ) with no per-page overrides.
const DEFAULT_HEADING = "Our Customers Trust Us";
const DEFAULT_SUBHEADING =
  "Teams ship Velt collaboration to millions of users every day.";
const DEFAULT_PRIMARY_CTA: CtaLink = {
  label: "Get Free API Key",
  href: "https://console.velt.dev/",
  newTab: true,
};
const DEFAULT_SECONDARY_CTA: CtaLink = {
  label: "View Customers",
  href: "/customers",
};

// Card sizing matches the live site (510 tall, 400 wide, 10px gap, 32px radius).
const CARD_W = 400;
const CARD_H = 510;
const CARD_GAP = 10;
const SCROLL_SPEED = 60; // px/sec — testimonials need readable dwell time
const HOVER_FACTOR = 0.1; // slow on hover, don't pause (see StealFeatures.tsx)

// Default testimonials. Used when the consumer (Sanity) doesn't provide its
// own card list. Order matches the live homepage marquee so this section
// stays consistent across feature pages until per-page overrides are added.
const TRUST_DEFAULTS: FeatureCustomerCarouselCard[] = [
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-google.png",
    pullQuote:
      "Velt’s commenting & notification features are bundled with a lot of magic",
    body: "Velt gave us 1-on-1 attention in our own private slack channel. The team was quick to add new features that we needed (thanks for the category feature!) We were extremely happy with how customizable Velt’s components were, allowing us to keep a cohesive look and feel to our product. Highly recommended.",
    authorName: "Yuri Kleban",
    authorRole: "Sr. Product Manager @Google",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-yuri.png",
  },
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-x.png",
    pullQuote: "Full collaboration features shipped in under 1 week",
    body: "Building our own collaborative features was becoming an overwhelming task, so we were relieved when we found Velt. Their SDK included all the commenting and notifications features we needed, and were easy to integrate. We shipped comments in just a week, without having to build from scratch!",
    authorName: "Chris Bakke",
    authorRole: "Head of Product @X",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-chris-bakke.png",
  },
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-metaimpact.png",
    pullQuote: "Increased weekly active users by 26%",
    body: "Velt gave us 1-on-1 attention in our own private slack channel. The team was quick to add new features that we needed (thanks for the category feature!) We were extremely happy with how customizable Velt’s components were, allowing us to keep a cohesive look and feel to our product. Highly recommended.",
    authorName: "Jeff Cunning",
    authorRole: "CPO @metaimpact",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-jeff.png",
  },
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-trumpet.png",
    pullQuote: "Increased engagement by 10% and helped ship 5x faster.",
    body: "Took about a week for the implementation. The speed of iteration from the Velt team is incredible compared to alternatives, they're always happy to discuss and find a solution. The Velt team was extremely supportive and responsive to feedback. Docs were clear and easy to understand.",
    authorName: "William Angel",
    authorRole: "Lead PM @Trumpet",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-william.png",
  },
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-leadpages.png",
    pullQuote: "Saved 3 FTEs & will boost retention",
    body: "Implementing Velt took weeks, not the quarters it would have taken us to build in-house, even with 3 FTE engineers. We're already seeing added value for our users and anticipate increased retention. Velt's product is slick, and their team is incredibly supportive.",
    authorName: "Hope Callaway",
    authorRole: "Sr. Product Manager @Leadpages",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-hope.png",
  },
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-cloudfactory.png",
    pullQuote: "Saved massive development effort",
    body: "Velt provides the critical commenting functionality our customers rely on, saving us massive development effort. Migration from our previous vendor was seamless.",
    authorName: "Fenne Buitenrust Hettema",
    authorRole: "Product Lead @Cloudfactory",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-fenne.png",
  },
  {
    // Bigtincan card — name/role intentionally mirrors the live site
    // (where the CMS labels it "Chris Bakke / Head of Product @X" against
    // a Gavin McIver avatar). Preserved verbatim per design parity ask.
    // Placed mid-list so it isn't adjacent to the real X testimonial above.
    customerLogoSrc: "/images/features/comments/trust-us/logo-bigtincan.png",
    pullQuote:
      "With Velt we turned months of development into weeks of delivery.",
    body: "We considered building this feature in-house. However, we quickly realized that creating a robust, scalable commenting system with all the modern collaboration features our users expect would require months of development effort and significant engineering resources, pulling our teams away from core innovation projects. That's when we discovered Velt.",
    authorName: "Chris Bakke",
    authorRole: "Head of Product @X",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-gavin.png",
  },
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-eqtble.png",
    pullQuote: "Boosted customer happiness.",
    body: "Commenting is something that we knew we wanted in our app but with limited resources it wasn’t going to be prioritized. That is until we found out about Velt. The team was fantastic to work with.",
    authorName: "Ethan Veres",
    authorRole: "Co-founder and CTO @eqtble",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-ethan.png",
  },
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-awesomic.png",
    pullQuote:
      "We were able to launch 5x times faster than building from scratch.",
    body: "Velt is a great product that sped up our feature development. It's saved us weeks of work.",
    authorName: "Roman Sevast",
    authorRole: "CEO @Awesomic",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-roman.png",
  },
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-marco.png",
    pullQuote:
      "With Velt, a single engineer could build comments feature in a few minutes.",
    body: "Velt is outstanding! It helped us enable clear and quick communication with customers. With Velt, a single engineer could add comments in a few minutes without help from Product or Design. The docs were clear and straightforward. We spent only a few minutes making Comments work.",
    authorName: "Weller Miranda",
    authorRole: "Sr. Software Engineer @Marco",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-weller.png",
  },
  {
    customerLogoSrc: "/images/features/comments/trust-us/logo-colossyan.png",
    pullQuote: "Boosted engagement in our product!",
    body: "It saved on engineering and the team is very quick on action! Keep up the responsiveness. We look forward to a long term partnership.",
    authorName: "Imre Nagy",
    authorRole: "VP of Engineering @Colossyan",
    authorAvatarSrc: "/images/features/comments/trust-us/avatar-imre.png",
  },
];

export function FeatureCustomerCarousel({
  heading = DEFAULT_HEADING,
  subheading = DEFAULT_SUBHEADING,
  primaryCta = DEFAULT_PRIMARY_CTA,
  secondaryCta = DEFAULT_SECONDARY_CTA,
  cards,
}: FeatureCustomerCarouselProps = {}) {
  // Always use the canonical TRUST_DEFAULTS for now — the live homepage
  // marquee is the source of truth, and Sanity content for this section
  // is intentionally ignored until per-page overrides are explicitly
  // wanted. Keep the prop in the type so the dispatcher still compiles.
  void cards;
  const list = TRUST_DEFAULTS;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const setRate = (rate: number) => {
      // CSS keyframe animations expose CSSAnimation objects via
      // Element.getAnimations() and accept playbackRate edits without
      // resetting position (unlike swapping animation-duration in WebKit).
      for (const a of track.getAnimations()) {
        a.playbackRate = rate;
      }
    };

    const onEnter = () => setRate(HOVER_FACTOR);
    const onLeave = () => setRate(1);

    viewport.addEventListener("mouseenter", onEnter);
    viewport.addEventListener("mouseleave", onLeave);
    return () => {
      viewport.removeEventListener("mouseenter", onEnter);
      viewport.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (list.length === 0) return null;

  // Translate by one full set so the loop wraps seamlessly when the second
  // duplicated set lands where the first started.
  const trackShift = list.length * (CARD_W + CARD_GAP);
  const durationSec = trackShift / SCROLL_SPEED;

  return (
    <section
      // `data-getstarted` is the Nav's dark-return marker (see
      // components/home/Nav.tsx). The Nav uses querySelector (first
      // match), so on pages where this carousel is rendered it wins
      // over LibraryFAQ's same-named marker — making the nav flip back
      // to dark/transparent at the top of the carousel, not the FAQ.
      data-getstarted
      className="flex flex-col items-center bg-black w-full pt-20 lg:pt-[120px] pb-12 lg:pb-[60px] gap-8 lg:gap-10"
    >
      <div className="flex flex-col items-center text-center gap-6 max-w-[820px] w-full px-6 lg:px-20">
        <h2
          className="font-urbanist font-bold text-white m-0"
          style={{
            fontSize: "clamp(28px, 4.2vw, 52px)",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
          }}
        >
          {heading}
        </h2>
        {subheading ? (
          <p
            className="font-urbanist text-white m-0 max-w-[720px]"
            style={{
              fontSize: "clamp(15px, 1.4vw, 18px)",
              lineHeight: 1.4,
              opacity: 0.6,
            }}
          >
            {subheading}
          </p>
        ) : null}
        {(primaryCta?.label || secondaryCta?.label) && (
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {secondaryCta?.label && secondaryCta.href ? (
              <CtaButton variant="secondary" cta={secondaryCta} />
            ) : null}
            {primaryCta?.label && primaryCta.href ? (
              <CtaButton variant="primary" cta={primaryCta} />
            ) : null}
          </div>
        )}
      </div>

      <style>{`
        @keyframes trust-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-${trackShift}px); }
        }
        .trust-marquee-track {
          animation: trust-marquee ${durationSec}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .trust-marquee-track { animation: none; }
          .trust-marquee-viewport { overflow-x: auto; }
        }
      `}</style>

      <div
        ref={viewportRef}
        className="trust-marquee-viewport w-full overflow-hidden"
        style={{ padding: 10 }}
      >
        <div
          ref={trackRef}
          className="trust-marquee-track flex"
          style={{
            gap: CARD_GAP,
            width: "max-content",
            willChange: "transform",
          }}
        >
          {[...list, ...list].map((card, i) => (
            <article
              key={`${card.authorName}-${i}`}
              aria-hidden={i >= list.length}
              className="flex flex-col shrink-0"
              style={{
                width: CARD_W,
                height: CARD_H,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 32,
                padding: 40,
                gap: 24,
              }}
            >
              {card.customerLogoSrc ? (
                <div style={{ height: 22 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.customerLogoSrc}
                    alt=""
                    style={{
                      height: 22,
                      maxWidth: 140,
                      objectFit: "contain",
                      objectPosition: "left center",
                      display: "block",
                      // Tint logos to white so brand-color logos (Google,
                      // Trumpet, etc.) stay legible against the dark card.
                      // Matches the greyscale look on velt.dev/.
                      filter: "brightness(0) invert(1)",
                      opacity: 0.85,
                    }}
                  />
                </div>
              ) : null}
              <h3
                className="font-urbanist font-bold text-white"
                style={{
                  fontSize: 24,
                  lineHeight: "120%",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {card.pullQuote}
              </h3>
              {card.body ? (
                <p
                  className="font-urbanist text-white"
                  style={{
                    fontSize: 14,
                    lineHeight: "150%",
                    opacity: 0.52,
                    margin: 0,
                  }}
                >
                  {card.body}
                </p>
              ) : null}
              <div
                className="flex items-center"
                style={{ gap: 12, marginTop: "auto" }}
              >
                {card.authorAvatarSrc ? (
                  <div
                    className="relative overflow-hidden shrink-0"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 999,
                      border: "1px solid #b3b1fb",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.authorAvatarSrc}
                      alt={card.authorName}
                      className="absolute inset-0 w-full h-full"
                      style={{ objectFit: "cover", objectPosition: "center" }}
                    />
                  </div>
                ) : null}
                <div className="flex flex-col" style={{ gap: 2 }}>
                  <span
                    className="font-urbanist font-bold text-white"
                    style={{ fontSize: 16, lineHeight: "120%" }}
                  >
                    {card.authorName}
                  </span>
                  {card.authorRole ? (
                    <span
                      className="font-urbanist text-white"
                      style={{ fontSize: 14, lineHeight: "120%" }}
                    >
                      {card.authorRole}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaButton({
  variant,
  cta,
}: {
  variant: "primary" | "secondary";
  cta: CtaLink;
}) {
  const isPrimary = variant === "primary";
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    padding: "0 18px",
    borderRadius: "var(--radius-button)",
    fontFamily: '"Urbanist", sans-serif',
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 1,
    letterSpacing: "-0.01em",
    color: "rgb(255, 255, 255)",
    textDecoration: "none",
    background: isPrimary ? "var(--color-velt-purple)" : "transparent",
    border: isPrimary ? "1px solid transparent" : "1px solid rgba(255,255,255,0.6)",
    cursor: "pointer",
  } as const;

  const isExternal = !!cta.href && /^(https?:)?\/\//.test(cta.href);
  if (isExternal || cta.newTab) {
    return (
      <a href={cta.href} target="_blank" rel="noopener" style={baseStyle}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href ?? "#"} style={baseStyle}>
      {cta.label}
    </Link>
  );
}
