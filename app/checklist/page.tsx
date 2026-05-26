import ListingPage from "@/components/listing/ListingPage";
import { getAllChecklistListItems } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

const HERO_HEADING = "Checklists for shipping better work";
const HERO_SUBHEADING =
  "Step-by-step playbooks for SEO, technical, and CRO work — used by 9,000+ teams to ship cleaner, faster.";

export const metadata = buildPageMetadata({
  title: "Checklists",
  description: HERO_SUBHEADING,
  path: "/checklist",
});

export default async function ChecklistIndexPage() {
  const items = await getAllChecklistListItems();
  return (
    <>
      <PageJsonLd
        name="Checklists | Superflow"
        description={HERO_SUBHEADING}
        path="/checklist"
        trail={[{ name: "Checklists", url: `${SITE_URL}/checklist` }]}
      />
      <ListingPage
        config={{
          hero: { heading: HERO_HEADING, subheading: HERO_SUBHEADING },
          grid: {
            variant: "icon-vertical",
            items: items.map((item) => ({
              title: item.title,
              subtitle: item.description,
              icon: item.thumbnail || "/images/hero/icon-world.svg",
              href: `/checklist/${item.slug}`,
              cta: "Open checklist",
            })),
          },
        }}
      />
    </>
  );
}
