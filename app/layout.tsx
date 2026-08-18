import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  ORG_DESCRIPTION,
  ORG_OG_IMAGE_ALT,
  SITE_TITLE_WITH_BRAND,
  SITE_URL,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/app/_seo/schema";
import { AmplitudePageView } from "@/components/scripts/AmplitudePageView";
import { PageviewTracker } from "@/components/scripts/PageviewTracker";
import {
  GtmNoScript,
  ThirdPartyScripts,
} from "@/components/scripts/ThirdPartyScripts";
import ProductHuntFloatingBadge from "@/components/shared-2026/ProductHuntFloatingBadge";

// Fonts are self-hosted from app/fonts rather than fetched with
// next/font/google.
//
// next/font/google downloads the woff2 files from fonts.gstatic.com during
// the build, so every deploy depends on Google's CDN still serving the exact
// file URLs Next resolved earlier. On 2026-08-12 that broke: Google converted
// Urbanist to a variable font and deleted the eight static instances the
// build cache still pointed at. Eight dead URLs became eight "Module not
// found" errors and the build failed on a repo nobody had touched.
//
// Serving the files from the repo removes the build-time network dependency,
// and removes the fonts.gstatic.com connection from the critical path at
// runtime as well.
//
// To refresh: see app/fonts/README.md.

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-poppins",
});

// One file covers the whole weight range. Google serves the same variable
// binary for every weight you ask for, so the previous four-weight request
// downloaded one 27KB file four times over.
const urbanist = localFont({
  src: "./fonts/urbanist-variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-urbanist",
});

// Serif display face for the 2026 homepage headings (single weight).
const adamina = localFont({
  src: "./fonts/adamina-400.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-adamina",
});

// Site-wide fallbacks, taken verbatim from the homepage positioning in
// app/_seo/schema.ts. These apply to the homepage (which shares the root
// segment) and to any route that ships no title/description of its own, so
// they must stay identical to what app/page.tsx renders.
const DEFAULT_TITLE = SITE_TITLE_WITH_BRAND;
const DEFAULT_DESCRIPTION = ORG_DESCRIPTION;
const DEFAULT_OG_IMAGE = "/opengraph-image.png";
const DEFAULT_OG_IMAGE_ALT = ORG_OG_IMAGE_ALT;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s | Superflow" },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    // og:url is page-specific, but the homepage is the only indexable route
    // that inherits this default (every other page overrides openGraph via
    // buildPageMetadata), so the site root is the correct value here.
    url: SITE_URL,
    siteName: "Superflow",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: "en_US",
    images: [
      { url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: DEFAULT_OG_IMAGE_ALT },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, alt: DEFAULT_OG_IMAGE_ALT }],
  },
  // Mirror the googleBot directives buildPageMetadata emits for every other
  // indexable page so the homepage is equally eligible for rich results.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Site-wide JSON-LD — emitted once at the root so every page advertises
// the same Organization + WebSite identity. Per-page schemas (WebPage,
// BreadcrumbList, FAQPage, Product, etc.) are emitted by individual
// routes and reference the Organization / WebSite by @id.
const ORGANIZATION_SCHEMA = buildOrganizationSchema();
const WEBSITE_SCHEMA = buildWebSiteSchema();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${urbanist.variable} ${adamina.variable}`}
    >
      <body className={poppins.className} style={{ overflowX: "hidden" }}>
        <GtmNoScript />
        <JsonLd id="ld-organization" data={ORGANIZATION_SCHEMA} />
        <JsonLd id="ld-website" data={WEBSITE_SCHEMA} />
        <ThirdPartyScripts />
        <Suspense fallback={null}>
          <PageviewTracker />
          <AmplitudePageView />
        </Suspense>
        {children}
        {/* Launch badge, pinned bottom-left on every marketing route. Mounted
            after children so it paints above page content; it hides itself on
            /studio and /preview. */}
        <ProductHuntFloatingBadge />
      </body>
    </html>
  );
}