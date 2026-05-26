export interface UseCaseHero {
  action?: string;
  useCase?: string;
  heroCtaText?: string;
  role1?: string;
  role2?: string;
  role3?: string;
  personaDesktopFont?: number;
  personaMobileFont?: number;
}

export interface UseCaseImageRef {
  alt?: string;
  caption?: string;
  asset?: { _ref?: string; url?: string };
}

export interface UseCaseProblemItem {
  title?: string;
  image?: string;
}

export interface UseCaseProblemSection {
  title1?: string;
  title2?: string;
  items?: UseCaseProblemItem[];
}

export interface UseCaseSolutionItem {
  title?: string;
  subCopy?: string;
  image?: string;
}

export interface UseCaseSolutionSection {
  title1?: string;
  title2?: string;
  items?: UseCaseSolutionItem[];
}

export interface UseCaseTestimonial {
  name?: string;
  role?: string;
  company?: string;
  title?: string;
  subCopy?: string;
  image?: string;
}

export interface UseCaseFaqItem {
  question: string;
  answer?: string;
}

export interface UseCaseDoc {
  _id?: string;
  title: string;
  slug?: string;
  description?: string;
  hidden?: boolean;
  thumbnail?: string;
  icon?: string;
  hero?: UseCaseHero;
  explanationTitle?: string;
  problemSection?: UseCaseProblemSection;
  solutionSection?: UseCaseSolutionSection;
  featureText1?: string;
  featureText2?: string;
  testimonials?: UseCaseTestimonial[];
  footerCtaTitle?: string;
  faq?: UseCaseFaqItem[];
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: string;
}

export interface UseCaseRelatedItem {
  title: string;
  description?: string;
  icon?: string;
  href: string;
}

export const SIGNUP_URL = "https://app.usesuperflow.com/signup";
