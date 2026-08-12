import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import styles from "@/components/tools/Tools.module.css";
import { ToolCard } from "@/components/tools/RelatedTools";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import { buildToolListSchema } from "@/app/_seo/tool-schema";
import {
  CATEGORY_LABELS,
  TOOLS,
  toolPath,
  type ToolCategory,
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

export default function ToolsIndexPage() {
  const liveEntries = TOOLS.filter((tool) => tool.status === "live");

  return (
    <div className={styles.page}>
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

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Free forever</span>
          <h1 className={styles.h1}>Free tools for people who ship websites</h1>
          <p className={styles.subhead}>
            Small, fast, useful. No login, no email gate, no ads, and no
            paywalled results. Every one of them is a small demo of what our
            agents do across a whole site.
          </p>
          <p className={styles.privacyLine}>
            We do not store the URLs you submit or the results beyond a short
            cache window.
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          {CATEGORY_ORDER.map((category) => {
            const tools = TOOLS.filter((tool) => tool.category === category);
            if (tools.length === 0) return null;

            return (
              <div key={category} className={styles.categoryBlock}>
                <h2 className={styles.categoryHeading}>
                  {CATEGORY_LABELS[category]}
                </h2>
                <div className={styles.toolGrid}>
                  {tools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.h2}>Why we give these away</h2>
          <div className={styles.prose}>
            <p>
              Superflow is a review and QA product for websites. Agencies point
              our agents at a site, the agents check every page against the
              agency&apos;s own rules, the team approves, and then the client
              signs off without needing a login.
            </p>
            <p>
              Each of these tools does one small piece of that work, once, on
              one page, for free. If the result is useful, the product is the
              same idea applied continuously to every page of every site you
              ship. If it is not useful, you have still had a free tool with no
              email gate, which is more than most of the alternatives offer.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
