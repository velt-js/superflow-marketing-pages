import ListingPage from "@/components/listing/ListingPage";
import { getAllIntegrationListItems } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

const HERO_HEADING = "Superflow integrations";
const HERO_SUBHEADING =
  "Plug Superflow into the tools your team already lives in. Push tasks, sync threads, and keep every conversation in context.";

export const metadata = buildPageMetadata({
  title: "Integrations",
  description: HERO_SUBHEADING,
  path: "/integrations",
});

export default async function IntegrationsIndexPage() {
  const items = await getAllIntegrationListItems();
  return (
    <>
      <PageJsonLd
        name="Integrations | Superflow"
        description={HERO_SUBHEADING}
        path="/integrations"
        trail={[{ name: "Integrations", url: `${SITE_URL}/integrations` }]}
      />
      <JsonLd
        id="ld-integrations-itemlist"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Superflow Integrations",
          url: `${SITE_URL}/integrations`,
          numberOfItems: items.length,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/integrations/${item.slug}`,
            name: item.appName ?? item.title,
          })),
        }}
      />
      <ListingPage
        config={{
          hero: { heading: HERO_HEADING, subheading: HERO_SUBHEADING },
          grid: {
            variant: "icon-horizontal",
            items: items.map((item) => ({
              title: item.appName || item.title,
              icon: item.appLogo || "/images/hero/icon-world.svg",
              href: `/integrations/${item.slug}`,
            })),
          },
        }}
      />
    </>
  );
}
