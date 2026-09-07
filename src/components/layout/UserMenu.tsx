"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Signed-in account control for the nav.
 *
 * Replaces the Register call-to-action once there is a session — a registered
 * user being told to "Register" is the wrong prompt. Carries the sign-out
 * action, which previously had nowhere to live.
 */

type MenuUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const initials = (user: MenuUser) => {
  const source = user.name?.trim() || user.email?.trim() || "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
};

export function UserMenu({ user }: { user: MenuUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      // refresh() re-runs the server components so pages that read the session
      // (the register page especially) reflect the sign-out immediately.
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full border transition-all duration-400 ${
          open
            ? "border-[var(--violet-300)] shadow-[0_0_22px_-4px_rgba(124,58,237,0.9)]"
            : "border-[var(--line-bright)] hover:border-[var(--violet-300)]"
        }`}
        style={{
          background:
            "radial-gradient(circle at 34% 28%, rgba(76,29,149,0.9) 0%, rgba(10,5,24,0.95) 74%)",
        }}
      >
        <span className="sr-only">
          {open ? "Close account menu" : "Open account menu"}
        </span>
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            aria-hidden
            className="font-display text-[0.6875rem] font-bold tracking-[0.04em] text-violet-100"
          >
            {initials(user)}
          </span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="menu-panel right-0 top-[calc(100%+0.75rem)] z-50 w-64 max-w-[calc(100vw-2rem)] animate-fade-up rounded-xl p-2 [--fade-delay:0s]"
        >
          <div className="border-b border-[var(--line)] px-3 pb-3 pt-2">
            <p className="truncate font-display text-xs font-bold uppercase tracking-[0.1em] text-white">
              {user.name || "Signed in"}
            </p>
            <p className="mt-1 truncate text-xs text-text-muted">{user.email}</p>
          </div>

          <Link
            href="/register"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-3 py-2.5 text-sm text-text-soft transition-colors duration-300 hover:bg-[rgba(124,58,237,0.18)] hover:text-white"
          >
            My registration
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={signingOut}
            className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-text-soft transition-colors duration-300 hover:bg-[rgba(244,63,94,0.16)] hover:text-rose-200 disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
