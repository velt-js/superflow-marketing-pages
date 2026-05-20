import type { Metadata } from "next";
import ListingPage from "@/components/listing/ListingPage";
import { comparisonListing } from "@/lib/listing-data";

export const metadata: Metadata = {
  title: "Compare Superflow",
  description: comparisonListing.hero.subheading,
};

export default function ComparisonIndexPage() {
  return <ListingPage config={comparisonListing} />;
}
