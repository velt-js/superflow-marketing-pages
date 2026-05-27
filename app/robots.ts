import type { MetadataRoute } from "next";

const SITE_URL = "https://usesuperflow.com";

/**
 * Generates the robots.txt file for the site.
 * Blocks crawlers from the Sanity Studio admin UI and API routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/studio/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
