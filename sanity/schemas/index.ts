import { placeholder } from "./placeholder";
import { author } from "./author";
import { blogPost, blogBodyImage } from "./blogPost";
import {
  integrationPage,
  integrationStep,
  integrationBodyImage,
} from "./integrationPage";
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
import {
  bugBookEntry,
  bugBookThreadComment,
  bugBookFinding,
  bugBookSite,
  bugBookCaptured,
} from "./bugBookEntry";
import { alternativePage } from "./alternativePage";
import { comparisonPage } from "./comparisonPage";
import { linkAnnotation } from "./shared/linkAnnotation";
import {
  reviewCta,
  reviewPersona,
  reviewHero,
  reviewFeatureCardCursor,
  reviewFeatureCard,
  reviewIntegrationLogo,
  reviewFeatureCards,
  reviewCollabCard,
  reviewCollabTools,
  reviewWebsiteFutureTab,
  reviewWebsiteFuture,
  reviewWebsiteInstall,
  reviewPage,
} from "./reviewPage";
import {
  checklistPage,
  checklistHero,
  checklistMainSection,
  checklistSection,
  checklistTip,
  checklistEndNote,
  checklistSuggested,
} from "./checklistPage";
import {
  featureHero,
  featureHeroTab,
  featureSolution,
  featureBlockTab,
  featureBlock,
  featureSetSection,
  featureGetStartedStep,
  featureGetStarted,
  featureRelatedCapability,
  featureRelatedCapabilities,
  featureFaqItem,
  featureFaq,
  featurePage,
} from "./featurePage";
import {
  comparisonPreviewFaqItem,
  comparisonPreviewLink,
  comparisonPreviewScorecardRow,
  comparisonPreviewDimension,
  comparisonPreviewCriterion,
  comparisonPreviewEntry,
  comparisonPreviewVsPage,
  comparisonPreviewArbiterPage,
  comparisonPreviewAlternativesPage,
  comparisonPreviewHub,
} from "./comparisonPreviewPage";
import {
  integrationPreviewHeroTab,
  integrationPreviewHero,
  integrationPreviewSolution,
  integrationPreviewBlockTab,
  integrationPreviewBlock,
  integrationPreviewFeatureSet,
  integrationPreviewStep,
  integrationPreviewGetStarted,
  integrationPreviewFaqItem,
  integrationPreviewFaq,
  integrationPreviewPage,
  integrationPreviewHub,
} from "./integrationPreviewPage";

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
  checklistPage,
  featurePage,
  integrationPreviewPage,
  integrationPreviewHub,
  comparisonPreviewVsPage,
  comparisonPreviewArbiterPage,
  comparisonPreviewAlternativesPage,
  comparisonPreviewHub,
  bugBookEntry,

  // Inline annotations
  linkAnnotation,

  // bugBookEntry sub-types
  bugBookThreadComment,
  bugBookFinding,
  bugBookSite,
  bugBookCaptured,

  // Per-type sub-schemas
  blogBodyImage,

  // integrationPage
  integrationStep,
  integrationBodyImage,

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
  reviewFeatureCardCursor,
  reviewFeatureCard,
  reviewIntegrationLogo,
  reviewFeatureCards,
  reviewCollabCard,
  reviewCollabTools,
  reviewWebsiteFutureTab,
  reviewWebsiteFuture,
  reviewWebsiteInstall,

  // checklistPage sub-types
  checklistHero,
  checklistMainSection,
  checklistSection,
  checklistTip,
  checklistEndNote,
  checklistSuggested,

  // featurePage sub-types
  featureHero,
  featureHeroTab,
  featureSolution,
  featureBlockTab,
  featureBlock,
  featureSetSection,
  featureGetStartedStep,
  featureGetStarted,
  featureRelatedCapability,
  featureRelatedCapabilities,
  featureFaqItem,
  featureFaq,

  // integrationPreviewPage + integrationPreviewHub sub-types
  integrationPreviewHeroTab,
  integrationPreviewHero,
  integrationPreviewSolution,
  integrationPreviewBlockTab,
  integrationPreviewBlock,
  integrationPreviewFeatureSet,
  integrationPreviewStep,
  integrationPreviewGetStarted,
  integrationPreviewFaqItem,
  integrationPreviewFaq,

  // comparisonPreview* sub-types
  comparisonPreviewFaqItem,
  comparisonPreviewLink,
  comparisonPreviewScorecardRow,
  comparisonPreviewDimension,
  comparisonPreviewCriterion,
  comparisonPreviewEntry,
];
