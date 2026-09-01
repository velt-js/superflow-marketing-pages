import Link from "next/link";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import ListingHero from "@/components/listing-2026/ListingHero";
import styles from "@/components/tools/Tools.module.css";
import ToolsExplorer from "@/components/tools/ToolsExplorer";
import { CodeBlock } from "@/components/tools/CodeBlock";
import { MCP_PATH } from "@/lib/tools/api-catalog";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import { buildToolListSchema } from "@/app/_seo/tool-schema";
import {
  TOOLS,
  toolPath,
  type ToolCategory,
  type ToolEntry,
} from "@/lib/tools/registry";

const TITLE = "Free Tools for Marketers and Website Teams";
const DESCRIPTION =
  "Free tools for agencies and website teams. Check AI visibility, test robots.txt against AI crawlers, and more. No login, no email, no ads.";

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/tools",
});

/** Category display order on the index. */
const CATEGORY_ORDER: ToolCategory[] = [
  "ai-visibility",
  "structured-data",
  "social",
  "quality",
  "campaigns",
  "assets",
];

/**
 * Every tool in one list: category order first, then the built ones ahead of
 * the planned ones.
 *
 * The index used to be six grids, one per category heading, which left a
 * half-empty row wherever a category held one or two tools. One flowing grid
 * fills, and the filter rail beside it (see `ToolsExplorer`) carries the
 * grouping that the headings used to.
 */
function orderedTools(): ToolEntry[] {
  try {
    return [...TOOLS].sort((a, b) => {
      if (a.status !== b.status) return a.status === "live" ? -1 : 1;
      return (
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
      );
    });
  } catch {
    return [...TOOLS];
  }
}

export default function ToolsIndexPage() {
  const liveEntries = TOOLS.filter((tool) => tool.status === "live");

  return (
    <div className={styles.page}>
      {/* No `solidAtTop`: the hero below is the site's blue gradient, which is
          what the transparent bar with white links is designed for. */}
      <SiteNav />

      <PageJsonLd
        name={`${TITLE} | Superflow`}
        description={DESCRIPTION}
        path="/tools"
        trail={[{ name: "Free tools", url: `${SITE_URL}/tools` }]}
      />
      <JsonLd
        id="ld-tools-itemlist"
        data={buildToolListSchema({
          tools: liveEntries.map((tool) => ({
            name: tool.name,
            tagline: tool.tagline,
            path: toolPath(tool.slug),
          })),
        })}
      />

      <ListingHero
        eyebrow="Free forever"
        heading="Free tools for people who ship websites"
        subheading="Small, fast, useful. No login, no email gate, no ads, no paywalled results."
        hideCta
        footnote="Nothing you submit is stored beyond a short cache."
      />

      <section className={styles.section}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerWide}`}>
          <ToolsExplorer
            tools={orderedTools()}
            categoryOrder={CATEGORY_ORDER}
          />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Or give them to your agent</h2>
          <p className={styles.sectionLead}>
            Every tool here is also an MCP tool and an HTTP endpoint. One URL,
            no account, no API key.
          </p>
          <CodeBlock
            label="Add the server once"
            language="bash"
            tool="tools-index"
            code={`claude mcp add --transport http superflow ${SITE_URL}${MCP_PATH}`}
          />
          <p className={styles.apiNote}>
            <Link className={styles.apiLink} href="/tools/mcp">
              Setup, tool list, and API reference
            </Link>
          </p>

          {/* The "why we give these away" answer, kept because it is the
              question every agency asks, folded away because it is not what
              anybody came here to read. */}
          <details className={`${styles.disclosure} ${styles.proseBlock}`}>
            <summary className={styles.disclosureSummary}>
              Why we give these away
            </summary>
            <div className={styles.disclosureBody}>
              <div className={styles.prose}>
                <p>
                  Superflow is a review and QA product for websites. Agencies
                  point our agents at a site, the agents check every page
                  against the agency&apos;s own rules, the team approves, and
                  then the client signs off without needing a login.
                </p>
                <p>
                  Each of these tools does one small piece of that work, once,
                  on one page, for free. If the result is useful, the product
                  is the same idea applied continuously to every page of every
                  site you ship. If it is not useful, you have still had a free
                  tool with no email gate, which is more than most of the
                  alternatives offer.
                </p>
              </div>
            </div>
          </details>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
