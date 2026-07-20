import Image from "next/image";
import Link from "next/link";

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";

import styles from "./comparison.module.css";
import { getToolLogosFromSlug } from "./toolLogos";
import type { ComparisonHubDoc, ComparisonHubItem } from "./types";

const BASE_PATH = "/preview/comparison";

/** Hub group definitions, in render order. */
const HUB_GROUPS: readonly {
  type: ComparisonHubItem["_type"];
  heading: string;
  lead: string;
}[] = [
  {
    type: "comparisonPreviewVsPage",
    heading: "Superflow vs the field",
    lead: "Head-to-head pages: one competitor, eight dimensions, every claim dated.",
  },
  {
    type: "comparisonPreviewAlternativesPage",
    heading: "Alternatives, ranked honestly",
    lead: "The switcher listicles: the best options per tool, including one reason to stay.",
  },
  {
    type: "comparisonPreviewArbiterPage",
    heading: "Tool vs tool",
    lead: "Neutral comparisons between two third-party tools. We publish; we don't compete above the disclosure line.",
  },
];

/**
 * The /preview/comparison hub: a compact gradient hero plus the catalog of
 * published preview pages, grouped by class.
 */
export default function ComparisonHubBody({
  doc,
  items,
}: {
  doc: ComparisonHubDoc | null;
  items: ComparisonHubItem[];
}) {
  return (
    <div className={styles.page}>
      <SiteNav />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {doc?.kicker ? <p className={styles.heroKicker}>{doc.kicker}</p> : null}
          <h1 className={styles.heroHeadline}>
            {doc?.headline ?? "Comparisons, done honestly."}
          </h1>
          {doc?.subhead ? (
            <p className={styles.heroSecondary}>{doc.subhead}</p>
          ) : null}
        </div>
        <div className={styles.heroFade} aria-hidden="true" />
      </header>

      <section className={styles.section}>
        {HUB_GROUPS.map((group) => {
          const groupItems = (items ?? []).filter(
            (item) => item?._type === group.type,
          );
          if (groupItems.length === 0) {
            return null;
          }
          return (
            <div key={group.type}>
              <h2 className={styles.hubGroupHeading}>{group.heading}</h2>
              <p className={styles.hubGroupLead}>{group.lead}</p>
              <ul className={styles.hubGrid}>
                {groupItems.map((item) => {
                  const logoSrcs = getToolLogosFromSlug(item.slug);
                  return (
                    <li key={item._id}>
                      <Link
                        className={styles.hubCard}
                        href={`${BASE_PATH}/${item.slug}`}
                      >
                        {logoSrcs.length > 0 ? (
                          <span className={styles.hubCardLogos}>
                            {logoSrcs.map((src) => (
                              <Image
                                key={src}
                                src={src}
                                alt=""
                                aria-hidden="true"
                                width={22}
                                height={22}
                                className={styles.toolLogo}
                                unoptimized
                              />
                            ))}
                          </span>
                        ) : null}
                        <p className={styles.hubCardTitle}>{item.title}</p>
                        {item?.metaDescription ? (
                          <p className={styles.hubCardBlurb}>
                            {item.metaDescription}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <SiteFooter />
    </div>
  );
}
