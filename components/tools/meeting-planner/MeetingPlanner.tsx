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
  calendarFile,
  dateLabel,
  DEFAULT_PEOPLE,
  DURATIONS,
  hoursLabel,
  hourValue,
  localParts,
  meetingFits,
  meetingSummary,
  MINUTE,
  parseState,
  STEP,
  timeLabel,
  zoneLabel,
  type Participant,
  type PlannerState,
} from "@/lib/tools/meeting-planner/time";
import styles from "./MeetingPlanner.module.css";

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
  const [copyFallback, setCopyFallback] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
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
      const people = saved?.people ?? DEFAULT_PEOPLE;
      setState(
        shared ?? {
          version: 1,
          people,
          date: localParts(Date.now(), people[0].zone).date,
          duration: saved?.duration ?? 30,
          selected: null,
          hour12: saved?.hour12 ?? true,
        },
      );
      if (window.location.hash.startsWith("#plan=") && !shared)
        setNotice(
          "That shared plan could not be loaded. Your saved locations are available below.",
        );
    };
    restore();
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    window.addEventListener("hashchange", restore);
    return () => {
      clearInterval(interval);
      window.removeEventListener("hashchange", restore);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* The planner still works without persistence. */
    }
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
    () => (state ? buildDay(state.date, state.people, state.duration) : null),
    [state?.date, state?.people, state?.duration],
  );
  useEffect(() => {
    const viewport = timelineRef.current;
    const cell = viewport?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!viewport || !cell) return;
    const offset =
      cell.getBoundingClientRect().left -
      viewport.getBoundingClientRect().left +
      viewport.scrollLeft;
    // Keep the selected time visible beside the sticky city labels on mobile,
    // without moving the visitor vertically down the page.
    viewport.scrollLeft = Math.max(
      0,
      offset - 180 - (viewport.clientWidth - 180) / 2,
    );
  }, [state?.selected, day]);
  if (!state || !day)
    return (
      <div className={styles.loading} role="status">
        <Icon name="clock" /> Loading your meeting planner…
      </div>
    );

  const base = state.people[0];
  const firstFit = day.fits.findIndex(Boolean);
  const defaultIndex =
    firstFit >= 0
      ? firstFit
      : Math.max(
          0,
          day.instants.findIndex((t) => localParts(t, base.zone).minute >= 540),
        );
  const selectedIndex =
    state.selected === null
      ? defaultIndex
      : Math.max(0, day.instants.indexOf(state.selected));
  const selected = day.instants[selectedIndex];
  const selectedFits = day.fits[selectedIndex] ?? false;
  const suggestions = day.instants
    .filter((_, i) => day.fits[i] && (i === firstFit || i % 4 === 0))
    .slice(0, 5);
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
      selected: null,
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
    <div className={styles.planner}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.kicker}>
            <span className={styles.liveDot} /> MADE FOR CUSTOMER CALLS
          </div>
          <h2>Different places. One good time.</h2>
        </div>
        <button className={styles.button} onClick={share}>
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
                {query ? "MATCHING CITIES & COUNTRIES" : "POPULAR CITIES"}
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
                              .join(", ")}{" "}
                          · {zoneLabel(selected ?? Date.now(), result.zone)}
                        </small>
                      </span>
                      {added ? <small>Added</small> : <Icon name="plus" />}
                    </button>
                  );
                })}
              </div>
              <p className={styles.searchMessage}>
                Countries with multiple time zones show a choice of cities and
                regions.
              </p>
            </div>
          )}
        </div>
        <p className={styles.searchHint}>
          <Icon name="clock" />
          <span>
            Pick the places.
            <br />
            <strong>We’ll work out the time zones.</strong>
          </span>
        </p>
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
            <input
              type="date"
              value={state.date}
              min="2000-01-01"
              max="2099-12-31"
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
            className={styles.textButton}
            onClick={() => changeDate(localParts(Date.now(), base.zone).date)}
          >
            Today
          </button>
        </div>
        <div className={styles.preferences}>
          <label>
            Duration{" "}
            <select
              aria-label="Meeting duration"
              value={state.duration}
              onChange={(e) =>
                patch({ duration: Number(e.target.value), selected: null })
              }
            >
              {DURATIONS.map((n) => (
                <option key={n} value={n}>
                  {n} min
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
      </div>

      <div className={styles.locationList}>
        {state.people.map((person, index) => (
          <div key={person.id} className={styles.locationCard}>
            <div className={styles.locationMain}>
              <span
                className={`${styles.countryBadge} ${index === 0 ? styles.baseBadge : ""}`}
              >
                {person.countryCode || "◎"}
              </span>
              <div className={styles.placeName}>
                <strong>{person.name}</strong>
                <small>
                  {person.country} ·{" "}
                  {zoneLabel(selected ?? Date.now(), person.zone)}
                </small>
              </div>
              <div className={styles.liveTime}>
                <strong>{currentTime(person)}</strong>
                <small>local time now</small>
              </div>
              <button
                className={`${styles.referenceButton} ${index === 0 ? styles.isReference : ""}`}
                aria-label={
                  index === 0
                    ? `${person.name} is the reference city`
                    : `Use ${person.name} as reference`
                }
                disabled={index === 0}
                onClick={() =>
                  patch({
                    people: [
                      person,
                      ...state.people.filter((p) => p.id !== person.id),
                    ],
                    selected: null,
                  })
                }
              >
                {index === 0 ? "Reference" : "Set reference"}
              </button>
              <button
                className={styles.hoursButton}
                aria-expanded={editing === person.id}
                onClick={() =>
                  setEditing(editing === person.id ? null : person.id)
                }
              >
                <Icon name="clock" />
                {hourValue(person.start)}–{hourValue(person.end)}
                <span className={styles.editLabel}>Edit hours</span>
              </button>
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
            {editing === person.id && (
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
            )}
          </div>
        ))}
      </div>

      <div
        className={`${styles.overlapBanner} ${firstFit < 0 ? styles.noOverlap : ""}`}
        role="status"
      >
        <span className={styles.overlapIcon}>
          <Icon name={firstFit >= 0 ? "check" : "clock"} />
        </span>
        <div>
          <strong>
            {state.people.length === 1
              ? "Add a customer’s location to compare"
              : firstFit >= 0
                ? `${hoursLabel(day.overlapMinutes)} of shared working hours`
                : day.overlapMinutes > 0
                  ? `Shared hours are too short for a ${state.duration}-minute call`
                  : "No shared working hours on this date"}
          </strong>
          <p>
            {firstFit >= 0
              ? `Green is working time for everyone. Times below follow ${base.name}.`
              : "Try a shorter call, a different date, or adjust someone’s working hours."}
          </p>
        </div>
      </div>

      <div className={styles.timelineHeader}>
        <div>
          <h3>Find your overlap</h3>
          <p>
            {base.name} is the reference for this day. Select any time to
            compare.
          </p>
        </div>
        <div className={styles.legend}>
          <span>
            <i className={styles.sharedSwatch} />
            Everyone working
          </span>
          <span>
            <i className={styles.workSwatch} />
            Working hours
          </span>
          <span>
            <i />
            Off hours
          </span>
        </div>
      </div>
      <div
        ref={timelineRef}
        className={styles.timelineScroll}
        tabIndex={0}
        role="region"
        aria-label="Time comparison. Scroll horizontally to see the full day."
      >
        <div
          className={styles.timeline}
          style={{ minWidth: `${180 + day.instants.length * 10}px` }}
        >
          <div className={styles.axis}>
            <span>LOCAL TIMES</span>
            <div className={styles.axisTicks}>
              {day.instants
                .filter((_, i) => i % 4 === 0)
                .map((t, i) => (
                  <span
                    key={t}
                    style={{ flex: Math.min(4, day.instants.length - i * 4) }}
                  >
                    {timeLabel(t, base.zone, state.hour12).replace(":00", "")}
                  </span>
                ))}
            </div>
          </div>
          {state.people.map((person, row) => (
            <div className={styles.timelineRow} key={person.id}>
              <div className={styles.rowLabel}>
                <strong>{person.name}</strong>
                <span>
                  {selected !== undefined
                    ? dateLabel(selected, person.zone)
                    : state.date}
                </span>
              </div>
              <div
                className={styles.cells}
                role="group"
                aria-label={`${person.name} timeline`}
              >
                {day.instants.map((t, i) => {
                  const working = day.availability[row][i];
                  const inSelection =
                    t >= selected && t < selected + state.duration * MINUTE;
                  return (
                    <button
                      key={t}
                      data-working={working}
                      data-shared={day.shared[i]}
                      data-selected={inSelection}
                      className={styles.cell}
                      aria-label={`${person.name}, ${dateLabel(t, person.zone)} ${timeLabel(t, person.zone, state.hour12)}, ${zoneLabel(t, person.zone)}, ${working ? "working hours" : "off hours"}`}
                      aria-pressed={i === selectedIndex}
                      tabIndex={i === selectedIndex ? 0 : -1}
                      title={`${timeLabel(t, person.zone, state.hour12)} · ${working ? "Working hours" : "Off hours"}`}
                      onClick={() => patch({ selected: t })}
                      onKeyDown={(e) => {
                        if (
                          ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                            e.key,
                          )
                        ) {
                          e.preventDefault();
                          const next =
                            e.key === "Home"
                              ? 0
                              : e.key === "End"
                                ? day.instants.length - 1
                                : Math.max(
                                    0,
                                    Math.min(
                                      day.instants.length - 1,
                                      i + (e.key === "ArrowRight" ? 1 : -1),
                                    ),
                                  );
                          patch({ selected: day.instants[next] });
                          const buttons =
                            e.currentTarget.parentElement?.querySelectorAll(
                              "button",
                            );
                          buttons?.[next]?.focus();
                        }
                      }}
                    >
                      {i % 4 === 0 ? (
                        <span>
                          {timeLabel(t, person.zone, state.hour12)
                            .replace(":00", "")
                            .replace(" AM", "a")
                            .replace(" PM", "p")}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className={styles.timelineRow}>
            <div className={styles.rowLabel}>
              <strong className={styles.sharedLabel}>Everyone available</strong>
              <span>{state.duration}-minute call fits</span>
            </div>
            <div className={styles.cells}>
              {day.instants.map((t, i) => (
                <button
                  key={t}
                  className={styles.overlapCell}
                  data-fits={day.fits[i]}
                  disabled={!day.fits[i]}
                  tabIndex={-1}
                  aria-label={`Select ${timeLabel(t, base.zone, state.hour12)} for everyone`}
                  onClick={() => patch({ selected: t })}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className={styles.timelineNote}>
        Arrow keys move by 15 minutes. Daylight saving is included; a day can
        have 23 or 25 hours.
      </p>

      {suggestions.length > 0 && state.people.length > 1 && (
        <div className={styles.suggestions}>
          <span>Good times in {base.name}</span>
          {suggestions.map((t) => (
            <button
              key={t}
              aria-pressed={t === selected}
              onClick={() => patch({ selected: t })}
            >
              {timeLabel(t, base.zone, state.hour12)}
            </button>
          ))}
        </div>
      )}

      {selected !== undefined ? (
        <section
          className={styles.meeting}
          aria-labelledby="selected-meeting-heading"
        >
          <div className={styles.meetingHeading}>
            <div>
              <p className={styles.kicker}>YOUR SELECTED TIME</p>
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
              {selectedFits ? "Works for everyone" : "Outside working hours"}
            </span>
          </div>
          <div className={styles.meetingPeople}>
            {state.people.map((person) => (
              <div key={person.id}>
                <span>{person.name}</span>
                <strong>
                  {timeLabel(selected, person.zone, state.hour12)} –{" "}
                  {timeLabel(
                    selected + state.duration * MINUTE,
                    person.zone,
                    state.hour12,
                  )}
                </strong>
                <small>
                  {dateLabel(selected, person.zone)}
                  {localParts(selected, person.zone).date !==
                  localParts(selected + state.duration * MINUTE, person.zone)
                    .date
                    ? ` → ${dateLabel(selected + state.duration * MINUTE, person.zone)}`
                    : ""}{" "}
                  · {zoneLabel(selected, person.zone)}
                </small>
                <span
                  className={
                    meetingFits(selected, state.duration, person)
                      ? styles.available
                      : styles.unavailable
                  }
                >
                  {meetingFits(selected, state.duration, person)
                    ? "Within working hours"
                    : "Outside working hours"}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={() =>
                void copy(
                  meetingSummary(
                    state.people,
                    selected,
                    state.duration,
                    state.hour12,
                  ),
                  "Meeting times copied.",
                )
              }
            >
              <Icon name="copy" />
              Copy meeting times
            </button>
            <button
              className={styles.button}
              onClick={() => {
                const blob = new Blob(
                  [
                    calendarFile(
                      state.people,
                      selected,
                      state.duration,
                      state.hour12,
                    ),
                  ],
                  { type: "text/calendar;charset=utf-8" },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "customer-meeting.ics";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                setNotice(
                  "Calendar file downloaded. Open it to add the meeting to your calendar.",
                );
              }}
            >
              <Icon name="calendar" />
              Download calendar event
            </button>
            <span>Copy or download, then send it to your customer.</span>
          </div>
        </section>
      ) : (
        <p className={styles.noDate}>
          This date does not exist in the reference location. Please choose
          another date.
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
        <span>
          Locations and working hours are saved in this browser. No account
          needed.
        </span>
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
