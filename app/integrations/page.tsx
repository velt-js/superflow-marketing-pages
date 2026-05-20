import type { Metadata } from "next";
import ListingPage from "@/components/listing/ListingPage";
import { integrationsListing } from "@/lib/listing-data";

export const metadata: Metadata = {
  title: "Integrations",
  description: integrationsListing.hero.subheading,
};

export default function IntegrationsIndexPage() {
  return <ListingPage config={integrationsListing} />;
}
