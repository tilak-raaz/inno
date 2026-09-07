import type { Metadata } from "next";
import { RegistrationConsole } from "@/components/register/Console";
import { isGoogleConfigured } from "@/lib/env";
import { findByUserId } from "@/lib/services/registration";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Register",
  description: "Register for INNOVISION 2026.",
};

/* Session state is resolved on the server so the console never flashes the
   wrong panel while a client-side session check settles. */
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getSession();
  const user = session.status === "authenticated" ? session.user : null;
  const registration = user ? await findByUserId(user.id).catch(() => null) : null;

  return (
    <div className="relative isolate min-h-svh overflow-clip">
      {/*
        No planet and no imagery here: this is a form, and the hero's artwork
        was competing with it. What carries over is the atmosphere — the same
        violet bloom over near-black, drawn purely with gradients.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-x-0 top-0 h-[900px]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 52% at 50% -8%, rgba(124,58,237,0.34) 0%, rgba(76,29,149,0.16) 38%, rgba(6,3,14,0) 72%)",
          }}
        />
        <div
          className="absolute left-1/2 top-[-140px] h-[520px] w-[900px] max-w-[130vw] -translate-x-1/2"
          style={{
            filter: "blur(90px)",
            backgroundImage:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(160,40,255,0.3) 0%, rgba(80,10,160,0) 70%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[420px]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 60% at 50% 120%, rgba(70,30,150,0.22) 0%, rgba(6,3,14,0) 70%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-(--gutter) pb-28 pt-[calc(var(--nav-h)+3rem)] sm:pb-36 sm:pt-[calc(var(--nav-h)+5rem)]">
        <div className="mb-10 sm:mb-14">
          <p className="hud">Innovision 2026</p>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-black uppercase leading-none tracking-[0.06em] text-white">
            Registration
          </h1>
        </div>

        <RegistrationConsole
          user={user}
          existing={registration}
          googleReady={isGoogleConfigured()}
          unavailable={session.status === "unavailable"}
        />
      </div>
    </div>
  );
}
