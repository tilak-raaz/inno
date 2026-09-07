"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

/**
 * Two routes to the same account: Google, or a one-time code by email.
 * Better Auth links them on the verified address, so using one this month and
 * the other next month lands on the same registration.
 */
export function SignInCard({
  googleReady,
  eyebrow = "Identify yourself",
  title = "Sign in to begin",
  lead = "Registration is tied to your account, so we hold exactly one place for you and you can come back to your manifest later.",
  callbackURL = "/register",
}: {
  googleReady: boolean;
  eyebrow?: string;
  title?: string;
  lead?: string;
  /** Where Google returns the user after the OAuth round trip. */
  callbackURL?: string;
}) {
  const uid = useId();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const sendCode = async () => {
    const parsed = z.email().safeParse(email.trim().toLowerCase());
    if (!parsed.success) {
      setError("Enter a valid email address");
      return;
    }
    setSending(true);
    setError(null);
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({
      email: parsed.data,
      type: "sign-in",
    });
    setSending(false);
    if (err) {
      setError(err.message ?? "Could not send the code. Try again.");
      return;
    }
    setStage("code");
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit code");
      return;
    }
    setSending(true);
    setError(null);
    const { error: err } = await authClient.signIn.emailOtp({
      email: email.trim().toLowerCase(),
      otp,
    });
    setSending(false);
    if (err) {
      setError(err.message ?? "That code is not valid. Request a new one.");
      return;
    }
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="panel panel-form ticked rounded-2xl px-6 py-14 sm:px-14">
        <p className="hud animate-fade-up">{eyebrow}</p>
        <h2 className="section-title mt-6 animate-fade-up [--fade-delay:0.1s]">
          {title}
        </h2>
        <p className="body-copy mx-auto mt-6 max-w-md animate-fade-up [--fade-delay:0.2s]">
          {lead}
        </p>

        {error ? (
          <p
            role="alert"
            className="mx-auto mt-8 max-w-sm rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </p>
        ) : null}

        {googleReady ? (
          <div className="mt-9 animate-fade-up [--fade-delay:0.3s]">
            <button
              type="button"
              disabled={busy || sending}
              onClick={() => {
                setBusy(true);
                authClient.signIn
                  .social({ provider: "google", callbackURL })
                  .catch(() => setBusy(false));
              }}
              className="btn-primary px-7 py-3.5 text-[0.8125rem] disabled:opacity-60"
            >
              {busy ? "Opening Google…" : "Continue with Google"}
            </button>
          </div>
        ) : null}

        <div className="mx-auto mt-9 flex max-w-sm items-center gap-4">
          <span className="h-px flex-1 bg-[var(--line)]" />
          <span className="hud">or use email</span>
          <span className="h-px flex-1 bg-[var(--line)]" />
        </div>

        <div className="mx-auto mt-6 max-w-sm text-left">
          {stage === "email" ? (
            <>
              <label
                htmlFor={`${uid}-otp-email`}
                className="mb-2.5 block font-display text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-violet-100"
              >
                Email address
              </label>
              <input
                id={`${uid}-otp-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                className="input"
                value={email}
                placeholder="you@college.edu"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={sending}
                className="btn-ghost mt-4 w-full justify-center disabled:opacity-60"
              >
                {sending ? "Sending code…" : "Email me a code"}
              </button>
            </>
          ) : (
            <>
              <label
                htmlFor={`${uid}-otp-code`}
                className="mb-2.5 block font-display text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-violet-100"
              >
                Six-digit code
              </label>
              <input
                id={`${uid}-otp-code`}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="input text-center font-display text-lg tracking-[0.5em]"
                value={otp}
                placeholder="000000"
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && verify()}
              />
              <p className="hud mt-3">Sent to {email} — expires in 5 minutes</p>
              <button
                type="button"
                onClick={verify}
                disabled={sending}
                className="btn-primary mt-4 w-full justify-center px-7 py-3.5 text-[0.8125rem] disabled:opacity-60"
              >
                {sending ? "Verifying…" : "Verify and continue"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage("email");
                  setOtp("");
                  setError(null);
                }}
                className="mt-4 block w-full text-center text-xs text-text-muted underline underline-offset-4 transition-colors hover:text-violet-300"
              >
                Use a different email
              </button>
            </>
          )}
        </div>

        <p className="hud mt-10">We only read your name and email address</p>
      </div>
    </div>
  );
}
