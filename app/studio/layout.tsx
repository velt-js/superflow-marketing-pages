import type { Metadata } from "next";

/**
 * Layout for the Sanity Studio route.
 * Blocks search engine indexing of the CMS admin UI.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Passes children through unchanged; exists solely to host the no-index metadata.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
