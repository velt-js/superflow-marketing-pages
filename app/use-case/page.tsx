import ListingPage from "@/components/listing-2026/ListingPage";
import { getAllUseCaseListItems } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

const HERO_HEADING = "See if Superflow is right for you and your team";
const HERO_SUBHEADING =
  "Get faster bug feedback across testing, staging and production. End communication breakdowns. Stop bugs before they even happen";

export const metadata = buildPageMetadata({
  title: "Explore How We Simplify Collaboration for your Workflow",
  description:
    "Browse every Superflow use case — from website QA to video review to client approvals. See which workflow fits your team.",
  path: "/use-case",
  noBrandSuffix: true,
});

export default async function UseCaseIndexPage() {
  const items = await getAllUseCaseListItems();
  return (
    <>
      <PageJsonLd
        name="Use Cases | Superflow"
        description="Browse every Superflow use case — from website QA to video review to client approvals. See which workflow fits your team."
        path="/use-case"
        trail={[{ name: "Use Cases", url: `${SITE_URL}/use-case` }]}
      />
      <JsonLd
        id="ld-use-case-itemlist"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Use Cases",
          url: `${SITE_URL}/use-case`,
          numberOfItems: items.length,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/use-case/${item.slug}`,
            name: item.useCase ?? item.title,
          })),
        }}
      />
      <ListingPage
        config={{
          hero: { heading: HERO_HEADING, subheading: HERO_SUBHEADING },
          grid: {
            variant: "icon-vertical",
            items: items.map((item) => ({
              title: item.useCase || item.title,
              subtitle: item.description,
              icon: item.icon || "/images/hero/icon-world.svg",
              href: `/use-case/${item.slug}`,
            })),
          },
        }}
        iconInvert
      />
    </>
  );
}
