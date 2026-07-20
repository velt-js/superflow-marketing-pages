import { BlogPortableText } from "@/components/blog-2026/BlogPortableText";
import type { ChecklistEndNote as EndNote } from "@/lib/checklist-types";
import styles from "./ChecklistEndNote.module.css";

/**
 * 2026-style checklist end note: the doc's closing prose inside a light
 * hairline-bordered card under a centred serif ink heading. Replaces
 * `components/checklist/ChecklistEndNote.tsx`.
 *
 * @param props.endNote - The checklist doc's `endNote` value.
 * @returns The section, or `null` when it has no content or on failure.
 */
export default function ChecklistEndNote({ endNote }: { endNote: EndNote }) {
  try {
    if (!endNote?.title && !endNote?.description) {
      return null;
    }

    return (
      <section className={styles.section} data-section="checklist-end-note">
        <div className={styles.inner}>
          {endNote?.title ? (
            <h2 className={styles.heading}>{endNote.title}</h2>
          ) : null}
          {endNote?.description ? (
            <div className={styles.body}>
              <BlogPortableText value={endNote.description} />
            </div>
          ) : null}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
