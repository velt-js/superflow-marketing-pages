import type { Metadata, Viewport } from "next";
import { Adamina, Poppins, Urbanist } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-urbanist",
});

// Serif display face for the 2026 homepage headings (single weight).
const adamina = Adamina({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-adamina",
});

const DEFAULT_TITLE = "Superflow: Creative Assets Review & Collaboration Tool";
const DEFAULT_DESCRIPTION =
  "With Superflow, agencies and marketing teams can deliver high-quality assets 10x faster. You can comment and collaborate on assets like live websites, video, PDF, Lottie files, images and more.";
const DEFAULT_OG_IMAGE = "/opengraph-image.png";
// Alt text for the shared social-share card. Describes the branded image so
// og:image:alt / twitter:image:alt are populated for accessibility + SEO.
const DEFAULT_OG_IMAGE_ALT =
  "Superflow: creative assets review and collaboration tool";

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
        {/* Clay (Claydar) web intent tracking. Rendered as a native <script>
            (not next/script) so it appears literally before </body> in the
            server HTML — Clay's installation verifier fetches static HTML and
            looks for the tag there. next/script's afterInteractive injects
            client-side (invisible to the verifier) and beforeInteractive
            forces it into <head> (which Clay rejects). The `async` prop is
            intentionally omitted: React 19 hoists async scripts into <head>,
            so a plain script keeps it in <body>. The Claydar loader is tiny
            and already loads its payload asynchronously itself. */}
        <script src="https://static.claydar.com/init.v1.js?id=cgBo1m1XAw" />
      </body>
    </html>
  );
}