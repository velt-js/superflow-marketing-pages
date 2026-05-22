import LegalPage from "@/components/legal/LegalPage";
import { termsHtml } from "@/lib/legal-content";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "The terms of service that govern your use of Superflow's collaboration platform for reviewing creative assets.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="9th Sept 2022">
      <div dangerouslySetInnerHTML={{ __html: termsHtml }} />
    </LegalPage>
  );
}
