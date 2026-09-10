"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  asPlace,
  createLocationSearch,
  type LocationCatalog,
  type SearchResult,
} from "@/lib/tools/meeting-planner/locations";
import {
  addDays,
  buildDay,
  calendarDateLabel,
  currentMeetingSelection,
  dateLabel,
  DEFAULT_PEOPLE,
  hourValue,
  localParts,
  meetingCopyText,
  meetingFits,
  MINUTE,
  parseState,
  STEP,
  timeLabel,
  type Participant,
  type PlannerState,
} from "@/lib/tools/meeting-planner/time";
import {
  deviceLocation,
  withDetectedCity,
} from "@/lib/tools/meeting-planner/detection";
import { suggestMeetingTimes } from "@/lib/tools/meeting-planner/suggestions";
import { MeetingTimeline, SELECTION_STEP } from "./MeetingTimeline";
import styles from "./MeetingPlanner.module.css";
import { PeriodIcon } from "./PeriodIcon";

const STORAGE_KEY = "superflow-meeting-planner-v1";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 96 }, (_, i) => i * STEP);

function Icon({
  name,
}: {
  name:
    | "search"
    | "plus"
    | "close"
    | "clock"
    | "copy"
    | "link"
    | "arrow"
    | "check"
    | "calendar";
}) {
  const paths = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4" />
      </>
    ),
    link: (
      <>
        <path d="m10 13 4-4M8 15l-1 1a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0M16 9l1-1a3 3 0 0 1 4 4l-5 5a3 3 0 0 1-4 0" />
      </>
    ),
    arrow: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 11h18" />
      </>
    ),
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function MeetingPlanner() {
  const [state, setState] = useState<PlannerState | null>(null);
  const [catalog, setCatalog] = useState<LocationCatalog | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [suggestion, setSuggestion] = useState<number | null>(null);
  const [revealSelection, setRevealSelection] = useState(0);
  const [copyFallback, setCopyFallback] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [detected, setDetected] = useState<Participant | null>(null);
  const detectedRef = useRef<Participant | null>(null);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const device = deviceLocation();
    detectedRef.current = device;
    setDetected(device);
    const restore = () => {
      let shared: PlannerState | null = null;
      try {
        if (window.location.hash.startsWith("#plan="))
          shared = parseState(
            decodeURIComponent(window.location.hash.slice(6)),
          );
      } catch {
        /* Invalid links fall back to a usable planner. */
      }
      let saved: PlannerState | null = null;
      try {
        saved = parseState(localStorage.getItem(STORAGE_KEY) ?? "");
      } catch {
        /* Storage is optional. */
      }
      const local = detectedRef.current;
      const originalSample =
        JSON.stringify(saved?.people) === JSON.stringify(DEFAULT_PEOPLE);
      const people =
        local && (!saved || originalSample)
          ? [
              {
                ...local,
                ...(originalSample
                  ? {
                      start: saved!.people[0].start,
                      end: saved!.people[0].end,
                      days: saved!.people[0].days,
                    }
                  : {}),
              },
              ...DEFAULT_PEOPLE.filter(
                (person) => person.zone !== local.zone,
              ).slice(0, 2),
            ]
          : (saved?.people ?? DEFAULT_PEOPLE);
      setState(
        shared ?? {
          version: 1,
          people,
          ...currentMeetingSelection(Date.now(), people[0].zone),
          duration: 30,
          hour12: saved?.hour12 ?? true,
        },
      );
      if (window.location.hash.startsWith("#plan=") && !shared)
        setNotice(
          "That shared plan could not be loaded. Your saved locations are available below.",
        );
    };
    restore();
    const controller = new AbortController();
    if (device) {
      fetch("/api/tools/meeting-planner/location", {
        signal: controller.signal,
        cache: "no-store",
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((value) => {
          const location = withDetectedCity(device, value);
          detectedRef.current = location;
          setDetected(location);
          // Enrich only a row created by auto-detection, never a shared plan or a city the user chose.
          if (window.location.hash.startsWith("#plan=")) return;
          setState((current) =>
            current
              ? {
                  ...current,
                  people: current.people.map((person) =>
                    person.id === device.id
                      ? {
                          ...person,
                          name: location.name,
                          country: location.country,
                          countryCode: location.countryCode,
                        }
                      : person,
                  ),
                }
              : current,
          );
        })
        .catch(() => {
          /* Device time still works if city detection is unavailable. */
        });
    }
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    window.addEventListener("hashchange", restore);
    return () => {
      controller.abort();
      clearInterval(interval);
      window.removeEventListener("hashchange", restore);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    // Keep synchronous storage writes off the pointer-drag path.
    const save = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* The planner still works without persistence. */
      }
    };
    const timeout = window.setTimeout(save, 150);
    window.addEventListener("pagehide", save);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("pagehide", save);
    };
  }, [state]);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogError(false);
    fetch("/data/meeting-locations.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Location catalog unavailable");
        return response.json();
      })
      .then(setCatalog)
      .catch((error) => {
        if (error.name !== "AbortError") setCatalogError(true);
      });
    return () => controller.abort();
  }, [retry]);

  const search = useMemo(
    () => (catalog ? createLocationSearch(catalog) : null),
    [catalog],
  );
  const results = useMemo(() => search?.(query) ?? [], [search, query]);
  const day = useMemo(
    () => (state ? buildDay(state.date, state.people, 1440) : null),
    [state?.date, state?.people],
  );
  const fits = useMemo(() => {
    if (!day || !state) return [];
    const count = state.duration / STEP;
    return day.instants.map((_, i) =>
      day.availability.every((row) => row.slice(i, i + count).every(Boolean)),
    );
  }, [day, state?.duration]);
  const suggestions = useMemo(
    () => (day && state ? suggestMeetingTimes(day, state.people) : []),
    [day],
  );
  useEffect(() => setSuggestion(null), [day]);
  if (!state || !day)
    return (
      <div className={styles.loading} role="status">
        <Icon name="clock" /> Loading your meeting planner…
      </div>
    );

  const base = state.people[0];
  const firstSelectableFit = fits.findIndex(
    (fit, i) => fit && i % (SELECTION_STEP / STEP) === 0,
  );
  const defaultIndex =
    firstSelectableFit >= 0
      ? firstSelectableFit
      : Math.max(
          0,
          day.instants.findIndex((t) => localParts(t, base.zone).minute >= 540),
        );
  const selectedIndex =
    state.selected === null
      ? defaultIndex
      : Math.max(0, day.instants.indexOf(state.selected));
  const selected = day.instants[selectedIndex];
  const selectedFits = fits[selectedIndex] ?? false;
  const outside =
    selected === undefined
      ? []
      : state.people.filter(
          (person) => !meetingFits(selected, state.duration, person),
        );
  const overlapHours = Math.floor(day.overlapMinutes / 60);
  const overlapRemainder = day.overlapMinutes % 60;
  const overlapText = [
    overlapHours
      ? `${overlapHours} ${overlapHours === 1 ? "hour" : "hours"}`
      : "",
    overlapRemainder ? `${overlapRemainder} minutes` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const showingSuggestion = suggestion === selected && state.duration === 30;
  const compactTime = (instant: number) =>
    timeLabel(instant, base.zone, state.hour12)
      .replace(/:00(?= )/, "")
      .replace(" AM", "am")
      .replace(" PM", "pm");
  const bannerText = showingSuggestion
    ? `${selectedFits ? "Suggested" : "Compromise"}: ${compactTime(selected)} – ${compactTime(selected + 30 * MINUTE)} · ${base.name}`
    : state.people.length === 1
      ? "Add another city to compare times"
      : day.overlapMinutes > 0
        ? `${overlapText} within everyone’s work hours`
        : "No shared work hours. Try a suggested compromise.";
  const bannerFits = showingSuggestion ? selectedFits : day.overlapMinutes > 0;
  const patch = (value: Partial<PlannerState>) =>
    setState((current) => (current ? { ...current, ...value } : current));
  const patchPerson = (id: string, value: Partial<Participant>) =>
    patch({
      people: state.people.map((p) => (p.id === id ? { ...p, ...value } : p)),
      selected: null,
    });
  const changeDate = (date: string) => {
    const valid = parseState(
      JSON.stringify({ ...state, date, selected: null }),
    );
    if (valid) setState(valid);
  };
  function addPlace(result: SearchResult) {
    if (
      !state ||
      state.people.length >= 8 ||
      state.people.some((p) => p.id === result.id)
    )
      return;
    try {
      new Intl.DateTimeFormat("en", { timeZone: result.zone });
    } catch {
      setNotice(
        "Your browser does not support this location’s time zone. Please update your browser.",
      );
      return;
    }
    patch({
      people: [
        ...state.people,
        { ...asPlace(result), start: 540, end: 1080, days: [1, 2, 3, 4, 5] },
      ],
      selected,
    });
    setQuery("");
    setSearchOpen(false);
    setActiveResult(0);
    setNotice(`${result.name} added.`);
    searchRef.current?.focus();
  }
  async function copy(text: string, success: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFallback("");
      setNotice(success);
    } catch {
      setCopyFallback(text);
      setNotice(
        "Clipboard access is unavailable. Select and copy the text below.",
      );
    }
  }
  function share() {
    const url = new URL(window.location.href);
    url.hash = `plan=${encodeURIComponent(JSON.stringify({ ...state, selected }))}`;
    void copy(
      url.toString(),
      "Plan link copied. It includes every location, working hours, date, and selected time.",
    );
  }
  const currentTime = (person: Participant) =>
    now === null ? "" : timeLabel(now, person.zone, state.hour12);

  return (
    <div className={styles.planner} data-meeting-planner>
      <div className={styles.quickActions}>
        <button className={styles.primaryButton} onClick={share}>
          <Icon name="link" /> Share plan
        </button>
      </div>
      <div className={styles.searchSection}>
        <div
          className={styles.searchWrap}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget))
              setSearchOpen(false);
          }}
        >
          <label htmlFor="location-search">
            Add a city or country <span>{state.people.length}/8 locations</span>
          </label>
          <div className={styles.searchBox}>
            <Icon name="search" />
            <input
              id="location-search"
              ref={searchRef}
              role="combobox"
              aria-expanded={searchOpen}
              aria-controls="location-results"
              aria-autocomplete="list"
              aria-activedescendant={
                searchOpen && results[activeResult]
                  ? `location-result-${activeResult}`
                  : undefined
              }
              placeholder="Try London, India, or San Francisco"
              value={query}
              autoComplete="off"
              disabled={state.people.length >= 8}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveResult(0);
                setSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setSearchOpen(true);
                  const next = Math.max(
                    0,
                    Math.min(
                      results.length - 1,
                      activeResult + (e.key === "ArrowDown" ? 1 : -1),
                    ),
                  );
                  setActiveResult(next);
                  resultRefs.current[next]?.scrollIntoView({
                    block: "nearest",
                  });
                }
                if (e.key === "Enter" && searchOpen && results[activeResult]) {
                  e.preventDefault();
                  addPlace(results[activeResult]);
                }
              }}
            />
            {query && (
              <button
                aria-label="Clear location search"
                className={styles.iconButton}
                onClick={() => {
                  setQuery("");
                  setActiveResult(0);
                  searchRef.current?.focus();
                }}
              >
                <Icon name="close" />
              </button>
            )}
          </div>
          {searchOpen && (
            <div className={styles.searchResults}>
              <p className={styles.resultHeading}>
                {query ? "MATCHING CITIES & COUNTRIES" : "POPULAR TECH HUBS"}
              </p>
              {!catalog && (
                <p className={styles.searchMessage}>
                  {catalogError ? (
                    <>
                      Locations could not load.{" "}
                      <button onClick={() => setRetry((n) => n + 1)}>
                        Try again
                      </button>
                    </>
                  ) : (
                    "Loading the city and country catalog…"
                  )}
                </p>
              )}
              {catalog && results.length === 0 && (
                <p className={styles.searchMessage}>
                  No matching location. Try a nearby larger city or the country
                  name.
                </p>
              )}
              <div
                id="location-results"
                role="listbox"
                aria-label="Matching locations"
              >
                {results.map((result, i) => {
                  const added = state.people.some((p) => p.id === result.id);
                  return (
                    <button
                      ref={(el) => {
                        resultRefs.current[i] = el;
                      }}
                      id={`location-result-${i}`}
                      key={result.id}
                      role="option"
                      aria-selected={activeResult === i}
                      aria-disabled={added}
                      className={`${styles.result} ${activeResult === i ? styles.activeResult : ""}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addPlace(result)}
                    >
                      <span className={styles.countryBadge}>
                        {result.countryCode}
                      </span>
                      <span className={styles.resultText}>
                        <strong>{result.name}</strong>
                        <small>
                          {result.hint ??
                            [result.region, result.country]
                              .filter(Boolean)
                              .join(", ")}
                        </small>
                      </span>
                      {added ? <small>Added</small> : <Icon name="plus" />}
                    </button>
                  );
                })}
              </div>
              <p className={styles.searchMessage}>
                For a large country, choose a city closest to your customer.
              </p>
            </div>
          )}
        </div>
        <div className={styles.searchHint}>
          <div>
            {detected ? (
              <>
                <button
                  className={styles.locationButton}
                  onClick={() => {
                    const existing = state.people.find(
                      (p) => p.id === detected.id,
                    );
                    if (!existing && state.people.length >= 8) {
                      setNotice(
                        "Remove a location before adding your location.",
                      );
                      return;
                    }
                    const person = existing ?? detected;
                    patch({
                      people: [
                        person,
                        ...state.people.filter((p) => p.id !== person.id),
                      ],
                      selected: null,
                    });
                    setNotice("The timeline now shows your local time.");
                  }}
                >
                  Use my location
                </button>
              </>
            ) : (
              <span>Add your city to get started.</span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`${styles.overlapBanner} ${!bannerFits ? styles.noOverlap : ""}`}
        data-meeting-suggestion
        role="status"
      >
        <span className={styles.overlapIcon}>
          <Icon name={bannerFits ? "check" : "clock"} />
        </span>
        <div>
          <strong title={bannerText}>{bannerText}</strong>
        </div>
        <button
          className={styles.suggestButton}
          disabled={!suggestions.length}
          title="Click again to see another suggested time"
          onClick={() => {
            const index =
              suggestion === selected ? suggestions.indexOf(selected) : -1;
            const next = suggestions[(index + 1) % suggestions.length];
            patch({ selected: next, duration: 30 });
            setSuggestion(next);
            setRevealSelection((value) => value + 1);
          }}
        >
          Suggest a time
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.dateControls}>
          <button
            className={styles.iconButton}
            aria-label="Previous day"
            onClick={() => changeDate(addDays(state.date, -1))}
          >
            <span className={styles.back}>
              <Icon name="arrow" />
            </span>
          </button>
          <label className={styles.dateField}>
            <span className={styles.srOnly}>Meeting date</span>
            <span className={styles.dateDisplay} aria-hidden="true">
              <span data-selected-date>{calendarDateLabel(state.date)}</span>
              <Icon name="calendar" />
            </span>
            <input
              type="date"
              aria-label="Meeting date"
              value={state.date}
              min="2000-01-01"
              max="2099-12-31"
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker?.();
                } catch {
                  /* Native input remains usable. */
                }
              }}
              onChange={(e) => changeDate(e.target.value)}
              onBlur={(e) => {
                if (e.currentTarget.value !== state.date)
                  changeDate(e.currentTarget.value);
              }}
            />
          </label>
          <button
            className={styles.iconButton}
            aria-label="Next day"
            onClick={() => changeDate(addDays(state.date, 1))}
          >
            <Icon name="arrow" />
          </button>
          <button
            className={`${styles.textButton} ${styles.todayButton}`}
            onClick={() => {
              patch({
                ...currentMeetingSelection(Date.now(), base.zone),
                duration: 30,
              });
              setRevealSelection((value) => value + 1);
            }}
          >
            {now !== null && state.date === localParts(now, base.zone).date
              ? "Today"
              : "Back to today"}
          </button>
        </div>
        <details className={styles.viewOptions}>
          <summary>View options</summary>
          <div className={styles.preferences}>
            <label className={styles.timeScale}>
              Show times in
              <select
                value={base.id}
                onChange={(e) => {
                  const person = state.people.find(
                    (p) => p.id === e.target.value,
                  );
                  if (!person) return;
                  patch({
                    people: [
                      person,
                      ...state.people.filter((p) => p.id !== person.id),
                    ],
                    date: localParts(selected ?? Date.now(), person.zone).date,
                    selected: selected ?? null,
                  });
                }}
              >
                {state.people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.segmented} aria-label="Time display">
              <button
                aria-pressed={state.hour12}
                onClick={() => patch({ hour12: true })}
              >
                12h
              </button>
              <button
                aria-pressed={!state.hour12}
                onClick={() => patch({ hour12: false })}
              >
                24h
              </button>
            </div>
          </div>
        </details>
      </div>

      <div className={styles.simpleHint}>
        <p>
          <span className={styles.desktopHint}>
            Click for 30 minutes. Drag the selection to move it, or pull its
            edges to change its length.
          </span>
          <span className={styles.mobileHint}>
            Tap to select. Drag to move or resize.
          </span>
        </p>
        <div className={styles.periodLegend}>
          <span title="8am–5:30pm in each city">
            <i className={styles.daySwatch}>
              <PeriodIcon period="day" />
            </i>
            Day
          </span>
          <span title="5:30pm–midnight in each city — darker gray means later">
            <i className={styles.eveningSwatch}>
              <PeriodIcon period="evening" />
            </i>
            Evening
          </span>
          <span title="Midnight–8am in each city — avoid meetings">
            <i className={styles.sleepSwatch}>
              <PeriodIcon period="overnight" />
            </i>
            Sleep hours
          </span>
          <span>
            <i className={styles.sharedSwatch} />
            Everyone’s work hours
          </span>
          <span title="Time slots that have already ended">
            <i className={styles.pastSwatch} />
            Past
          </span>
        </div>
      </div>
      <MeetingTimeline
        now={now}
        revealSelection={revealSelection}
        day={day}
        people={state.people}
        selected={selected}
        duration={state.duration}
        hour12={state.hour12}
        onSelect={patch}
        renderLocation={(person) => (
          <>
            <div className={styles.cityTop}>
              <strong title={person.name}>{person.name}</strong>
              <button
                className={styles.iconButton}
                disabled={state.people.length === 1}
                aria-label={`Remove ${person.name}`}
                onClick={() => {
                  patch({
                    people: state.people.filter((p) => p.id !== person.id),
                    selected: null,
                  });
                  if (editing === person.id) setEditing(null);
                }}
              >
                <Icon name="close" />
              </button>
            </div>
            <div
              className={styles.cityNow}
              aria-label={`Current time in ${person.name}`}
            >
              <strong>{currentTime(person)}</strong>
              <span>now</span>
            </div>
            <div className={styles.cityDetails}>
              <span title={person.country}>
                {person.country || "Your local time"}
              </span>
              <button
                className={styles.hoursButton}
                aria-label={`${person.name}: ${hourValue(person.start)}–${hourValue(person.end)} Edit hours`}
                aria-expanded={editing === person.id}
                aria-controls="working-hours-editor"
                onClick={() =>
                  setEditing(editing === person.id ? null : person.id)
                }
              >
                <Icon name="clock" /> Edit hours
              </button>
            </div>
          </>
        )}
      />
      {state.people
        .filter((person) => person.id === editing)
        .map((person) => (
          <section
            id="working-hours-editor"
            key={person.id}
            className={styles.editorPanel}
            aria-label={`Working hours for ${person.name}`}
          >
            <div className={styles.editorHeading}>
              <strong>Working hours for {person.name}</strong>
              <button
                className={styles.textButton}
                onClick={() => setEditing(null)}
              >
                Done
              </button>
            </div>

            <div className={styles.hoursEditor}>
              <div className={styles.hoursFields}>
                {(["start", "end"] as const).map((key) => (
                  <label key={key}>
                    {key === "start" ? "Work starts" : "Work ends"}
                    <select
                      aria-label={`${person.name} work ${key}`}
                      value={person[key]}
                      onChange={(e) =>
                        patchPerson(person.id, {
                          [key]: Number(e.target.value),
                        })
                      }
                    >
                      {HOURS.map((n) => (
                        <option value={n} key={n}>
                          {hourValue(n)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <div>
                <p>Working days</p>
                <div className={styles.dayButtons}>
                  {[1, 2, 3, 4, 5, 6, 0].map((n) => (
                    <button
                      key={n}
                      aria-label={`${person.name} works ${DAYS[n]}`}
                      aria-pressed={person.days.includes(n)}
                      onClick={() =>
                        patchPerson(person.id, {
                          days: person.days.includes(n)
                            ? person.days.filter((d) => d !== n)
                            : [...person.days, n],
                        })
                      }
                    >
                      {DAYS[n]}
                    </button>
                  ))}
                </div>
              </div>
              {person.start >= person.end && (
                <p className={styles.editorHint}>
                  {person.start === person.end
                    ? "Start and end match, so no working hours are available."
                    : "Overnight shift: working days refer to the day the shift starts."}
                </p>
              )}
            </div>
          </section>
        ))}
      <p className={styles.srOnly} id="meeting-selection-help">
        Arrow keys move by 30 minutes. Shift + arrow keys adjust the range. On
        mobile, swipe the time scale to scroll. Daylight saving is included.
      </p>

      {selected !== undefined ? (
        <section
          className={styles.meeting}
          aria-labelledby="selected-meeting-heading"
        >
          <div className={styles.meetingHeading}>
            <div>
              <p className={styles.kicker}>YOUR MEETING</p>
              <h3 id="selected-meeting-heading">
                {timeLabel(selected, base.zone, state.hour12)} <span>–</span>{" "}
                {timeLabel(
                  selected + state.duration * MINUTE,
                  base.zone,
                  state.hour12,
                )}
              </h3>
              <p>
                {dateLabel(selected, base.zone)} · {base.name} ·{" "}
                {state.duration} minutes
              </p>
            </div>
            <span
              className={`${styles.fitBadge} ${!selectedFits ? styles.outsideBadge : ""}`}
            >
              <Icon name={selectedFits ? "check" : "clock"} />
              {selectedFits
                ? "Within everyone’s work hours"
                : outside.length === 1
                  ? `Outside ${outside[0].name}’s work hours`
                  : `Outside work hours in ${outside.length} cities`}
            </span>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={() =>
                void copy(
                  meetingCopyText(state.people, selected, state.duration),
                  "Meeting times copied.",
                )
              }
            >
              <Icon name="copy" />
              Copy meeting times
            </button>
          </div>
        </section>
      ) : (
        <p className={styles.noDate}>
          This date is not available in {base.name}. Please choose another day.
        </p>
      )}
      <div className={styles.notice} role="status" aria-live="polite">
        {notice}
      </div>
      {copyFallback && (
        <textarea
          className={styles.fallback}
          aria-label="Text to copy manually"
          readOnly
          value={copyFallback}
          onFocus={(e) => e.target.select()}
          rows={4}
        />
      )}
      <div className={styles.bottomNote}>
        <span>Your cities and work hours are saved automatically.</span>
        <span>
          City data:{" "}
          <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">
            GeoNames
          </a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0
          </a>
        </span>
      </div>
    </div>
  );
}
