import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { privacyHtml } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="9th Sept 2022">
      <div dangerouslySetInnerHTML={{ __html: privacyHtml }} />
    </LegalPage>
  );
}
