import { PortableText as SanityPortableText } from "@portabletext/react";
import type { PortableTextComponents, PortableTextBlock } from "@portabletext/react";
import { urlFor } from "@/sanity/imageUrl";
import { isExternalHref, toInternalHref } from "@/lib/links";
import styles from "./BlogPortableText.module.css";

/** Shape of a Sanity image value (inline `image` or `blogBodyImage` type). */
type SanityImageValue = {
  asset?: { _ref?: string; url?: string };
  alt?: string;
  caption?: string;
};

/** Shape of a Sanity `table` value: a header row followed by body rows. */
type SanityTableValue = {
  rows?: Array<{ _key?: string; cells?: string[] }>;
};

/**
 * Renders an inline body image (and its optional caption) shared by the
 * `image` and `blogBodyImage` portable-text types.
 *
 * @param props.value - The Sanity image value to render.
 * @returns The figure element, or `null` when no resolvable image URL exists.
 */
function renderBodyImage({ value }: { value: SanityImageValue }) {
  try {
    const src = value?.asset?._ref
      ? urlFor(value).width(1200).fit("max").auto("format").url()
      : value?.asset?.url || "";
    if (!src) return null;
    return (
      <figure className={styles.figure}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={value?.alt || ""}
          className={styles.figureImage}
        />
        {value?.caption ? (
          <figcaption className={styles.figureCaption}>
            {value.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  } catch {
    return null;
  }
}

/**
 * Renders the `table` portable-text type as a light-theme HTML table, with
 * the first row treated as the header.
 *
 * @param props.value - The Sanity table value to render.
 * @returns The table element, or `null` when the table has no rows.
 */
function renderBodyTable({ value }: { value: SanityTableValue }) {
  try {
    const rows = value?.rows ?? [];
    if (rows.length === 0) return null;
    const [headerRow, ...bodyRows] = rows;
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          {headerRow?.cells ? (
            <thead>
              <tr>
                {headerRow.cells.map((cell, cellIndex) => (
                  <th key={cellIndex} className={styles.tableHeaderCell}>
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {bodyRows.map((row, rowIndex) => (
              <tr key={row?._key ?? rowIndex} className={styles.tableRow}>
                {(row?.cells ?? []).map((cell, cellIndex) => (
                  <td key={cellIndex} className={styles.tableCell}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch {
    return null;
  }
}

/**
 * Light-theme portable-text component map: same block/mark/list/type
 * coverage as `components/PortableText.tsx`, restyled with the 2026 ink/muted/
 * accent palette for a white article page.
 */
const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className={styles.heading1}>{children}</h1>,
    h2: ({ children }) => <h2 className={styles.heading2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.heading3}>{children}</h3>,
    h4: ({ children }) => <h4 className={styles.heading4}>{children}</h4>,
    normal: ({ children }) => (
      <p className={styles.paragraph}>{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className={styles.listBullet}>{children}</ul>
    ),
    number: ({ children }) => (
      <ol className={styles.listNumber}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className={styles.listItem}>{children}</li>,
    number: ({ children }) => <li className={styles.listItem}>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className={styles.strong}>{children}</strong>
    ),
    em: ({ children }) => <em className={styles.emphasis}>{children}</em>,
    code: ({ children }) => (
      <code className={styles.inlineCode}>{children}</code>
    ),
    link: ({ children, value }) => {
      const isExternal = isExternalHref(value?.href);
      const normalizedHref = toInternalHref(value?.href);
      return (
        <a
          href={normalizedHref}
          className={styles.link}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    code: ({ value }) => (
      <pre className={styles.codeBlock}>
        <code className={styles.codeBlockText}>{value?.code}</code>
      </pre>
    ),
    image: renderBodyImage,
    blogBodyImage: renderBodyImage,
    table: renderBodyTable,
  },
};

/**
 * Light-theme portable-text renderer for the 2026 blog post template. A
 * tonal copy of `PortableTextRenderer` from `components/PortableText.tsx`
 * (which stays dark-themed for the checklist pages that also depend on it).
 *
 * @param props.value - The Sanity portable-text block array to render.
 */
export function BlogPortableText({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className={styles.article}>
      <SanityPortableText value={value} components={components} />
    </div>
  );
}
