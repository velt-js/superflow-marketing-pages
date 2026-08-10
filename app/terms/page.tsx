import LegalPage from "@/components/legal/LegalPage";
import { termsHtml } from "@/lib/legal-content";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "The terms of service that govern your use of Superflow's collaboration platform for reviewing creative assets.",
  path: "/terms",
  ogImage: PAGE_OG_IMAGES.terms,
});

export default function TermsPage() {
  return (
    <>
      <PageJsonLd
        name="Terms of Service | Superflow"
        description="The terms of service that govern your use of Superflow's collaboration platform for reviewing creative assets."
        path="/terms"
        trail={[{ name: "Terms", url: `${SITE_URL}/terms` }]}
      />
      <LegalPage title="Terms of Service" lastUpdated="9th Sept 2022">
        <div dangerouslySetInnerHTML={{ __html: termsHtml }} />
      </LegalPage>
    </>
  );
}
