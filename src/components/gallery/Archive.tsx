"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArchivePlate } from "./ArchivePlate";
import { captures, galleryYears } from "@/data/gallery";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

/**
 * GALLERY — mission archives.
 *
 * A horizontal reel rather than a grid: frames sit at slightly different
 * depths and drift as the reel moves, which is what makes it read as an
 * archive rack instead of a photo wall. It is a native scroller underneath,
 * so trackpads, touch, scrollbars and Tab all work without special-casing.
 */

const RATIO = {
  portrait: "aspect-[3/4] w-[62vw] sm:w-[300px]",
  landscape: "aspect-[4/3] w-[80vw] sm:w-[440px]",
  square: "aspect-square w-[70vw] sm:w-[340px]",
} as const;

export function Archive() {
  const [year, setYear] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const reduced = usePrefersReducedMotion();

  const list = useMemo(
    () => (year === "All" ? captures : captures.filter((c) => String(c.year) === year)),
    [year],
  );

  /* Parallax: each frame lifts a little as it crosses the middle of the rail. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = rail.clientWidth / 2;
      for (const child of Array.from(rail.children) as HTMLElement[]) {
        const c = child.offsetLeft - rail.scrollLeft + child.offsetWidth / 2;
        const d = Math.max(-1, Math.min(1, (c - mid) / mid));
        child.style.setProperty("--lift", `${(1 - Math.abs(d)) * -14}px`);
        child.style.setProperty("--dim", String(0.55 + (1 - Math.abs(d)) * 0.45));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    rail.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced, list]);

  const nudge = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * Math.min(520, rail.clientWidth * 0.8), behavior: "smooth" });
  };

  const move = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) => (i === null ? null : (i + dir + list.length) % list.length)),
    [list.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, move]);

  return (
    <>
      <div className="mx-auto max-w-(--shell) px-(--gutter)">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div role="group" aria-label="Filter by year" className="flex flex-wrap gap-2">
            {galleryYears.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                aria-pressed={year === y}
                className={`rounded-full border px-4 py-2 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.18em] transition-all duration-400 ${
                  year === y
                    ? "border-[var(--violet-300)] bg-[rgba(124,58,237,0.22)] text-white"
                    : "border-[var(--line)] text-text-muted hover:border-[var(--line-bright)] hover:text-white"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nudge(-1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] text-text-soft transition-colors duration-400 hover:border-[var(--line-bright)] hover:text-white"
            >
              <span className="sr-only">Scroll archive left</span>
              <span aria-hidden>←</span>
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] text-text-soft transition-colors duration-400 hover:border-[var(--line-bright)] hover:text-white"
            >
              <span className="sr-only">Scroll archive right</span>
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- the reel ---------------- */}
      <ul
        ref={railRef}
        className="archive-rail mt-12 flex snap-x snap-mandatory items-end gap-5 overflow-x-auto px-(--gutter) pb-10 pt-6 sm:gap-8"
      >
        {list.map((c, i) => (
          <li
            key={c.id}
            className="archive-frame snap-center"
            style={{ ["--lift" as string]: "0px", ["--dim" as string]: "1" }}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              className={`group relative block shrink-0 overflow-hidden rounded-xl border border-[var(--line)] ${RATIO[c.ratio]}`}
            >
              <ArchivePlate capture={c} />
              <span className="absolute inset-x-0 bottom-0 p-4 text-left sm:p-5">
                <span className="hud block">
                  {c.year} · {c.tag}
                </span>
                <span className="mt-2 block font-display text-sm font-bold uppercase tracking-[0.1em] text-white">
                  {c.title}
                </span>
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-500 group-hover:border-[var(--line-bright)]"
              />
            </button>
          </li>
        ))}
      </ul>

      <p className="hud mt-2 text-center">
        {list.length} frames · drag or scroll the reel · select to enlarge
      </p>

      {/* ---------------- viewer ---------------- */}
      {open !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={list[open].title}
          className="fixed inset-0 z-[60] flex flex-col bg-[rgba(4,2,10,0.94)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4 px-(--gutter) py-5">
            <p className="hud">
              {list[open].year} · {list[open].tag} · {open + 1} / {list.length}
            </p>
            <button
              type="button"
              onClick={() => setOpen(null)}
              autoFocus
              className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] text-text-soft transition-colors hover:border-[var(--line-bright)] hover:text-white"
            >
              <span className="sr-only">Close viewer</span>
              <span aria-hidden>✕</span>
            </button>
          </div>

          <div className="flex flex-1 items-center gap-4 px-(--gutter) pb-4 sm:gap-8">
            <button
              type="button"
              onClick={() => move(-1)}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--line)] text-text-soft transition-colors hover:border-[var(--line-bright)] hover:text-white"
            >
              <span className="sr-only">Previous frame</span>
              <span aria-hidden>←</span>
            </button>
            <figure
              key={list[open].id}
              className="mx-auto flex h-full max-h-[72vh] w-full max-w-4xl animate-fade-up flex-col"
            >
              <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--line)]">
                <ArchivePlate capture={list[open]} />
              </div>
              <figcaption className="mt-5 text-center">
                <p className="font-display text-base font-bold uppercase tracking-[0.12em] text-white">
                  {list[open].title}
                </p>
                <p className="body-copy mt-2">{list[open].caption}</p>
              </figcaption>
            </figure>
            <button
              type="button"
              onClick={() => move(1)}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--line)] text-text-soft transition-colors hover:border-[var(--line-bright)] hover:text-white"
            >
              <span className="sr-only">Next frame</span>
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
