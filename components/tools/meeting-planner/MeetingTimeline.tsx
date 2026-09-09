"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  dateLabel,
  localParts,
  MINUTE,
  STEP,
  timeLabel,
  zoneLabel,
  type buildDay,
  type Participant,
} from "@/lib/tools/meeting-planner/time";
import styles from "./MeetingPlanner.module.css";

// Keep the calculation engine at 15 minutes for quarter-hour zones and existing shared plans.
export const SELECTION_STEP = 30;
const STRIDE = SELECTION_STEP / STEP;

type Selection = { selected: number; duration: number };
type Props = {
  day: ReturnType<typeof buildDay>;
  people: Participant[];
  selected: number;
  duration: number;
  hour12: boolean;
  onSelect: (selection: Selection) => void;
  renderLocation: (person: Participant) => ReactNode;
};

export function MeetingTimeline({
  day,
  people,
  selected,
  duration,
  hour12,
  onSelect,
  renderLocation,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ left: 0, width: 0, cityWidth: 240 });
  const frame = useRef<number | null>(null);
  const pending = useRef<Selection | null>(null);
  const drag = useRef<{
    element: HTMLDivElement;
    pointer: number;
    anchor: number;
    left: number;
    width: number;
    before: Selection;
    latest: Selection;
    moved: boolean;
  } | null>(null);
  const slots = useMemo(
    () => day.instants.filter((_, i) => i % STRIDE === 0),
    [day],
  );
  const selectedIndex = Math.floor(
    (selected - day.start) / (SELECTION_STEP * MINUTE),
  );
  const nextDuration = Math.max(
    SELECTION_STEP,
    Math.ceil(duration / SELECTION_STEP) * SELECTION_STEP,
  );
  const end = selected + duration * MINUTE;
  const selectionLeft = ((selected - day.start) / (day.end - day.start)) * 100;
  const selectionWidth =
    ((Math.min(end, day.end) - selected) / (day.end - day.start)) * 100;
  const clock = (t: number, zone: string) =>
    timeLabel(t, zone, hour12)
      .replace(/:00(?= )/, "")
      .replace(" AM", "am")
      .replace(" PM", "pm");
  const base = people[0];
  // Formatting and availability do not change while the selection moves.
  const labels = useMemo(
    () =>
      people.map((person, row) =>
        slots.map((t, i) => {
          const time = timeLabel(t, person.zone, hour12);
          const working = day.availability[row]
            .slice(i * STRIDE, (i + 1) * STRIDE)
            .every(Boolean);
          return {
            clock: clock(t, person.zone),
            working,
            title: `${time} · ${working ? "Working hours" : "Off hours"}`,
            aria: `${person.name}, ${dateLabel(t, person.zone)} ${time}, ${zoneLabel(t, person.zone)}, ${working ? "working hours" : "off hours"}`,
          };
        }),
      ),
    [day, people, hour12, slots],
  );

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  // Center once when a different day/zone opens, never in response to dragging.
  useEffect(() => {
    const viewport = viewportRef.current;
    const cell = viewport?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!viewport || !cell) return;
    viewport.scrollLeft = Math.max(
      0,
      cell.getBoundingClientRect().left -
        viewport.getBoundingClientRect().left +
        viewport.scrollLeft -
        labelWidth(viewport) -
        (viewport.clientWidth - labelWidth(viewport) - cell.offsetWidth) / 2,
    );
  }, [day.start, base.zone]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(measureViewport);
    observer.observe(viewport);
    measureViewport();
    return () => observer.disconnect();
  }, []);

  function measureViewport() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = {
      left: viewport.scrollLeft,
      width: viewport.clientWidth,
      cityWidth: labelWidth(viewport),
    };
    setView((before) =>
      before.left === next.left &&
      before.width === next.width &&
      before.cityWidth === next.cityWidth
        ? before
        : next,
    );
  }

  function labelWidth(viewport: HTMLElement) {
    return (
      viewport.querySelector<HTMLElement>(`[data-city-label]`)?.offsetWidth ??
      240
    );
  }

  function queue(selection: Selection) {
    pending.current = selection;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (pending.current) onSelect(pending.current);
      pending.current = null;
    });
  }

  function pointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!e.isPrimary || e.button !== 0 || !slots.length) return;
    const target = e.target as HTMLElement;
    const cell = target.closest<HTMLButtonElement>("button[data-index]");
    if (!cell) return;
    e.preventDefault();
    const anchor = Number(cell.dataset.index);
    const rect = e.currentTarget.getBoundingClientRect();
    const next = { selected: slots[anchor], duration: nextDuration };
    drag.current = {
      element: e.currentTarget,
      pointer: e.pointerId,
      anchor,
      left: rect.left,
      width: rect.width,
      before: { selected, duration },
      latest: next,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    cell.focus({ preventScroll: true });
    onSelect(next);
  }

  function pointerMove(e: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || active.pointer !== e.pointerId) return;
    const index = Math.max(
      0,
      Math.min(
        slots.length - 1,
        Math.floor(((e.clientX - active.left) / active.width) * slots.length),
      ),
    );
    if (index !== active.anchor) active.moved = true;
    if (!active.moved) return;
    const first = Math.min(index, active.anchor);
    const minutes = Math.min(
      1440,
      (Math.abs(index - active.anchor) + 1) * SELECTION_STEP,
    );
    active.latest = { selected: slots[first], duration: minutes };
    queue(active.latest);
  }

  function finish(cancel = false) {
    const active = drag.current;
    if (!active) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    pending.current = null;
    drag.current = null;
    const result = cancel ? active.before : active.latest;
    onSelect(result);
    const index = Math.floor(
      (result.selected - day.start) / (SELECTION_STEP * MINUTE),
    );
    active.element
      .querySelector<HTMLButtonElement>(`[data-index="${index}"]`)
      ?.focus({ preventScroll: true });
  }

  function focusCell(cell: HTMLButtonElement) {
    cell.focus({ preventScroll: true });
    const viewport = viewportRef.current;
    if (!viewport) return;
    const box = cell.getBoundingClientRect();
    const visible = viewport.getBoundingClientRect();
    if (box.left < visible.left + labelWidth(viewport))
      viewport.scrollLeft -= visible.left + labelWidth(viewport) - box.left;
    else if (box.right > visible.right)
      viewport.scrollLeft += box.right - visible.right;
  }

  return (
    <div
      ref={viewportRef}
      className={styles.timelineScroll}
      onScroll={measureViewport}
      tabIndex={0}
      role="region"
      aria-label="Time comparison. Scroll horizontally to see the full day."
      onKeyDown={(e) => {
        if (e.key === "Escape") finish(true);
      }}
    >
      <div
        className={styles.timeline}
        style={{ minWidth: `calc(var(--city-width) + ${slots.length * 26}px)` }}
      >
        {people.map((person, row) => (
          <div className={styles.timelineRow} key={person.id}>
            <div className={styles.rowLabel} data-city-label>
              {renderLocation(person)}
            </div>
            <div
              className={styles.cells}
              role="group"
              aria-label={`${person.name} timeline`}
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={() => finish()}
              onPointerCancel={() => finish(true)}
              onLostPointerCapture={() => finish()}
            >
              {slots.map((t, i) => (
                <button
                  key={t}
                  data-index={i}
                  data-working={labels[row][i].working}
                  data-shared={day.shared
                    .slice(i * STRIDE, (i + 1) * STRIDE)
                    .every(Boolean)}
                  data-selected={
                    t >= selected && t < selected + duration * MINUTE
                  }
                  className={styles.cell}
                  aria-label={labels[row][i].aria}
                  title={labels[row][i].title}
                  aria-pressed={i === selectedIndex}
                  tabIndex={i === selectedIndex ? 0 : -1}
                  onClick={(e) => {
                    if (e.detail === 0)
                      onSelect({ selected: t, duration: nextDuration });
                  }}
                  onKeyDown={(e) => {
                    if (
                      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        e.key,
                      )
                    )
                      return;
                    e.preventDefault();
                    const next =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? slots.length - 1
                          : Math.max(
                              0,
                              Math.min(
                                slots.length - 1,
                                i +
                                  (e.key === "ArrowRight"
                                    ? 1
                                    : selected !== slots[i]
                                      ? 0
                                      : -1),
                              ),
                            );
                    if (
                      e.shiftKey &&
                      ["ArrowLeft", "ArrowRight"].includes(e.key)
                    ) {
                      onSelect({
                        selected: slots[selectedIndex],
                        duration: Math.max(
                          SELECTION_STEP,
                          Math.min(
                            1440,
                            nextDuration +
                              (e.key === "ArrowRight"
                                ? SELECTION_STEP
                                : -SELECTION_STEP),
                          ),
                        ),
                      });
                    } else {
                      onSelect({
                        selected: slots[next],
                        duration: nextDuration,
                      });
                      const buttons =
                        e.currentTarget.parentElement?.querySelectorAll(
                          "button",
                        );
                      if (buttons?.[next]) focusCell(buttons[next]);
                    }
                  }}
                >
                  {i % 2 === 0 && !(t < end && t + 60 * MINUTE > selected) && (
                    <span className={styles.cellTime} aria-hidden="true">
                      {labels[row][i].clock}
                    </span>
                  )}
                </button>
              ))}
              {Number.isFinite(selected) && (
                <>
                  <div
                    className={styles.selectionFill}
                    style={{
                      left: `${selectionLeft}%`,
                      width: `${selectionWidth}%`,
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className={styles.selectionLabel}
                    aria-label={`Selected time in ${person.name}`}
                    title={`${dateLabel(selected, person.zone)} ${timeLabel(selected, person.zone, hour12)} ${zoneLabel(selected, person.zone)} – ${dateLabel(end, person.zone)} ${timeLabel(end, person.zone, hour12)} ${zoneLabel(end, person.zone)}`}
                    style={{
                      left: view.width
                        ? `clamp(${view.left + Math.min(85, (view.width - view.cityWidth) / 2)}px, ${selectionLeft + selectionWidth / 2}%, ${view.left + view.width - view.cityWidth - Math.min(85, (view.width - view.cityWidth) / 2)}px)`
                        : `${selectionLeft + selectionWidth / 2}%`,
                      maxWidth: view.width
                        ? `${view.width - view.cityWidth - 8}px`
                        : undefined,
                    }}
                  >
                    {localParts(selected, person.zone).date !==
                      localParts(selected, base.zone).date && (
                      <small>
                        {dateLabel(selected, person.zone).replace(/^\w+, /, "")}{" "}
                        ·{" "}
                      </small>
                    )}
                    {clock(selected, person.zone)} – {clock(end, person.zone)}
                    {localParts(selected, person.zone).date !==
                      localParts(end, person.zone).date && (
                      <small>
                        {" "}
                        · {dateLabel(end, person.zone).replace(/^\w+, /, "")}
                      </small>
                    )}
                    {zoneLabel(selected, person.zone) !==
                      zoneLabel(end, person.zone) && (
                      <small>
                        {" "}
                        · {zoneLabel(selected, person.zone)} →{" "}
                        {zoneLabel(end, person.zone)}
                      </small>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
