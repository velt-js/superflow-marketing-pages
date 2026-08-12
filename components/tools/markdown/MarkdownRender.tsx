// Turns parsed Markdown tokens into React elements.
//
// There is deliberately no `dangerouslySetInnerHTML` in this file, and there
// must never be one. Every string from the document reaches the DOM as a React
// text child, which React escapes, so a document containing `<script>` renders
// those characters rather than executing them. That is the whole security
// model of this tool and it holds without a sanitizer.
//
// `href` and `src` are the exceptions React does not cover, and both are
// already fenced by `safeHref` in the parser. An unsafe URL arrives here as
// "", which renders as a plain span rather than a live link.

import type { BlockToken, InlineToken } from "@/lib/tools/markdown/parse";
import styles from "./Markdown.module.css";

/**
 * Renders inline tokens.
 *
 * @param props - The tokens to render.
 */
function Inline({ tokens }: { tokens: InlineToken[] }) {
  return (
    <>
      {tokens.map((token, index) => {
        switch (token.kind) {
          case "text":
            return <span key={index}>{token.value}</span>;
          case "strong":
            return (
              <strong key={index}>
                <Inline tokens={token.children} />
              </strong>
            );
          case "em":
            return (
              <em key={index}>
                <Inline tokens={token.children} />
              </em>
            );
          case "del":
            return (
              <del key={index}>
                <Inline tokens={token.children} />
              </del>
            );
          case "code":
            return (
              <code key={index} className={styles.inlineCode}>
                {token.value}
              </code>
            );
          case "link":
            // An unsafe scheme was collapsed to "" by the parser. Render the
            // text without making it clickable rather than dropping it, so the
            // reader still sees what the document said.
            return token.href.length > 0 ? (
              <a
                key={index}
                href={token.href}
                rel="nofollow noopener noreferrer"
                target={token.href.startsWith("#") ? undefined : "_blank"}
              >
                <Inline tokens={token.children} />
              </a>
            ) : (
              <span key={index} title="Link removed: unsupported URL scheme">
                <Inline tokens={token.children} />
              </span>
            );
          case "image":
            return token.src.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={index} src={token.src} alt={token.alt} className={styles.image} loading="lazy" />
            ) : (
              <span key={index} className={styles.blockedImage}>
                {token.alt || "image"}
              </span>
            );
          case "break":
            return <br key={index} />;
          default:
            return null;
        }
      })}
    </>
  );
}

/**
 * Renders one block and anything nested inside it.
 *
 * @param props - The block to render.
 */
function Block({ block }: { block: BlockToken }) {
  switch (block.kind) {
    case "heading": {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag id={block.slug}>
          <Inline tokens={block.children} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p>
          <Inline tokens={block.children} />
        </p>
      );
    case "code":
      return (
        <pre className={styles.codeBlock} data-language={block.language || undefined}>
          <code>{block.value}</code>
        </pre>
      );
    case "quote":
      return (
        <blockquote className={styles.quote}>
          <Blocks blocks={block.blocks} />
        </blockquote>
      );
    case "list": {
      const items = block.items.map((itemBlocks, index) => (
        <li key={index}>
          <Blocks blocks={itemBlocks} />
        </li>
      ));
      return block.ordered ? <ol start={block.start}>{items}</ol> : <ul>{items}</ul>;
    }
    case "table":
      return (
        // The wrapper is what keeps a wide table from scrolling the page body
        // sideways on a phone.
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th key={index}>
                    <Inline tokens={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <Inline tokens={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "hr":
      return <hr />;
    default:
      return null;
  }
}

/**
 * Renders a list of blocks.
 *
 * @param props - The blocks to render.
 */
export function Blocks({ blocks }: { blocks: BlockToken[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </>
  );
}

/**
 * The rendered document.
 *
 * @param props - The parsed blocks.
 */
export function MarkdownRender({ blocks }: { blocks: BlockToken[] }) {
  return (
    <article className={styles.rendered}>
      <Blocks blocks={blocks} />
    </article>
  );
}
