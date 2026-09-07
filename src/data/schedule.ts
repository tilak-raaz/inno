/** The four-day flight plan shown on the home page timeline. */

export type ScheduleStop = {
  day: number;
  date: string;
  label: string;
  /** One-line framing for the day. */
  brief: string;
  entries: { time: string; title: string; note: string }[];
};

export const schedule: ScheduleStop[] = [
  {
    day: 1,
    date: "06 Nov",
    label: "Ignition",
    brief:
      "Gates open, the campus reconfigures into a festival grid and the first builds go on the clock.",
    entries: [
      { time: "16:00", title: "Opening Ceremony", note: "Main Amphitheatre — inaugural address and the lighting of the beacon" },
      { time: "14:00", title: "Line Follower", note: "Robotics Arena B — heats through the afternoon" },
      { time: "20:00", title: "HackOverflow begins", note: "LA Complex — 36 hours on the clock" },
    ],
  },
  {
    day: 2,
    date: "07 Nov",
    label: "Ascent",
    brief:
      "The heaviest technical bracket of the festival. Two arenas run in parallel from morning to dusk.",
    entries: [
      { time: "09:30", title: "Case Summit", note: "Seminar Hall — live corporate case, ninety minutes" },
      { time: "10:00", title: "Robowars", note: "Central Arena — round of sixteen through to quarter-finals" },
      { time: "14:00", title: "Circuitrix", note: "EC Lab Complex — three rounds, analogue only" },
      { time: "21:00", title: "Nebula Night", note: "BBA Ground — headline electronic set" },
    ],
  },
  {
    day: 3,
    date: "08 Nov",
    label: "Orbit",
    brief:
      "Autonomy, flight and capital. The day the machines run themselves and the founders take the stage.",
    entries: [
      { time: "09:00", title: "Startup Orbit", note: "Innovation Centre — pitch rounds before an angel syndicate" },
      { time: "11:00", title: "Autonomous Rover", note: "Terrain Bay — simulated planetary surface" },
      { time: "15:00", title: "Drone Grand Prix", note: "Aero Field — FPV heats under lights" },
      { time: "20:30", title: "Star Talk", note: "Golden Jubilee Auditorium — keynote from the guest of honour" },
    ],
  },
  {
    day: 4,
    date: "09 Nov",
    label: "Return",
    brief:
      "Finals across every bracket, then the descent — prizes, closing set and the last transmission.",
    entries: [
      { time: "10:00", title: "Bridge It", note: "Structures Lab — load testing to failure" },
      { time: "16:00", title: "Quantum Quiz", note: "Golden Jubilee Auditorium — stage finals" },
      { time: "19:00", title: "Prize Distribution", note: "Main Amphitheatre — all brackets" },
      { time: "21:00", title: "Closing Night", note: "BBA Ground — the final descent" },
    ],
  },
];
