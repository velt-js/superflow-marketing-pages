import Image from "next/image";
import Link from "next/link";

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";

import styles from "./comparison.module.css";
import { getToolLogosFromSlug } from "./toolLogos";
import type { ComparisonHubDoc, ComparisonHubItem } from "./types";
import { toInternalHref } from "@/lib/links";

const BASE_PATH = "/preview/comparison";
const ALTERNATIVES_BASE_PATH = "/preview/alternative";

/**
 * Detail-page base path for a hub item; alternatives listicles live under
 * their own route.
 */
function itemBasePath(itemType: ComparisonHubItem["_type"]): string {
  try {
    return itemType === "comparisonPreviewAlternativesPage"
      ? ALTERNATIVES_BASE_PATH
      : BASE_PATH;
  } catch {
    return BASE_PATH;
  }
}

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
 * The comparison hub body: a compact gradient hero plus the catalog of
 * published preview pages, grouped by class. `visibleTypes` limits which
 * groups render (the alternatives class gets its own hub); `heroOverride`
 * replaces the doc's hero copy on hubs without their own Sanity doc;
 * `crossLinks` renders pointer pills to sibling hubs.
 */
export default function ComparisonHubBody({
  doc,
  items,
  visibleTypes,
  heroOverride,
  crossLinks,
}: {
  doc: ComparisonHubDoc | null;
  items: ComparisonHubItem[];
  visibleTypes?: ComparisonHubItem["_type"][];
  heroOverride?: { kicker?: string; headline?: string; subhead?: string };
  crossLinks?: { label: string; href: string }[];
}) {
  const kicker = heroOverride?.kicker ?? doc?.kicker;
  const headline =
    heroOverride?.headline ?? doc?.headline ?? "Comparisons, done honestly.";
  const subhead = heroOverride?.subhead ?? doc?.subhead;
  const groups = HUB_GROUPS.filter(
    (group) => !visibleTypes || visibleTypes.includes(group.type),
  );

  return (
    <div className={styles.page}>
      <SiteNav />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {kicker ? <p className={styles.heroKicker}>{kicker}</p> : null}
          <h1 className={styles.heroHeadline}>{headline}</h1>
          {subhead ? <p className={styles.heroSecondary}>{subhead}</p> : null}
        </div>
        <div className={styles.heroFade} aria-hidden="true" />
      </header>

      <section className={styles.section}>
        {groups.map((group) => {
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
                        href={`${itemBasePath(item._type)}/${item.slug}`}
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

        {crossLinks && crossLinks.length > 0 ? (
          <ul className={styles.relatedList}>
            {crossLinks.map((link) => (
              <li key={link.href} className={styles.relatedItem}>
                <Link href={toInternalHref(link.href) ?? "#"}>{link.label}</Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <SiteFooter />
    </div>
  );
}
