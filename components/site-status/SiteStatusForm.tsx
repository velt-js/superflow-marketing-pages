"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parseStatusTarget, statusPathFor } from "@/lib/site-status/target";
import styles from "./SiteStatus.module.css";

/** Props for {@link SiteStatusForm}. */
interface SiteStatusFormProps {
  /** Pre-filled value, e.g. the site already being shown. */
  initialValue?: string;
  /** Label for the submit button. */
  buttonLabel?: string;
  /** Visual size: "hero" for the landing page, "compact" below a result. */
  size?: "hero" | "compact";
}

/**
 * URL input that sends the visitor to /tool/status/<site>. Validation runs
 * client-side so an invalid address shows an inline message instead of a
 * round trip; the result page validates again on the server.
 */
export default function SiteStatusForm({
  initialValue = "",
  buttonLabel = "Check status",
  size = "hero",
}: SiteStatusFormProps) {
  const router = useRouter();
  const [value, setValue] = useState<string>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const target = parseStatusTarget(value);
      if (!target) {
        setError("Enter a public website address, like example.com or https://example.com/pricing.");
        return;
      }
      setError(null);
      setIsNavigating(true);
      router.push(statusPathFor(target));
    } catch {
      setIsNavigating(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      className={`${styles.form} ${size === "compact" ? styles.formCompact : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.formRow}>
        <label className={styles.srOnly} htmlFor="site-status-url">
          Website address
        </label>
        <input
          id="site-status-url"
          className={styles.input}
          type="text"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="example.com"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "site-status-error" : undefined}
        />
        <button
          className={`${styles.btn} ${styles.btnFilled} ${styles.submit}`}
          type="submit"
          disabled={isNavigating}
        >
          {isNavigating ? "Checking…" : buttonLabel}
        </button>
      </div>
      {error ? (
        <p id="site-status-error" className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
