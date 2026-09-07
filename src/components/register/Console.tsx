"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { events } from "@/data/events";
import {
  ARRIVALS,
  TSHIRTS,
  YEARS,
  identitySchema,
  logisticsSchema,
  missionSchema,
} from "@/lib/registrationSchema";

/**
 * REGISTRATION — mission control.
 *
 * Four steps, each validated on its own before the next unlocks, so nobody
 * reaches the end and discovers a problem three panels back. The chrome is
 * cosmetic; the form underneath is ordinary, labelled and keyboard-complete.
 */

type Errors = Record<string, string>;

const STEPS = [
  { key: "identity", label: "Identity", hint: "Who is flying" },
  { key: "mission", label: "Mission", hint: "What you are entering" },
  { key: "logistics", label: "Logistics", hint: "Arrival and kit" },
  { key: "launch", label: "Launch", hint: "Confirm and submit" },
] as const;

export function RegistrationConsole() {
  const uid = useId();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    year: "",
    events: [] as string[],
    teamName: "",
    arrival: "",
    accommodation: "",
    tshirt: "",
    notes: "",
    consent: false,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const rest = { ...e };
      delete rest[key as string];
      return rest;
    });
  };

  const flatten = (issues: { path: PropertyKey[]; message: string }[]) => {
    const out: Errors = {};
    for (const i of issues) {
      const k = String(i.path[0] ?? "form");
      if (!out[k]) out[k] = i.message;
    }
    return out;
  };

  const validateStep = (index: number) => {
    const schema = [identitySchema, missionSchema, logisticsSchema][index];
    if (!schema) return true;
    const result = schema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    setErrors(flatten(result.error.issues));
    return false;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const submit = async () => {
    for (let i = 0; i < 3; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) setReference(data.reference);
      else setErrors(data.errors ?? { form: "Something went wrong. Try again." });
    } catch {
      setErrors({ form: "Could not reach mission control. Check your connection." });
    } finally {
      setSubmitting(false);
    }
  };

  const chosen = useMemo(
    () => events.filter((e) => form.events.includes(e.id)),
    [form.events],
  );

  if (reference) return <Cleared reference={reference} chosen={chosen.length} />;

  return (
    <div className="mx-auto max-w-4xl px-(--gutter)">
      {/* ---------------- progress ---------------- */}
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-4 sm:gap-x-5">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
              className="group flex items-center gap-2.5 text-left disabled:cursor-default"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border font-display text-[0.625rem] font-bold tabular-nums transition-all duration-500 ${
                  i === step
                    ? "border-[var(--violet-300)] bg-[rgba(124,58,237,0.28)] text-white shadow-[0_0_20px_-4px_rgba(124,58,237,0.9)]"
                    : i < step
                      ? "border-[var(--line-bright)] bg-[rgba(30,17,61,0.8)] text-violet-200"
                      : "border-[var(--line)] text-text-faint"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className="hidden sm:block">
                <span
                  className={`block font-display text-[0.6875rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 ${
                    i <= step ? "text-white" : "text-text-faint"
                  }`}
                >
                  {s.label}
                </span>
                <span className="hud mt-0.5 block normal-case tracking-[0.14em]">
                  {s.hint}
                </span>
              </span>
            </button>
            {i < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={`hidden h-px w-8 transition-colors duration-500 sm:block lg:w-14 ${
                  i < step ? "bg-[var(--violet-500)]" : "bg-[var(--line)]"
                }`}
              />
            ) : null}
          </li>
        ))}
      </ol>

      {/* ---------------- panel ---------------- */}
      <div className="panel ticked mt-10 rounded-2xl p-6 sm:mt-14 sm:p-10">
        {errors.form ? (
          <p role="alert" className="mb-6 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errors.form}
          </p>
        ) : null}

        {step === 0 ? (
          <Fieldset legend="Identity" note="Step 1 of 4">
            <Field id={`${uid}-name`} label="Full name" error={errors.fullName}>
              <input
                id={`${uid}-name`}
                className="input"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? `${uid}-name-err` : undefined}
              />
            </Field>
            <Field id={`${uid}-email`} label="Email" error={errors.email}>
              <input
                id={`${uid}-email`}
                type="email"
                inputMode="email"
                className="input"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${uid}-email-err` : undefined}
              />
            </Field>
            <Field id={`${uid}-phone`} label="Phone" error={errors.phone}>
              <input
                id={`${uid}-phone`}
                type="tel"
                inputMode="tel"
                className="input"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
              />
            </Field>
            <Field id={`${uid}-inst`} label="College or school" error={errors.institution}>
              <input
                id={`${uid}-inst`}
                className="input"
                value={form.institution}
                onChange={(e) => set("institution", e.target.value)}
                autoComplete="organization"
                aria-invalid={!!errors.institution}
                aria-describedby={errors.institution ? `${uid}-inst-err` : undefined}
              />
            </Field>
            <Field id={`${uid}-year`} label="Year of study" error={errors.year} full>
              <div className="flex flex-wrap gap-2">
                {YEARS.map((y) => (
                  <Chip
                    key={y}
                    active={form.year === y}
                    onClick={() => set("year", y)}
                    label={y}
                  />
                ))}
              </div>
            </Field>
          </Fieldset>
        ) : null}

        {step === 1 ? (
          <Fieldset legend="Mission" note="Step 2 of 4">
            <Field
              id={`${uid}-events`}
              label={`Events — ${form.events.length} selected`}
              error={errors.events}
              full
            >
              <ul className="grid gap-2 sm:grid-cols-2">
                {events.map((e) => {
                  const on = form.events.includes(e.id);
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          set(
                            "events",
                            on
                              ? form.events.filter((x) => x !== e.id)
                              : [...form.events, e.id],
                          )
                        }
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-400 ${
                          on
                            ? "border-[var(--violet-300)] bg-[rgba(124,58,237,0.18)]"
                            : "border-[var(--line)] hover:border-[var(--line-bright)]"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border text-[9px] ${
                            on
                              ? "border-[var(--violet-300)] bg-[var(--violet-500)] text-white"
                              : "border-[var(--line-bright)]"
                          }`}
                        >
                          {on ? "✓" : ""}
                        </span>
                        <span>
                          <span className="block font-display text-xs font-bold uppercase tracking-[0.1em] text-white">
                            {e.name}
                          </span>
                          <span className="mt-1 block text-xs text-text-muted">
                            {e.category} · Day {e.day} · {e.team}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Field>
            <Field
              id={`${uid}-team`}
              label="Team name (optional)"
              error={errors.teamName}
              full
            >
              <input
                id={`${uid}-team`}
                className="input"
                value={form.teamName}
                onChange={(e) => set("teamName", e.target.value)}
                placeholder="Leave blank if you are entering solo"
              />
            </Field>
          </Fieldset>
        ) : null}

        {step === 2 ? (
          <Fieldset legend="Logistics" note="Step 3 of 4">
            <Field id={`${uid}-arrival`} label="Arriving on" error={errors.arrival} full>
              <div className="flex flex-wrap gap-2">
                {ARRIVALS.map((a) => (
                  <Chip key={a} active={form.arrival === a} onClick={() => set("arrival", a)} label={a} />
                ))}
              </div>
            </Field>
            <Field id={`${uid}-acc`} label="Need campus accommodation?" error={errors.accommodation} full>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "yes", l: "Yes, please" },
                  { v: "no", l: "No, arranged" },
                ].map((o) => (
                  <Chip
                    key={o.v}
                    active={form.accommodation === o.v}
                    onClick={() => set("accommodation", o.v)}
                    label={o.l}
                  />
                ))}
              </div>
            </Field>
            <Field id={`${uid}-tee`} label="T-shirt size" error={errors.tshirt} full>
              <div className="flex flex-wrap gap-2">
                {TSHIRTS.map((t) => (
                  <Chip key={t} active={form.tshirt === t} onClick={() => set("tshirt", t)} label={t} />
                ))}
              </div>
            </Field>
            <Field id={`${uid}-notes`} label="Anything we should know? (optional)" error={errors.notes} full>
              <textarea
                id={`${uid}-notes`}
                rows={3}
                className="input resize-y"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Accessibility needs, dietary requirements, travel details…"
              />
            </Field>
            <Field id={`${uid}-consent`} label="" error={errors.consent} full>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-text-muted">
                <input
                  id={`${uid}-consent`}
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--violet-500)]"
                  aria-invalid={!!errors.consent}
                />
                <span>
                  I accept the{" "}
                  <Link href="/#about" className="text-violet-300 underline underline-offset-4">
                    code of conduct
                  </Link>{" "}
                  and consent to being contacted about my registration.
                </span>
              </label>
            </Field>
          </Fieldset>
        ) : null}

        {step === 3 ? (
          <Fieldset legend="Launch" note="Step 4 of 4">
            <div className="col-span-full space-y-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line-soft)]">
              <Row k="Name" v={form.fullName} />
              <Row k="Contact" v={`${form.email} · ${form.phone}`} />
              <Row k="Institution" v={`${form.institution} · ${form.year} year`} />
              <Row
                k="Events"
                v={chosen.map((e) => e.name).join(", ") || "—"}
              />
              {form.teamName ? <Row k="Team" v={form.teamName} /> : null}
              <Row k="Arrival" v={form.arrival} />
              <Row
                k="Accommodation"
                v={form.accommodation === "yes" ? "Requested" : "Self-arranged"}
              />
              <Row k="T-shirt" v={form.tshirt} />
              {form.notes ? <Row k="Notes" v={form.notes} /> : null}
            </div>
            <p className="hud col-span-full mt-2">
              Check the manifest. You can step back to change anything.
            </p>
          </Fieldset>
        ) : null}

        {/* ---------------- controls ---------------- */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-8">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-ghost disabled:pointer-events-none disabled:opacity-35"
          >
            <span aria-hidden>←</span> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-primary px-7 py-3.5 text-[0.8125rem]">
              Continue <span aria-hidden>→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="btn-primary px-7 py-3.5 text-[0.8125rem] disabled:opacity-60"
            >
              {submitting ? "Transmitting…" : "Begin mission"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Fieldset({
  legend,
  note,
  children,
}: {
  legend: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="animate-fade-up">
      <legend className="sr-only">{legend}</legend>
      <div className="mb-8 flex items-center gap-4">
        <h2 className="font-display text-lg font-bold uppercase tracking-[0.14em] text-white">
          {legend}
        </h2>
        <div className="rule flex-1" />
        <span className="hud">{note}</span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  id,
  label,
  error,
  full,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      {label ? (
        <label
          htmlFor={id}
          className="mb-2.5 block font-display text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-text-soft"
        >
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-2 text-xs text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-4 py-2.5 font-display text-xs font-semibold tracking-[0.1em] transition-all duration-400 ${
        active
          ? "border-[var(--violet-300)] bg-[rgba(124,58,237,0.22)] text-white"
          : "border-[var(--line)] text-text-muted hover:border-[var(--line-bright)] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-1 bg-[rgba(10,5,24,0.75)] px-5 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
      <span className="hud">{k}</span>
      <span className="text-sm text-text">{v}</span>
    </div>
  );
}

function Cleared({ reference, chosen }: { reference: string; chosen: number }) {
  return (
    <div className="mx-auto max-w-2xl px-(--gutter) text-center">
      <div className="panel ticked rounded-2xl px-8 py-16 sm:px-14">
        <p className="hud animate-fade-up">Cleared for launch</p>
        <h2 className="section-title mt-6 animate-fade-up [--fade-delay:0.1s]">
          You are on the manifest
        </h2>
        <p className="body-copy mx-auto mt-6 max-w-md animate-fade-up [--fade-delay:0.2s]">
          {chosen} {chosen === 1 ? "event" : "events"} logged. A confirmation is on its
          way to your inbox with joining instructions and arena timings.
        </p>
        <p className="mt-10 animate-fade-up [--fade-delay:0.3s]">
          <span className="hud block">Your reference</span>
          <span className="mt-3 block font-display text-2xl font-black tracking-[0.22em] text-white">
            {reference}
          </span>
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-3 animate-fade-up [--fade-delay:0.4s]">
          <Link href="/events" className="btn-primary px-6 py-3.5 text-[0.8125rem]">
            Browse events
          </Link>
          <Link href="/merch" className="btn-ghost">
            Get the merch
          </Link>
        </div>
      </div>
    </div>
  );
}
