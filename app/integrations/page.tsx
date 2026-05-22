import ListingPage from "@/components/listing/ListingPage";
import { integrationsListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: "Integrations",
  description: integrationsListing.hero.subheading,
  path: "/integrations",
});

export default function IntegrationsIndexPage() {
  return <ListingPage config={integrationsListing} />;
}
