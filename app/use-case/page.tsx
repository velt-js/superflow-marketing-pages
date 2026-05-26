import ListingPage from "@/components/listing/ListingPage";
import { getAllUseCaseListItems } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

const HERO_HEADING = "See if Superflow is right for you and your team";
const HERO_SUBHEADING =
  "Get faster bug feedback across testing, staging and production. End communication breakdowns. Stop bugs before they even happen";

export const metadata = buildPageMetadata({
  title: "Explore How We Simplify Collaboration for your Workflow",
  description: HERO_SUBHEADING,
  path: "/use-case",
  noBrandSuffix: true,
});

export default async function UseCaseIndexPage() {
  const items = await getAllUseCaseListItems();
  return (
    <>
      <PageJsonLd
        name="Use Cases | Superflow"
        description={HERO_SUBHEADING}
        path="/use-case"
        trail={[{ name: "Use Cases", url: `${SITE_URL}/use-case` }]}
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
