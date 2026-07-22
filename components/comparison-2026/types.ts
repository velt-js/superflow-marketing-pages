// Doc shapes returned by the comparisonPreview* GROQ queries
// (sanity/lib/queries.ts). Slugs are flattened to strings by the projections.

export type ComparisonFaqItem = {
  question: string;
  answer: string;
};

export type ComparisonLink = {
  label: string;
  href: string;
};

export type ComparisonDimension = {
  number?: string;
  label: string;
  framing?: string;
  leftFacts?: string[];
  rightFacts?: string[];
  leftVerified?: string;
  rightVerified?: string;
  verdict?: string;
};

export type ComparisonScorecardRow = {
  label: string;
  leftCell: string;
  rightCell: string;
};

export type ComparisonCriterion = {
  label: string;
  line: string;
};

export type ComparisonEntry = {
  name: string;
  bestFor?: string;
  standout?: string;
  limits?: string;
  vsAnchor?: string;
};

type ComparisonPreviewShared = {
  _id: string;
  title: string;
  slug: string;
  kicker?: string;
  headline?: string;
  faq?: ComparisonFaqItem[];
  related?: ComparisonLink[];
  factsCheckedAt?: string;
  sourceUrls?: string[];
  metaTitle?: string;
  metaDescription?: string;
};

export type ComparisonVsDoc = ComparisonPreviewShared & {
  _type: "comparisonPreviewVsPage";
  competitorName: string;
  grantedNoun?: string;
  secondary?: string;
  prevents?: string[];
  qualifier?: string;
  heroCaption?: string;
  dimensions?: ComparisonDimension[];
  scorecardKicker?: string;
  scorecard?: ComparisonScorecardRow[];
  pricingCompetitor?: string;
  pricingSuperflow?: string;
  switchingLines?: string[];
  honestCloseStrengths?: string;
  stayLine?: string;
  fieldLink?: ComparisonLink;
};

export type ComparisonArbiterDoc = ComparisonPreviewShared & {
  _type: "comparisonPreviewArbiterPage";
  toolLeftName: string;
  toolRightName: string;
  standfirst?: string;
  disclosure?: string;
  dateline?: string;
  shortAnswerPickLeft?: string;
  shortAnswerPickRight?: string;
  shortAnswerShared?: string;
  dimensions?: ComparisonDimension[];
  scorecard?: ComparisonScorecardRow[];
  pricingNote?: string;
  thirdOptionBody?: string;
  thirdOptionLinks?: ComparisonLink[];
};

export type ComparisonAlternativesDoc = ComparisonPreviewShared & {
  _type: "comparisonPreviewAlternativesPage";
  anchorName: string;
  standfirst?: string;
  dateline?: string;
  criteria?: ComparisonCriterion[];
  superflowHeadline?: string;
  superflowBody?: string;
  superflowBestFor?: string;
  superflowScorecard?: ComparisonScorecardRow[];
  superflowHonestLimit?: string;
  superflowLinks?: ComparisonLink[];
  entries?: ComparisonEntry[];
  stayHeading?: string;
  stayBody?: string;
  stayLine?: string;
  finalCtaHeadline?: string;
};

export type ComparisonPreviewDoc =
  | ComparisonVsDoc
  | ComparisonArbiterDoc
  | ComparisonAlternativesDoc;

export type ComparisonHubDoc = {
  _id: string;
  title?: string;
  kicker?: string;
  headline?: string;
  subhead?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type ComparisonHubItem = {
  _id: string;
  _type: ComparisonPreviewDoc["_type"];
  title: string;
  slug: string;
  metaDescription?: string;
};
