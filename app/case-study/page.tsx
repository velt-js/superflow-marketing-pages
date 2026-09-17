import CaseStudyListingPage from "@/components/case-study-2026/CaseStudyListingPage";
import { getAllCaseStudyListItems } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

const HERO_HEADING = "Customer case studies";
const HERO_SUBHEADING =
  "See how teams use Superflow to ship faster, cut review rounds, and keep every comment in context.";

// The hero line reads well on the page but is too short to fill a SERP
// snippet, so the meta description says the same thing at snippet length
// rather than stretching the hero to suit search engines.
const META_DESCRIPTION =
  "See how real agencies and product teams use Superflow to ship faster, cut review rounds, and keep every client comment in context. Read their results.";

export const metadata = buildPageMetadata({
  title: "Customer Case Studies and Results",
  description: META_DESCRIPTION,
  path: "/case-study",
  ogImage: PAGE_OG_IMAGES.caseStudy,
});

export default async function CaseStudyIndexPage() {
  const items = await getAllCaseStudyListItems();
  return (
    <>
      <PageJsonLd
        name="Case Studies | Superflow"
        description={META_DESCRIPTION}
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
      <CaseStudyListingPage
        heading={HERO_HEADING}
        subheading={HERO_SUBHEADING}
        items={items}
      />
    </>
  );
}
