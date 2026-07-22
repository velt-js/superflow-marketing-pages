import type { ReactNode } from "react";

/**
 * Shared brand-mark glyphs for the connector integration pages' bespoke
 * sections (Monday, Asana, ClickUp, Slack).
 *
 * All marks are inline SVGs (no asset dependency, no client boundary) so they
 * can be reused by the server-rendered "What crosses" and "Link once" sections.
 * The Superflow flower geometry mirrors `SuperflowFlowerMark` in
 * `components/home-2026/feature-artifacts/WhiteLabelArtifact.tsx`, and the
 * tool geometries mirror the logos used by the hero integration artifacts
 * (`components/home-2026/hero-artifacts/IntegrationsArtifact.tsx`), so the
 * marks stay identical across the site.
 */

/** Props shared by every brand-mark glyph. */
interface BrandMarkProps {
  /** Rendered width/height in pixels (marks are square). */
  size?: number;
  /** Optional class applied to the root `<svg>`. */
  className?: string;
}

/** Default rendered size (px) when a caller omits one. */
const DEFAULT_MARK_SIZE = 26;

/**
 * The multi-color Superflow flower mark (yellow / coral / green / indigo
 * petals), matching the exact Figma petals used elsewhere on the site.
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline Superflow flower SVG, or `null` on failure.
 */
export function SuperflowFlowerMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path
          d="M13.4316 3.51909C12.6958 3.20466 11.8819 3.11989 11.0969 3.2759C10.312 3.43192 9.59255 3.82142 9.03308 4.3933C8.46157 4.95285 8.07233 5.67168 7.91623 6.45582C7.76014 7.23996 7.84447 8.05291 8.15818 8.7884C8.45708 9.52946 8.97285 10.1631 9.63803 10.6065C10.3032 11.05 11.0868 11.2825 11.8864 11.2736H15.9223V7.24436C15.9311 6.44498 15.698 5.66158 15.2535 4.99684C14.8091 4.33209 14.1741 3.81701 13.4316 3.51909Z"
          fill="#FFCD2E"
        />
        <path
          d="M28.1321 8.52565C27.188 7.58307 25.9855 6.94115 24.6765 6.68096C23.3675 6.42076 22.0107 6.55396 20.7774 7.06372C19.5441 7.57348 18.4896 8.43695 17.7471 9.54511C17.0046 10.6533 16.6073 11.9564 16.6055 13.29V20.0329H23.3675C24.706 20.0471 26.0176 19.657 27.1306 18.9139C28.2436 18.1707 29.1061 17.1091 29.6052 15.868C30.1269 14.638 30.2654 13.2795 30.0027 11.9697C29.7399 10.6599 29.088 9.45962 28.1321 8.52565Z"
          fill="#FF7162"
        />
        <path
          d="M24.3715 23.2142C24.0727 22.4723 23.5569 21.8378 22.8914 21.3935C22.226 20.9492 21.4419 20.7158 20.6416 20.7238H16.6057V24.7565C16.5973 25.5561 16.8307 26.3395 17.2754 27.0042C17.7201 27.6689 18.3554 28.184 19.098 28.4818C19.5949 28.6906 20.1283 28.7986 20.6674 28.7995C21.3289 28.7928 21.9788 28.6243 22.5601 28.3085C23.1414 27.9928 23.6365 27.5396 24.0019 26.9885C24.3674 26.4374 24.5922 25.8053 24.6566 25.1473C24.721 24.4893 24.6231 23.8256 24.3715 23.2142Z"
          fill="#0DCF82"
        />
        <path
          d="M2.93155 16.1289C2.40623 17.3593 2.26498 18.7195 2.52629 20.0315C2.7876 21.3434 3.43928 22.5459 4.39601 23.4816C5.01327 24.11 5.74925 24.6096 6.56125 24.9516C7.37325 25.2936 8.24513 25.4712 9.12631 25.4739C10.0283 25.4719 10.9209 25.2915 11.7527 24.9432C12.995 24.4447 14.0576 23.5829 14.8013 22.4708C15.5451 21.3586 15.9353 20.0479 15.921 18.7104V11.9606H9.16929C7.83035 11.9467 6.51844 12.3373 5.4054 13.081C4.29236 13.8248 3.4301 14.8872 2.93155 16.1289Z"
          fill="#625DF5"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The Monday.com mark — three diagonal red / yellow / green strokes.
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline Monday SVG, or `null` on failure.
 */
