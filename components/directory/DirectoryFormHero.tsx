import Link from "next/link";

import { DIRECTORY_BASE_PATH } from "@/lib/directory/constants";
import styles from "./DirectoryHero.module.css";

/**
 * Compact gradient hero for the three directory form pages.
 *
 * Shares `DirectoryHero.module.css` with the category and profile heroes
 * so a founder moving from a listing to the match form does not appear to
 * change site. `tight` trims the bottom padding on pages whose form card
 * is pulled up into the fade.
 *
 * @param props - Component props.
 * @param props.kicker - Small mono line above the headline.
 * @param props.heading - The H1.
 * @param props.subheading - Supporting line under it.
 * @param props.backLabel - Optional "back to..." link label.
 * @param props.backHref - Where that link goes. Defaults to /directory.
 */
export default function DirectoryFormHero({
  kicker,
  heading,
  subheading,
  backLabel,
  backHref = DIRECTORY_BASE_PATH,
}: {
  kicker?: string;
  heading: string;
  subheading?: string;
  backLabel?: string;
  backHref?: string;
}) {
  try {
    return (
      <section className={styles.hero} data-section="directory-form-hero">
        <div className={styles.inner}>
          {backLabel && (
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
              <ol className={styles.breadcrumbList}>
                <li>
                  <Link href={backHref} className={styles.breadcrumbLink}>
                    {backLabel}
                  </Link>
                </li>
              </ol>
            </nav>
          )}
          {kicker && <p className={styles.kicker}>{kicker}</p>}
          <h1 className={styles.headline}>{heading}</h1>
          {subheading && <p className={styles.subhead}>{subheading}</p>}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
