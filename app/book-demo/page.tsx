"use client";

import Footer from "@/components/home/Footer";
import { FeatureCustomerCarousel } from "@/components/feature/FeatureCustomerCarousel";
import { PageHero } from "@/components/library/PageHero";
import Script from "next/script";

const CALENDLY_URL = "https://calendly.com/goyalrakesh/30min?embed_domain=velt.dev&embed_type=Inline&hide_gdpr_banner=1&background_color=171717&text_color=ffffff&primary_color=ffffff&hide_event_type_details=1&hide_landing_page_details=1";

/**
 * /book-demo — Calendly scheduling page with trust signals.
 * Layout: hero heading + inline Calendly widget + trusted logos + footer.
 */
export default function BookDemoPage() {
  return (
    <>
      <div
        className="relative bg-black text-white font-urbanist w-full overflow-x-hidden"
      >
        <PageHero
          decorated
          heading="Book a demo"
          subheading="See how Velt can help you add powerful collaboration features to your app."
        />

        {/* Calendly embed */}
        <section
          className="relative w-full bg-black"
          style={{ padding: "0 80px 80px" }}
        >
          <div
            className="flex flex-col items-center"
            style={{ width: 1280, margin: "0 auto" }}
          >
            <div
              className="calendly-inline-widget"
              data-url={CALENDLY_URL}
              style={{
                width: "100%",
                minWidth: 320,
                height: 700,
                borderRadius: 16,
                overflow: "hidden",
              }}
            />
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-urbanist font-medium"
              style={{
                marginTop: 16,
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                textDecoration: "underline",
              }}
            >
              Not loading? Click here
            </a>
          </div>
        </section>

        <FeatureCustomerCarousel />

        <Footer />
      </div>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
    </>
  );
}
