"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query subscription.
 *
 * useSyncExternalStore rather than useState + useEffect: the match is external
 * state, so reading it during render (and re-reading on change) avoids the
 * extra render pass a state-in-effect seed would cause.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false, // the server has no viewport; assume "no match"
  );
}

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
