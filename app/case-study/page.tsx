import ListingPage from "@/components/listing/ListingPage";
import { getAllCaseStudyListItems } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

const HERO_HEADING = "Customer case studies";
const HERO_SUBHEADING =
  "See how teams use Superflow to ship faster, cut review rounds, and keep every comment in context.";

export const metadata = buildPageMetadata({
  title: "Case Studies",
  description: HERO_SUBHEADING,
  path: "/case-study",
});

export default async function CaseStudyIndexPage() {
  const items = await getAllCaseStudyListItems();
  return (
    <>
      <PageJsonLd
        name="Case Studies | Superflow"
        description={HERO_SUBHEADING}
        path="/case-study"
        trail={[{ name: "Case Studies", url: `${SITE_URL}/case-study` }]}
      />
      <JsonLd
        id="ld-case-study-itemlist"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Case Studies",
          url: `${SITE_URL}/case-study`,
          numberOfItems: items.length,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/case-study/${item.slug}`,
            name: item.title,
          })),
        }}
      />
      <ListingPage
        config={{
          hero: { heading: HERO_HEADING, subheading: HERO_SUBHEADING },
          grid: {
            variant: "icon-vertical",
            items: items.map((item) => ({
              title: item.title,
              subtitle: item.description,
              icon: item.logo || item.thumbnail || "/images/hero/icon-world.svg",
              href: `/case-study/${item.slug}`,
              cta: "Read case study",
            })),
          },
        }}
      />
    </>
  );
}
