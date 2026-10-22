import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import IntercomButton from "@/components/home/IntercomButton";
import SiteStatusLanding from "@/components/site-status/SiteStatusLanding";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

const DESCRIPTION =
  "Free website status checker. Enter any URL and we load it from our servers right now to tell you whether the site is up or down, with the HTTP status and response time.";

export const metadata = buildPageMetadata({
  title: "Website Status Checker: Is This Site Down?",
  description: DESCRIPTION,
  path: "/tool/status",
});

export default function SiteStatusToolPage() {
  return (
    <main>
      <PageJsonLd
        name="Website Status Checker | Superflow"
        description={DESCRIPTION}
        path="/tool/status"
        trail={[{ name: "Website Status Checker", url: `${SITE_URL}/tool/status` }]}
      />
      <SiteNav />
      <SiteStatusLanding />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
