"use client";

import { useEffect, useMemo, useRef, type PointerEvent } from "react";
import {
  dateLabel,
  MINUTE,
  STEP,
  timeLabel,
  zoneLabel,
  type buildDay,
  type Participant,
} from "@/lib/tools/meeting-planner/time";
import styles from "./MeetingPlanner.module.css";

type Selection = { selected: number; duration: number };
type Props = {
  day: ReturnType<typeof buildDay>;
  people: Participant[];
  selected: number;
  duration: number;
  hour12: boolean;
  fits: boolean[];
  onSelect: (selection: Selection) => void;
};

export function MeetingTimeline({
  day,
  people,
  selected,
  duration,
  hour12,
  fits,
  onSelect,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
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
  const selectedIndex = day.instants.indexOf(selected);
  const base = people[0];
  // Formatting and availability do not change while the selection moves.
  const labels = useMemo(
    () =>
      people.map((person, row) =>
        day.instants.map((t, i) => {
          const time = timeLabel(t, person.zone, hour12);
          const working = day.availability[row][i];
          return {
            title: `${time} · ${working ? "Working hours" : "Off hours"}`,
            aria: `${person.name}, ${dateLabel(t, person.zone)} ${time}, ${zoneLabel(t, person.zone)}, ${working ? "working hours" : "off hours"}`,
          };
        }),
      ),
    [day, people, hour12],
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
      cell.offsetLeft - 180 - (viewport.clientWidth - 180) / 2,
    );
  }, [day.start, base.zone]);

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
    if (!e.isPrimary || e.button !== 0 || !day.instants.length) return;
    const target = e.target as HTMLElement;
    const cell = target.closest<HTMLButtonElement>("button[data-index]");
    if (!cell) return;
    e.preventDefault();
    const anchor = Number(cell.dataset.index);
    const rect = e.currentTarget.getBoundingClientRect();
    const next = { selected: day.instants[anchor], duration };
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
        day.instants.length - 1,
        Math.floor(
          ((e.clientX - active.left) / active.width) * day.instants.length,
        ),
      ),
    );
    if (index !== active.anchor) active.moved = true;
    if (!active.moved) return;
    const first = Math.min(index, active.anchor);
    const minutes = Math.min(
      1440,
      (Math.abs(index - active.anchor) + 1) * STEP,
    );
    active.latest = { selected: day.instants[first], duration: minutes };
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
    const index = day.instants.indexOf(result.selected);
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
    if (box.left < visible.left + 180)
      viewport.scrollLeft -= visible.left + 180 - box.left;
    else if (box.right > visible.right)
      viewport.scrollLeft += box.right - visible.right;
  }

  return (
    <div
      ref={viewportRef}
      className={styles.timelineScroll}
      tabIndex={0}
      role="region"
      aria-label="Time comparison. Scroll horizontally to see the full day."
      onKeyDown={(e) => {
        if (e.key === "Escape") finish(true);
      }}
    >
      <div
        className={styles.timeline}
        style={{ minWidth: `${180 + day.instants.length * 10}px` }}
      >
        <div className={styles.axis}>
          <span>
            {base.name === "Your location"
              ? "YOUR LOCAL TIME"
              : `${base.name.toUpperCase()} TIME`}
          </span>
          <div className={styles.axisTicks}>
            {day.instants
              .filter((_, i) => i % 4 === 0)
              .map((t, i) => (
                <span
                  key={t}
                  style={{ flex: Math.min(4, day.instants.length - i * 4) }}
                >
                  {timeLabel(t, base.zone, hour12).replace(":00", "")}
                </span>
              ))}
          </div>
        </div>
        {people.map((person, row) => (
          <div className={styles.timelineRow} key={person.id}>
            <div className={styles.rowLabel}>
              <strong>{person.name}</strong>
              <span>
                {selected === undefined ? "" : dateLabel(selected, person.zone)}
              </span>
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
              {day.instants.map((t, i) => (
                <button
                  key={t}
                  data-index={i}
                  data-working={day.availability[row][i]}
                  data-shared={day.shared[i]}
                  data-selected={
                    t >= selected && t < selected + duration * MINUTE
                  }
                  className={styles.cell}
                  aria-label={labels[row][i].aria}
                  title={labels[row][i].title}
                  aria-pressed={i === selectedIndex}
                  tabIndex={i === selectedIndex ? 0 : -1}
                  onClick={(e) => {
                    if (e.detail === 0) onSelect({ selected: t, duration });
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
                          ? day.instants.length - 1
                          : Math.max(
                              0,
                              Math.min(
                                day.instants.length - 1,
                                i + (e.key === "ArrowRight" ? 1 : -1),
                              ),
                            );
                    if (
                      e.shiftKey &&
                      ["ArrowLeft", "ArrowRight"].includes(e.key)
                    ) {
                      onSelect({
                        selected,
                        duration: Math.max(
                          STEP,
                          Math.min(
                            1440,
                            duration + (e.key === "ArrowRight" ? STEP : -STEP),
                          ),
                        ),
                      });
                    } else {
                      onSelect({ selected: day.instants[next], duration });
                      const buttons =
                        e.currentTarget.parentElement?.querySelectorAll(
                          "button",
                        );
                      if (buttons?.[next]) focusCell(buttons[next]);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className={styles.timelineRow}>
          <div className={styles.rowLabel}>
            <strong className={styles.sharedLabel}>Everyone available</strong>
            <span>{duration}-minute call fits</span>
          </div>
          <div className={styles.cells}>
            {day.instants.map((t, i) => (
              <button
                key={t}
                className={styles.overlapCell}
                data-fits={fits[i]}
                disabled={!fits[i]}
                tabIndex={-1}
                aria-label={`Select ${timeLabel(t, base.zone, hour12)} for everyone`}
                onClick={() => onSelect({ selected: t, duration })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
