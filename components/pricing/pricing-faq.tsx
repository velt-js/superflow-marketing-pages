// /pricing FAQ entries — copied verbatim from usesuperflow.com/pricing.
// Order, question text, and answer copy match the live site exactly.
// Shape matches components/home/FAQ.tsx's `FAQItemProps` so the home-page
// FAQ component can render these directly on /pricing.

import Link from "next/link";

import type { FAQItemProps } from "@/components/home/FAQ";

const linkStyle: React.CSSProperties = {
  color: "rgba(174, 171, 255, 0.9)",
  textDecoration: "underline",
};

export const pricingFAQ: FAQItemProps[] = [
  {
    q: "What is Superflow?",
    a: (
      <>
        Superflow is a collaboration platform for agencies &amp; marketers to
        review, proof and deliver creative assets fast. Superflow supports
        websites, videos, lottie animations, PDF and images.
        <br />
        <br />
        With Superflow agencies &amp; marketers deliver more high quality
        creative assets fast.
      </>
    ),
  },
  {
    q: "What formats are supported in Superflow?",
    a: "Superflow supports all types of Websites, Videos, Lottie, Images and PDFs.",
  },
  {
    q: "What is counted as a seat?",
    a: (
      <>
        Your team member (also called Admin user) that you invite to Superflow
        will be counted as a seat.
        <br />
        <br />
        Commenter User &amp; Guest users are free.
      </>
    ),
  },
  {
    q: "What is the difference between Admin, Commenter & Guest users?",
    a: (
      <>
        <strong>Admin or team user:</strong> Your team members should be added
        as an admin user. They have full access to the admin panel and get
        access to all features in your account.
        <br />
        <br />
        <strong>Commenter user:</strong> Commenter Users can read or write
        comments but they need to authenticate or sign in to Superflow. You
        should add external users or your clients as commenters. This is
        available for all plans. These are free and not counted towards your
        seats.
        <br />
        <br />
        <strong>Guest user:</strong> Guest users can read or write comments
        without authenticating or signing in. You should add external users or
        your clients as guest users. This is only available on Scale and
        Enterprise plans. These are free and not counted towards your seats.
      </>
    ),
  },
  {
    q: "Does Superflow offer a free plan?",
    a: (
      <>
        Superflow offers a free 10-day trial to new users, no credit card
        needed. During the trial period, you get full access to all features.
        <br />
        <br />
        We also offer a free forever Starter plan that becomes available after
        your trial has ended.
      </>
    ),
  },
  {
    q: "Do you offer any volume discounts?",
    a: (
      <>
        Yes, we offer volume discounts.{" "}
        <Link href="/book-demo" style={linkStyle}>
          Contact us
        </Link>{" "}
        to get started.
      </>
    ),
  },
  {
    q: "Do you offer any discounts for startups or education?",
    a: (
      <>
        Yes, we offer discounts for early-stage startups.{" "}
        <Link href="/book-demo" style={linkStyle}>
          Contact us
        </Link>{" "}
        to get started.
      </>
    ),
  },
  {
    q: "How secure is Superflow?",
    a: (
      <>
        Superflow supports Isolated dedicated storage and encrypts data in
        transit and at rest using industry standards.
        <br />
        <br />
        We are currently going through SOC2 certification.
      </>
    ),
  },
  {
    q: "How reliable and scalable is Superflow?",
    a: "We guarantee at least 99.9% uptime and provide highly scalable infrastructure.",
  },
];
