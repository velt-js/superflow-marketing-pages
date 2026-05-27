import type { Metadata, Viewport } from "next";
import { Poppins, Urbanist } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/app/_seo/schema";
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

const DEFAULT_TITLE = "Superflow: Creative Assets Review & Collaboration Tool";
const DEFAULT_DESCRIPTION =
  "With Superflow agencies and marketing teams can deliver high quality assets 10x faster. You can comment and collaborate on assets like live websites, video, pdf, lottie files, images and more.";
const DEFAULT_OG_IMAGE = "/opengraph-image.png";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://usesuperflow.com"),
  title: { default: DEFAULT_TITLE, template: "%s | Superflow" },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Superflow",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: "en_US",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

// Site-wide JSON-LD — emitted once at the root so every page advertises
// the same Organization + WebSite identity. Per-page schemas (WebPage,
// BreadcrumbList, FAQPage, Product, etc.) are emitted by individual
// routes and reference the Organization / WebSite by @id.
const ORGANIZATION_SCHEMA = buildOrganizationSchema();
const WEBSITE_SCHEMA = buildWebSiteSchema();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${urbanist.variable}`}>
      <body className={poppins.className} style={{ overflowX: "hidden" }}>
        <GtmNoScript />
        <JsonLd id="ld-organization" data={ORGANIZATION_SCHEMA} />
        <JsonLd id="ld-website" data={WEBSITE_SCHEMA} />
        <ThirdPartyScripts />
        {children}
      </body>
    </html>
  );
}
