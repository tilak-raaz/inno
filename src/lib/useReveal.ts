"use client";

import { useEffect, useRef } from "react";

/**
 * Marks descendants carrying `data-reveal` as visible once the host element
 * scrolls into view. One observer per container rather than one per node, and
 * it disconnects after firing — reveals are a one-way trip.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  rootMargin?: string;
  stagger?: number;
}) {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = "0px 0px -12% 0px", stagger = 90 } =
    options ?? {};

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const targets = host.matches("[data-reveal]")
      ? [host, ...Array.from(host.querySelectorAll<HTMLElement>("[data-reveal]"))]
      : Array.from(host.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (!targets.length) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      targets.forEach((el) => el.setAttribute("data-reveal", "in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const index = targets.indexOf(el);
          el.style.setProperty(
            "--reveal-delay",
            `${Math.max(0, index) * stagger}ms`,
          );
          el.setAttribute("data-reveal", "in");
          observer.unobserve(el);
        });
      },
      { threshold, rootMargin },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold, rootMargin, stagger]);

  return ref;
}
