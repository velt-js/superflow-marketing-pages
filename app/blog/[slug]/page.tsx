import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getBlogPostBySlug,
  getAllBlogSlugs,
} from "@/sanity/lib/queries";
import { PortableTextRenderer } from "@/components/PortableText";
import Footer from "@/components/home/Footer";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  ORG_ID,
  ORG_NAME,
  ORG_OG_IMAGE,
  SITE_URL,
  buildBreadcrumbList,
} from "@/app/_seo/schema";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

type PostShape = {
  title?: string;
  description?: string;
  publishedAt?: string;
  _updatedAt?: string;
  category?: string;
  categoryLabel?: string;
  readTime?: number;
  author?: { name?: string; role?: string; avatar?: string };
  featuredImage?: string;
  ogImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  faqSchema?: string;
  blogPostingSchema?: string;
  body?: Parameters<typeof PortableTextRenderer>[0]["value"];
};

function buildBlogPostingSchema({
  post,
  slug,
}: {
  post: PostShape;
  slug: string;
}): Record<string, unknown> | null {
  if (!post?.title) return null;
  const pageUrl = `${SITE_URL}/blog/${slug}`;
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    publisher: { "@id": ORG_ID },
  };
  const description = post.metaDescription ?? post.description;
  if (description) node.description = description;
  if (post.publishedAt) node.datePublished = post.publishedAt;
  if (post._updatedAt) node.dateModified = post._updatedAt;
  if (post.author?.name) {
    node.author = { "@type": "Person", name: post.author.name };
  } else {
    node.author = { "@type": "Organization", name: ORG_NAME };
  }
  node.image = post.ogImage ?? post.featuredImage ?? ORG_OG_IMAGE;
  return node;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const rawTitle = post.metaTitle || `${post.title} | Superflow Blog`;
  const description = post.metaDescription || post.description || "";
  const metadata = buildPageMetadata({
    title: rawTitle,
    description,
    path: `/blog/${slug}`,
    ogImage: post.ogImage ?? undefined,
    socialTitle: rawTitle,
  });
  metadata.title = { absolute: rawTitle };
  if (metadata.openGraph) {
    (metadata.openGraph as Record<string, unknown>).type = "article";
  }
  return metadata;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: PostShape | null = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const blogPostingSchema = buildBlogPostingSchema({ post, slug });
  const blogBreadcrumb = buildBreadcrumbList([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: post.title ?? slug, url: `${SITE_URL}/blog/${slug}` },
  ]);

  const dateLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-black text-white font-urbanist">
      {blogPostingSchema ? (
        <JsonLd id="ld-blog-post" data={blogPostingSchema} />
      ) : null}
      <JsonLd id="ld-blog-post-breadcrumb" data={blogBreadcrumb} />

      {/* Hero */}
      <header className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {post.categoryLabel && (
            <div className="inline-block rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-px mb-10">
              <div className="rounded-full bg-black px-5 py-2">
                <span className="uppercase tracking-[0.18em] text-xs font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                  {post.categoryLabel}
                </span>
              </div>
            </div>
          )}

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#C6B8FF] tracking-[-0.02em] leading-[1.05]">
            {post.title}
          </h1>

          {post.author?.name && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {post.author.avatar && (
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white/10">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-white/85 text-base">{post.author.name}</span>
            </div>
          )}

          {(dateLabel || post.readTime) && (
            <div className="flex items-center justify-center gap-3 text-white/40 text-sm mt-3">
              {dateLabel && <time>{dateLabel}</time>}
              {dateLabel && post.readTime ? <span>&mdash;</span> : null}
              {post.readTime ? <span>{post.readTime} min read</span> : null}
            </div>
          )}
        </div>
      </header>

      {/* Hero image */}
      {post.featuredImage && (
        <div className="px-6">
          <div className="relative aspect-[16/9] max-w-5xl mx-auto rounded-3xl overflow-hidden bg-white/5">
            <Image
              src={post.featuredImage}
              alt={post.title ?? ""}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Body */}
      {post.body && (
        <article className="max-w-3xl mx-auto px-6 py-16">
          <div className="prose-invert max-w-none">
            <PortableTextRenderer value={post.body} />
          </div>

          {post.blogPostingSchema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: post.blogPostingSchema }}
            />
          )}
          {post.faqSchema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: post.faqSchema }}
            />
          )}
        </article>
      )}

      <Footer />
    </div>
  );
}
