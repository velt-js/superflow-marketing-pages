"use client";

// The mock cards.
//
// Each platform gets its own renderer rather than one themed template,
// because recognising your own Slack unfurl or Discord embed at a glance is
// the point. The differences that are modelled are the ones that change what
// a reader sees: where the image sits, whether it is cropped or letterboxed,
// where the source line goes, and the type sizes that decide how much of a
// title fits on a line.
//
// Every card renders the same three resolved fields (title, description,
// image) even where a platform's own client sometimes hides one. The engine
// is the authority on what each platform resolves, and quietly dropping a
// field it resolved would hide the exact thing the visitor came to check. The
// per-platform notes underneath say what the platform will actually do with
// it.
//
// Images come from arbitrary third-party sites, so they are plain `<img>`
// elements: `next/image` would need every customer domain in remote-host
// config. They are constrained to the card, and a failure renders words
// rather than a broken icon, because a broken og:image is itself a finding.

import { useState } from "react";
import type { PlatformPreview, PreviewField } from "@/lib/tools/social-preview/report";
import styles from "./SocialPreview.module.css";

/** What a card learned about its image once the browser tried to load it. */
export type ImageOutcome = {
  loaded: boolean;
  width: number;
  height: number;
};

type CardProps = {
  preview: PlatformPreview;
  /** Called once the browser has resolved the image, or failed to. */
  onImageOutcome: (outcome: ImageOutcome) => void;
};

/**
 * The mock image inside a card.
 *
 * Alt text is empty on purpose. The image is a reproduction of what a
 * platform would show, and the same information is already on the page as
 * text in the "where each field came from" rows below the card, so announcing
 * it six more times would only add noise.
 *
 * @param props - Source URL, crop behaviour, dark styling, and the callback
 *   that reports what happened.
 */
