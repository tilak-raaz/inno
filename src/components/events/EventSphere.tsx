import { Planet } from "@/components/hero/Planet";
import type { InnoEvent } from "@/data/events";

/**
 * An event rendered as a body in space.
 *
 * Planets and moons reuse the hero's Planet composite, hue-rotated off its
 * native violet so every destination reads as a distinct world built from the
 * same material. Asteroids reuse the hero's exported silhouettes.
 */

/** The Figma planet sits at roughly 265deg; everything else is relative to it. */
const BASE_HUE = 265;

const ASTEROID_ART = [
  "/assets/asteroid-a-large.svg",
  "/assets/asteroid-b2.svg",
  "/assets/asteroid-c.svg",
];

export function EventSphere({
  event,
  index = 0,
  active = false,
}: {
  event: InnoEvent;
  index?: number;
  active?: boolean;
}) {
  const rotate = event.hue - BASE_HUE;

  if (event.body === "asteroid") {
    return (
      <div
        className="grid h-full w-full place-items-center"
        style={{
          filter: `hue-rotate(${rotate}deg) saturate(${active ? 1.35 : 1}) brightness(${
            active ? 1.25 : 0.95
          })`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASTEROID_ART[index % ASTEROID_ART.length]}
          alt=""
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full"
      style={{
        ["--pd" as string]: "100%",
        filter: `hue-rotate(${rotate}deg) ${
          event.body === "moon" ? "saturate(0.55) brightness(0.92)" : ""
        }`,
      }}
    >
      <Planet rings={active && event.body === "planet"} />
    </div>
  );
}
