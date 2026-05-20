import type { Metadata } from "next";
import ListingPage from "@/components/listing/ListingPage";
import { alternativeListing } from "@/lib/listing-data";

export const metadata: Metadata = {
  title: "Superflow Alternatives",
  description: alternativeListing.hero.subheading,
};

export default function AlternativeIndexPage() {
  return <ListingPage config={alternativeListing} />;
}
