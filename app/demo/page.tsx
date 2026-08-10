// /demo — 2026 light redesign: gradient hero + live-demo gallery cards,
// matching the homepage theme (SiteNav / ListingHero / SiteFooter).

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import DemoGallery from "@/components/demo-2026/DemoGallery";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

const PAGE_TITLE = "Live Product Demo - Superflow";
const PAGE_DESCRIPTION =
  "Click an asset for a live demo of Superflow. Review and collaborate on websites, videos, PDFs, Lottie files, and images.";

const HERO_HEADING = "See Superflow in action";
const HERO_SUBHEADING =
  "Pick an asset below for a live demo - no signup needed. Review and collaborate on websites, videos, PDFs, Lottie files, and images.";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/demo",
  ogImage: PAGE_OG_IMAGES.demo,
  noBrandSuffix: true,
});

export default function DemoPage() {
  return (
    <main>
      <PageJsonLd
        name={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        path="/demo"
        trail={[{ name: "Demo", url: `${SITE_URL}/demo` }]}
      />
      <SiteNav />
      <ListingHero heading={HERO_HEADING} subheading={HERO_SUBHEADING} hideCta />
      <DemoGallery />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
