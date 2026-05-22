import ListingPage from "@/components/listing/ListingPage";
import { userPersonaListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: "See if Superflow is right for you and your team",
  description: "Are you a designer, developer, PM? Superflow integrates seamlessly for everyone.",
  path: "/user-persona",
  noBrandSuffix: true,
});

export default function UserPersonaIndexPage() {
  return (
    <>
      <PageJsonLd
        name="See if Superflow is right for you and your team"
        description="Are you a designer, developer, PM? Superflow integrates seamlessly for everyone."
        path="/user-persona"
        trail={[{ name: "User Persona", url: `${SITE_URL}/user-persona` }]}
      />
      <ListingPage config={userPersonaListing} />
    </>
  );
}
