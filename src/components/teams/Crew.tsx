"use client";

import { useMemo, useState } from "react";
import { crew, departments, type CrewMember } from "@/data/teams";

/**
 * TEAMS — the crew as a star chart.
 *
 * Each department is a small cluster; members are the stars in it, joined to
 * their own department and round the ring to the next. Filtering dims the rest
 * of the sky rather than rebuilding it, so the shape of the organisation stays
 * recognisable however you slice it.
 *
 * Below `lg` the chart is replaced outright by a card list — a constellation
 * on a 390px screen is a puzzle, not a feature.
 */

const RX = 35;
const RY = 30;

type Placed = CrewMember & { x: number; y: number; dept: number };

const placed: Placed[] = (() => {
  const byDept = departments.map((d) => crew.filter((m) => m.department === d));
  const out: Placed[] = [];
  byDept.forEach((members, d) => {
    const a = ((-90 + d * (360 / departments.length)) * Math.PI) / 180;
    const cx = 50 + Math.cos(a) * RX;
    const cy = 50 + Math.sin(a) * RY;
    // spread the cluster along the tangent so it never overlaps its neighbours
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    members.forEach((m, i) => {
      const t = (i - (members.length - 1) / 2) * 15;
      const r = i % 2 === 0 ? 0 : 7;
      out.push({
        ...m,
        dept: d,
        x: +(cx + tx * t + Math.cos(a) * r).toFixed(3),
        y: +(cy + ty * t + Math.sin(a) * r).toFixed(3),
      });
    });
  });
  return out;
})();

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

export function Crew() {
  const [dept, setDept] = useState("All");
  const [activeId, setActiveId] = useState(placed[0].id);

  const visible = (m: Placed) => dept === "All" || m.department === dept;
  const active = useMemo(
    () => placed.find((m) => m.id === activeId) ?? placed[0],
    [activeId],
  );

  /* Cluster links, plus a ring joining each cluster to the next. */
  const edges = useMemo(() => {
    const out: [Placed, Placed][] = [];
    departments.forEach((_, d) => {
      const inDept = placed.filter((m) => m.dept === d);
      for (let i = 0; i < inDept.length - 1; i++) out.push([inDept[i], inDept[i + 1]]);
      const nextDept = placed.filter((m) => m.dept === (d + 1) % departments.length);
      if (inDept.length && nextDept.length)
        out.push([inDept[inDept.length - 1], nextDept[0]]);
    });
    return out;
  }, []);

  return (
    <div className="mx-auto max-w-(--shell) px-(--gutter)">
      {/* ---------------- filter ---------------- */}
      <div role="group" aria-label="Filter crew by department" className="flex flex-wrap gap-2">
        {["All", ...departments].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              setDept(d);
              const first = placed.find((m) => d === "All" || m.department === d);
              if (first) setActiveId(first.id);
            }}
            aria-pressed={dept === d}
            className={`rounded-full border px-4 py-2 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.18em] transition-all duration-400 ${
              dept === d
                ? "border-[var(--violet-300)] bg-[rgba(124,58,237,0.22)] text-white"
                : "border-[var(--line)] text-text-muted hover:border-[var(--line-bright)] hover:text-white"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16">
        {/* ---------------- HUD readout ---------------- */}
        <div className="order-2 lg:order-1" aria-live="polite">
          <div key={active.id} className="panel ticked animate-fade-up rounded-2xl p-7 sm:p-9">
            <div className="flex items-center gap-5">
              <Avatar member={active} size={72} />
              <div className="min-w-0">
                <p className="hud">{active.department}</p>
                <p className="mt-2 truncate font-display text-lg font-bold uppercase tracking-[0.1em] text-white">
                  {active.name}
                </p>
                <p className="mt-1 text-sm text-violet-300">{active.role}</p>
              </div>
            </div>
            <div className="rule my-6" />
            <p className="body-copy">{active.bio}</p>
          </div>

          <p className="hud mt-6">
            Select a node to read its file · {placed.filter(visible).length} of{" "}
            {placed.length} crew shown
          </p>
        </div>

        {/* ---------------- star chart (lg+) ---------------- */}
        <div className="order-1 hidden lg:order-2 lg:block">
          <div className="relative mx-auto aspect-square w-full max-w-[600px]">
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              {edges.map(([a, b], i) => (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={
                    visible(a) && visible(b)
                      ? "rgba(150,100,255,0.28)"
                      : "rgba(150,100,255,0.07)"
                  }
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                filter: "blur(46px)",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.3) 0%, rgba(124,58,237,0) 70%)",
              }}
            />

            {placed.map((m) => {
              const on = visible(m);
              const isActive = m.id === active.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => on && setActiveId(m.id)}
                  onMouseEnter={() => on && setActiveId(m.id)}
                  disabled={!on}
                  aria-pressed={isActive}
                  className="crew-node absolute w-max -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${m.x}%`,
                    top: `${m.y}%`,
                    opacity: on ? 1 : 0.2,
                    zIndex: isActive ? 20 : 10,
                  }}
                >
                  <Avatar member={m} size={isActive ? 84 : 62} active={isActive} />
                  <span
                    className={`crew-label absolute left-1/2 top-full mt-2.5 max-w-[140px] -translate-x-1/2 truncate whitespace-nowrap rounded-full border border-[var(--line)] bg-[rgba(6,3,14,0.92)] px-2.5 py-1 text-center font-display text-[0.625rem] font-semibold uppercase tracking-[0.14em] ${
                      isActive ? "text-white opacity-100" : "text-text-faint"
                    }`}
                  >
                    {m.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- card list (below lg) ---------------- */}
        <ul className="order-3 grid gap-3 sm:grid-cols-2 lg:hidden">
          {placed.filter(visible).map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setActiveId(m.id)}
                aria-pressed={m.id === active.id}
                className={`panel panel-hover flex w-full items-center gap-4 rounded-xl p-4 text-left ${
                  m.id === active.id ? "border-[var(--violet-300)]" : ""
                }`}
              >
                <Avatar member={m} size={52} active={m.id === active.id} />
                <span className="min-w-0">
                  <span className="block truncate font-display text-xs font-bold uppercase tracking-[0.1em] text-white">
                    {m.name}
                  </span>
                  <span className="mt-1 block truncate text-xs text-text-muted">
                    {m.role}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Avatar({
  member,
  size,
  active = false,
}: {
  member: CrewMember;
  size: number;
  active?: boolean;
}) {
  return (
    <span
      className="relative mx-auto grid shrink-0 place-items-center rounded-full border transition-all duration-500"
      style={{
        width: size,
        height: size,
        borderColor: active ? "var(--violet-300)" : "var(--line-bright)",
        background:
          "radial-gradient(circle at 34% 28%, rgba(76,29,149,0.85) 0%, rgba(10,5,24,0.95) 72%)",
        boxShadow: active
          ? "0 0 34px -6px rgba(124,58,237,0.9), inset 0 1px 0 rgba(196,181,253,0.28)"
          : "inset 0 1px 0 rgba(196,181,253,0.14)",
      }}
    >
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.photo}
          alt=""
          className="h-full w-full rounded-full object-cover"
          draggable={false}
        />
      ) : (
        <span
          className="font-display font-bold tracking-[0.06em] text-violet-100"
          style={{ fontSize: size * 0.3 }}
        >
          {initials(member.name)}
        </span>
      )}
    </span>
  );
}
