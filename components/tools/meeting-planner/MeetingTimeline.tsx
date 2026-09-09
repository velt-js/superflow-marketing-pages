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
  revealSelection: number;
  day: ReturnType<typeof buildDay>;
  people: Participant[];
  selected: number;
  duration: number;
  hour12: boolean;
  onSelect: (selection: Selection) => void;
  renderLocation: (person: Participant) => ReactNode;
};

export function MeetingTimeline({
  revealSelection,
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
    action: "create" | "move" | "start" | "end";
    startX: number;
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
          const minute = localParts(t, person.zone).minute;
          const daytime = minute >= 6 * 60 && minute < 18 * 60;
          return {
            daytime,
            clock: clock(t, person.zone),
            working,
            title: `${time} · ${daytime ? "Day" : "Night"} · ${working ? "Working hours" : "Off hours"}`,
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

  // Center on a new day/zone or an explicit suggestion, never while dragging.
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
  }, [day.start, base.zone, revealSelection]);

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

  function changeRange(
    before: Selection,
    action: "move" | "start" | "end",
    delta: number,
  ): Selection {
    const step = SELECTION_STEP * MINUTE;
    if (action === "move") {
      return {
        selected: Math.max(
          day.start,
          Math.min(slots[slots.length - 1], before.selected + delta * step),
        ),
        duration: before.duration,
      };
    }
    const beforeEnd = before.selected + before.duration * MINUTE;
    if (action === "start") {
      const start = Math.max(
        day.start,
        beforeEnd - 1440 * MINUTE,
        Math.min(beforeEnd - step, before.selected + delta * step),
      );
      return { selected: start, duration: (beforeEnd - start) / MINUTE };
    }
    return {
      selected: before.selected,
      duration: Math.max(
        SELECTION_STEP,
        Math.min(1440, before.duration + delta * SELECTION_STEP),
      ),
    };
  }

  function pointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!e.isPrimary || e.button !== 0 || !slots.length) return;
    const target = e.target as HTMLElement;
    const control = target.closest<HTMLElement>("[data-range-action]");
    const cell = target.closest<HTMLButtonElement>("button[data-index]");
    if (!cell && !control) return;
    // A touch swipe pans the day; a tap selects a slot through onClick.
    // Only the selection and its handles capture touch dragging.
    if (e.pointerType === "touch" && !control) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const action = control
      ? (control.dataset.rangeAction as "move" | "start" | "end")
      : "create";
    drag.current = {
      element: e.currentTarget,
      pointer: e.pointerId,
      anchor: cell ? Number(cell.dataset.index) : selectedIndex,
      action,
      startX: e.clientX,
      left: rect.left,
      width: rect.width,
      before: { selected, duration },
      latest: { selected, duration },
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    (cell ?? control)?.focus({ preventScroll: true });
  }

  function pointerMove(e: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || active.pointer !== e.pointerId) return;
    // Normal click jitter must never move or resize an existing selection.
    if (!active.moved && Math.abs(e.clientX - active.startX) < 6) return;
    active.moved = true;
    if (active.action === "create") {
      const index = Math.max(
        0,
        Math.min(
          slots.length - 1,
          Math.floor(((e.clientX - active.left) / active.width) * slots.length),
        ),
      );
      active.latest = {
        selected: slots[Math.min(index, active.anchor)],
        duration: Math.min(
          1440,
          (Math.abs(index - active.anchor) + 1) * SELECTION_STEP,
        ),
      };
    } else {
      const delta = Math.round(
        ((e.clientX - active.startX) / active.width) * slots.length,
      );
      active.latest = changeRange(active.before, active.action, delta);
    }
    queue(active.latest);
  }

  function finish(cancel = false) {
    const active = drag.current;
    if (!active) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    pending.current = null;
    drag.current = null;
    const result = cancel
      ? active.before
      : !active.moved && active.action === "create"
        ? { selected: slots[active.anchor], duration: SELECTION_STEP }
        : active.latest;
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
      aria-describedby="meeting-selection-help"
      onKeyDown={(e) => {
        if (e.key === "Escape") finish(true);
      }}
    >
      <div
        className={styles.timeline}
        style={{ minWidth: `calc(var(--city-width) + ${slots.length * 36}px)` }}
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
                  data-period={labels[row][i].daytime ? "day" : "night"}
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
                  onClick={() => {
                    if (!(t >= selected && t < end))
                      onSelect({ selected: t, duration: SELECTION_STEP });
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
                        selected,
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
                        e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                          "button[data-index]",
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
                  >
                    {(["move", "start", "end"] as const).map((action) => (
                      <button
                        key={action}
                        data-range-action={action}
                        className={
                          action === "move"
                            ? styles.rangeMove
                            : styles.rangeEdge
                        }
                        data-edge={action}
                        aria-label={`${action === "move" ? "Move meeting" : `Resize ${action}`} in ${person.name}`}
                        title={
                          action === "move"
                            ? "Drag to move"
                            : `Drag to change ${action} time`
                        }
                        onKeyDown={(e) => {
                          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight")
                            return;
                          e.preventDefault();
                          e.stopPropagation();
                          onSelect(
                            changeRange(
                              { selected, duration },
                              action,
                              e.key === "ArrowRight" ? 1 : -1,
                            ),
                          );
                        }}
                      />
                    ))}
                  </div>
                  <div
                    className={styles.selectionLabel}
                    data-range-action="move"
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
