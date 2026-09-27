"use client";

import Link from "next/link";
import { Planet } from "./Planet";

/**
 * HERO — a 1:1 reconstruction of Figma node 4:145.
 *
 * The design is authored on a 1728 x 1077.742 stage with everything absolutely
 * placed. Rather than approximate it, the stage is reproduced literally: every
 * offset below is the Figma value multiplied by `--fu`, the stage unit defined
 * by `.hero` (exactly 1 at a 1728px-wide viewport). Two things deliberately do
 * *not* scale linearly — the headline and the CTA label — because pure scaling
 * makes them illegible on a phone; both fall back to a fitted size in CSS.
 */

/* The stage itself (1728 x 1077.742) is sized in CSS by `.hero-stage`. */

/** Figma px -> stage length. */
const u = (n: number) => `calc(${n} * var(--fu))`;

/* Vertical centres of the type stack, derived from Figma 4:215:
   heading  332.601 + 64.832 + 155/2                     = 474.93
   "2026"   332.601 + 219.832 + 18.063 + 87.088/2        = 614.04
   button   332.601 + 346.271 + 67.09/2                  = 712.42 */
const Y_TITLE = 474.93;
const Y_YEAR = 614.04;
const Y_CTA = 712.42;

const ASTEROIDS = [
  // 4:166 — small, upper right
  { src: "/assets/asteroid-b.svg", left: 1309.06, top: 110.75, boxW: 75.776, boxH: 69.262, w: 70.961, h: 63.865, spin: 4.52, driftX: 8, driftY: -16, dur: 17, delay: -3, flip: false },
  // 4:173 — smallest, upper left of the planet
  { src: "/assets/asteroid-c.svg", left: 311.02, top: 193.59, boxW: 64.51, boxH: 48.382, w: 64.51, h: 48.382, spin: 0, driftX: -7, driftY: 13, dur: 21, delay: -9, flip: false },
  // 4:181 — mid, far left
  { src: "/assets/asteroid-b2.svg", left: 46.1, top: 276.61, boxW: 153.388, boxH: 140.604, w: 141.921, h: 127.729, spin: 5.44, driftX: 10, driftY: -20, dur: 24, delay: -6, flip: false },
  // 4:188 — mid, far right
  { src: "/assets/asteroid-a.svg", left: 1542, top: 340.22, boxW: 117.632, boxH: 100.486, w: 116.117, h: 98.7, spin: -0.89, driftX: -9, driftY: 17, dur: 19, delay: -12, flip: false },
  // 4:205 — foreground, bottom right
  { src: "/assets/asteroid-a-large.svg", left: 1328, top: 787, boxW: 446.676, boxH: 384.373, w: 432.617, h: 367.724, spin: -2.24, driftX: -6, driftY: -11, dur: 27, delay: -4, flip: false },
  // 4:256 — foreground, bottom left (mirrored copy of 4:205)
  { src: "/assets/asteroid-a-large.svg", left: 0.32, top: 787, boxW: 446.676, boxH: 384.373, w: 432.617, h: 367.724, spin: -177.76, driftX: 6, driftY: 11, dur: 30, delay: -15, flip: true },
];

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section
      className="hero relative isolate flex min-h-svh w-full items-center justify-center overflow-clip bg-transparent"
      aria-labelledby="hero-title"
    >
      {/* ---------- atmosphere layer (non-interactive) ---------- */}
      <div className="hero-stage pointer-events-none">
        {/* Abstract Geometric HUD / Tech element - non AI, code generated */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 mix-blend-screen"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="380" stroke="#7c3aed" strokeWidth="2" strokeDasharray="10 20"/>
            <circle cx="400" cy="400" r="300" stroke="#c4b5fd" strokeWidth="1" strokeDasharray="5 50"/>
            <path d="M400 0L400 800M0 400L800 400" stroke="#a78bfa" strokeWidth="1" opacity="0.3"/>
            <rect x="250" y="250" width="300" height="300" stroke="#5b21b6" strokeWidth="2" strokeDasharray="2 10" fill="none"/>
          </svg>
        </motion.div>

        {/* planet stack, 4:147 – 4:160, centred on Figma (864, 418.94) */}
        <motion.div
          className="absolute"
          style={{
            left: u(864),
            top: u(418.94),
            ["--pd" as string]: u(1161.175),
          }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Planet
            rings
            className="hero-planet animate-breathe [--breathe-dur:12s] [--breathe-hi:1] [--breathe-lo:0.93]"
          />
        </motion.div>

        {/* 4:161 — violet limb burning along the planet's lower edge */}
        <div
          className="absolute"
          style={{
            left: u(-172.67),
            top: u(629.15),
            width: u(2073.342),
            height: u(509.184),
            opacity: 0.92,
            filter: `blur(${u(39.654)})`,
            backgroundImage:
              "radial-gradient(ellipse 94.34% 94.34% at 50% 80%, rgba(160,40,255,0.7) 0%, rgba(144,32,233,0.575) 12.5%, rgba(120,20,200,0.45) 25%, rgba(108,17,188,0.325) 37.5%, rgba(80,10,160,0.2) 50%, rgba(80,10,160,0) 72%)",
          }}
        />

        {/* 4:164 / 4:255 — horizon flares, additive */}
        <div
          className="hero-horizon hero-horizon-right absolute mix-blend-plus-lighter"
          style={{
            left: u(950.39),
            top: u(738.26),
            width: u(864),
            height: u(387.972),
            filter: `blur(${u(51.608)})`,
            backgroundImage:
              "radial-gradient(ellipse 70.71% 70.71% at 50% 50%, rgb(187,171,208) 0%, rgba(146,110,181,0.5) 32.5%, rgba(104,49,153,0) 65%)",
          }}
        />
        <div
          className="hero-horizon hero-horizon-left absolute mix-blend-plus-lighter"
          style={{
            left: u(-119),
            top: u(738.26),
            width: u(864),
            height: u(387.972),
            filter: `blur(${u(51.608)})`,
            backgroundImage:
              "radial-gradient(ellipse 70.71% 70.71% at 50% 50%, rgb(65,32,121) 0%, rgba(104,49,153,0) 65%)",
          }}
        />

        {/* 4:165 — first bottom fade */}
        <div
          className="absolute left-0 w-full"
          style={{
            top: u(922.92),
            height: u(154.823),
            backgroundImage:
              "linear-gradient(to top, rgba(6,3,14,0.95), rgba(6,3,14,0))",
          }}
        />

        {/* asteroid field, 4:166 – 4:256 */}
        {ASTEROIDS.map((a, i) => (
          <motion.div
            key={i}
            className="absolute flex items-center justify-center"
            style={{
              left: u(a.left),
              top: u(a.top),
              width: u(a.boxW),
              height: u(a.boxH),
            }}
            animate={{
              y: [0, i % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          >
            <div style={a.flip ? { transform: "scaleY(-1)" } : undefined}>
              <div
                className="animate-drift"
                style={{
                  ["--spin" as string]: `${a.spin}deg`,
                  ["--spin-delta" as string]: `${i % 2 === 0 ? 2.4 : -2.4}deg`,
                  ["--drift-x" as string]: u(a.driftX),
                  ["--drift-y" as string]: u(a.driftY),
                  ["--drift-dur" as string]: `${a.dur}s`,
                  ["--drift-delay" as string]: `${a.delay}s`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.src}
                  alt=""
                  className="block max-w-none"
                  style={{ width: u(a.w), height: u(a.h) }}
                  draggable={false}
                />
              </div>
            </div>
          </motion.div>
        ))}

        {/* 4:214 — second bottom fade, seats the hero into the page */}
        <div
          className="absolute left-0 w-full"
          style={{
            top: u(974.53),
            height: u(103.216),
            backgroundImage: "linear-gradient(to top, #06030e, rgba(6,3,14,0))",
          }}
        />

        {/* 4:230 — top vignette */}
        <div
          className="absolute left-0 w-full"
          style={{
            top: u(-9),
            height: u(294),
            backgroundImage:
              "linear-gradient(to bottom, #06030e 0%, #06030e 6%, rgba(6,3,14,0) 100%)",
          }}
        />
      </div>

      {/* ---------- type layer, on the same stage (4:215) ---------- */}
      <div className="hero-stage z-10">
        <Centred top={Y_TITLE}>
          <motion.h1
            id="hero-title"
            className="hero-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          >
            Innovision
          </motion.h1>
        </Centred>

        <Centred top={Y_YEAR}>
          <motion.p
            className="hero-year"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          >
            2026
          </motion.p>
        </Centred>

        <Centred top={Y_CTA}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.9 }}
          >
            <Link
              href="/#about"
              className="btn-primary hero-cta pointer-events-auto"
            >
              <span>Explore more about Innovision</span>
              <span className="hero-cta-well" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/polygon-play.svg" alt="" className="hero-cta-glyph" />
              </span>
            </Link>
          </motion.div>
        </Centred>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center sm:bottom-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <div className="mx-auto h-9 w-px bg-gradient-to-b from-transparent via-[rgba(167,139,250,0.55)] to-transparent" />
        <span className="hud mt-3 block">Scroll to descend</span>
      </motion.div>
    </section>
  );
}

/** Full-width row on the hero stage, centred on a Figma y-coordinate. */
function Centred({ top, children }: { top: number; children: React.ReactNode }) {
  return (
    <div
      className="absolute left-0 flex w-full -translate-y-1/2 justify-center"
      style={{ top: u(top) }}
    >
      {children}
    </div>
  );
}
