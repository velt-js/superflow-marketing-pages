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
import { ToolApiDocs } from "@/components/tools/ToolApiDocs";
import styles from "@/components/tools-2026/Md5Tool.module.css";
import toolStyles from "@/components/tools/Tools.module.css";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

const PAGE_TITLE = "MD5 Hash Generator";
const PAGE_DESCRIPTION =
  "Free MD5 hash generator. Paste any text and get its MD5 digest instantly, or call the same endpoint as an API from your own scripts and tools.";

// Every tool states its privacy position in the same place. This page predates
// the shared ToolPage template, so it carries its own copy of the line rather
// than inheriting it.
//
// The wording is deliberately not the template's "runs in your browser": this
// tool POSTs the text to /tools/md5, so the text does leave the device. The
// endpoint sends no-store and writes nothing, which is what the line claims and
// all it claims.
const PRIVACY_LINE =
  "Free, no login, no email. We do not store the text you send or the hash we return.";

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
      {/* ListingHero is a light hero, so the bar must be solid from the top. */}
      <SiteNav solidAtTop />
      <ListingHero heading={HERO_HEADING} subheading={HERO_SUBHEADING} hideCta />
      <p className={styles.privacyLine}>{PRIVACY_LINE}</p>
      <Md5Tool />
      {/* The shared API and MCP block. This page predates the ToolPage
          template, so the wrapper is what puts it inside the `.page` scope
          those styles read their colour variables from. */}
      <div className={toolStyles.page}>
        <ToolApiDocs slug="md5-generator" />
      </div>
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
