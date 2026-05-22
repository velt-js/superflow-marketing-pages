import type { Metadata } from "next";
import { Poppins, Urbanist } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${urbanist.variable}`}>
      <body className={poppins.className} style={{ overflowX: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
