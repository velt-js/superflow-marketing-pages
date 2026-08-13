import BugBookListingBody from "@/components/bug-book-2026/BugBookListingBody";
import { getAllBugBookEntries } from "@/sanity/lib/queries";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  SITE_URL,
  buildBreadcrumbList,
  buildWebPageSchema,
} from "@/app/_seo/schema";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

const BUG_BOOK_DESCRIPTION =
  "Real bugs, rage clicks, and typos caught in Superflow reviews - by humans and by our AI agents - before users ever saw them. Names removed. Shame preserved.";

const BUG_BOOK_BREADCRUMB = buildBreadcrumbList([
  { name: "Home", url: SITE_URL },
  { name: "Bug Book", url: `${SITE_URL}/bug-book` },
]);

const BUG_BOOK_WEBPAGE = buildWebPageSchema({
  name: "The Bug Book | Superflow",
  description: BUG_BOOK_DESCRIPTION,
  url: `${SITE_URL}/bug-book`,
  breadcrumb: BUG_BOOK_BREADCRUMB,
});

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: "The Bug Book",
  description: BUG_BOOK_DESCRIPTION,
  path: "/bug-book",
});

export default async function BugBookPage() {
  const entries = await getAllBugBookEntries();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Superflow Bug Book",
    url: `${SITE_URL}/bug-book`,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/bug-book/${entry.slug}`,
      name: entry.headline,
    })),
  };

  return (
    <>
      <JsonLd id="ld-bug-book-webpage" data={BUG_BOOK_WEBPAGE} />
      <JsonLd id="ld-bug-book-breadcrumb" data={BUG_BOOK_BREADCRUMB} />
      <JsonLd id="ld-bug-book-itemlist" data={itemList} />
      <BugBookListingBody entries={entries} />
    </>
  );
}