export function MondayMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="259.188 11.938 39.188 39.188"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path
          fill="#F62B54"
          d="M263.942 43.2761C262.264 43.2761 260.587 42.345 259.656 40.8552C258.724 39.3654 258.91 37.5032 259.842 36.0134L268.6 22.2329C269.532 20.7431 271.209 19.812 272.887 19.812C274.564 19.812 276.241 20.9294 277.173 22.4191C277.918 23.9089 277.918 25.7711 276.986 27.2609L268.228 41.0414C267.296 42.345 265.619 43.2761 263.942 43.2761Z"
        />
        <path
          fill="#FFCC00"
          d="M279.039 43.2763C277.175 43.2763 275.684 42.3452 274.753 40.8554C274.007 39.1794 274.007 37.3172 274.939 35.8274L283.697 22.0469C284.629 20.5571 286.306 19.626 287.984 19.626C289.847 19.626 291.338 20.7433 292.27 22.2331C293.015 23.7229 293.015 25.5851 291.897 27.0749L283.138 40.8554C282.207 42.3452 280.716 43.2763 279.039 43.2763Z"
        />
        <path
          fill="#00CA72"
          d="M293.758 43.4624C296.228 43.4624 298.23 41.4614 298.23 38.993C298.23 36.5247 296.228 34.5237 293.758 34.5237C291.288 34.5237 289.285 36.5247 289.285 38.993C289.285 41.4614 291.288 43.4624 293.758 43.4624Z"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The Asana mark — three coral dots masked from a warm radial gradient,
 * mirroring the `AsanaLogo` used by the hero integration artifacts.
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline Asana SVG, or `null` on failure.
 */
export function AsanaMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="38.586 17.925 35.081 35.021"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <defs>
          <radialGradient
            id="brandmark-asana"
            gradientUnits="userSpaceOnUse"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="translate(56.1473 35.4204) rotate(-90) scale(17.5032 17.5336)"
          >
            <stop stopColor="#FFB900" />
            <stop offset="0.6" stopColor="#F95D8F" />
            <stop offset="0.9991" stopColor="#F95353" />
          </radialGradient>
          <mask
            id="brandmark-asana-mask"
            maskUnits="userSpaceOnUse"
            x="38"
            y="17"
            width="36"
            height="36"
          >
            <path fill="#ffffff" d="M63.0922 25.2028C63.0922 29.0331 59.9678 32.1521 56.1308 32.1521C52.2938 32.1521 49.1694 29.0331 49.1694 25.2028C49.1694 21.3724 52.2938 18.2534 56.1308 18.2534C60.0226 18.2534 63.0922 21.3177 63.0922 25.2028ZM47.0864 33.8484C43.2494 33.8484 40.125 36.9674 40.125 40.7978C40.125 44.6282 43.2494 47.7472 47.0864 47.7472C50.9234 47.7472 54.0479 44.6282 54.0479 40.7978C54.0479 36.9674 50.9782 33.8484 47.0864 33.8484ZM65.1752 33.8484C61.3382 33.8484 58.2137 36.9674 58.2137 40.7978C58.2137 44.6282 61.3382 47.7472 65.1752 47.7472C69.0122 47.7472 72.1366 44.6282 72.1366 40.7978C72.1366 36.9674 69.067 33.8484 65.1752 33.8484Z" />
          </mask>
        </defs>
        <g mask="url(#brandmark-asana-mask)">
          <path fill="url(#brandmark-asana)" d="M56.1265 17.9255C65.8287 17.9255 73.6671 25.7504 73.6671 35.4357C73.6671 45.1211 65.8287 52.9459 56.1265 52.9459C46.4244 52.9459 38.5859 45.1211 38.5859 35.4357C38.6408 25.7504 46.4792 17.9255 56.1265 17.9255Z" />
        </g>
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The ClickUp mark — gradient chevron over gradient base strokes, mirroring
 * the `ClickUpLogo` used by the hero integration artifacts.
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline ClickUp SVG, or `null` on failure.
 */
