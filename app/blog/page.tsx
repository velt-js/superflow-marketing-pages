import BlogListingBody, {
  type BlogListingPost,
} from "@/components/blog-2026/BlogListingBody";
import { getAllBlogPosts } from "@/sanity/lib/queries";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  SITE_URL,
  ORG_ID,
  buildBreadcrumbList,
  buildWebPageSchema,
} from "@/app/_seo/schema";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";

const BLOG_BREADCRUMB = buildBreadcrumbList([
  { name: "Home", url: SITE_URL },
  { name: "Blog", url: `${SITE_URL}/blog` },
]);

const BLOG_DESCRIPTION =
  "Guides, comparisons, and insights from Superflow on creative-asset review, collaboration workflows, and shipping faster.";

const BLOG_WEBPAGE = buildWebPageSchema({
  name: "Blog | Superflow",
  description: BLOG_DESCRIPTION,
  url: `${SITE_URL}/blog`,
  breadcrumb: BLOG_BREADCRUMB,
});

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: "Blog",
  description: BLOG_DESCRIPTION,
  path: "/blog",
  ogImage: PAGE_OG_IMAGES.blog,
});

export default async function BlogListingPage() {
  const posts = (await getAllBlogPosts()) as BlogListingPost[];

  // Pick the most-recent featured post; fall back to the newest overall.
  const hero = posts.find((p) => p.featured) ?? posts[0];
  const rest = hero ? posts.filter((p) => p._id !== hero._id) : posts;

  const BLOG_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: "Superflow Blog",
    url: `${SITE_URL}/blog`,
    description: BLOG_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      image: post.featuredImage,
    })),
  };

  const BLOG_ITEMLIST = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Superflow Blog Posts",
    url: `${SITE_URL}/blog`,
    numberOfItems: posts.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: posts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <>
      <JsonLd id="ld-blog-webpage" data={BLOG_WEBPAGE} />
      <JsonLd id="ld-blog-breadcrumb" data={BLOG_BREADCRUMB} />
      <JsonLd id="ld-blog-blog" data={BLOG_SCHEMA} />
      <JsonLd id="ld-blog-itemlist" data={BLOG_ITEMLIST} />
      <BlogListingBody featuredPost={hero} posts={rest} />
    </>
  );
}
