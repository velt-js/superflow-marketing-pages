import ListingPage from "@/components/listing/ListingPage";
import { integrationsListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: "Integrations",
  description: integrationsListing.hero.subheading,
  path: "/integrations",
});

export default function IntegrationsIndexPage() {
  return (
    <>
      <PageJsonLd
        name="Integrations | Superflow"
        description={integrationsListing.hero.subheading}
        path="/integrations"
        trail={[{ name: "Integrations", url: `${SITE_URL}/integrations` }]}
      />
      <ListingPage config={integrationsListing} />
    </>
  );
}
