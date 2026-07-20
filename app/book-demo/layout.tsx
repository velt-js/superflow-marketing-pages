import { JsonLd } from "@/app/_seo/JsonLd";
import {
  SITE_URL,
  buildBreadcrumbList,
  buildWebPageSchema,
} from "@/app/_seo/schema";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

const BOOK_DEMO_DESCRIPTION =
  "See Superflow in action. Get a personalized walkthrough of how agencies and marketers review and ship creative assets 10x faster.";

export const metadata = buildPageMetadata({
  title: "Book a demo",
  description: BOOK_DEMO_DESCRIPTION,
  path: "/book-demo",
});

const BOOK_DEMO_BREADCRUMB = buildBreadcrumbList([
  { name: "Home", url: SITE_URL },
  { name: "Book a demo", url: `${SITE_URL}/book-demo` },
]);

const BOOK_DEMO_WEBPAGE = buildWebPageSchema({
  name: "Book a demo | Superflow",
  description: BOOK_DEMO_DESCRIPTION,
  url: `${SITE_URL}/book-demo`,
  breadcrumb: BOOK_DEMO_BREADCRUMB,
});

// Nav chrome now comes from the page itself (the 2026 SiteNav), so this
// layout only contributes the page metadata + JSON-LD.
export default function BookDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd id="ld-book-demo-webpage" data={BOOK_DEMO_WEBPAGE} />
      <JsonLd id="ld-book-demo-breadcrumb" data={BOOK_DEMO_BREADCRUMB} />
      {children}
    </>
  );
}
