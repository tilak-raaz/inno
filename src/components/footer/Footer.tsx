import Link from "next/link";
import { contacts, footerLinks, site, socials } from "@/data/site";

/**
 * FOOTER — the far side of the journey.
 *
 * The hero opens on a planet rising into frame; the footer closes on the same
 * planet setting below the fold. Same limb gradient, same violet bloom, same
 * ring geometry — inverted.
 */
export function Footer() {
  return (
    <footer className="relative isolate overflow-clip border-t border-[var(--line)] bg-ink pt-24">
      {/* Planet limb setting below the fold — mirrors Figma 4:161 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px]">
        <div
          className="absolute left-1/2 top-[38%] aspect-square w-[160%] -translate-x-1/2 rounded-full border-t border-[rgba(150,100,255,0.13)]"
          style={{
            background:
              "radial-gradient(ellipse 60% 42% at 50% 100%, rgba(70,30,150,0.28) 0%, rgba(6,3,14,0) 62%)",
          }}
        />
        <div
          className="absolute inset-x-[-10%] bottom-[-140px] h-[340px] opacity-80"
          style={{
            filter: "blur(58px)",
            backgroundImage:
              "radial-gradient(ellipse 70% 70% at 50% 100%, rgba(160,40,255,0.5) 0%, rgba(100,20,190,0.26) 34%, rgba(80,10,160,0) 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-(--shell) px-(--gutter)">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
          {/* identity */}
          <div>
            <p className="hud">{site.edition}</p>
            <p className="mt-4 font-display text-[clamp(2rem,4.6vw,3.25rem)] font-black uppercase leading-none tracking-[0.1em] text-white">
              {site.name}
            </p>
            <p className="mt-2 font-display text-lg font-semibold tracking-[0.42em] text-violet-300">
              {site.year}
            </p>
            <p className="body-copy mt-6 max-w-sm">{site.description}</p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group rounded-lg border border-[var(--line)] px-3.5 py-2 text-xs tracking-wide text-text-muted transition-colors duration-400 hover:border-[var(--line-bright)] hover:text-white"
                >
                  {s.label}
                  <span className="ml-1.5 text-[0.9em] text-text-faint transition-colors group-hover:text-violet-300">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* link columns + contact */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {footerLinks.map((column) => (
              <div key={column.title}>
                <h2 className="hud">{column.title}</h2>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label + link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-muted transition-colors duration-300 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* contact strip */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line-soft)] sm:grid-cols-3">
          {contacts.map((c) => (
            <a
              key={c.role}
              href={c.href}
              className="group bg-[rgba(10,5,24,0.72)] p-6 transition-colors duration-400 hover:bg-[rgba(30,17,61,0.62)]"
            >
              <p className="hud">{c.role}</p>
              <p className="mt-3 font-display text-sm font-semibold tracking-[0.08em] text-white">
                {c.name}
              </p>
              <p className="mt-1 text-sm text-text-muted transition-colors group-hover:text-violet-300">
                {c.value}
              </p>
            </a>
          ))}
        </div>

        <div className="rule mt-14" />

        <div className="flex flex-col gap-4 py-8 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.year} {site.name} — {site.host}. All rights reserved.
          </p>
          <p className="hud">End of transmission</p>
        </div>
      </div>
    </footer>
  );
}
