import LegalPage from "@/components/legal/LegalPage";
import { privacyHtml } from "@/lib/legal-content";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "Read the Superflow privacy policy: what data we collect, how it's used, and the controls you have over it.",
  path: "/privacy",
  ogImage: PAGE_OG_IMAGES.privacy,
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageJsonLd
        name="Privacy Policy | Superflow"
        description="Read the Superflow privacy policy: what data we collect, how it's used, and the controls you have over it."
        path="/privacy"
        trail={[{ name: "Privacy", url: `${SITE_URL}/privacy` }]}
      />
      <LegalPage title="Privacy Policy" lastUpdated="9th Sept 2022">
        <div dangerouslySetInnerHTML={{ __html: privacyHtml }} />
      </LegalPage>
    </>
  );
}
