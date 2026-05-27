import type { MetadataRoute } from "next";
import { ORG_DESCRIPTION } from "@/app/_seo/schema";

/**
 * Next.js App Router Web App Manifest route.
 * Served automatically at /manifest.webmanifest.
 *
 * @returns The site's Web App Manifest metadata.
 */
export default function manifest(): MetadataRoute.Manifest {
  try {
    return {
      name: "Superflow",
      short_name: "Superflow",
      description: ORG_DESCRIPTION,
      start_url: "/",
      display: "standalone",
      background_color: "#000000",
      theme_color: "#000000",
      icons: [
        {
          src: "/logo.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ],
    };
  } catch {
    return {
      name: "Superflow",
      short_name: "Superflow",
      start_url: "/",
      display: "standalone",
      background_color: "#000000",
      theme_color: "#000000",
      icons: [],
    };
  }
}
