import Image from "next/image";
import type { PortableTextBlock } from "@portabletext/react";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import { BlogPortableText } from "./BlogPortableText";
import { formatBlogDate } from "./formatBlogDate";
import styles from "./BlogPostBody.module.css";

/** Pixel size of the author avatar rendered beside their name. */
const AVATAR_SIZE_PX = 36;
/** Separator glyph between the date and read-time in the meta row. */
const META_SEPARATOR = "\u2022";

/** Author byline shape as returned by `getBlogPostBySlug`. */
export interface BlogPostAuthor {
  name?: string;
  role?: string;
  avatar?: string;
}

/** Post shape as returned by `getBlogPostBySlug`, trimmed to what this
    component renders (SEO/schema fields stay in `app/blog/[slug]/page.tsx`). */
export interface BlogPostBodyPost {
  title?: string;
  category?: string;
  categoryLabel?: string;
  publishedAt?: string;
  readTime?: number;
  author?: BlogPostAuthor;
  featuredImage?: string;
  body?: PortableTextBlock[];
}

interface BlogPostBodyProps {
  post: BlogPostBodyPost;
}

/**
 * Full presentation layer for `/blog/[slug]`: SiteNav, a centered header
 * (category kicker, serif headline, author + date/read-time), a rounded
 * featured-image card, the article body rendered with `BlogPortableText`,
 * and SiteFooter. All SEO/JSON-LD, the Sanity query, and the raw
 * `blogPostingSchema`/`faqSchema` script tags stay in
 * `app/blog/[slug]/page.tsx`; this component only renders whatever post data
 * it's handed.
 *
 * @param props.post - The resolved blog post document.
 */
export default function BlogPostBody({ post }: BlogPostBodyProps) {
  const dateLabel = formatBlogDate(post?.publishedAt);
  const kicker = post?.categoryLabel ?? post?.category;

  return (
    <main className={styles.page}>
      <SiteNav />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
          <h1 className={styles.headline}>{post?.title}</h1>

          {post?.author?.name ? (
            <div className={styles.authorRow}>
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={AVATAR_SIZE_PX}
                  height={AVATAR_SIZE_PX}
                  className={styles.avatar}
                />
              ) : null}
              <span className={styles.authorName}>{post.author.name}</span>
            </div>
          ) : null}

          {dateLabel || post?.readTime ? (
            <div className={styles.metaRow}>
              {dateLabel ? (
                <time dateTime={post?.publishedAt}>{dateLabel}</time>
              ) : null}
              {dateLabel && post?.readTime ? (
                <span className={styles.metaDot} aria-hidden="true">
                  {META_SEPARATOR}
                </span>
              ) : null}
              {post?.readTime ? <span>{post.readTime} min read</span> : null}
            </div>
          ) : null}
        </div>
      </header>

      {post?.featuredImage ? (
        <section className={styles.featuredImageSection}>
          <div className={styles.featuredImageWrap}>
            <Image
              src={post.featuredImage}
              alt={post?.title ?? ""}
              fill
              priority
              sizes="(min-width: 1080px) 1040px, 100vw"
              className={styles.featuredImage}
            />
          </div>
        </section>
      ) : null}

      {post?.body ? (
        <article className={styles.articleSection}>
          <div className={styles.articleInner}>
            <BlogPortableText value={post.body} />
          </div>
        </article>
      ) : null}

      <SiteFooter />
    </main>
  );
}
