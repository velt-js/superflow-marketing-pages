import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import LogoBar from "@/components/home/LogoBar";
import Testimonial from "@/components/home/Testimonial";
import FeatureCards, {
  type FeatureCardOverride,
} from "@/components/home/FeatureCards";
import CustomerLoveCarousel from "@/components/home/CustomerLoveCarousel";
import DarkSection from "@/components/home/DarkSection";
import WebflowPluginHero from "@/components/webflow-plugin/WebflowPluginHero";
import WebflowPluginPerfectlyBuilt from "@/components/webflow-plugin/WebflowPluginPerfectlyBuilt";
import WebflowPluginSteps from "@/components/webflow-plugin/WebflowPluginSteps";
import WebflowPluginSaveHours from "@/components/webflow-plugin/WebflowPluginSaveHours";
import WhatElse from "@/components/home/WhatElse";
import WebflowPluginMobileBrowsers from "@/components/webflow-plugin/WebflowPluginMobileBrowsers";
import WebflowPluginIntegrations from "@/components/webflow-plugin/WebflowPluginIntegrations";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

const PAGE_PATH = "/webflow-plugin";
const PAGE_TITLE =
  "Superflow for Webflow - Comment & collaborate on your Webflow sites";
const PAGE_DESCRIPTION =
  "Superflow helps your team and clients review and add feedback in one place, so you can iterate and ship your Webflow websites 10x faster.";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: PAGE_PATH,
  ogImage: PAGE_OG_IMAGES.webflowPlugin,
});

// "Why Superflow is the swiftest annotation tool for Webflow?" — three
// image+text rows powered by the homepage FeatureCards primitive. The
// fourth gradient slot is unused; cards rotate through the same palette.
const WHY_CARDS: FeatureCardOverride[] = [
  {
    type: "simple",
    iconType: "comment",
    title: "Iterate on design\n10X faster",
    subtitle:
      "Leave comments directly on staging and production Webflow sites - no mockups, no screenshots, no email threads.",
    imageSrc: "/images/sections/home-cards/review-creative-assets.png",
  },
  {
    type: "simple",
    iconType: "prioritize",
    title: "Capture and\nreport bugs",
    subtitle:
      "Attach audio, video, or screen recordings to any pin so engineers see exactly what the reviewer saw.",
    imageSrc: "/images/sections/home-cards/manage-prioritize.png",
    imageAspectRatio: "1460/620",
  },
  {
    type: "simple",
    iconType: "approve",
    title: "Bring everyone\ntogether",
    subtitle:
      "Show what you see without uncertainty. Designers, devs, PMs, and clients on the same canvas.",
    imageSrc: "/images/sections/home-cards/get-approvals.png",
  },
];

// "Add Superflow app to boost your Webflow editor" — two more image+text
// cards using a different pair of gradient slots so they read distinct
// from the WHY_CARDS section above.
const INSTALL_CARDS: FeatureCardOverride[] = [
  {
    type: "simple",
    iconType: "integrate",
    title: "View feedback\nin your editor",
    subtitle:
      "Open the Superflow panel inside the Webflow Designer and triage comments without leaving your build.",
    imageSrc: "/images/sections/home-cards/sync-with-tools.png",
    imageAspectRatio: "1400/300",
  },
  {
    type: "simple",
    iconType: "comment",
    title: "UX copy\nsuggestions",
    subtitle:
      "AI-assisted rewrites for buttons, headers, and microcopy - generated right inside the editor.",
    imageSrc: "/images/sections/home-cards/review-creative-assets.png",
  },
];

export default function WebflowPluginPage() {
  return (
    <main>
      <PageJsonLd
        name={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        path={PAGE_PATH}
        trail={[{ name: "Webflow Plugin", url: `${SITE_URL}${PAGE_PATH}` }]}
      />
      <Nav />
      <WebflowPluginHero />
      <LogoBar />

      <FeatureCards cards={WHY_CARDS} />

      <WebflowPluginPerfectlyBuilt />

      <Testimonial
        name="Riley Hennigh"
        role="Product Designer @Headway.io"
        headline="Everybody has loved how easy it is to get started"
        quote='"Superflow has enabled fast feedback from stakeholders during website design and development. Easy to use, loved by all, and seamlessly compatible with mobile."'
        avatar="/images/sections/riley.png"
      />

      <FeatureCards cards={INSTALL_CARDS} />

      <WebflowPluginSteps />

      <WebflowPluginSaveHours />

      <WhatElse />

      <Testimonial
        name="Eric Lessman"
        role="Co-Founder & CEO @Bluecap"
        headline="Eliminating time wasted on vague instructions"
        quote='"Superflow streamlines front-end design coordination, eliminating time wasted on vague instructions. Clicking comments highlights specific website areas instantly. The receptive team implements feedback promptly, making collaboration effortless."'
        avatar="/images/sections/simon-smallchua.png"
      />

      <WebflowPluginMobileBrowsers />

      <WebflowPluginIntegrations />

      <CustomerLoveCarousel />
      <DarkSection />
      <Footer />
      <IntercomButton />
    </main>
  );
}
