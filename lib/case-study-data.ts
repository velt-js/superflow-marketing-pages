import type { ListingHeroBadge } from "@/components/listing/ListingHero";

export interface CaseStudyHeroData {
  heading: string;
  subtitle: string;
  leftBadge?: ListingHeroBadge;
  rightBadge?: ListingHeroBadge;
  meta: {
    industry: string;
    teamsInvolved: string;
    companySize: string;
  };
}

export interface CaseStudyProblemSolutionData {
  heading: string;
  subtitle: string;
  problem: string;
  solution: string;
}

export interface CaseStudyBarrierCard {
  number: string;
  visualKey: "shortcuts" | "chat" | "task";
  caption: string;
}

export interface CaseStudyBarriersData {
  heading: string;
  subtitle: string;
  cards: CaseStudyBarrierCard[];
}

export interface CaseStudySolutionRow {
  number: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
}

export interface CaseStudySolutionsData {
  heading: string;
  subtitle: string;
  rows: CaseStudySolutionRow[];
}

export interface CaseStudyResultMetric {
  value: string;
  label: string;
  size: "large" | "small";
  tone: "teal" | "blue" | "amber";
}

export interface CaseStudyResultsData {
  heading: string;
  subtitle: string;
  metrics: CaseStudyResultMetric[];
}

export interface CaseStudyTestimonialBadge {
  label: string;
  color: string;
  textColor?: string;
  pointer: "left" | "right";
  position: { top: string; left?: string; right?: string };
  pointerColor?: string;
}

export interface CaseStudyTestimonialData {
  headline: string;
  quote: string;
  authorName: string;
  authorRole: string;
  avatar: string;
  badges: CaseStudyTestimonialBadge[];
}

export interface CaseStudyFAQItem {
  q: string;
  a: string;
}

export interface CaseStudyConfig {
  hero: CaseStudyHeroData;
  problemSolution: CaseStudyProblemSolutionData;
  barriers: CaseStudyBarriersData;
  solutions: CaseStudySolutionsData;
  results: CaseStudyResultsData;
  testimonial: CaseStudyTestimonialData;
  faq: CaseStudyFAQItem[];
}

export const caseStudyDetails: Record<string, CaseStudyConfig> = {
  writesonic: {
    hero: {
      heading: "How Writesonic saved $5000 every week on overhead costs using Superflow?",
      subtitle: "Writesonic is a generative AI startup that help teams with copywriting",
      leftBadge: { label: "Photographer", color: "#4dd5ff" },
      rightBadge: { label: "Designer", color: "#fc6cba" },
      meta: {
        industry: "SaaS - AI",
        teamsInvolved: "Designer, Developers & Marketing",
        companySize: "50 - 60",
      },
    },
    problemSolution: {
      heading: "What happened?",
      subtitle: "Writesonic is a generative AI startup that help teams with copywriting",
      problem: "Feedback-to-solution time is significantly high",
      solution: "Give contextual feedback and to track progress",
    },
    barriers: {
      heading: "What was going wrong?",
      subtitle: "These are the barriers that were faced by the Writesonic team",
      cards: [
        { number: "1", visualKey: "shortcuts", caption: "Lots of screenshots and messages" },
        { number: "2", visualKey: "chat", caption: "Unclear feedback" },
        { number: "3", visualKey: "task", caption: "No clear owner" },
      ],
    },
    solutions: {
      heading: "How we solved it",
      subtitle: "These are the barriers that were faced by the Writesonic team",
      rows: [
        {
          number: "01",
          tag: "Comments",
          title: "Feedback directly on site",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
          image: "/images/sections/collaboration/comments-in-context.png",
        },
        {
          number: "02",
          tag: "Screen Recording",
          title: "Clear feedback with Screen Recording",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
          image: "/images/sections/collaboration/record-richer-feedback.png",
          reverse: true,
        },
        {
          number: "03",
          tag: "Task Management",
          title: "Assign comments to your team",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
          image: "/images/sections/collaboration/whos-doing-what.png",
        },
      ],
    },
    results: {
      heading: "Here are the results",
      subtitle: "These are the barriers that were faced by the Writesonic team",
      metrics: [
        { value: "10X", label: "Quicker Feedback Loops", size: "large", tone: "teal" },
        { value: "~42K", label: "Comments Added", size: "small", tone: "blue" },
        { value: "20%", label: "Fewer Tasks Created", size: "small", tone: "amber" },
      ],
    },
    testimonial: {
      headline: "It's everything I've wanted",
      quote:
        "Superflow is the fastest, easiest way to iterate on our apps and marketing pages. The UX is easy, the tech is brilliant, the team is like lightning–it's everything I've wanted and tried to build into our websites myself for 15 years. Finally!",
      authorName: "Manvi Agarwal",
      authorRole: "Content Lead - Writesonic",
      avatar: "/images/hero/icon-world.svg",
      badges: [
        { label: "Engineer", color: "#0dcf82", pointer: "right", position: { top: "0px", right: "-16px" }, pointerColor: "#0dcf82" },
        { label: "Designer", color: "#ff7162", pointer: "right", position: { top: "240px", right: "-24px" }, pointerColor: "#ff7162" },
        { label: "Product", color: "#ffcd2e", textColor: "#141416", pointer: "left", position: { top: "200px", left: "-24px" }, pointerColor: "#ffcd2e" },
      ],
    },
    faq: [
      {
        q: "What is Superflow?",
        a: "Superflow is a collaboration platform for agencies & marketers to review, proof and deliver creative assets fast. Superflow supports websites, videos, lottie animations, PDF and images.",
      },
      {
        q: "What formats are supported in Superflow?",
        a: "Superflow supports all types of websites, videos, Lottie animations, images and PDFs.",
      },
      {
        q: "Does Superflow offer a free plan?",
        a: "Superflow offers a free 10-day trial to new users, no credit card needed. During the trial period, you get full access to all features.",
      },
    ],
  },
};
