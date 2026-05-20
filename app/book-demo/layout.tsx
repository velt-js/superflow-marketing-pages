import Nav from "@/components/home/Nav";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  SITE_URL,
  buildBreadcrumbList,
  buildWebPageSchema,
} from "@/app/_seo/schema";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

const BOOK_DEMO_DESCRIPTION =
  "See Velt in action. Get a personalized walkthrough of our collaboration SDK — comments, cursors, notifications, and more.";

export const metadata = buildPageMetadata({
  title: "Book a demo",
  description: BOOK_DEMO_DESCRIPTION,
  path: "/book-demo",
  ogImage: "/og/book-demo.png",
});

const BOOK_DEMO_BREADCRUMB = buildBreadcrumbList([
  { name: "Home", url: SITE_URL },
  { name: "Book a demo", url: `${SITE_URL}/book-demo` },
]);

const BOOK_DEMO_WEBPAGE = buildWebPageSchema({
  name: "Book a demo | Velt",
  description: BOOK_DEMO_DESCRIPTION,
  url: `${SITE_URL}/book-demo`,
  breadcrumb: BOOK_DEMO_BREADCRUMB,
});

export default function BookDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <Nav />
      </div>
      <JsonLd id="ld-book-demo-webpage" data={BOOK_DEMO_WEBPAGE} />
      <JsonLd id="ld-book-demo-breadcrumb" data={BOOK_DEMO_BREADCRUMB} />
      {children}
    </>
  );
}
