import { Planet } from "@/components/hero/Planet";
import { Reveal } from "./Reveal";

/**
 * Shared header for every interior page.
 *
 * It reuses the hero's Planet, but clipped to a shallow cap at the foot of the
 * header — the same body, seen from much closer, rising into frame. That one
 * decision is what keeps six pages reading as one place. Everything above the
 * limb stays on plain ink so the type never fights an image.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  meta,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  meta?: { label: string; value: string }[];
}) {
  return (
    <header className="relative isolate pb-24 pt-(--nav-h) sm:pb-32">
      <Reveal className="relative z-10 mx-auto max-w-(--shell) px-(--gutter) pt-20 sm:pt-28">
        <p className="hud" data-reveal>
          {eyebrow}
        </p>
        <h1 className="section-title mt-5 max-w-4xl" data-reveal>
          {title}
        </h1>
        <p className="body-copy mt-6 max-w-2xl" data-reveal>
          {lead}
        </p>

        {meta?.length ? (
          <dl
            className="mt-12 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line-soft)] sm:grid-cols-4"
            data-reveal
          >
            {meta.map((m) => (
              <div key={m.label} className="bg-[rgba(10,5,24,0.78)] px-5 py-4">
                <dt className="hud">{m.label}</dt>
                <dd className="mt-2 font-display text-sm font-semibold tracking-[0.06em] text-white">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Reveal>

      <PlanetLimb />
    </header>
  );
}

/**
 * The top cap of a very large sphere, clipped to a shallow band. Reused by the
 * interior page headers and available to any section that needs the horizon.
 */
export function PlanetLimb({ height = 215 }: { height?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      style={{ height }}
    >
      {/* violet rim burning along the limb — Figma 4:161, flattened */}
      <div
        className="absolute inset-x-[-15%] bottom-0 h-[240px]"
        style={{
          filter: "blur(46px)",
          backgroundImage:
            "radial-gradient(ellipse 55% 62% at 50% 100%, rgba(160,40,255,0.42) 0%, rgba(100,20,190,0.2) 40%, rgba(80,10,160,0) 74%)",
        }}
      />
      <div
        className="absolute left-1/2 top-0 aspect-square w-[1500px] max-w-none -translate-x-1/2 opacity-90"
        style={{ ["--pd" as string]: "1500px" }}
      >
        <Planet />
      </div>
      {/* keep the violet rim crisp, dissolve the surface into the page */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(6,3,14,0) 0%, rgba(6,3,14,0.3) 52%, rgba(6,3,14,0.86) 86%, #06030e 100%)",
        }}
      />
    </div>
  );
}
