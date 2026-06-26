import { client } from "../client";

export type BlogPostListItem = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  author?: { name: string; role?: string };
  featuredImage?: string;
};

export async function getAllBlogPosts(): Promise<BlogPostListItem[]> {
  return client.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      description,
      publishedAt,
      category,
      categoryLabel,
      readTime,
      featured,
      tags,
      "author": author->{ name, role },
      "featuredImage": featuredImage.asset->url
    }
  `);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "blogPost" && defined(slug.current)].slug.current`
  );
}

export async function getBlogPostBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      description,
      publishedAt,
      _updatedAt,
      category,
      categoryLabel,
      readTime,
      tags,
      "author": author->{ name, role, "avatar": avatar.asset->url },
      "featuredImage": featuredImage.asset->url,
      body,
      metaTitle,
      metaDescription,
      "ogImage": ogImage.asset->url,
      faqSchema,
      blogPostingSchema
    }
  `,
    { slug }
  );
}

// Integration page queries
export type IntegrationListItem = {
  _id: string;
  slug: string;
  title: string;
  appName?: string;
  appLogo?: string;
  metaDescription?: string;
};

export async function getAllIntegrationSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "integrationPage" && defined(slug.current)].slug.current`
  );
}

export async function getAllIntegrationListItems(): Promise<
  IntegrationListItem[]
> {
  return client.fetch(
    `*[_type == "integrationPage" && defined(slug.current)] | order(appName asc) {
      _id,
      "slug": slug.current,
      title,
      appName,
      "appLogo": appLogo.asset->url,
      metaDescription
    }`
  );
}

export async function getIntegrationPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "integrationPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, metaTitle, metaDescription,
      authorName, publishedDateText,
      "thumbnail": thumbnail.asset->url,
      appName, "appLogo": appLogo.asset->url, linkToApp, isTaskApp,
      installationVideoLink, "installationVideoFile": installationVideoFile.asset->url,
      description, overview,
      steps[]{ title, body }
    }`,
    { slug }
  );
}

// Use case page queries
export type UseCaseListItem = {
  _id: string;
  slug: string;
  title: string;
  useCase?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
};

export async function getAllUseCaseSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "useCasePage" && defined(slug.current)].slug.current`
  );
}

export async function getAllUseCaseListItems(): Promise<UseCaseListItem[]> {
  return client.fetch(
    `*[_type == "useCasePage" && defined(slug.current) && hidden != true] | order(title asc) {
      _id,
      "slug": slug.current,
      title,
      "useCase": hero.useCase,
      description,
      "icon": icon.asset->url,
      "thumbnail": thumbnail.asset->url
    }`
  );
}
export async function getUseCasePageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "useCasePage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, hidden,
      "thumbnail": thumbnail.asset->url, "icon": icon.asset->url,
      hero, explanationTitle,
      problemSection{ title1, title2, items[]{ title, "image": image.asset->url } },
      solutionSection{ title1, title2, items[]{ title, subCopy, "image": image.asset->url } },
      featureText1, featureText2,
      testimonials[]{ name, role, company, title, subCopy, "image": image.asset->url },
      footerCtaTitle, faq[]{ question, answer },
      metaTitle, metaDescription, noIndex
    }`,
    { slug }
  );
}

// Case study page queries
export type CaseStudyListItem = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  logo?: string;
  thumbnail?: string;
};

export async function getAllCaseStudySlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "caseStudyPage" && defined(slug.current)].slug.current`
  );
}

