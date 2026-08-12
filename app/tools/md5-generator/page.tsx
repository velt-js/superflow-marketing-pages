// /tools/md5-generator - human-facing UI for the /tools/md5 endpoint,
// in the 2026 light idiom (SiteNav / ListingHero / SiteFooter), matching
// how /calculator wraps the interactive ROI tool.
//
// The endpoint itself stays at /tools/md5: a route handler and a page
// cannot share one URL in Next.js, and that path is the published API.

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import Md5Tool from "@/components/tools-2026/Md5Tool";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

const PAGE_TITLE = "MD5 Hash Generator";
const PAGE_DESCRIPTION =
  "Free MD5 hash generator. Paste any text and get its MD5 digest instantly, or call the same endpoint as an API from your own scripts and tools.";

const HERO_HEADING = "MD5 hash generator";
const HERO_SUBHEADING =
  "Paste any text and get its MD5 digest as you type. The same hashing runs behind a public endpoint, so you can call it from a script, a spreadsheet, or a workflow tool.";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/tools/md5-generator",
});

export default function Md5GeneratorPage() {
  return (
    <main>
      <PageJsonLd
        name={`${PAGE_TITLE} | Superflow`}
        description={PAGE_DESCRIPTION}
        path="/tools/md5-generator"
        trail={[
          { name: "MD5 Hash Generator", url: `${SITE_URL}/tools/md5-generator` },
        ]}
      />
      <SiteNav />
      <ListingHero heading={HERO_HEADING} subheading={HERO_SUBHEADING} hideCta />
      <Md5Tool />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
