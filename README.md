# INNOVISION 2026

Front-end for the 26th edition of the INNOVISION techno-management festival —
one continuous journey through a futuristic universe, across six pages.

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · Zod.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

---

## The hero is the source of truth

`src/components/hero/Hero.tsx` is a 1:1 reconstruction of Figma node **4:145**
(`MacBook Pro 16" - 2`), not an approximation of a screenshot.

The design is authored on a fixed **1728 × 1077.742** stage with everything
absolutely placed, so the stage is reproduced literally. `.hero` defines a
single unit:

```css
--fu: calc(100cqw / 1728);   /* exactly 1 Figma px at a 1728px viewport */
```

Every offset in `Hero.tsx` is `calc(<figma value> * var(--fu))`. Verified
against the Figma render: headline and CTA ink positions and all six asteroid
boxes land **within 1.5px** at the reference width.

Two things deliberately do *not* scale linearly, because pure scaling makes
them illegible on a phone:

- the headline — `min(154.823 * --fu, (100cqw - 2.5rem) / 9.6)`, so it always
  fits on one line and equals the Figma value at 1728px;
- the CTA label and padding — floored with `max()` so the button never drops
  below 13px type.

Two documented departures from the Figma layer list, both to fix artefacts the
frame hides but a real viewport does not:

- the top vignette starts from the page ink `#06030e` rather than pure black,
  so the clipped stage edge is seamless on viewports taller than the stage;
- the play glyph is the exported polygon rotated 90°. Figma's transform reads
  `-29.76°`, but the node renders 17 × 20 (taller than wide) — a right-pointing
  play triangle — which is what 90° produces.

### Figma assets

Exported to `public/assets/` and used directly — nothing is redrawn:

| file | Figma node |
| --- | --- |
| `planet-texture.png` | 4:160 — planet surface map (soft-light) |
| `asteroid-a.svg`, `asteroid-a-large.svg` | 4:189, 4:206 / 4:257 |
| `asteroid-b.svg`, `asteroid-b2.svg` | 4:167, 4:182 |
| `asteroid-c.svg` | 4:174 |
| `polygon-play.svg` | 4:254 — CTA glyph |

---

## One universe, six pages

`src/components/hero/Planet.tsx` is the spine of the whole system. Every
internal measurement is a fraction of `--pd` (planet diameter), so the same
composite scales from one length and is reused everywhere:

| where | how it appears |
| --- | --- |
| Hero | full disc with orbit rings |
| Interior page headers | clipped to a shallow rising limb (`PlanetLimb`) |
| About | small dial with three orbiting labels |
| Events | hue-rotated per event — one body, many worlds |
| Footer | the same limb, setting |

That reuse — not a shared purple — is what keeps the six pages one place.

```
/            Hero · About · Schedule · Sponsors · Footer
/events      orbital explorer — drag, scroll or arrow-key between bodies
/merch       orbital showroom — lit stage, colourway + size picker
/register    four-step mission console, validated per step
/gallery     archive reel — horizontal, depth-parallaxed, fullscreen viewer
/teams       crew star chart, clustered by department
```

## Layout

```
src/
  app/            routes; api/register is the intake handler
  components/
    hero/         Hero, Planet          — the Figma reconstruction
    layout/       Nav
    footer/       Footer
    ui/           Reveal, Section, PageHeader, Starfield
    home/         About, Schedule, Sponsors
    events/ merch/ gallery/ teams/ register/
  data/           all content — events, schedule, sponsors, merch, gallery, teams, site
  lib/            useReveal, useMediaQuery, usePointerDrag, registrationSchema
```

Content is fully separated from presentation. Adding an event, sponsor, product
or crew member means editing one file in `src/data/` — the orbits, constellations
and carousels lay themselves out.

## Design system

Tokens live at the top of `src/app/globals.css`, all derived from the hero:
`--ink #06030e`, the violet ramp `#7c3aed → #5b21b6`, `--halo #9046ff`, the
three hairline weights, and the two cinematic easings.

Shared classes: `.hud` (telemetry micro-label), `.section-title`, `.body-copy`,
`.panel` + `.ticked` (instrument panel with corner ticks), `.rule`,
`.btn-primary` / `.btn-ghost`, `.input`.

Type: **Orbitron** for display (as in Figma), **Space Grotesk** for body —
Orbitron is unreadable at paragraph length.

## Animation

No animation library. Scroll reveals use one `IntersectionObserver` per group
(`useReveal`); ambient motion is CSS keyframes on `transform`/`opacity` only;
carousels are pointer/wheel/keyboard handlers (`usePointerDrag`).

`prefers-reduced-motion: reduce` disables every ambient animation and shows all
revealed content immediately. Without JavaScript, a `<noscript>` rule reveals
everything too.

## Responsiveness

Verified with no horizontal overflow across 390 / 430 / 768 / 1024 / 1440 /
1920 on all six pages. Complex layouts are re-composed rather than shrunk: the
constellation and star chart become tiered lists and card grids below `lg`; the
hero crops toward the planet instead of scaling it down.

---

## Before going live

1. **Content** — everything in `src/data/` is written to be plausible, not
   accurate. Replace event details, dates, prize pools, crew names and contact
   addresses with the real thing.
2. **Sponsor logos** — `SponsorPlate` renders a wordmark. Add a `logo` field
   per sponsor in `src/data/sponsors.ts` and render it in place of the text.
   Glow lives on the plate border, never on the mark, so real logos stay clean.
3. **Photography** — `src/data/gallery.ts` entries take an optional `src`. Set
   it and that frame renders the photograph instead of the procedural plate.
   Same for `photo` on crew members in `src/data/teams.ts`.
4. **Registration** — `src/app/api/register/route.ts` validates and returns a
   reference but **does not persist anything**. Wire it to your database or
   sheet, and add rate limiting, before opening registration.
5. **Merch checkout** — "Add to bag" is presentational. Connect it to your
   payment flow.
6. **Open Graph image** — add one; `src/app/layout.tsx` sets the metadata.
