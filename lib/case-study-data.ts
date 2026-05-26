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
  image?: string;
  imageAlt?: string;
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
  image?: string;
  video?: string;
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

