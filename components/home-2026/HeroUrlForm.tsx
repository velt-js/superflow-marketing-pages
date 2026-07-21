"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import styles from "./Hero.module.css";
import { GlobeIcon } from "./HeroIcons";

const URL_PLACEHOLDER = "Enter your website URL";
const START_LABEL = "Start";

/** Superflow app onboarding entry point the hero form hands the URL off to. */
const START_APP_URL = "http://app.usesuperflow.com/start";

const EMPTY_URL_MESSAGE = "Please enter your website URL.";
const INVALID_URL_MESSAGE =
  "That doesn't look like a valid URL. Try something like yourwebsite.com.";

/**
 * Normalize raw input into an absolute URL: trims whitespace and prefixes
 * `https://` when the user omitted a scheme. Returns "" for empty input.
 * @param rawUrl - Whatever the user typed into the URL field.
 */
function normalizeWebsiteUrl(rawUrl: string): string {
  try {
    const trimmedUrl = rawUrl?.trim() ?? "";
    if (!trimmedUrl) {
      return "";
    }
    return /^https?:\/\//i.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`;
  } catch {
    return "";
  }
}

/**
 * Whether the given absolute URL parses and carries a plausible website
 * hostname (at least one dot-separated label pair, e.g. "example.com" —
 * rejects bare words like "sadasdasd", spaces, and malformed hosts).
 * @param candidateUrl - Absolute URL string (scheme already ensured).
 */
function isValidWebsiteUrl(candidateUrl: string): boolean {
  try {
    const hostname = new URL(candidateUrl)?.hostname ?? "";
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(hostname);
  } catch {
    return false;
  }
}

/**
 * Hero URL-capture form (input + "Start" button) for the homepage hero panel.
 *
 * A client component so submitting can validate the entered URL (showing an
 * inline warning when it is missing or malformed) and redirect the browser to
 * the Superflow app's onboarding start page with the URL attached as the
 * `url` query param (e.g. `http://app.usesuperflow.com/start?url=...`).
 */
export default function HeroUrlForm() {
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // The button only reads "enabled" once the input is a genuinely valid URL
  // (same normalization + check the submit handler uses), so random text like
  // "sadasdasd" keeps it in the dimmed idle state.
  const normalizedUrl = normalizeWebsiteUrl(websiteUrl);
  const isUrlReady = normalizedUrl !== "" && isValidWebsiteUrl(normalizedUrl);

  /**
   * Keep the controlled input in sync with what the user types and clear any
   * stale validation warning.
   * @param event - Change event from the URL input.
   */
  function handleUrlChange(event: ChangeEvent<HTMLInputElement>) {
    try {
      setWebsiteUrl(event?.target?.value ?? "");
      setErrorMessage("");
    } catch {
      setWebsiteUrl("");
    }
  }

  /**
   * Validate the entered URL (prefixing `https://` when the user omitted a
   * scheme). On success, send the browser to the Superflow app onboarding
   * page; otherwise surface an inline warning under the field.
   * @param event - Submit event from the URL-capture form.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      event?.preventDefault();
      if (!normalizedUrl) {
        setErrorMessage(EMPTY_URL_MESSAGE);
        return;
      }
      if (!isValidWebsiteUrl(normalizedUrl)) {
        setErrorMessage(INVALID_URL_MESSAGE);
        return;
      }
      window.location.href = `${START_APP_URL}?url=${encodeURIComponent(normalizedUrl)}`;
    } catch {
      setErrorMessage(INVALID_URL_MESSAGE);
    }
  }

  return (
    // noValidate: validation (and its inline warning) is handled in
    // handleSubmit instead of the browser's native bubble.
    <form className={styles.urlForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.urlRow}>
        <div
          className={`${styles.urlField} ${
            errorMessage ? styles.urlFieldError : ""
          }`}
        >
          <GlobeIcon size={24} className={styles.urlIcon} />
          <input
            className={styles.urlInput}
            // Plain text (not type="url") so bare domains like "example.com"
            // pass validation; handleSubmit adds the missing scheme.
            type="text"
            inputMode="url"
            aria-label={URL_PLACEHOLDER}
            aria-invalid={errorMessage ? true : undefined}
            placeholder={URL_PLACEHOLDER}
            value={websiteUrl}
            onChange={handleUrlChange}
            required
          />
        </div>
        <button
          type="submit"
          className={`${styles.startButton} ${
            isUrlReady ? styles.startButtonReady : ""
          }`}
        >
          {START_LABEL}
        </button>
      </div>

      {errorMessage ? (
        <p className={styles.urlWarning} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
