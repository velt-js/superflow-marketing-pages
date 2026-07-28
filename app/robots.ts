import type { MetadataRoute } from "next";

import { SITE_URL } from "@/app/_seo/schema";

/**
 * Generates the robots.txt file for the site.
 * Blocks crawlers from the Sanity Studio admin UI, API routes, and the
 * remaining noindex preview routes (/preview/*, e.g. /preview/integrations)
 * so they can never be crawled or indexed as thin, duplicate-title pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/studio/", "/api/", "/preview/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
