import ListingPage from "@/components/listing/ListingPage";
import { alternativeListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: "Superflow Alternatives",
  description: alternativeListing.hero.subheading,
  path: "/alternative",
  noBrandSuffix: true,
});

export default function AlternativeIndexPage() {
  return (
    <>
      <PageJsonLd
        name="Superflow Alternatives"
        description={alternativeListing.hero.subheading}
        path="/alternative"
        trail={[{ name: "Alternatives", url: `${SITE_URL}/alternative` }]}
      />
      <ListingPage config={alternativeListing} />
    </>
  );
}
