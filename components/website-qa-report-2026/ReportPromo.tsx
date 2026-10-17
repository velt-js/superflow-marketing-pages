// A small card pointing at the State of Website QA report, for the pages
// that link to it (/tools, /blog). Server component, no script.

import Image from "next/image";
import Link from "next/link";
import {
  PAGE_IMAGE_SIZE,
  REPORT_FILES,
  REPORT_PATH,
  REPORT_SUBTITLE,
  REPORT_TITLE,
} from "@/lib/website-qa-report/report";
import styles from "./ReportPromo.module.css";

export function ReportPromo({ source }: { source: string }) {
  try {
    return (
      <Link href={`${REPORT_PATH}?source=${encodeURIComponent(source)}`} className={styles.card}>
        <Image
          src={REPORT_FILES.cover}
          alt=""
          width={PAGE_IMAGE_SIZE.width}
          height={PAGE_IMAGE_SIZE.height}
          sizes="72px"
          className={styles.cover}
        />
        <span className={styles.text}>
          <span className={styles.eyebrow}>Industry report · 2026</span>
          <span className={styles.title}>{REPORT_TITLE}</span>
          <span className={styles.subtitle}>{REPORT_SUBTITLE}</span>
        </span>
        <span className={styles.cta} aria-hidden="true">
          Read the findings
        </span>
      </Link>
    );
  } catch {
    return null;
  }
}
