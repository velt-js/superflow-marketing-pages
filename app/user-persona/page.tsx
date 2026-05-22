import ListingPage from "@/components/listing/ListingPage";
import { userPersonaListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: "See if Superflow is right for you and your team",
  description: "Are you a designer, developer, PM? Superflow integrates seamlessly for everyone.",
  path: "/user-persona",
  noBrandSuffix: true,
});

export default function UserPersonaIndexPage() {
  return <ListingPage config={userPersonaListing} />;
}
