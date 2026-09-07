"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { EventSphere } from "@/components/events/EventSphere";
import { events as ALL_EVENTS, eventCategories } from "@/data/events";
import { usePointerDrag } from "@/lib/usePointerDrag";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

/**
 * EVENT EXPLORER — the catalogue as a system of bodies.
 *
 * The selected event holds the centre; the rest ride an ellipse around it.
 * Advancing rotates the whole system by one slot, so browsing feels like
 * turning a planetarium rather than paging a grid.
 *
 * Every body is a real <button> with an accessible name, the readout is a
 * live region, and arrow keys work — the orbit is a presentation of a list,
 * not a replacement for one.
 */

/* Ellipse radii, in cqw of the stage. ry < rx reads as a tilted orbit. */
const RX = 41;
const RY = 30;

export function EventExplorer() {
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();

  const list = useMemo(
    () =>
      category === "All"
        ? ALL_EVENTS
        : ALL_EVENTS.filter((e) => e.category === category),
    [category],
  );

  // Snap back to the first result when the filter changes — during render, so
  // the orbit never shows a body that is no longer in the list.
  const [lastCategory, setLastCategory] = useState(category);
  if (lastCategory !== category) {
    setLastCategory(category);
    setActive(0);
  }

  const step = useCallback(
    (dir: 1 | -1) =>
      setActive((i) => (i + dir + list.length) % list.length),
    [list.length],
  );

  const { offset, dragging, handlers } = usePointerDrag({ onStep: step });

  const current = list[active];
  const count = list.length;

  return (
    <div className="mx-auto max-w-(--shell) px-(--gutter)">
      {/* ---------------- filters ---------------- */}
      <div
        role="group"
        aria-label="Filter events by category"
        className="flex flex-wrap gap-2"
      >
        {eventCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-full border px-4 py-2 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.18em] transition-all duration-400 ${
              category === c
                ? "border-[var(--violet-300)] bg-[rgba(124,58,237,0.22)] text-white"
                : "border-[var(--line)] text-text-muted hover:border-[var(--line-bright)] hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-center lg:gap-16">
        {/* ---------------- orbit stage ---------------- */}
        <div className="order-1 lg:order-2">
          <div
            {...handlers}
            role="listbox"
            aria-label="Events in orbit"
            aria-activedescendant={`body-${current.id}`}
            tabIndex={0}
            className={`orbit-stage relative mx-auto aspect-square w-full max-w-[600px] touch-pan-y select-none rounded-full ${
              dragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ ["--drag" as string]: `${offset}px` }}
          >
            {/* orbit guide */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[var(--line)]"
              style={{ width: `${RX * 2}cqw`, height: `${RY * 2}cqw` }}
            />
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[52cqw] w-[52cqw] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                filter: "blur(46px)",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.3) 0%, rgba(124,58,237,0) 70%)",
              }}
            />

            {list.map((event, i) => {
              const slot = (i - active + count) % count;
              const isActive = slot === 0;
              // ring slots start at the top and run clockwise
              const a =
                count > 1
                  ? (-90 + ((slot - 1) * 360) / (count - 1)) * (Math.PI / 180)
                  : 0;
              const dx = isActive ? 0 : RX * Math.cos(a);
              const dy = isActive ? 0 : RY * Math.sin(a);
              // bodies at the front of the ellipse read as nearer
              const depth = isActive ? 1 : 0.62 + 0.38 * ((Math.sin(a) + 1) / 2);
              const base = isActive ? 34 : 12.5 * event.mass;

              return (
                <button
                  key={event.id}
                  id={`body-${event.id}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className="orbit-body absolute left-1/2 top-1/2 rounded-full focus-visible:outline-offset-8"
                  style={{
                    width: `${base}cqw`,
                    height: `${base}cqw`,
                    transform: `translate(-50%, -50%) translate(${dx}cqw, ${dy}cqw) scale(${depth})`,
                    zIndex: isActive ? 20 : Math.round(depth * 10),
                    opacity: isActive ? 1 : 0.45 + depth * 0.5,
                    transition: reduced
                      ? "none"
                      : "transform 900ms var(--ease-out-cine), opacity 700ms var(--ease-out-cine)",
                  }}
                >
                  <span className="sr-only">
                    {event.name} — {event.category}, day {event.day}
                  </span>
                  <span
                    aria-hidden
                    className={`block h-full w-full ${
                      isActive
                        ? "animate-drift [--drift-dur:16s] [--drift-y:-6px] [--spin-delta:0deg]"
                        : ""
                    }`}
                  >
                    <EventSphere event={event} index={i} active={isActive} />
                  </span>
                  {!isActive ? (
                    <span
                      aria-hidden
                      className="orbit-tip pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap font-display text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-text-faint"
                    >
                      {event.code}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* transport */}
          <div className="mt-8 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => step(-1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] text-text-soft transition-colors duration-400 hover:border-[var(--line-bright)] hover:text-white"
            >
              <span className="sr-only">Previous event</span>
              <span aria-hidden>←</span>
            </button>
            <p className="hud tabular-nums">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={() => step(1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] text-text-soft transition-colors duration-400 hover:border-[var(--line-bright)] hover:text-white"
            >
              <span className="sr-only">Next event</span>
              <span aria-hidden>→</span>
            </button>
          </div>
          <p className="hud mt-4 text-center">Drag, scroll or use arrow keys</p>
        </div>

        {/* ---------------- readout ---------------- */}
        <div
          className="order-2 lg:order-1"
          aria-live="polite"
          aria-atomic="true"
        >
          <div key={current.id} className="animate-fade-up">
            <div className="flex items-center gap-4">
              <span className="font-display text-xs font-bold tracking-[0.3em] text-violet-400">
                {current.code}
              </span>
              <div className="rule flex-1" />
              <span className="hud">{current.category}</span>
            </div>

            <h2 className="section-title mt-6">{current.name}</h2>
            <p className="mt-4 font-display text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
              {current.tagline}
            </p>
            <p className="body-copy mt-6 max-w-xl">{current.description}</p>

            <dl className="mt-9 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line-soft)] sm:grid-cols-2">
              {[
                { k: "Day", v: `Day ${current.day} — ${current.time}` },
                { k: "Venue", v: current.venue },
                { k: "Prize pool", v: current.prize },
                { k: "Team size", v: current.team },
              ].map((row) => (
                <div key={row.k} className="bg-[rgba(10,5,24,0.72)] px-5 py-4">
                  <dt className="hud">{row.k}</dt>
                  <dd className="mt-2 text-sm text-text">{row.v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary px-6 py-3.5 text-[0.8125rem]">
                Register for {current.name}
              </Link>
              <Link href="/#schedule" className="btn-ghost">
                Full schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
