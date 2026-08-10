import { notFound } from "next/navigation";
import {
  getBlogPostBySlug,
  getAllBlogSlugs,
} from "@/sanity/lib/queries";
import BlogPostBody, {
  type BlogPostBodyPost,
} from "@/components/blog-2026/BlogPostBody";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  ORG_ID,
  ORG_NAME,
  ORG_OG_IMAGE,
  SITE_URL,
  buildBreadcrumbList,
} from "@/app/_seo/schema";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { ogCardUrl } from "@/lib/og/card-url";

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
  body?: BlogPostBodyPost["body"];
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
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
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
    ogImage: post.ogImage ?? ogCardUrl(rawTitle),
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

  return (
    <>
      {blogPostingSchema ? (
        <JsonLd id="ld-blog-post" data={blogPostingSchema} />
      ) : null}
      <JsonLd id="ld-blog-post-breadcrumb" data={blogBreadcrumb} />
      {post.blogPostingSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: post.blogPostingSchema }}
        />
      ) : null}
      {post.faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: post.faqSchema }}
        />
      ) : null}

      <BlogPostBody post={post} />
    </>
  );
}
