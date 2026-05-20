import { client } from "../client";

export type BlogPostListItem = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  author?: { name: string; role?: string };
  featuredImage?: string;
};

export async function getAllBlogPosts(): Promise<BlogPostListItem[]> {
  return client.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      description,
      publishedAt,
      category,
      tags,
      "author": author->{ name, role },
      "featuredImage": featuredImage.asset->url
    }
  `);
}

// Review page queries (/<feature>-review)
export async function getAllReviewSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "reviewPage" && defined(slug.current)].slug.current`
  );
}

export async function getReviewPageBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "reviewPage" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      feature,
      hero {
        headlineLine1,
        subheading,
        personaLeft { label, color },
        personaRight { label, color },
        primaryCta,
        secondaryCta,
        "heroMediaSrc": heroMedia.asset->url
      },
      featureCards {
        eyebrow,
        heading,
        cards[] {
          titleLine1,
          titleLine2,
          subtitle,
          "imageSrc": image.asset->url
        },
        integrationLogos[] {
          name,
          href,
          "logoSrc": logo.asset->url
        },
        integrationsCtaLabel,
        integrationsCtaHref
      },
      collaborationTools {
        headingLine1,
        headingLine2,
        cards[] {
          title,
          body,
          "iconSrc": icon.asset->url,
          "previewSrc": preview.asset->url
        },
        ctaLabel,
        ctaHref
      },
      faqFormatsAnswer,
      metaTitle,
      metaDescription,
      "ogImage": ogImage.asset->url
    }
  `,
    { slug }
  );
}
