"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { sponsorTiers } from "@/data/sponsors";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

/**
 * SPONSORS — a constellation rather than a logo wall.
 *
 * Tiers become shells: the title partner sits at the centre of mass, and each
 * outer shell carries a lighter tier. Lines are drawn between shells the way a
 * star chart joins a figure.
 *
 * The plates themselves stay flat and undecorated — glow lives on the border,
 * never on the mark, so a real logo dropped in here stays legible.
 */

/* Polar placement per tier, in degrees clockwise from twelve o'clock.
   The eight outer nodes sit on a 45-degree lattice, alternating between the
   two shells, so no two plates ever come within 45 degrees of each other. */
const ANGLES: number[][] = [[0], [0, 135, 225], [45, 90, 180, 270, 315]];
const RADII = [0, 0.32, 0.52];

/* Rounded to 3dp: Node and the browser serialise raw floats differently
   (66.269465723032 vs 66.26946572303201), which trips React hydration. */
const polar = (angleDeg: number, r: number) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: +(50 + Math.cos(a) * r * 100).toFixed(3),
    y: +(50 + Math.sin(a) * r * 100).toFixed(3),
  };
};

type Node = {
  name: string;
  note: string;
  href?: string;
  tier: number;
  x: number;
  y: number;
};

const NODES: Node[] = sponsorTiers.flatMap((tier, ti) =>
  tier.sponsors.map((s, si) => ({
    ...s,
    tier: ti,
    ...polar(ANGLES[ti][si] ?? si * 60, RADII[ti]),
  })),
);

/* Star-chart edges: centre to every mid node, then each mid to its neighbours
   on the outer shell. */
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 4],
  [1, 8],
  [2, 5],
  [2, 7],
  [3, 6],
  [3, 8],
  [4, 5],
  [6, 7],
];

export function Sponsors() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  /* Pointer parallax: shells drift by different amounts, so the chart gains
     depth without anything ever moving on its own. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      frame = 0;
      el.style.setProperty("--px", nx.toFixed(4));
      el.style.setProperty("--py", ny.toFixed(4));
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      nx = 0;
      ny = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <section
      id="sponsors"
      className="relative scroll-mt-24 overflow-x-clip py-24 sm:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-(--shell) px-(--gutter)">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="hud" data-reveal>
            Backed by
          </p>
          <h2 className="section-title mt-5" data-reveal>
            The constellation
          </h2>
          <p className="body-copy mt-6" data-reveal>
            Eleven partners underwrite the prize pool, the arenas and the four
            days of infrastructure it takes to run them.
          </p>
        </Reveal>

        {/* ---------------- constellation (lg and up) ---------------- */}
        <Reveal className="mt-20 hidden lg:block">
          <div
            ref={stageRef}
            data-reveal
            className="relative mx-auto aspect-7/5 w-full max-w-[760px] [--px:0] [--py:0]"
          >
            {/* shells */}
            {[0.32, 0.52].map((r, i) => (
              <div
                key={r}
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line)]"
                style={{ width: `${r * 200}%`, height: `${r * 200}%`, opacity: 0.7 - i * 0.24 }}
              />
            ))}

            {/* star-chart edges */}
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              {EDGES.map(([a, b], i) => (
                <line
                  key={i}
                  x1={NODES[a].x}
                  y1={NODES[a].y}
                  x2={NODES[b].x}
                  y2={NODES[b].y}
                  stroke="rgba(150,100,255,0.3)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* centre bloom */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                filter: "blur(50px)",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.34) 0%, rgba(124,58,237,0) 68%)",
              }}
            />

            {NODES.map((node, i) => {
              const depth = [10, 22, 34][node.tier];
              return (
                <div
                  key={node.name}
                  /* No Tailwind -translate-* here: v4 emits the `translate`
                     property, which would stack with this `transform` and
                     offset every node by an extra 50%. */
                  className="absolute w-max"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: `translate(-50%, -50%) translate(calc(var(--px) * ${depth}px), calc(var(--py) * ${depth}px))`,
                    transition: "transform 700ms var(--ease-out-cine)",
                  }}
                >
                  <SponsorPlate node={node} index={i} />
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* ---------------- tiered list (below lg) ---------------- */}
        <div className="mt-16 space-y-12 lg:hidden">
          {sponsorTiers.map((tier) => (
            <Reveal key={tier.tier} stagger={70}>
              <div className="flex items-center gap-4" data-reveal>
                <p className="hud shrink-0">{tier.tier}</p>
                <div className="rule flex-1" />
              </div>
              <div
                className={`mt-6 grid gap-3 ${
                  tier.shell === 0 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                }`}
              >
                {tier.sponsors.map((s, i) => (
                  <div key={s.name} data-reveal>
                    <SponsorPlate
                      node={{ ...s, tier: tier.shell === 0 ? 0 : 1 }}
                      index={i}
                      block
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link href="/#sponsors" className="btn-ghost">
            Partner with Innovision
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function SponsorPlate({
  node,
  index,
  block = false,
}: {
  node: { name: string; note: string; href?: string; tier: number };
  index: number;
  block?: boolean;
}) {
  const isTitle = node.tier === 0;
  const Tag = node.href ? "a" : "div";

  return (
    <Tag
      {...(node.href ? { href: node.href, target: "_blank", rel: "noreferrer noopener" } : {})}
      className={`panel panel-hover group flex flex-col items-center justify-center rounded-xl text-center ${
        block ? "w-full" : ""
      } ${
        isTitle ? "px-7 py-6" : node.tier === 1 ? "px-5 py-4" : "px-4 py-3"
      }`}
      style={
        block
          ? undefined
          : {
              animation: `inno-drift ${17 + index * 2.3}s ease-in-out ${-index * 1.7}s infinite`,
              ["--drift-y" as string]: `${index % 2 ? 7 : -7}px`,
              ["--drift-x" as string]: `${index % 3 ? -4 : 4}px`,
              ["--spin-delta" as string]: "0deg",
            }
      }
    >
      {/* Wordmark placeholder — replace with an <img>/<svg> logo per sponsor.
          Deliberately unstyled beyond type: no filters, no distortion. */}
      <span
        className={`block whitespace-nowrap font-display font-bold uppercase text-white ${
          isTitle
            ? "text-base tracking-[0.14em] sm:text-lg"
            : node.tier === 1
              ? "text-[0.8125rem] tracking-[0.12em]"
              : "text-[0.6875rem] tracking-[0.1em]"
        }`}
      >
        {node.name}
      </span>
      <span className="hud mt-2 block normal-case tracking-[0.2em] transition-colors duration-500 group-hover:text-violet-300">
        {node.note}
      </span>
    </Tag>
  );
}
