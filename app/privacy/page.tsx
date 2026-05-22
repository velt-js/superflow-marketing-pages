import LegalPage from "@/components/legal/LegalPage";
import { privacyHtml } from "@/lib/legal-content";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "Read the Superflow privacy policy: what data we collect, how it's used, and the controls you have over it.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="9th Sept 2022">
      <div dangerouslySetInnerHTML={{ __html: privacyHtml }} />
    </LegalPage>
  );
}
