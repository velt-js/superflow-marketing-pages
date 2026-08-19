// Content registry for the tools that have a Markdown copy.
//
// A tool appears here only once it actually works. A .md file for a tool that
// is still "Coming soon" would hand an agent a document describing something
// it cannot use, which is worse than a 404.

import type { ToolContent } from "./types";
import { UTM_BUILDER_CONTENT } from "./utm-builder";
import { MARKDOWN_VIEWER_CONTENT } from "./markdown-viewer";
import { MD5_GENERATOR_CONTENT } from "./md5-generator";
import { TECH_STACK_DETECTOR_CONTENT } from "./tech-stack-detector";
import { JSON_LD_VALIDATOR_CONTENT } from "./json-ld-validator";
import { JSON_LD_GENERATOR_CONTENT } from "./json-ld-generator";
import { MARKDOWN_FOR_AGENTS_CONTENT } from "./markdown-for-agents";
import { LLMS_TXT_GENERATOR_CONTENT } from "./llms-txt-generator";
import { SOCIAL_PREVIEW_CHECKER_CONTENT } from "./social-preview-checker";
import { FULL_PAGE_SCREENSHOT_CONTENT } from "./full-page-screenshot";
import { ALT_TEXT_GENERATOR_CONTENT } from "./alt-text-generator";
import { REVIEW_LIKE_PAUL_GRAHAM_CONTENT } from "./review-like-paul-graham";
import { REVIEW_LIKE_STEVE_JOBS_CONTENT } from "./review-like-steve-jobs";
import { LOOKALIKE_TEST_CONTENT } from "./lookalike-test";
import { REVIEW_LIKE_PETER_THIEL_CONTENT } from "./review-like-peter-thiel";
import { REVIEW_LIKE_ELON_MUSK_CONTENT } from "./review-like-elon-musk";
import { REVIEW_LIKE_TRAVIS_KALANICK_CONTENT } from "./review-like-travis-kalanick";

export type { ToolContent, ToolFaqEntry, ToolHowItWorksStep, ToolFact } from "./types";

export const TOOL_CONTENT: readonly ToolContent[] = [
  UTM_BUILDER_CONTENT,
  MD5_GENERATOR_CONTENT,
  MARKDOWN_VIEWER_CONTENT,
  TECH_STACK_DETECTOR_CONTENT,
  JSON_LD_VALIDATOR_CONTENT,
  JSON_LD_GENERATOR_CONTENT,
  MARKDOWN_FOR_AGENTS_CONTENT,
  LLMS_TXT_GENERATOR_CONTENT,
  SOCIAL_PREVIEW_CHECKER_CONTENT,
  FULL_PAGE_SCREENSHOT_CONTENT,
  ALT_TEXT_GENERATOR_CONTENT,
  REVIEW_LIKE_PAUL_GRAHAM_CONTENT,
  REVIEW_LIKE_STEVE_JOBS_CONTENT,
  LOOKALIKE_TEST_CONTENT,
  REVIEW_LIKE_PETER_THIEL_CONTENT,
  REVIEW_LIKE_ELON_MUSK_CONTENT,
  REVIEW_LIKE_TRAVIS_KALANICK_CONTENT,
];

/**
 * Looks up a tool's content by slug.
 *
 * @param slug - The tool's URL slug.
 */
export function findToolContent(slug: string): ToolContent | undefined {
  try {
    return TOOL_CONTENT.find((content) => content.slug === slug);
  } catch {
    return undefined;
  }
}

export {
  UTM_BUILDER_CONTENT,
  MARKDOWN_VIEWER_CONTENT,
  MD5_GENERATOR_CONTENT,
  TECH_STACK_DETECTOR_CONTENT,
  JSON_LD_VALIDATOR_CONTENT,
  JSON_LD_GENERATOR_CONTENT,
  MARKDOWN_FOR_AGENTS_CONTENT,
  LLMS_TXT_GENERATOR_CONTENT,
  SOCIAL_PREVIEW_CHECKER_CONTENT,
  FULL_PAGE_SCREENSHOT_CONTENT,
  ALT_TEXT_GENERATOR_CONTENT,
  REVIEW_LIKE_PAUL_GRAHAM_CONTENT,
  REVIEW_LIKE_STEVE_JOBS_CONTENT,
  LOOKALIKE_TEST_CONTENT,
  REVIEW_LIKE_PETER_THIEL_CONTENT,
  REVIEW_LIKE_ELON_MUSK_CONTENT,
  REVIEW_LIKE_TRAVIS_KALANICK_CONTENT,
};