function PreviewImage({
  src,
  variant,
  dark = false,
  onImageOutcome,
}: {
  src: string;
  variant: "cover" | "contain";
  dark?: boolean;
  onImageOutcome: (outcome: ImageOutcome) => void;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${styles.imgFallback} ${dark ? styles.imgFallbackDark : ""}`}
      >
        The image did not load. Platforms fetch it the same way, so this is
        what they would get too.
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`${styles.img} ${
        variant === "cover" ? styles.imgCover : styles.imgContain
      }`}
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onLoad={(event) =>
        onImageOutcome({
          loaded: true,
          width: event.currentTarget.naturalWidth,
          height: event.currentTarget.naturalHeight,
        })
      }
      onError={() => {
        setFailed(true);
        onImageOutcome({ loaded: false, width: 0, height: 0 });
      }}
    />
  );
}

/**
 * A resolved field's text, or an italic placeholder when the platform found
 * nothing. Never invents a value.
 *
 * @param props - The field, the class for the real text, and dark styling.
 */
function FieldText({
  field,
  className,
  fallback,
  dark = false,
}: {
  field: PreviewField;
  className: string;
  fallback: string;
  dark?: boolean;
}) {
  if (field.value.length === 0) {
    return (
      <span
        className={`${className} ${dark ? styles.emptyFieldDark : styles.emptyField}`}
      >
        {fallback}
      </span>
    );
  }
  return <span className={className}>{field.value}</span>;
}

/** The dashed strip that stands in for a missing image. */
function NoImageStrip({ platformName }: { platformName: string }) {
  return (
    <div className={styles.noImageStrip}>
      No image, so {platformName} has nothing to show here
    </div>
  );
}

/** X (Twitter): domain stamped over the image, text below. */
function XCard({ preview, onImageOutcome }: CardProps) {
  const hasImage = preview.image.value.length > 0;

  const body = (
    <div className={styles.xBody}>
      {preview.layout !== "large-image" ? (
        <span className={styles.xAttribution}>{preview.attribution}</span>
      ) : null}
      <FieldText
        field={preview.title}
        className={styles.xTitle}
        fallback="No title"
      />
      <FieldText
        field={preview.description}
        className={styles.xDescription}
        fallback="No description"
      />
      {hasImage ? null : <NoImageStrip platformName={preview.platformName} />}
    </div>
  );

  if (preview.layout === "large-image" && hasImage) {
    return (
      <div className={styles.xCard}>
        <div className={styles.xImageWrap}>
          <PreviewImage
            src={preview.image.value}
            variant="cover"
            onImageOutcome={onImageOutcome}
          />
          <span className={styles.xDomainPill}>{preview.attribution}</span>
        </div>
        {body}
      </div>
    );
  }

  if (preview.layout === "thumbnail" && hasImage) {
    return (
      <div className={styles.xCard}>
        <div className={styles.xThumbRow}>
          <div className={styles.xThumb}>
            <PreviewImage
              src={preview.image.value}
              variant="cover"
              onImageOutcome={onImageOutcome}
            />
          </div>
          {body}
        </div>
      </div>
    );
  }

  return <div className={styles.xCard}>{body}</div>;
}

/** LinkedIn: image on top, then a grey band with the title and the domain. */
function LinkedInCard({ preview, onImageOutcome }: CardProps) {
  const hasImage = preview.image.value.length > 0;

  const body = (
    <div className={styles.liBody}>
      <FieldText
        field={preview.title}
        className={styles.liTitle}
        fallback="No title"
      />
      <FieldText
        field={preview.description}
        className={styles.liDescription}
        fallback="No description"
      />
      <span className={styles.liAttribution}>{preview.attribution}</span>
      {hasImage ? null : <NoImageStrip platformName={preview.platformName} />}
    </div>
  );

  if (preview.layout === "thumbnail" && hasImage) {
    return (
      <div className={styles.liCard}>
        <div className={styles.liThumbRow}>
          <div className={styles.liThumb}>
            <PreviewImage
              src={preview.image.value}
              variant="cover"
              onImageOutcome={onImageOutcome}
            />
          </div>
          {body}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.liCard}>
      {hasImage ? (
        <PreviewImage
          src={preview.image.value}
          variant="cover"
          onImageOutcome={onImageOutcome}
        />
      ) : null}
      {body}
    </div>
  );
}

/** Facebook: image on top, then the grey band with the domain in caps. */
function FacebookCard({ preview, onImageOutcome }: CardProps) {
  const hasImage = preview.image.value.length > 0;

  const body = (
    <div className={styles.fbBody}>
      <span className={styles.fbAttribution}>{preview.attribution}</span>
      <FieldText
        field={preview.title}
        className={styles.fbTitle}
        fallback="No title"
      />
      <FieldText
        field={preview.description}
        className={styles.fbDescription}
        fallback="No description"
      />
      {hasImage ? null : <NoImageStrip platformName={preview.platformName} />}
    </div>
  );

  if (preview.layout === "thumbnail" && hasImage) {
    return (
      <div className={styles.fbCard}>
        <div className={styles.fbThumbRow}>
          <div className={styles.fbThumb}>
            <PreviewImage
              src={preview.image.value}
              variant="cover"
              onImageOutcome={onImageOutcome}
            />
          </div>
          {body}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fbCard}>
      {hasImage ? (
        <PreviewImage
          src={preview.image.value}
          variant="cover"
          onImageOutcome={onImageOutcome}
        />
      ) : null}
      {body}
    </div>
  );
}

/** Slack: coloured left rail, text first, letterboxed image underneath. */
function SlackCard({ preview, onImageOutcome }: CardProps) {
  const hasImage = preview.image.value.length > 0;

  const text = (
    <div className={styles.slackCard}>
      <span className={styles.slackAttribution}>{preview.attribution}</span>
      <FieldText
        field={preview.title}
        className={styles.slackTitle}
        fallback="No title"
      />
      <FieldText
        field={preview.description}
        className={styles.slackDescription}
        fallback="No description"
      />
      {hasImage && preview.layout !== "thumbnail" ? (
        <div className={styles.slackImageWrap}>
          <PreviewImage
            src={preview.image.value}
            variant="contain"
            onImageOutcome={onImageOutcome}
          />
        </div>
      ) : null}
      {hasImage ? null : <NoImageStrip platformName={preview.platformName} />}
    </div>
  );

  if (preview.layout === "thumbnail" && hasImage) {
    return (
      <div className={styles.slackThumbRow}>
        {text}
        <div className={styles.slackThumb}>
          <PreviewImage
            src={preview.image.value}
            variant="cover"
            onImageOutcome={onImageOutcome}
          />
        </div>
      </div>
    );
  }

  return text;
}

/** Discord: dark embed with an accent rail and the image below the text. */
function DiscordCard({ preview, onImageOutcome }: CardProps) {
  const hasImage = preview.image.value.length > 0;

  const text = (
    <>
      <span className={styles.discordAttribution}>{preview.attribution}</span>
      <FieldText
        field={preview.title}
        className={styles.discordTitle}
        fallback="No title"
        dark
      />
      <FieldText
        field={preview.description}
        className={styles.discordDescription}
        fallback="No description"
        dark
      />
    </>
  );

  if (preview.layout === "thumbnail" && hasImage) {
    return (
      <div className={styles.discordCard}>
        <div className={styles.discordThumbRow}>
          <div style={{ minWidth: 0, flex: "1 1 auto" }}>{text}</div>
          <div className={styles.discordThumb}>
            <PreviewImage
              src={preview.image.value}
              variant="cover"
              dark
              onImageOutcome={onImageOutcome}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.discordCard}>
      {text}
      {hasImage ? (
        <div className={styles.discordImageWrap}>
          <PreviewImage
            src={preview.image.value}
            variant="contain"
            dark
            onImageOutcome={onImageOutcome}
          />
        </div>
      ) : (
        <NoImageStrip platformName={preview.platformName} />
      )}
    </div>
  );
}

/**
 * Google: a search result, not a share card. No image, because Google builds
 * the snippet from the title tag and the meta description and never reads
 * Open Graph for it.
 */
function GoogleCard({ preview }: CardProps) {
  const initial = preview.attribution.replace(/^https?:\/\/(www\.)?/i, "").charAt(0);

  return (
    <div className={styles.googleCard}>
      <div className={styles.googleSiteRow}>
        <span className={styles.googleFavicon} aria-hidden="true">
          {initial.toUpperCase() || "?"}
        </span>
        <span className={styles.googleUrl}>{preview.attribution}</span>
      </div>
      <FieldText
        field={preview.title}
        className={styles.googleTitle}
        fallback="No title"
      />
      <FieldText
        field={preview.description}
        className={styles.googleSnippet}
        fallback="No description, so Google writes its own from the page text"
      />
    </div>
  );
}

/** Fallback chrome for a platform the engine adds before this file catches up. */
function GenericCard({ preview, onImageOutcome }: CardProps) {
  const hasImage = preview.image.value.length > 0;
  return (
    <div className={styles.fbCard}>
      {hasImage ? (
        <PreviewImage
          src={preview.image.value}
          variant="cover"
          onImageOutcome={onImageOutcome}
        />
      ) : null}
      <div className={styles.fbBody}>
        <span className={styles.fbAttribution}>{preview.attribution}</span>
        <FieldText
          field={preview.title}
          className={styles.fbTitle}
          fallback="No title"
        />
        <FieldText
          field={preview.description}
          className={styles.fbDescription}
          fallback="No description"
        />
      </div>
    </div>
  );
}

/**
 * Renders one platform's card in that platform's own shape.
 *
 * @param props - The preview to draw and the image-outcome callback.
 */
export function PreviewCard(props: CardProps) {
  switch (props.preview.platform) {
    case "x":
      return <XCard {...props} />;
    case "linkedin":
      return <LinkedInCard {...props} />;
    case "facebook":
      return <FacebookCard {...props} />;
    case "slack":
      return <SlackCard {...props} />;
    case "discord":
      return <DiscordCard {...props} />;
    case "google":
      return <GoogleCard {...props} />;
    default:
      return <GenericCard {...props} />;
  }
}
