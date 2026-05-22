import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/home/Footer";
import { getAllBlogPosts } from "@/sanity/lib/queries";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  SITE_URL,
  buildBreadcrumbList,
  buildWebPageSchema,
} from "@/app/_seo/schema";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

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
});

type BlogPost = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  publishedAt?: string;
  category?: string;
  featured?: boolean;
  featuredImage?: string;
};

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogListingPage() {
  const posts = (await getAllBlogPosts()) as BlogPost[];

  // Pick the most-recent featured post; fall back to the newest overall.
  const hero = posts.find((p) => p.featured) ?? posts[0];
  const rest = hero ? posts.filter((p) => p._id !== hero._id) : posts;

  return (
    <>
      <JsonLd id="ld-blog-webpage" data={BLOG_WEBPAGE} />
      <JsonLd id="ld-blog-breadcrumb" data={BLOG_BREADCRUMB} />
      <div className="relative bg-black text-white font-urbanist w-full overflow-x-hidden min-h-screen">
        {/* Featured hero */}
        {hero && (
          <section className="pt-32 pb-12 px-6">
            <Link
              href={`/blog/${hero.slug}`}
              className="relative block max-w-6xl mx-auto rounded-3xl overflow-hidden border border-white/10 group"
              style={{ aspectRatio: "16 / 9" }}
            >
              {hero.featuredImage && (
                <Image
                  src={hero.featuredImage}
                  alt={hero.title}
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              )}

              {/* Overlay card */}
              <div className="absolute left-6 bottom-6 md:left-10 md:bottom-10 max-w-md rounded-2xl bg-black/70 backdrop-blur-xl p-6 md:p-8 border border-white/10">
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {hero.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-white/60 mt-3">
                  <span className="truncate">{hero.title}</span>
                  {hero.publishedAt && (
                    <>
                      <span aria-hidden>&bull;</span>
                      <time>{formatDate(hero.publishedAt)}</time>
                    </>
                  )}
                </div>
                <span className="inline-flex items-center rounded-full bg-[#625DF5] px-5 py-2 text-sm font-semibold text-white mt-5 group-hover:bg-[#7672FF] transition">
                  Read Now
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* Recent Blogs */}
        <section className="max-w-6xl mx-auto px-6 mt-12 md:mt-20 mb-24">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-10">
            Recent Blogs
          </h3>

          {rest.length === 0 ? (
            <p className="text-white/60">
              No more posts.{" "}
              <Link
                href="/studio"
                className="text-[#A89BFF] hover:underline"
              >
                Add one in Sanity Studio
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {rest.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-4"
                >
                  {post.featuredImage && (
                    <div
                      className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5"
                      style={{ aspectRatio: "16 / 9" }}
                    >
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 380px, (min-width: 768px) 45vw, 90vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-xl font-semibold text-white leading-snug">
                      {post.title}
                    </h4>
                    {post.publishedAt && (
                      <time className="text-sm text-white/40">
                        {formatDate(post.publishedAt)}
                      </time>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Footer />
      </div>
    </>
  );
}
