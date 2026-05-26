import type { PortableTextBlock } from "@portabletext/react";

export interface IntegrationStepDoc {
  title: string;
  body?: PortableTextBlock[];
}

export interface IntegrationDoc {
  _id?: string;
  title: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  authorName?: string;
  publishedDateText?: string;
  thumbnail?: string;
  appName?: string;
  appLogo?: string;
  linkToApp?: string;
  isTaskApp?: boolean;
  installationVideoLink?: string;
  installationVideoFile?: string;
  description?: PortableTextBlock[];
  overview?: PortableTextBlock[];
  steps?: IntegrationStepDoc[];
}

export interface OtherIntegrationItem {
  name: string;
  icon: string;
  href: string;
}
