import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import { formatBlogDate } from "./formatBlogDate";
import styles from "./BlogListingBody.module.css";

/** Mono uppercase eyebrow shown above the hero headline. */
const HERO_KICKER = "SUPERFLOW BLOG";
/** Hero headline (no CMS field backs this today, so it's hardcoded copy). */
const HERO_HEADLINE = "The Superflow Blog";
/**
 * Hero subhead. Kept consistent with the page's meta description (guides,
 * comparisons, and insights on creative-asset review and collaboration).
 */
const HERO_SUBHEAD =
  "Guides, comparisons, and insights on creative-asset review, client collaboration, and shipping faster without breaking trust.";
/** Heading above the remaining-posts card grid. */
const GRID_HEADING = "More from the blog";
/** Copy shown when there are no posts beyond (or including) the featured one. */
const EMPTY_STATE_TEXT = "No more posts yet.";
const STUDIO_LINK_LABEL = "Add one in Sanity Studio";

/** One blog post as returned by `getAllBlogPosts`. */
export interface BlogListingPost {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  publishedAt?: string;
  category?: string;
  categoryLabel?: string;
  featured?: boolean;
  featuredImage?: string;
}

interface BlogListingBodyProps {
  /** The selected featured post (`posts.find(p => p.featured) ?? posts[0]`). */
  featuredPost?: BlogListingPost;
  /** Every other post, rendered in the card grid below the featured post. */
  posts: BlogListingPost[];
}

/** A small right-pointing chevron used on the featured-post "Read" link. */
function ArrowIcon() {
  return (
    <svg
      className={styles.featuredCtaIcon}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Renders one large card for the featured post: image + kicker + title + date. */
function FeaturedPostCard({ post }: { post: BlogListingPost }) {
  const dateLabel = formatBlogDate(post?.publishedAt);
  const kicker = post?.categoryLabel ?? post?.category;

  return (
    <Link href={`/blog/${post.slug}`} className={styles.featuredCard}>
      <div className={styles.featuredImageWrap}>
        {post?.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            priority
            sizes="(min-width: 1080px) 630px, 100vw"
            className={styles.featuredImage}
          />
        ) : null}
      </div>
      <div className={styles.featuredBody}>
        {kicker ? <p className={styles.featuredKicker}>{kicker}</p> : null}
        <h2 className={styles.featuredTitle}>{post.title}</h2>
        {dateLabel ? (
          <p className={styles.featuredMeta}>
            <time dateTime={post.publishedAt}>{dateLabel}</time>
          </p>
        ) : null}
        <span className={styles.featuredCta}>
          Read the story
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

/** Renders one card in the remaining-posts grid: image + kicker + title + date. */
function PostCard({ post }: { post: BlogListingPost }) {
  const dateLabel = formatBlogDate(post?.publishedAt);
  const kicker = post?.categoryLabel ?? post?.category;

  return (
    <Link href={`/blog/${post.slug}`} className={styles.card}>
      <div className={styles.cardImageWrap}>
        {post?.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(min-width: 1080px) 380px, (min-width: 620px) 45vw, 100vw"
            className={styles.cardImage}
          />
        ) : null}
      </div>
      <div className={styles.cardBody}>
        {kicker ? <p className={styles.cardKicker}>{kicker}</p> : null}
        <h3 className={styles.cardTitle}>{post.title}</h3>
        {dateLabel ? (
          <p className={styles.cardMeta}>
            <time dateTime={post.publishedAt}>{dateLabel}</time>
          </p>
        ) : null}
      </div>
    </Link>
  );
}

/**
 * Full presentation layer for `/blog`: SiteNav, a compact hero on the shared
 * blue gradient bitmap, the featured post as a large light card, a card grid
 * of the remaining posts, and SiteFooter. All SEO/JSON-LD and the
 * featured-post selection logic stay in `app/blog/page.tsx`; this component
 * only renders whatever it's handed.
 *
 * @param props.featuredPost - The post to feature above the grid.
 * @param props.posts - The remaining posts to render in the grid.
 */
export default function BlogListingBody({
  featuredPost,
  posts,
}: BlogListingBodyProps) {
  return (
    <main className={styles.page}>
      <SiteNav />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{HERO_KICKER}</p>
          <h1 className={styles.headline}>{HERO_HEADLINE}</h1>
          <p className={styles.subhead}>{HERO_SUBHEAD}</p>
        </div>
      </section>

      {featuredPost ? (
        <section className={styles.featuredSection}>
          <div className={styles.featuredInner}>
            <FeaturedPostCard post={featuredPost} />
          </div>
        </section>
      ) : null}

      <section className={styles.gridSection}>
        <div className={styles.gridInner}>
          <h2 className={styles.gridHeading}>{GRID_HEADING}</h2>

          {posts.length === 0 ? (
            <p className={styles.emptyState}>
              {EMPTY_STATE_TEXT}{" "}
              <Link href="/studio" className={styles.emptyStateLink}>
                {STUDIO_LINK_LABEL}
              </Link>
              .
            </p>
          ) : (
            <ul className={styles.grid}>
              {posts.map((post) => (
                <li key={post._id} className={styles.item}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
