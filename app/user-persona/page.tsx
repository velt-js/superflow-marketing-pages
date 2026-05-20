import type { Metadata } from "next";
import ListingPage from "@/components/listing/ListingPage";
import { userPersonaListing } from "@/lib/listing-data";

export const metadata: Metadata = {
  title: "Who uses Superflow",
  description: userPersonaListing.hero.subheading,
};

export default function UserPersonaIndexPage() {
  return <ListingPage config={userPersonaListing} />;
}
