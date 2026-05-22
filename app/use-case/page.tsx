import ListingPage from "@/components/listing/ListingPage";
import { useCaseListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: "Explore How We Simplify Collaboration for your Workflow",
  description: useCaseListing.hero.subheading,
  path: "/use-case",
  noBrandSuffix: true,
});

export default function UseCaseIndexPage() {
  return <ListingPage config={useCaseListing} />;
}