export async function getAllCaseStudyListItems(): Promise<CaseStudyListItem[]> {
  return client.fetch(
    `*[_type == "caseStudyPage" && defined(slug.current)] | order(title asc) {
      _id,
      "slug": slug.current,
      title,
      description,
      "logo": logo.asset->url,
      "thumbnail": thumbnail.asset->url
    }`
  );
}
export async function getCaseStudyPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "caseStudyPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, author, publishedDateText,
      _updatedAt,
      "thumbnail": thumbnail.asset->url, "logo": logo.asset->url,
      hero, overview,
      problemSection{ description, items[]{ text, "image": image.asset->url } },
      solutionSection{ description, items[]{ tag, title, subText, "video": video.asset->url } },
      resultsSection{ description, items[]{ value, text } },
      testimonial{ name, role, company, title, subText, "profileImage": profileImage.asset->url },
      showFaq, faq[]{ question, answer },
      metaTitle, metaDescription
    }`,
    { slug }
  );
}

// User persona page queries
export async function getAllUserPersonaSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "userPersonaPage" && defined(slug.current)].slug.current`
  );
}
export async function getAllUserPersonaPages() {
  return client.fetch(
    `*[_type == "userPersonaPage" && hidden != true] | order(title asc){
      _id, title, "slug": slug.current,
      "role": hero.role,
      "description": hero.description,
      "thumbnail": thumbnail.asset->url,
      "icon": icon.asset->url
    }`
  );
}
export async function getUserPersonaPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "userPersonaPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, hidden,
      "thumbnail": thumbnail.asset->url, "icon": icon.asset->url,
      hero,
      jobs[]{ title1, title2, features[]{ highlightTitle, highlightSubText, "highlightImage": highlightImage.asset->url, barrierText } },
      solutionTitle1, solutionTitle2, featureText1, featureText2,
      features[]{ title, subText, "image": image.asset->url },
      othersTitle1, othersTitle2, outcomeOneLiner,
      testimonials[]{ name, role, company, title, subCopy, "image": image.asset->url },
      faq[]{ question, answer },
      finalCta, metaTitle, metaDescription, noIndex
    }`,
    { slug }
  );
}

// Alternative page queries
export async function getAllAlternativeSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "alternativePage" && defined(slug.current)].slug.current`
  );
}
export async function getAllAlternativePages() {
  return client.fetch(
    `*[_type == "alternativePage" && hidden != true] | order(publishedDate desc, title asc){
      _id, title, "slug": slug.current, description,
      competitor1Name, competitor2Name,
      "thumbnail": thumbnail.asset->url,
      "competitor2Logo": competitor2Logo.asset->url
    }`
  );
}
export async function getAlternativePageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "alternativePage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, hidden, author,
      publishedDate, publishedDateText, enableLayout2,
      "thumbnail": thumbnail.asset->url,
      competitor1Name, "competitor1Logo": competitor1Logo.asset->url,
      competitor2Name, "competitor2Logo": competitor2Logo.asset->url,
      criteria[]{
        _key, title, description, winnerC1, result,
        competitor1{
          score, title, "video": video.asset->url, youtubeUrl,
          tags[]{ label, color }
        },
        competitor2{
          score, title, "video": video.asset->url, youtubeUrl,
          tags[]{ label, color }
        }
      },
      pricing[]{ c1Name, c1Price, c1Users, c2Name, c2Price, c2Users },
      showOverview, overview, summaryPointers,
      testimonial{ name, role, company, title, subCopy, "profileImage": profileImage.asset->url },
      faq[]{ question, answer },
      choices[]{
        title, subText, "image": image.asset->url,
        videoLink, "videoFile": videoFile.asset->url
      },
      features[]{ title, c1Text, c2Text },
      highlights[]{
        title, subText, "image": image.asset->url,
        videoLink, "videoFile": videoFile.asset->url
      },
      caseStudy{ title, challenges, link },
      layout2Testimonial{ name, role, company, title, subCopy, "profileImage": profileImage.asset->url },
      metaTitle, metaDescription
    }`,
    { slug }
  );
}

// Comparison page queries
export async function getAllComparisonSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "comparisonPage" && defined(slug.current)].slug.current`
  );
}
export async function getAllComparisonPages() {
  return client.fetch(
    `*[_type == "comparisonPage" && hidden != true] | order(title asc){
      _id, title, "slug": slug.current,
      competitor1Name, competitor2Name,
      "thumbnail": thumbnail.asset->url,
      "competitor1Logo": competitor1Logo.asset->url,
      "competitor2Logo": competitor2Logo.asset->url
    }`
  );
}
export async function getComparisonPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "comparisonPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, hidden, author,
      publishedDate, publishedDateText, enableLayout2,
      "thumbnail": thumbnail.asset->url,
      competitor1Name, "competitor1Logo": competitor1Logo.asset->url,
      competitor2Name, "competitor2Logo": competitor2Logo.asset->url,
      criteria[]{
        _key, title, description, winnerC1, result,
        competitor1{
          score, title, "video": video.asset->url, youtubeUrl,
          tags[]{ label, color }
        },
        competitor2{
          score, title, "video": video.asset->url, youtubeUrl,
          tags[]{ label, color }
        }
      },
      pricing[]{ c1Name, c1Price, c1Users, c2Name, c2Price, c2Users },
      overview, summaryPointers,
      testimonial{ name, role, company, title, subCopy, "profileImage": profileImage.asset->url },
      faq[]{ question, answer },
      highlights[]{
        title, subText, "image": image.asset->url,
        videoLink, "videoFile": videoFile.asset->url
      },
      caseStudy{ title, challenges, link },
      layout2Testimonial{ name, role, company, title, subCopy, "profileImage": profileImage.asset->url },
      metaTitle, metaDescription, noIndex
    }`,
    { slug }
  );
}

// Checklist page queries (root-level /[slug], handled by app/(features)/[slug])
export type ChecklistListItem = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
};

export async function getAllChecklistSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "checklistPage" && defined(slug.current)].slug.current`
  );
}

