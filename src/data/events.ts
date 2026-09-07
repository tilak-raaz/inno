/**
 * Event catalogue. The Events page treats each entry as a body in orbit;
 * `body` picks the silhouette and `hue` drives its atmosphere, so adding an
 * event never requires touching the renderer.
 */

export type EventBody = "planet" | "moon" | "asteroid";

export type InnoEvent = {
  id: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  day: 1 | 2 | 3 | 4;
  time: string;
  venue: string;
  prize: string;
  team: string;
  /** Visual identity within the orbital explorer. */
  body: EventBody;
  hue: number;
  /** Relative size, 0.75 – 1.25. */
  mass: number;
};

export const events: InnoEvent[] = [
  {
    id: "robowars",
    code: "IV-01",
    name: "Robowars",
    tagline: "Steel meets steel in the arena",
    description:
      "Fifteen kilograms of drive train, armour and spinning weaponry. Two machines enter a polycarbonate arena; the one still moving after three minutes advances. India's fiercest campus combat robotics bracket returns with a deeper prize pool and a new vertical-spinner class.",
    category: "Robotics",
    day: 2,
    time: "10:00 — 18:00",
    venue: "Central Arena, BBA Ground",
    prize: "₹2,50,000",
    team: "4 – 8 members",
    body: "planet",
    hue: 268,
    mass: 1.25,
  },
  {
    id: "hackoverflow",
    code: "IV-02",
    name: "HackOverflow",
    tagline: "36 hours. One working product.",
    description:
      "A 36-hour build sprint against a problem statement revealed at the opening bell. Mentors from the sponsor pool rotate through the floor every four hours. Judged on working software, not slideware — you demo from a live URL or you don't demo.",
    category: "Software",
    day: 1,
    time: "20:00 — 08:00 (+2)",
    venue: "LA Complex, Blocks 1–4",
    prize: "₹2,00,000",
    team: "2 – 4 members",
    body: "planet",
    hue: 250,
    mass: 1.15,
  },
  {
    id: "drone-grand-prix",
    code: "IV-03",
    name: "Drone Grand Prix",
    tagline: "FPV racing through a lit gate circuit",
    description:
      "Time-trial and head-to-head heats around a twelve-gate illuminated circuit. Pilots fly FPV with their own airframes under a 5-inch class limit. Fastest three laps aggregate; a single gate cut voids the run.",
    category: "Aeromodelling",
    day: 3,
    time: "15:00 — 19:00",
    venue: "Aero Field, West Campus",
    prize: "₹1,20,000",
    team: "1 – 3 members",
    body: "moon",
    hue: 220,
    mass: 0.95,
  },
  {
    id: "case-summit",
    code: "IV-04",
    name: "Case Summit",
    tagline: "Boardroom strategy under real constraints",
    description:
      "A live corporate case released by the partner firm, cracked in ninety minutes and defended in front of a panel of practising consultants. Round two swaps your deck with a rival team — you defend theirs.",
    category: "Management",
    day: 2,
    time: "09:30 — 14:00",
    venue: "Seminar Hall, Main Building",
    prize: "₹1,00,000",
    team: "2 – 3 members",
    body: "moon",
    hue: 285,
    mass: 0.9,
  },
  {
    id: "autonomous-rover",
    code: "IV-05",
    name: "Autonomous Rover",
    tagline: "No pilot. No remote. Just perception.",
    description:
      "Navigate a simulated planetary surface — loose gravel, gradients and unlit tunnels — with zero human input after the start signal. Scoring weights terrain covered, samples retrieved and recovery from an induced sensor fault.",
    category: "Robotics",
    day: 3,
    time: "11:00 — 17:00",
    venue: "Terrain Bay, Mechanical Dept",
    prize: "₹1,50,000",
    team: "3 – 6 members",
    body: "planet",
    hue: 200,
    mass: 1.05,
  },
  {
    id: "circuitrix",
    code: "IV-06",
    name: "Circuitrix",
    tagline: "Analogue instincts, three rounds deep",
    description:
      "Debug a sabotaged board, reverse-engineer an unlabelled circuit from its response curve, then build to spec on breadboard against the clock. Oscilloscopes provided; intuition is not.",
    category: "Electronics",
    day: 2,
    time: "14:00 — 18:30",
    venue: "EC Lab Complex",
    prize: "₹60,000",
    team: "2 members",
    body: "asteroid",
    hue: 262,
    mass: 0.8,
  },
  {
    id: "bridge-it",
    code: "IV-07",
    name: "Bridge It",
    tagline: "Popsicle sticks against gravity",
    description:
      "Design and build a load-bearing truss inside a fixed mass budget, then watch a hydraulic press find its weakest joint. Score is load at failure divided by structure mass — elegance beats bulk every year.",
    category: "Civil",
    day: 4,
    time: "10:00 — 15:00",
    venue: "Structures Lab",
    prize: "₹50,000",
    team: "2 – 4 members",
    body: "asteroid",
    hue: 240,
    mass: 0.78,
  },
  {
    id: "quantum-quiz",
    code: "IV-08",
    name: "Quantum Quiz",
    tagline: "The general quiz that isn't general",
    description:
      "Six rounds spanning science history, engineering disasters, semiconductors and space programmes. Written prelims cut the field to eight; the stage round runs on infinite bounce with negative marking.",
    category: "Quizzing",
    day: 4,
    time: "16:00 — 19:00",
    venue: "Golden Jubilee Auditorium",
    prize: "₹40,000",
    team: "1 – 3 members",
    body: "asteroid",
    hue: 292,
    mass: 0.75,
  },
  {
    id: "startup-orbit",
    code: "IV-09",
    name: "Startup Orbit",
    tagline: "Pitch to a room that writes cheques",
    description:
      "Ten minutes on stage, five on defence, in front of an angel syndicate and two operating founders. Traction beats vision — bring numbers. Finalists receive incubation support at the campus foundry regardless of placement.",
    category: "Entrepreneurship",
    day: 3,
    time: "09:00 — 13:00",
    venue: "Innovation Centre",
    prize: "₹1,75,000 + incubation",
    team: "1 – 4 members",
    body: "moon",
    hue: 275,
    mass: 0.98,
  },
  {
    id: "line-follower",
    code: "IV-10",
    name: "Line Follower",
    tagline: "The classic, run at speed",
    description:
      "A high-contrast track with crossovers, acute turns and a discontinuity section. PID tuning decides this one. Two runs, best time counts, five-second penalty per manual recovery.",
    category: "Robotics",
    day: 1,
    time: "14:00 — 18:00",
    venue: "Robotics Arena B",
    prize: "₹45,000",
    team: "1 – 4 members",
    body: "asteroid",
    hue: 210,
    mass: 0.76,
  },
];

export const eventCategories = [
  "All",
  ...Array.from(new Set(events.map((e) => e.category))),
];
