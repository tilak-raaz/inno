/**
 * Mission archives.
 *
 * `src` is left undefined so the gallery renders its procedural archive plate
 * instead of a broken image. Drop a real photograph path in and that frame
 * switches to the photograph automatically — nothing else changes.
 */

export type Capture = {
  id: string;
  title: string;
  caption: string;
  year: number;
  tag: string;
  /** Frame aspect within the archive strip. */
  ratio: "portrait" | "landscape" | "square";
  /** Seeds the procedural plate. */
  seed: number;
  src?: string;
};

export const captures: Capture[] = [
  { id: "a1", title: "First Light", caption: "The beacon lit at the opening ceremony, 2025", year: 2025, tag: "Ceremony", ratio: "landscape", seed: 11 },
  { id: "a2", title: "Arena Floor", caption: "Robowars quarter-final, sixty seconds before the bell", year: 2025, tag: "Robowars", ratio: "portrait", seed: 27 },
  { id: "a3", title: "Hour Thirty-One", caption: "HackOverflow, the long stretch before dawn", year: 2025, tag: "HackOverflow", ratio: "landscape", seed: 43 },
  { id: "a4", title: "Gate Seven", caption: "FPV heats under the field lights", year: 2024, tag: "Drone GP", ratio: "square", seed: 58 },
  { id: "a5", title: "The Panel", caption: "Startup Orbit finals, Innovation Centre", year: 2024, tag: "Startup Orbit", ratio: "landscape", seed: 71 },
  { id: "a6", title: "Load at Failure", caption: "A truss two seconds from collapse", year: 2024, tag: "Bridge It", ratio: "portrait", seed: 84 },
  { id: "a7", title: "Nebula Night", caption: "Twelve thousand on the BBA ground", year: 2025, tag: "Concert", ratio: "landscape", seed: 96 },
  { id: "a8", title: "Terrain Bay", caption: "A rover finds its own way through the gravel run", year: 2023, tag: "Rover", ratio: "square", seed: 108 },
  { id: "a9", title: "Crew Call", caption: "The organising team, 04:00, day three", year: 2023, tag: "Crew", ratio: "landscape", seed: 122 },
  { id: "a10", title: "Descent", caption: "Closing night, the last transmission", year: 2025, tag: "Ceremony", ratio: "portrait", seed: 137 },
  { id: "a11", title: "Solder Line", caption: "Circuitrix, round two", year: 2024, tag: "Circuitrix", ratio: "square", seed: 149 },
  { id: "a12", title: "Podium", caption: "Prize distribution, main amphitheatre", year: 2023, tag: "Ceremony", ratio: "landscape", seed: 163 },
];

export const galleryYears = [
  "All",
  ...Array.from(new Set(captures.map((c) => String(c.year)))).sort().reverse(),
];
