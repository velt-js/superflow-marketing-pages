import { placeholder } from "./placeholder";
import { author } from "./author";
import { blogPost, blogBodyImage } from "./blogPost";
import { integrationPage, integrationStep } from "./integrationPage";
import {
  useCasePage,
  useCaseHero,
  useCaseProblemItem,
  useCaseProblemSection,
  useCaseSolutionItem,
  useCaseSolutionSection,
  useCaseFaqItem,
  useCaseTestimonial,
} from "./useCasePage";
import {
  caseStudyPage,
  caseStudyHero,
  caseStudyOverview,
  caseStudyProblemItem,
  caseStudyProblemSection,
  caseStudySolutionItem,
  caseStudySolutionSection,
  caseStudyResultItem,
  caseStudyResultsSection,
  caseStudyTestimonial,
  caseStudyFaqItem,
} from "./caseStudyPage";
import {
  userPersonaPage,
  userPersonaHero,
  userPersonaJobFeature,
  userPersonaJob,
  userPersonaFaqItem,
  userPersonaTestimonial,
  userPersonaFeatureItem,
  userPersonaFinalCta,
} from "./userPersonaPage";
import {
  comparisonTag,
  comparisonCompetitorBlock,
  comparisonCriterion,
  comparisonPricingRow,
  comparisonChoice,
  comparisonFeatureRow,
  comparisonHighlight,
  comparisonTestimonial,
  comparisonCaseStudy,
  comparisonFaqItem,
} from "./shared/comparison";
import { alternativePage } from "./alternativePage";
import { comparisonPage } from "./comparisonPage";
import { linkAnnotation } from "./shared/linkAnnotation";
import {
  reviewCta,
  reviewPersona,
  reviewHero,
  reviewFeatureCard,
  reviewIntegrationLogo,
  reviewFeatureCards,
  reviewWebsiteFirstCardVariant,
  reviewCollabCard,
  reviewCollabTools,
  reviewWebsiteFutureTab,
  reviewWebsiteFuture,
  reviewWebsiteInstall,
  reviewPage,
} from "./reviewPage";

export const schemaTypes = [
  // Documents
  placeholder,
  author,
  blogPost,
  integrationPage,
  useCasePage,
  caseStudyPage,
  userPersonaPage,
  alternativePage,
  comparisonPage,
  reviewPage,

  // Inline annotations
  linkAnnotation,

  // Per-type sub-schemas
  blogBodyImage,

  // integrationPage
  integrationStep,

  // useCasePage
  useCaseHero,
  useCaseProblemItem,
  useCaseProblemSection,
  useCaseSolutionItem,
  useCaseSolutionSection,
  useCaseFaqItem,
  useCaseTestimonial,

  // caseStudyPage
  caseStudyHero,
  caseStudyOverview,
  caseStudyProblemItem,
  caseStudyProblemSection,
  caseStudySolutionItem,
  caseStudySolutionSection,
  caseStudyResultItem,
  caseStudyResultsSection,
  caseStudyTestimonial,
  caseStudyFaqItem,

  // userPersonaPage
  userPersonaHero,
  userPersonaJobFeature,
  userPersonaJob,
  userPersonaFaqItem,
  userPersonaTestimonial,
  userPersonaFeatureItem,
  userPersonaFinalCta,

  // shared comparison sub-types (alternativePage + comparisonPage)
  comparisonTag,
  comparisonCompetitorBlock,
  comparisonCriterion,
  comparisonPricingRow,
  comparisonChoice,
  comparisonFeatureRow,
  comparisonHighlight,
  comparisonTestimonial,
  comparisonCaseStudy,
  comparisonFaqItem,

  // reviewPage sub-types
  reviewCta,
  reviewPersona,
  reviewHero,
  reviewFeatureCard,
  reviewIntegrationLogo,
  reviewFeatureCards,
  reviewWebsiteFirstCardVariant,
  reviewCollabCard,
  reviewCollabTools,
  reviewWebsiteFutureTab,
  reviewWebsiteFuture,
  reviewWebsiteInstall,
];
