import type { PortableTextBlock } from "@portabletext/react";

export interface ChecklistHero {
  docName?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
}

export interface ChecklistMainSection {
  image?: string;
  subText?: string;
  caption?: string;
}

export interface ChecklistTip {
  title?: string;
  description?: PortableTextBlock[];
}

export interface ChecklistSection {
  title?: string;
  description?: PortableTextBlock[];
  buttonText?: string;
  buttonAction?: string;
  tips?: ChecklistTip[];
}

export interface ChecklistEndNote {
  title?: string;
  description?: PortableTextBlock[];
}

export interface ChecklistSuggested {
  name?: string;
  bgColor?: string;
  // CMS-authored, may be relative without a leading slash. Any future renderer
  // MUST pass this through `toInternalHref` (and key target/rel off
  // `isExternalHref`) to avoid compounding paths against the current route.
  href?: string;
}

export interface ChecklistDoc {
  _id?: string;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  hidden?: boolean;
  hero?: ChecklistHero;
  mainSection?: ChecklistMainSection;
  whatTitle?: string;
  whatDescription?: string;
  howTitle?: string;
  howDescription?: string;
  sections?: ChecklistSection[];
  endNote?: ChecklistEndNote;
  suggestedChecklists?: ChecklistSuggested[];
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: string;
}

export interface ChecklistListItem {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
}
