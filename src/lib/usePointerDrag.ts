"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type DragOptions = {
  /** Horizontal pixels of travel that equal one step. */
  stepDistance?: number;
  onStep: (direction: 1 | -1) => void;
};

/**
 * Pointer/touch/wheel/keyboard driver shared by the orbital carousels.
 * Returns live drag offset so callers can rubber-band their layout while the
 * pointer is down, plus the handlers to spread onto the drag surface.
 */
export function usePointerDrag({ stepDistance = 130, onStep }: DragOptions) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const consumed = useRef(0);
  const wheelLock = useRef(0);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startX.current = event.clientX;
    consumed.current = 0;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!dragging) return;
      const delta = event.clientX - startX.current - consumed.current;
      if (Math.abs(delta) >= stepDistance) {
        const direction: 1 | -1 = delta > 0 ? -1 : 1;
        consumed.current += direction === 1 ? -stepDistance : stepDistance;
        onStep(direction);
      }
      setOffset(
        Math.max(-stepDistance, Math.min(stepDistance, delta)) * 0.35,
      );
    },
    [dragging, onStep, stepDistance],
  );

  const endDrag = useCallback((event: React.PointerEvent) => {
    setDragging(false);
    setOffset(0);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const onWheel = useCallback(
    (event: React.WheelEvent) => {
      // Only hijack deliberate horizontal intent; vertical scroll stays page scroll.
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;
      const now = Date.now();
      if (now - wheelLock.current < 320) return;
      wheelLock.current = now;
      onStep(event.deltaX > 0 ? 1 : -1);
    },
    [onStep],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onStep(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onStep(-1);
      }
    },
    [onStep],
  );

  useEffect(() => {
    if (!dragging) return;
    const cancel = () => {
      setDragging(false);
      setOffset(0);
    };
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
    };
  }, [dragging]);

  return {
    offset,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerLeave: endDrag,
      onWheel,
      onKeyDown,
    },
  };
}
