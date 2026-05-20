import type { Metadata } from "next";
import ListingPage from "@/components/listing/ListingPage";
import { useCaseListing } from "@/lib/listing-data";

export const metadata: Metadata = {
  title: "Use Cases",
  description: useCaseListing.hero.subheading,
};

export default function UseCaseIndexPage() {
  return <ListingPage config={useCaseListing} />;
}
