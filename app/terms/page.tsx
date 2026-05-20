import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { termsHtml } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="9th Sept 2022">
      <div dangerouslySetInnerHTML={{ __html: termsHtml }} />
    </LegalPage>
  );
}