export function ClickUpMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="362 12.25 37.125 37.125"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <defs>
          <linearGradient
            id="brandmark-clickup-a"
            gradientUnits="userSpaceOnUse"
            x1="370.578"
            y1="39.9558"
            x2="392.252"
            y2="39.9558"
          >
            <stop stopColor="#8930FD" />
            <stop offset="1" stopColor="#49CCF9" />
          </linearGradient>
          <linearGradient
            id="brandmark-clickup-b"
            gradientUnits="userSpaceOnUse"
            x1="371.049"
            y1="24.9023"
            x2="391.816"
            y2="24.9023"
          >
            <stop stopColor="#FF02F0" />
            <stop offset="1" stopColor="#FFC800" />
          </linearGradient>
        </defs>
        <path fillRule="evenodd" clipRule="evenodd" fill="url(#brandmark-clickup-a)" d="M370.578 38.49L374.57 35.4094C376.704 38.1741 378.956 39.4774 381.446 39.4774C383.936 39.4774 386.149 38.2136 388.164 35.4489L392.234 38.4505C389.31 42.4 385.674 44.4932 381.446 44.4932C377.257 44.4932 373.582 42.4 370.578 38.49Z" />
        <path fillRule="evenodd" clipRule="evenodd" fill="url(#brandmark-clickup-b)" d="M381.444 25.181L374.331 31.3027L371.051 27.4717L381.484 18.5063L391.838 27.4717L388.518 31.2632L381.444 25.181Z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The Webflow mark — the blue "W" logotype (geometry from
 * public/images/logos/webflow.svg, the shared logo asset).
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline Webflow SVG, or `null` on failure.
 */
export function WebflowMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size * (674 / 1080)}
        viewBox="0 0 1080 674"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path
          fill="#146EF5"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1080 0 735.386 673.684H411.695l144.221-279.203h-6.471C430.464 548.934 252.942 650.61-.0005 673.684v-275.34s161.8135-9.557 256.9385-109.568H-.0005V.0053H288.771V237.515l6.481-.026L413.254.0053h218.39V236.009l6.482-.01L760.555 0H1080Z"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The WordPress mark — the circled "W" in WordPress blue (geometry from
 * public/images/logos/wordpress.svg, the shared logo asset).
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline WordPress SVG, or `null` on failure.
 */
export function WordPressMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 122.52 122.523"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <g fill="#21759b">
          <path d="m8.708 61.26c0 20.802 12.089 38.779 29.619 47.298l-25.069-68.686c-2.916 6.536-4.55 13.769-4.55 21.388z" />
          <path d="m96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501l19.138 56.925 11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z" />
          <path d="m62.184 65.857-15.768 45.819c4.708 1.384 9.687 2.141 14.846 2.141 6.12 0 11.989-1.058 17.452-2.979-.141-.225-.269-.464-.374-.724z" />
          <path d="m107.376 36.046c.226 1.674.354 3.471.354 5.404 0 5.333-.996 11.328-3.996 18.824l-16.053 46.413c15.624-9.111 26.133-26.038 26.133-45.426.001-9.137-2.333-17.729-6.438-25.215z" />
          <path d="m61.262 0c-33.779 0-61.262 27.481-61.262 61.26 0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263-.001-33.779-27.487-61.26-61.265-61.26zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z" />
        </g>
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The Google Tag Manager mark — the blue diamond tag with the darker-blue
 * publish dot (official Google Analytics-suite icon geometry).
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline GTM SVG, or `null` on failure.
 */
export function GtmMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 192 192"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <polygon fill="#8AB4F8" points="111.31,176.79 80.76,147 146.37,80 178,111" />
        <path
          fill="#4285F4"
          d="M111.44,45.08L81,14L14.44,79.93c-8.58,8.58-8.58,22.49,0,31.08L80,177l31-29L61.05,95.47L111.44,45.08z"
        />
        <path
          fill="#8AB4F8"
          d="M177.56,80.44l-66-66c-8.59-8.59-22.52-8.59-31.11,0c-8.59,8.59-8.59,22.52,0,31.11l66,66 c8.59,8.59,22.52,8.59,31.11,0C186.15,102.96,186.15,89.03,177.56,80.44z"
        />
        <circle fill="#246FDB" cx="95.5" cy="162.5" r="21.5" />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The Slack mark — the four-lobe pinwheel in Slack's red / blue / green /
 * yellow, mirroring the `SlackGlyph` used by the homepage Solution section and
 * the Review Workflow artifact.
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline Slack SVG, or `null` on failure.
 */
export function SlackMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 122.8 122.8"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path
          d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zM32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
          fill="#e01e5a"
        />
        <path
          d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zM45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
          fill="#36c5f0"
        />
        <path
          d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zM90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
          fill="#2eb67d"
        />
        <path
          d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zM77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
          fill="#ecb22e"
        />
      </svg>
    );
  } catch {
    return null;
  }
}
