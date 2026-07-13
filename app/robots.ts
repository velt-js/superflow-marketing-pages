import type { MetadataRoute } from "next";

const SITE_URL = "https://usesuperflow.com";

/**
 * Generates the robots.txt file for the site.
 * Blocks crawlers from the Sanity Studio admin UI, API routes, and the
 * noindex preview routes (/preview/* and /home-preview) so they can never
 * be crawled or indexed as thin, duplicate-title pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/studio/", "/api/", "/preview/", "/home-preview"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
