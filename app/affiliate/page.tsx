import type { Metadata } from "next";

import Nav from "@/components/home/Nav";
import LogoBar from "@/components/home/LogoBar";
import DarkSection from "@/components/home/DarkSection";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";

import AffiliateHero from "@/components/affiliate/AffiliateHero";
import WhyJoinUs from "@/components/affiliate/WhyJoinUs";
import ThreeSteps from "@/components/affiliate/ThreeSteps";
import RevenueShareBanner from "@/components/affiliate/RevenueShareBanner";
import DosAndDonts from "@/components/affiliate/DosAndDonts";

export const metadata: Metadata = {
  title: "Affiliate Program | Superflow",
  description:
    "Join the Superflow Affiliate Program. Earn 30% revenue share by sharing Superflow with your audience.",
};

const AFFILIATE_FAQS = [
  {
    q: "What is Superflow?",
    a: "Superflow is a collaboration platform for agencies & marketers to review, proof and deliver creative assets fast.",
  },
  {
    q: "What formats are supported in Superflow?",
    a: "Superflow supports all types of websites, videos, Lottie animations, images and PDFs.",
  },
  {
    q: "Does Superflow offer a free plan?",
    a: "Superflow offers a free 10-day trial to new users, no credit card needed. During the trial period, you get full access to all features.",
  },
];

export default function AffiliatePage() {
  return (
    <main>
      <Nav />
      <AffiliateHero />
      <LogoBar />
      <section className="bg-white relative">
        <WhyJoinUs />
        <ThreeSteps />
        <RevenueShareBanner />
        <DosAndDonts />
      </section>
      <DarkSection withTopCurve faqItems={AFFILIATE_FAQS} />
      <Footer />
      <IntercomButton />
    </main>
  );
}