export async function getAllChecklistListItems(): Promise<ChecklistListItem[]> {
  return client.fetch(
    `*[_type == "checklistPage" && defined(slug.current) && hidden != true] | order(title asc) {
      _id,
      "slug": slug.current,
      title,
      description,
      category,
      "thumbnail": thumbnail.asset->url
    }`
  );
}

export async function getChecklistPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "checklistPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, category, hidden,
      "thumbnail": thumbnail.asset->url,
      hero,
      mainSection{ "image": image.asset->url, subText, caption },
      whatTitle, whatDescription, howTitle, howDescription,
      sections[]{ title, description, buttonText, buttonAction, tips[]{ title, description } },
      endNote,
      // NOTE: href is CMS-authored and may be relative; any future renderer
      // MUST normalize it via toInternalHref (see lib/links.ts).
      suggestedChecklists[]{ name, bgColor, href },
      metaTitle, metaDescription, noIndex
    }`,
    { slug }
  );
}

// Review page queries (/<feature>-review)
export async function getAllReviewSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "reviewPage" && defined(slug.current)].slug.current`
  );
}

export async function getReviewPageBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "reviewPage" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      feature,
      hero {
        headlineLine1,
        subheading,
        personaLeft { label, color },
        personaRight { label, color },
        primaryCta,
        secondaryCta,
        "heroMediaSrc": heroMedia.asset->url
      },
      featureCards {
        eyebrow,
        heading,
        cards[] {
          "type": cardType,
          iconType,
          title,
          titleLine1,
          titleLine2,
          subtitle,
          "imageSrc": image.asset->url,
          imageAspectRatio,
          cursors[] {
            side,
            label,
            color,
            textColor,
            topPct
          }
        },
        integrationLogos[] {
          name,
          href,
          "logoSrc": logo.asset->url
        },
        integrationsCtaLabel,
        integrationsCtaHref
      },
      websiteFuture {
        headingLine1,
        subheading,
        tabs[] {
          label,
          iconName,
          "imageSrc": image.asset->url
        }
      },
      websiteInstall {
        headingLine1,
        headingLine2,
        subheading,
        "logosSrc": logos.asset->url
      },
      collaborationTools {
        headingLine1,
        headingLine2,
        cards[] {
          title,
          body,
          "iconSrc": icon.asset->url,
          "previewSrc": preview.asset->url
        },
        ctaLabel,
        ctaHref
      },
      faqFormatsAnswer,
      metaTitle,
      metaDescription,
      "ogImage": ogImage.asset->url
    }
  `,
    { slug }
  );
}
