import { Planet } from "@/components/hero/Planet";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";

const STATS = [
  { value: "4", unit: "days", label: "Continuous operation" },
  { value: "40+", unit: "events", label: "Across nine disciplines" },
  { value: "15K+", unit: "visitors", label: "From 120 campuses" },
  { value: "₹25L+", unit: "prize pool", label: "Awarded on site" },
];

const ORBIT_LABELS = ["Technology", "Creativity", "Innovation"];

const BRIEFING = [
  {
    n: "01",
    title: "What it is",
    body: "Four days in which a campus is rebuilt as a festival — arenas, labs, stages and a night ground — and thrown open to anyone who builds things.",
  },
  {
    n: "02",
    title: "Who it is for",
    body: "Undergraduates, school teams, independent makers and founders. Every bracket has an entry tier that assumes nothing beyond curiosity.",
  },
  {
    n: "03",
    title: "What you leave with",
    body: "A ranking, a prize, a prototype that survived contact with judges — and a roster of people who were in the same room at 4 a.m.",
  },
];

export function About() {
  return (
    <section id="about" className="relative isolate scroll-mt-24 overflow-clip">
      {/* ---- approach band: the hero's planet, still receding ---- */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px]">
        <div
          className="absolute left-1/2 top-[-560px] aspect-square w-[150%] -translate-x-1/2 rounded-full border-t border-[rgba(150,100,255,0.18)]"
          style={{
            background:
              "radial-gradient(ellipse 50% 30% at 50% 100%, rgba(90,40,190,0.2) 0%, rgba(6,3,14,0) 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-(--shell) px-(--gutter) py-24 sm:py-32 lg:py-40">
        <Reveal className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center lg:gap-24">
          {/* ---- briefing copy ---- */}
          <div>
            <p className="hud" data-reveal>
              Mission briefing — 001
            </p>
            <h2 className="section-title mt-5 text-balance" data-reveal>
              A universe of technology, creativity and innovation
            </h2>
            <div className="mt-8 space-y-5" data-reveal>
              <p className="body-copy">
                <strong className="font-semibold text-text">
                  {site.name} {site.year}
                </strong>{" "}
                is {site.edition.toLowerCase()} of the techno-management festival
                of {site.host} — {site.dates}. It is the largest
                gathering of its kind in eastern India, and it runs on the
                assumption that the most interesting work happens when
                disciplines are forced into the same room.
              </p>
              <p className="body-copy">
                Robots fight in a polycarbonate arena while a hackathon enters
                its thirty-first hour two buildings away. A founder pitches to a
                syndicate at nine, and by three that afternoon an autonomous
                rover is failing, publicly, on a gravel gradient. Nothing here is
                a demonstration. Everything is a contest.
              </p>
              <p className="body-copy">
                This site is the flight plan. Every destination below is real,
                dated and open for registration.
              </p>
            </div>
          </div>

          {/* ---- orbital dial ---- */}
          <div
            className="relative mx-auto aspect-square w-full max-w-[440px]"
            data-reveal
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ ["--pd" as string]: "42%" }}
            >
              <Planet />
            </div>

            {/* three shells, each a slow orbit carrying one label */}
            {ORBIT_LABELS.map((label, i) => {
              const size = 50 + i * 20; // % of the dial
              const dur = 34 + i * 13;
              /* Negative delay offsets each shell's phase, so the three
                 markers sit 120 degrees apart even before anything moves. */
              const phase = -(dur * i) / 3;
              return (
                <div
                  key={label}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line)]"
                  style={{ width: `${size}%`, height: `${size}%` }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      animation: `${i % 2 ? "inno-orbit-rev" : "inno-orbit"} ${dur}s linear ${phase}s infinite`,
                    }}
                  >
                    {/* the marker rides the shell… */}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                      <div
                        style={{
                          animation: `${i % 2 ? "inno-orbit" : "inno-orbit-rev"} ${dur}s linear ${phase}s infinite`,
                        }}
                      >
                        {/* …and counter-rotates so the label stays upright */}
                        <span className="block whitespace-nowrap rounded-full border border-[var(--line-bright)] bg-[rgba(10,5,24,0.85)] px-3 py-1.5 font-display text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-violet-200 backdrop-blur-sm">
                          {label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <p className="hud absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap">
              {site.location}
            </p>
          </div>
        </Reveal>

        {/* ---- telemetry strip ---- */}
        <Reveal
          className="mt-24 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line-soft)] sm:grid-cols-2 lg:grid-cols-4"
          stagger={70}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-[rgba(10,5,24,0.72)] px-7 py-8 transition-colors duration-500 hover:bg-[rgba(30,17,61,0.6)]"
              data-reveal
            >
              <p className="font-display text-[clamp(2rem,3.4vw,2.75rem)] font-black leading-none text-white">
                {s.value}
              </p>
              <p className="hud mt-3">{s.unit}</p>
              <p className="mt-3 text-sm text-text-muted">{s.label}</p>
            </div>
          ))}
        </Reveal>

        {/* ---- parameters ---- */}
        <Reveal className="mt-20 grid gap-10 md:grid-cols-3" stagger={90}>
          {BRIEFING.map((b) => (
            <div key={b.n} data-reveal>
              <div className="flex items-baseline gap-4">
                <span className="font-display text-xs font-bold tracking-[0.3em] text-violet-500">
                  {b.n}
                </span>
                <div className="rule flex-1" />
              </div>
              <h3 className="mt-5 font-display text-base font-bold uppercase tracking-[0.14em] text-white">
                {b.title}
              </h3>
              <p className="body-copy mt-3">{b.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
