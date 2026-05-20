import type { Metadata } from "next";
import Nav from "@/components/home/Nav";
import LogoBar from "@/components/home/LogoBar";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import CTABanner from "@/components/home/CTABanner";
import SecurityHero from "@/components/security/SecurityHero";
import FoundationalPrinciples from "@/components/security/FoundationalPrinciples";
import DataProtection from "@/components/security/DataProtection";
import EnterpriseSecurity from "@/components/security/EnterpriseSecurity";
import DataPrivacy from "@/components/security/DataPrivacy";

export const metadata: Metadata = {
  title: "Security and Privacy",
  description:
    "Superflow establishes policies and controls, monitors compliance, and proves it to third-party auditors.",
};

export default function SecurityPage() {
  return (
    <main>
      <Nav />
      <SecurityHero />
      <LogoBar />
      <FoundationalPrinciples />
      <DataProtection />
      <EnterpriseSecurity />
      <DataPrivacy />
      <section className="pt-[40px] pb-[80px] lg:pt-[60px] lg:pb-[120px]" style={{ background: "#000" }}>
        <CTABanner />
      </section>
      <Footer />
      <IntercomButton />
    </main>
  );
}
