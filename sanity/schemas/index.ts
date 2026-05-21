import { placeholder } from "./placeholder";
import { author } from "./author";
import { blogPost, blogBodyImage } from "./blogPost";
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
  reviewPage,

  // Inline annotations (must be top-level so the Portable Text editor
  // can dereference `_type: "link"` in body content).
  linkAnnotation,

  // Per-type sub-schemas
  blogBodyImage,

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
