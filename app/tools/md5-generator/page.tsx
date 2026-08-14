// /tools/md5-generator - human-facing UI for the /tools/md5 endpoint.
//
// The endpoint itself stays at /tools/md5: a route handler and a page cannot
// share one URL in Next.js, and that path is the published API.
//
// This page has no long-form section of its own, so it does not use the shared
// ToolPage template — but its chrome is the same as every other tool's: the
// 2026 gradient hero, the tool on a white card lifted into it, then the shared
// API/MCP block and the related-tools mesh.

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import Md5Tool from "@/components/tools-2026/Md5Tool";
import { ToolApiDocs } from "@/components/tools/ToolApiDocs";
import { RelatedTools } from "@/components/tools/RelatedTools";
import styles from "@/components/tools/Tools.module.css";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

const PAGE_TITLE = "MD5 Hash Generator";
const PAGE_DESCRIPTION =
  "Free MD5 hash generator. Paste any text and get its MD5 digest instantly, or call the same endpoint as an API from your own scripts and tools.";

// Every tool states its privacy position in the same place. The wording is
// deliberately not the template's "runs in your browser": this tool POSTs the
// text to /tools/md5, so the text does leave the device. The endpoint sends
// no-store and writes nothing, which is what the line claims and all it claims.
const PRIVACY_LINE =
  "Free, no login, no email. We do not store the text you send or the hash.";

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
    <div className={styles.page}>
      <PageJsonLd
        name={`${PAGE_TITLE} | Superflow`}
        description={PAGE_DESCRIPTION}
        path="/tools/md5-generator"
        trail={[
          { name: "Free tools", url: `${SITE_URL}/tools` },
          { name: PAGE_TITLE, url: `${SITE_URL}/tools/md5-generator` },
        ]}
      />
      {/* No `solidAtTop`: the hero below is the site's blue gradient, which is
          what the transparent bar with white links is designed for. */}
      <SiteNav />

      <ListingHero
        eyebrow="Free tool, no login"
        heading={HERO_HEADING}
        subheading={HERO_SUBHEADING}
        hideCta
        tight
        footnote={
          <>
            {PRIVACY_LINE}{" "}
            <a href="/tools/md5-generator.md">Markdown copy</a> ·{" "}
            <a href="#api">API and MCP</a>
          </>
        }
      />

      <section className={styles.toolSlot}>
        <div className={styles.toolInner}>
          {/* The tool's own "Use it as an API" panel is dropped here: the
              shared block below documents the same endpoint, and the MCP tool
              with it, so keeping both would document one endpoint twice on one
              screen. */}
          <Md5Tool hideApiPanel bare />
        </div>
      </section>

      <ToolApiDocs slug="md5-generator" />

      <RelatedTools slug="md5-generator" />

      <SiteFooter />
      <IntercomButton />
    </div>
  );
}
