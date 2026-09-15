"use client";

import { useState } from "react";

import styles from "./DirectoryForm.module.css";

/** Keys that commit the current draft as a tag. Comma and Tab as well as
 *  Enter, because people paste comma-separated lists and because Tab is
 *  what someone reaches for after typing the last one. */
const COMMIT_KEYS = new Set(["Enter", ",", "Tab"]);

/**
 * A capped list of short free-text tags.
 *
 * Used for services and for startup client names. The cap is enforced
 * here AND in lib/directory/claim-validation.ts - this one so the input
 * disables itself rather than accepting a ninth tag it will silently
 * drop, that one because a form is a suggestion.
 *
 * Deliberately NOT a combobox with suggestions. The service vocabulary in
 * this dataset is 900 distinct free-text strings across four sources;
 * suggesting from it would push agencies toward whatever wording a
 * scraper happened to capture rather than their own.
 *
 * @param props - Component props.
 * @param props.id - Input id, for the label association.
 * @param props.label - Visible field label.
 * @param props.values - Current tags.
 * @param props.onChange - Called with the new list on every change.
 * @param props.maxItems - Cap on the number of tags.
 * @param props.maxChars - Cap on one tag's length.
 * @param props.placeholder - Input placeholder.
 * @param props.hint - Optional help text under the field.
 */
export default function TagInput({
  id,
  label,
  values,
  onChange,
  maxItems,
  maxChars,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  maxItems: number;
  maxChars: number;
  placeholder?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState("");

  try {
    const isFull = values.length >= maxItems;

    /**
     * Commits the draft as a tag, if there is room and it is not a
     * duplicate.
     */
    function commit() {
      try {
        const tag = draft.trim().slice(0, maxChars);
        if (!tag) return;
        const exists = values.some((value) => value.toLowerCase() === tag.toLowerCase());
        if (exists || isFull) {
          setDraft("");
          return;
        }
        onChange([...values, tag]);
        setDraft("");
      } catch {
        setDraft("");
      }
    }

    /** Removes one tag. */
    function remove(target: string) {
      try {
        onChange(values.filter((value) => value !== target));
      } catch {
        // Leave the list as it was.
      }
    }

    return (
      <div className={styles.field}>
        <label htmlFor={id} className={styles.label}>
          {label}{" "}
          <span className={styles.optional}>
            {values.length}/{maxItems}
          </span>
        </label>

        {values.length > 0 && (
          <div className={styles.tags}>
            {values.map((value) => (
              <span key={value} className={styles.tag}>
                {value}
                <button
                  type="button"
                  className={styles.tagRemove}
                  aria-label={`Remove ${value}`}
                  onClick={() => remove(value)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          id={id}
          className={styles.control}
          type="text"
          value={draft}
          maxLength={maxChars}
          disabled={isFull}
          placeholder={isFull ? `That is the maximum of ${maxItems}` : placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (!COMMIT_KEYS.has(event.key)) return;
            // Tab only commits when there is something to commit, so an
            // empty field still moves focus the way Tab should.
            if (event.key === "Tab" && draft.trim().length === 0) return;
            event.preventDefault();
            commit();
          }}
          // Commit on blur too: plenty of people type a tag and click the
          // submit button, and losing that last entry is maddening.
          onBlur={commit}
        />

        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  } catch {
    return null;
  }
}
