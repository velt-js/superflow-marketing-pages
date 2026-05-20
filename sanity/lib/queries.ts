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
