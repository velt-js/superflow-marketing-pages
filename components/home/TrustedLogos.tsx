"use client";

// TrustedLogos — Figma node 8506:105840 (1440×216). 3-row 8/7/8 grid of
// 160×72 tiles, each with a 0.9px border. Row 2 replaces two adjacent
// cells with a 320-wide "TRUSTED BY TOP TEAMS" label. On hover, the grid
// cross-fades into a "Migrated from Competitors" panel sourced from the
// Framer `logo-grid` component (hover variant `Pky7wJkSd-hover`): one
// full-width header row, five logo tiles (pendo, trumpet, cloudfactory,
// MEDDICC, vareto), and a two-cell CTA row ("Compare Velt" /
// "Migration Guide").

import { useState } from "react";

type Tile =
  | { kind: "logo"; src: string; alt: string; w: number; h: number; opacity?: number }
  | { kind: "label" };

// Default grid — Figma 8506:105840 left-to-right, top-to-bottom.
// 8 + (6 logos + 320-wide label) + 8 = 23 items total.
// Widths × heights per Framer `sizes` attr × image intrinsic aspect. All
// opacity values per the Framer `logo-grid` default variant.
const defaultTiles: Tile[] = [
  { kind: "logo", src: "/images/logos/google.svg",      alt: "Google",      w: 92,   h: 27, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/varonis.svg",     alt: "Varonis",     w: 113,  h: 19, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/pendo.svg",       alt: "Pendo",       w: 95,   h: 22, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/heygen.svg",      alt: "HeyGen",      w: 90,   h: 25, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/flyr.svg",        alt: "FLYR",        w: 85,   h: 15, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/bigtincan.svg",   alt: "Bigtincan",   w: 101,  h: 30, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/runway.svg",      alt: "Runway",      w: 77,   h: 15, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/lambdatest.svg",  alt: "LambdaTest",  w: 114,  h: 27, opacity: 0.5 },

  { kind: "logo", src: "/images/logos/datarails.svg",   alt: "Datarails",   w: 98,   h: 26, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/firehydrant.svg", alt: "FireHydrant", w: 101,  h: 27, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/leadpages.png",   alt: "Leadpages",   w: 103,  h: 31, opacity: 0.5 },
  { kind: "label" },
  { kind: "logo", src: "/images/logos/vellum.svg",      alt: "Vellum",      w: 83,   h: 23, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/safetykit.png",   alt: "SafetyKit",   w: 104,  h: 21, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/qloo.png",        alt: "Qloo",        w: 54,   h: 24, opacity: 0.5 },

  { kind: "logo", src: "/images/logos/lacoustics.png",  alt: "L-Acoustics", w: 126,  h: 12, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/cloudfactory.png",alt: "CloudFactory",w: 116,  h: 22, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/trumpet.png",     alt: "Trumpet",     w: 117,  h: 20, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/cofactr.png",     alt: "Cofactr",     w: 105,  h: 22, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/butter.svg",      alt: "Butter",      w: 82,   h: 30, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/colossyan.svg",   alt: "Colossyan",   w: 118,  h: 24, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/classwallet.png", alt: "ClassWallet", w: 144,  h: 23, opacity: 0.5 },
  { kind: "logo", src: "/images/logos/openenvoy.svg",   alt: "OpenEnvoy",   w: 119,  h: 28, opacity: 0.5 },
];

// Inline SVGs for the hover-variant logos that aren't in our static set.
// Extracted from velt-7e5af-main/src/framer/logo-grid.jsx (Pky7wJkSd-hover).
const PendoMarkSvg = () => (
  <svg width="93" height="31" viewBox="0 0 93.15 31.05" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g opacity="0.75">
      <g transform="translate(7.126 6.617)">
        <path
          d="M 61.582 12.636 C 63.625 12.636 65.278 11.01 65.278 9.011 C 65.278 7.01 63.618 5.385 61.582 5.385 C 59.547 5.385 57.886 7.011 57.886 9.01 C 57.886 11.011 59.547 12.636 61.582 12.636 Z M 65.285 0 L 67.038 0 L 67.038 14.367 L 65.285 14.367 L 65.285 12.933 C 64.274 13.851 62.955 14.358 61.589 14.353 C 58.586 14.353 56.141 11.957 56.141 9.01 C 56.141 6.063 58.586 3.668 61.589 3.668 C 62.974 3.668 64.275 4.169 65.285 5.088 Z M 25.237 12.572 C 27.279 12.572 28.933 10.947 28.933 8.947 C 28.933 6.947 27.272 5.321 25.237 5.321 C 23.201 5.321 21.541 6.947 21.541 8.947 C 21.541 10.947 23.202 12.572 25.237 12.572 Z M 21.542 5.024 C 22.553 4.106 23.871 3.599 25.237 3.604 C 28.24 3.604 30.686 5.999 30.686 8.946 C 30.686 11.893 28.241 14.289 25.237 14.289 C 23.852 14.289 22.552 13.787 21.542 12.868 L 21.542 17.957 L 19.789 17.957 L 19.789 3.59 L 21.541 3.59 L 21.541 5.025 Z M 40.983 8.112 C 40.615 6.458 39.251 5.321 37.576 5.321 C 35.901 5.321 34.432 6.487 34.036 8.112 Z M 37.583 3.582 C 40.516 3.582 42.813 5.95 42.813 8.967 L 42.813 9.837 L 34.043 9.837 C 34.439 11.463 35.909 12.628 37.583 12.628 C 38.742 12.628 39.831 12.197 40.488 11.476 L 41.003 10.911 L 41.067 10.84 L 41.138 10.904 L 42.261 11.943 L 42.333 12.013 L 42.268 12.084 L 41.753 12.649 C 40.756 13.738 39.237 14.359 37.576 14.359 C 34.615 14.359 32.205 11.943 32.205 8.975 C 32.205 6.006 34.615 3.59 37.576 3.59 Z M 73.702 5.321 C 71.667 5.321 70.006 6.96 70.006 8.974 C 70.006 10.989 71.667 12.628 73.702 12.628 C 75.738 12.628 77.399 10.989 77.399 8.975 C 77.399 6.961 75.738 5.321 73.702 5.321 Z M 79.151 8.974 C 79.151 11.943 76.706 14.359 73.702 14.359 C 70.699 14.359 68.254 11.943 68.254 8.975 C 68.254 6.006 70.699 3.59 73.702 3.59 C 76.706 3.59 79.151 6.006 79.151 8.974 Z M 54.318 8.862 L 54.318 14.359 L 52.615 14.359 L 52.615 8.862 C 52.615 6.904 51.138 5.308 49.321 5.308 C 47.505 5.308 46.029 6.897 46.029 8.862 L 46.029 14.359 L 44.325 14.359 L 44.325 3.59 L 46.029 3.59 L 46.029 4.897 C 46.947 4.056 48.106 3.59 49.321 3.59 C 52.078 3.59 54.318 5.95 54.318 8.862 Z"
          fill="rgb(255,255,255)"
        />
        <path d="M 0 10.259 L 8.247 10.259 L 8.247 18.322 L 16.494 10.259 L 16.494 2.196 L 8.247 2.196 Z" fill="rgb(255,255,255)" />
      </g>
    </g>
  </svg>
);

const MeddiccMarkSvg = () => (
  <svg width="117" height="30" viewBox="0 0 97.681 25.39" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g opacity="0.75">
      <path
        d="M 47.314 8.142 L 47.314 17.378 L 45.065 17.378 L 45.065 11.602 L 43.064 17.378 L 41.118 17.378 L 39.104 11.588 L 39.104 17.378 L 36.854 17.378 L 36.854 8.142 L 39.605 8.142 L 42.117 14.575 L 44.577 8.142 Z M 51.118 9.865 L 51.118 11.813 L 54.262 11.813 L 54.262 13.51 L 51.118 13.51 L 51.118 15.575 L 54.657 15.575 L 54.657 17.378 L 48.867 17.378 L 48.867 8.076 L 54.657 8.076 L 54.657 9.865 Z M 61.295 14.668 C 61.781 14.203 62.025 13.548 62.025 12.708 C 62.025 11.866 61.781 11.212 61.295 10.747 C 60.808 10.282 60.126 10.05 59.25 10.05 L 58.184 10.05 L 58.184 15.366 L 59.25 15.366 C 60.126 15.366 60.808 15.134 61.295 14.669 M 63.716 15.136 C 63.329 15.84 62.743 16.415 62.032 16.788 C 61.3 17.183 60.438 17.379 59.447 17.379 L 55.935 17.379 L 55.935 8.076 L 59.447 8.076 C 60.447 8.076 61.311 8.268 62.039 8.655 C 62.767 9.041 63.326 9.585 63.716 10.285 C 64.107 10.988 64.302 11.795 64.302 12.706 C 64.302 13.617 64.107 14.428 63.716 15.134 M 70.939 14.668 C 71.426 14.203 71.669 13.548 71.669 12.708 C 71.669 11.866 71.426 11.212 70.939 10.747 C 70.453 10.282 69.771 10.05 68.894 10.05 L 67.828 10.05 L 67.828 15.366 L 68.894 15.366 C 69.771 15.366 70.453 15.134 70.939 14.669 M 73.361 15.136 C 72.973 15.84 72.388 16.414 71.677 16.788 C 70.944 17.183 70.082 17.379 69.092 17.379 L 65.579 17.379 L 65.579 8.076 L 69.092 8.076 C 70.091 8.076 70.956 8.268 71.683 8.655 C 72.412 9.041 72.97 9.585 73.361 10.285 C 73.751 10.988 73.946 11.795 73.946 12.706 C 73.946 13.617 73.751 14.428 73.361 15.134 M 77.471 8.075 L 75.221 8.075 L 75.221 17.378 L 77.471 17.378 L 77.471 8.076 Z M 86.214 8.917 C 86.99 9.54 87.493 10.382 87.721 11.444 L 85.34 11.444 C 85.178 11.032 84.896 10.679 84.53 10.43 C 84.167 10.184 83.735 10.062 83.234 10.062 C 82.576 10.062 82.045 10.304 81.642 10.785 C 81.238 11.268 81.036 11.912 81.036 12.719 C 81.036 13.526 81.238 14.169 81.642 14.646 C 82.045 15.124 82.576 15.364 83.234 15.364 C 83.735 15.364 84.165 15.241 84.53 14.994 C 84.894 14.749 85.164 14.416 85.34 13.995 L 87.721 13.995 C 87.493 15.048 86.991 15.888 86.214 16.515 C 85.437 17.141 84.458 17.455 83.273 17.455 C 82.369 17.455 81.576 17.255 80.892 16.855 C 80.212 16.461 79.662 15.878 79.307 15.177 C 78.934 14.459 78.748 13.637 78.748 12.717 C 78.748 11.795 78.934 10.975 79.307 10.256 C 79.662 9.555 80.212 8.972 80.892 8.578 C 81.576 8.178 82.369 7.978 83.273 7.978 C 84.458 7.978 85.437 8.29 86.214 8.912 M 96.174 8.917 C 96.95 9.54 97.453 10.382 97.681 11.444 L 95.3 11.444 C 95.138 11.032 94.856 10.679 94.49 10.43 C 94.127 10.184 93.695 10.062 93.194 10.062 C 92.536 10.062 92.005 10.304 91.602 10.785 C 91.198 11.268 90.996 11.912 90.996 12.719 C 90.996 13.526 91.198 14.169 91.602 14.646 C 92.005 15.124 92.536 15.364 93.194 15.364 C 93.695 15.364 94.125 15.241 94.49 14.994 C 94.854 14.749 95.124 14.416 95.3 13.995 L 97.681 13.995 C 97.453 15.048 96.951 15.888 96.174 16.515 C 95.397 17.141 94.418 17.455 93.233 17.455 C 92.329 17.455 91.536 17.255 90.852 16.855 C 90.172 16.461 89.622 15.878 89.267 15.177 C 88.894 14.459 88.708 13.637 88.708 12.717 C 88.708 11.795 88.894 10.975 89.267 10.256 C 89.622 9.555 90.172 8.972 90.852 8.578 C 91.536 8.178 92.329 7.978 93.233 7.978 C 94.418 7.978 95.397 8.29 96.174 8.912 M 12.694 0 C 19.676 0 25.389 5.712 25.39 12.694 C 25.39 19.677 19.677 25.39 12.694 25.39 C 5.712 25.39 0 19.677 0 12.694 C 0 5.713 5.712 0 12.694 0 Z M 12.896 5.534 L 12.896 5.542 L 9.154 9.283 L 9.152 9.283 L 5.776 12.658 L 5.111 13.324 C 4.699 13.736 4.467 14.295 4.467 14.878 C 4.467 15.461 4.699 16.02 5.111 16.432 L 5.754 17.074 C 6.612 17.932 8.003 17.932 8.861 17.074 L 12.874 13.061 L 12.897 13.038 L 12.897 13.028 L 12.901 13.032 L 12.922 13.054 L 16.27 16.402 L 16.937 17.067 C 17.795 17.925 19.186 17.925 20.044 17.067 L 20.687 16.424 C 21.544 15.566 21.544 14.175 20.687 13.317 L 16.672 9.304 L 12.899 5.531 Z"
        fill="rgb(255,255,255)"
      />
    </g>
  </svg>
);

type CompetitorLogo = {
  key: string;
  render: () => React.ReactNode;
  opacity?: number;
};

// Five logos on the hover state — each sits in a 256×72 tile.
const competitorLogos: CompetitorLogo[] = [
  {
    key: "pendo",
    render: () => <PendoMarkSvg />,
    opacity: 0.75,
  },
  {
    key: "trumpet",
    render: () => (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src="/images/logos/trumpet.png" alt="Trumpet" width={117} height={24} style={{ opacity: 0.5 }} />
    ),
  },
  {
    key: "cloudfactory",
    render: () => (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src="/images/logos/cloudfactory.png" alt="CloudFactory" width={121} height={23} style={{ opacity: 0.5 }} />
    ),
  },
  {
    key: "meddicc",
    render: () => <MeddiccMarkSvg />,
    opacity: 0.75,
  },
  {
    key: "vareto",
    render: () => (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src="/images/logos/vareto.png" alt="Vareto" width={112} height={21} style={{ opacity: 0.5 }} />
    ),
  },
];

// Logos-only list, used both in the desktop grid (as the non-label tiles)
// and in the mobile marquee below. Keeping a single source so the two
// layouts can't drift apart.
const logoTiles = defaultTiles.filter(
  (t): t is Extract<Tile, { kind: "logo" }> => t.kind === "logo",
);

// Mobile marquee math — 160px tiles, same shift logic as StealFeatures.
const MOBILE_TILE_W = 160;
const MOBILE_TRACK_SHIFT = logoTiles.length * MOBILE_TILE_W;
const MOBILE_DURATION_S = MOBILE_TRACK_SHIFT / 60; // 60 px/s, slower than steal features

function DefaultGrid() {
  return (
    <>
      {/* Desktop grid — full 8/7/8 layout with the "Trusted By Top Teams"
          label tile in row 2. Visible at lg+ only. */}
      <div
        className="hidden lg:flex flex-wrap items-center justify-center content-center w-full"
      >
        {defaultTiles.map((tile, i) =>
          tile.kind === "label" ? (
            <div
              key={`label-${i}`}
              className="flex items-center justify-center shrink-0 font-urbanist font-bold uppercase whitespace-nowrap"
              style={{
                width: 320,
                height: 72,
                padding: 21.6,
                border: "0.9px solid #171717",
                fontSize: 12.6,
                letterSpacing: "1.89px",
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Trusted By&nbsp;
              <span style={{ color: "#b3b0fb" }}>Top Teams</span>
            </div>
          ) : (
            <div
              key={`${tile.alt}-${i}`}
              className="relative shrink-0 flex items-center justify-center"
              style={{
                width: 160,
                height: 72,
                border: "0.9px solid #171717",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile.src}
                alt={tile.alt}
                width={tile.w}
                height={tile.h}
                style={{
                  width: tile.w,
                  height: tile.h,
                  opacity: tile.opacity ?? 1,
                  objectFit: "contain",
                }}
              />
            </div>
          ),
        )}
      </div>

      {/* Mobile marquee — single horizontal scroll of all logos, looping
          via CSS keyframes. 25% edge fade matches the live site pattern. */}
      <div className="lg:hidden flex flex-col w-full gap-6">
        <div
          className="font-urbanist font-bold uppercase text-center"
          style={{
            fontSize: 12.6,
            letterSpacing: "1.89px",
            lineHeight: 1.2,
            color: "#fff",
          }}
        >
          Trusted By&nbsp;
          <span style={{ color: "#b3b0fb" }}>Top Teams</span>
        </div>
        <style>{`
          @keyframes trusted-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-${MOBILE_TRACK_SHIFT}px); }
          }
          .trusted-marquee-track {
            animation: trusted-marquee ${MOBILE_DURATION_S}s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .trusted-marquee-track { animation: none; }
            .trusted-marquee-viewport { overflow-x: auto; }
          }
        `}</style>
        <div
          className="trusted-marquee-viewport w-full overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)",
          }}
        >
          <div
            className="trusted-marquee-track flex items-center"
            style={{ height: 72, width: "max-content" }}
          >
            {[...logoTiles, ...logoTiles].map((tile, i) => (
              <div
                key={`${tile.alt}-${i}`}
                aria-hidden={i >= logoTiles.length}
                className="shrink-0 flex items-center justify-center"
                style={{ width: MOBILE_TILE_W, height: 72 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.src}
                  alt={tile.alt}
                  width={tile.w}
                  height={tile.h}
                  style={{
                    width: tile.w,
                    height: tile.h,
                    opacity: tile.opacity ?? 1,
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CompetitorsGrid() {
  // 3 rows × 1280 wide: heading (full width), 5 logo tiles (256w each),
  // 2 CTA tiles (640w each). Matches Framer hover variant.
  return (
    <div className="flex flex-col" style={{ width: 1280 }}>
      {/* Row 1 — heading */}
      <div
        className="flex items-center justify-center font-urbanist font-bold uppercase whitespace-nowrap"
        style={{
          width: 1280,
          height: 72,
          border: "0.9px solid #171717",
          fontSize: 12.6,
          letterSpacing: "1.89px",
          lineHeight: 1.2,
          color: "#fff",
        }}
      >
        Migrated From&nbsp;
        <span style={{ color: "#b3b0fb" }}>Competitors</span>
      </div>

      {/* Row 2 — 5 logo tiles */}
      <div className="flex" style={{ width: 1280 }}>
        {competitorLogos.map((logo) => (
          <div
            key={logo.key}
            className="relative shrink-0 flex items-center justify-center"
            style={{
              width: 256,
              height: 72,
              border: "0.9px solid #171717",
            }}
          >
            {logo.render()}
          </div>
        ))}
      </div>

      {/* Row 3 — Compare Velt / Migration Guide CTAs */}
      <div className="flex" style={{ width: 1280 }}>
        <a
          href="/comparison"
          className="group flex items-center justify-center gap-2 font-urbanist whitespace-nowrap"
          style={{
            width: 640,
            height: 72,
            border: "0.9px solid #171717",
            fontSize: 15,
            color: "rgb(245,245,245)",
            opacity: 0.5,
            textDecoration: "none",
          }}
        >
          <span>Compare Velt</span>
          <span style={{ display: "inline-block", width: 14, height: 14 }} aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
        <a
          href="/migrate/liveblocks"
          className="group flex items-center justify-center gap-2 font-urbanist whitespace-nowrap"
          style={{
            width: 640,
            height: 72,
            border: "0.9px solid #171717",
            fontSize: 15,
            color: "rgb(245,245,245)",
            opacity: 0.5,
            textDecoration: "none",
          }}
        >
          <span>Migration Guide</span>
          <span style={{ display: "inline-block", width: 14, height: 14 }} aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}

export function TrustedLogos() {
  const [showCompetitors, setShowCompetitors] = useState(false);

  return (
    <section
      className="flex flex-col items-center justify-center w-full bg-black px-6 lg:px-20 pb-16 lg:pb-20"
      onMouseEnter={() => setShowCompetitors(true)}
      onMouseLeave={() => setShowCompetitors(false)}
    >
      {/* Inner stage. Below lg the default grid renders alone and wraps
          naturally; the hover competitor flip is a desktop affordance only. */}
      <div className="relative w-full max-w-[1280px] lg:h-[216px]">
        <div
          className="lg:absolute lg:inset-0 transition-opacity duration-300"
          style={{ opacity: showCompetitors ? 0 : 1, pointerEvents: showCompetitors ? "none" : "auto" }}
        >
          <DefaultGrid />
        </div>
        <div
          className="hidden lg:block absolute inset-0 transition-opacity duration-300"
          style={{ opacity: showCompetitors ? 1 : 0, pointerEvents: showCompetitors ? "auto" : "none" }}
        >
          <CompetitorsGrid />
        </div>
      </div>
    </section>
  );
}
