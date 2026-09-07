"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { schedule } from "@/data/schedule";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

/**
 * EVENT SCHEDULE — the four days plotted as stations along an orbital route.
 *
 * Scrolling traces the route: the arc draws itself and each station lights as
 * the trace reaches it. Clicking a station takes over from the scroll so the
 * section stays usable as a plain tab list — which is also what it degrades to
 * under `prefers-reduced-motion`.
 */

/* Quadratic Bézier for the route, in the SVG's 1000 x 210 viewBox. */
const P0 = { x: 34, y: 168 };
const P1 = { x: 500, y: -32 };
const P2 = { x: 966, y: 168 };
const STATION_T = [0.11, 0.37, 0.63, 0.89];

const pointAt = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
});

export function Schedule() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [manual, setManual] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      const id = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(id);
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the route enters the lower third, 1 once it is fully read.
      const raw = (vh * 0.82 - rect.top) / Math.max(1, rect.height * 0.55);
      setProgress(Math.min(1, Math.max(0, raw)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const reached = STATION_T.filter((t) => progress >= t - 0.06).length;
  const scrollActive = Math.max(0, Math.min(schedule.length - 1, reached - 1));
  const active = manual ?? scrollActive;
  const day = schedule[active];

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setManual((current) => {
      const from = current ?? 0;
      const next = e.key === "ArrowRight" ? from + 1 : from - 1;
      return Math.max(0, Math.min(schedule.length - 1, next));
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="schedule"
      className="relative scroll-mt-24 py-24 sm:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-(--shell) px-(--gutter)">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="hud" data-reveal>
              Flight plan — four days
            </p>
            <h2 className="section-title mt-5" data-reveal>
              Upcoming destinations
            </h2>
          </div>
          <Link href="/events" className="btn-ghost" data-reveal>
            Explore all events
            <span aria-hidden>↗</span>
          </Link>
        </Reveal>

        {/* ---------------- the route ---------------- */}
        <div className="relative mt-16 sm:mt-20">
          <svg
            viewBox="0 0 1000 210"
            className="h-[130px] w-full overflow-visible sm:h-[190px]"
            aria-hidden
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="route-live" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5b21b6" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            {/* dormant route */}
            <path
              d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
              fill="none"
              stroke="rgba(120,60,220,0.22)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="5 7"
            />
            {/* traced route */}
            <path
              d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
              fill="none"
              stroke="url(#route-live)"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - progress}
              style={{ transition: "stroke-dashoffset 260ms linear" }}
            />
          </svg>

          {/* stations, positioned over the arc */}
          <div
            role="tablist"
            aria-label="Festival days"
            onKeyDown={onKeyDown}
            className="absolute inset-0"
          >
            {schedule.map((stop, i) => {
              const p = pointAt(STATION_T[i]);
              const lit = progress >= STATION_T[i] - 0.06;
              const isActive = i === active;
              return (
                <button
                  key={stop.day}
                  role="tab"
                  id={`route-tab-${stop.day}`}
                  aria-selected={isActive}
                  aria-controls={`route-panel-${stop.day}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setManual(i)}
                  className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${(p.x / 1000) * 100}%`, top: `${(p.y / 210) * 100}%` }}
                >
                  <span
                    className={`relative grid place-items-center rounded-full border transition-all duration-700 ${
                      isActive
                        ? "h-12 w-12 border-[var(--violet-300)] bg-[rgba(124,58,237,0.24)] shadow-[0_0_30px_-4px_rgba(124,58,237,0.85)] sm:h-14 sm:w-14"
                        : lit
                          ? "h-9 w-9 border-[var(--line-bright)] bg-[rgba(30,17,61,0.85)] sm:h-11 sm:w-11"
                          : "h-9 w-9 border-[var(--line)] bg-[rgba(10,5,24,0.85)] sm:h-11 sm:w-11"
                    } group-hover:border-[var(--violet-300)]`}
                  >
                    <span
                      className={`font-display text-xs font-bold tabular-nums transition-colors duration-500 ${
                        isActive ? "text-white" : lit ? "text-violet-200" : "text-text-faint"
                      }`}
                    >
                      {stop.day}
                    </span>
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute inset-[-6px] rounded-full border border-[rgba(167,139,250,0.35)] animate-breathe [--breathe-dur:3.4s] [--breathe-hi:0.9] [--breathe-lo:0.15]"
                      />
                    ) : null}
                  </span>
                  <span
                    className={`mt-3 hidden whitespace-nowrap font-display text-[0.625rem] font-semibold uppercase tracking-[0.24em] transition-colors duration-500 sm:block ${
                      isActive ? "text-white" : "text-text-faint"
                    }`}
                  >
                    {stop.label}
                  </span>
                  <span className="hud mt-1 hidden whitespace-nowrap sm:block">
                    {stop.date}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- day detail ---------------- */}
        <div
          role="tabpanel"
          id={`route-panel-${day.day}`}
          aria-labelledby={`route-tab-${day.day}`}
          key={day.day}
          className="panel ticked mt-14 animate-fade-up rounded-2xl p-7 sm:mt-20 sm:p-10"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <div>
              <p className="hud">
                Day {day.day} — {day.date}
              </p>
              <h3 className="mt-3 font-display text-2xl font-black uppercase tracking-[0.1em] text-white sm:text-3xl">
                {day.label}
              </h3>
            </div>
            <p className="body-copy max-w-md sm:text-right">{day.brief}</p>
          </div>

          <ul className="mt-9 divide-y divide-[var(--line)] border-t border-[var(--line)]">
            {day.entries.map((entry) => (
              <li
                key={entry.title}
                className="group grid gap-1 py-5 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-6"
              >
                <span className="font-display text-sm font-semibold tabular-nums tracking-[0.1em] text-violet-300">
                  {entry.time}
                </span>
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors duration-400 group-hover:text-violet-200">
                    {entry.title}
                  </p>
                  <p className="mt-1.5 text-sm text-text-muted">{entry.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
