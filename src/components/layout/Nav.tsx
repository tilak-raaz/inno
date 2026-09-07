"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, registerLink, site } from "@/data/site";

/**
 * Primary navigation.
 *
 * Figma 4:231 defines the bar: 72.25px tall, the wordmark centred at 32.99px
 * Orbitron Bold / 0.14em, links on the left and an action on the right (both
 * present in the frame but hidden in the final iteration). That structure is
 * kept intact here — the hidden slots are simply filled with the real routes.
 */
export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    // Seed off the next frame rather than synchronously: a page restored
    // mid-scroll still gets the right state, without a cascading render.
    const seed = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(seed);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the sheet on navigation and lock the page behind it while open.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled
            ? "border-b border-[var(--line)] bg-[rgba(6,3,14,0.72)] backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-full max-w-(--shell) items-center justify-between px-(--gutter)"
        >
          {/* left — routes */}
          <ul className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`nav-link ${isActive(link.href) ? "nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* mobile — menu toggle sits where the routes would be */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-ml-2 mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-soft transition-colors hover:text-white lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="relative block h-[13px] w-6" aria-hidden>
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-transform duration-400 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-px bg-current transition-all duration-400 ${
                  open ? "top-1.5 w-full -rotate-45" : "top-3 w-2/3"
                }`}
              />
            </span>
          </button>

          {/* centre — wordmark (Figma 4:252). Absolutely centred from lg up,
              where there is room; in normal flow below that so it cannot
              collide with the action on the right. */}
          <Link
            href="/"
            className="nav-wordmark lg:absolute lg:left-1/2 lg:-translate-x-1/2"
            aria-label={`${site.name} ${site.year} — home`}
          >
            {site.name}
          </Link>

          {/* right — primary action */}
          <div className="flex items-center gap-5">
            <span className="hud hidden xl:block">{site.dates}</span>
            <Link href={registerLink.href} className="nav-cta">
              {registerLink.label}
              <span aria-hidden className="text-[0.85em]">
                ↗
              </span>
            </Link>
          </div>
        </nav>
      </header>

      {/* mobile sheet */}
      <div
        id="mobile-nav"
        className={`fixed inset-0 z-40 overflow-hidden transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-[rgba(4,2,10,0.86)] backdrop-blur-2xl"
        />
        <nav
          aria-label="Mobile"
          className="relative flex h-full flex-col justify-center px-(--gutter) pb-16 pt-(--nav-h)"
        >
          <ul className="space-y-1">
            {[...navLinks, registerLink].map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  tabIndex={open ? 0 : -1}
                  className="group flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-5 transition-[transform,opacity] duration-500"
                  style={{
                    transitionDelay: open ? `${80 + i * 55}ms` : "0ms",
                    transform: open ? "none" : "translateY(14px)",
                    opacity: open ? 1 : 0,
                  }}
                >
                  <span
                    className={`min-w-0 truncate font-display text-2xl font-bold uppercase tracking-[0.12em] transition-colors ${
                      isActive(link.href)
                        ? "text-white"
                        : "text-text-soft group-hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                  <span className="hud hidden min-w-0 truncate normal-case tracking-[0.2em] xs:block">
                    {link.sub}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="hud mt-10">
            {site.dates} — {site.host}
          </p>
        </nav>
      </div>
    </>
  );
}
