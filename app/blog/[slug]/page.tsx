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

function buildBlogPostingSchema({
  post,
  slug,
}: {
  post: {
    title?: string;
    description?: string;
    publishedAt?: string;
    _updatedAt?: string;
    author?: { name?: string };
    featuredImage?: string;
    ogImage?: string;
    metaDescription?: string;
  };
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
  const post = await getBlogPostBySlug(slug);

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
    <div className="min-h-screen bg-white text-black font-urbanist" style={{ paddingTop: 80 }}>
      {blogPostingSchema ? (
        <JsonLd id="ld-blog-post" data={blogPostingSchema} />
      ) : null}
      <JsonLd id="ld-blog-post-breadcrumb" data={blogBreadcrumb} />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.title}</h1>
          {post.description && (
            <p className="text-lg text-black/60 mb-6">{post.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-black/40">
            {post.author?.name && <span>{post.author.name}</span>}
            {post.publishedAt && (
              <>
                <span>&middot;</span>
                <time>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            )}
          </div>
        </div>

        {post.featuredImage && (
          <div className="relative aspect-[16/9] mb-12 overflow-hidden rounded-xl bg-black/5">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              priority
              className="object-cover"
            />
          </div>
        )}

        {post.body && (
          <div className="prose max-w-none">
            <PortableTextRenderer value={post.body} />
          </div>
        )}

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
      <Footer />
    </div>
  );
}
