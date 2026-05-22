import ListingPage from "@/components/listing/ListingPage";
import { useCaseListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: "Explore How We Simplify Collaboration for your Workflow",
  description: useCaseListing.hero.subheading,
  path: "/use-case",
  noBrandSuffix: true,
});

export default function UseCaseIndexPage() {
  return (
    <>
      <PageJsonLd
        name="Use Cases | Superflow"
        description={useCaseListing.hero.subheading}
        path="/use-case"
        trail={[{ name: "Use Cases", url: `${SITE_URL}/use-case` }]}
      />
      <ListingPage config={useCaseListing} />
    </>
  );
}
