"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { SignInCard } from "@/components/auth/SignInCard";
import type { PublicRegistration } from "@/lib/services/registration";
import type { SessionUser } from "@/lib/session";
import {
  GENDERS,
  TSHIRT_SIZES,
  academicSchema,
  idCardMetaSchema,
  logisticsSchema,
  personalSchema,
} from "@/lib/validation/registration";

/**
 * REGISTRATION — mission control.
 *
 * Four steps, each validated on its own before the next unlocks, so nobody
 * reaches the end and discovers a problem three panels back. The chrome is
 * cosmetic; the form underneath is ordinary, labelled and keyboard-complete.
 *
 * Client-side validation here is for feel only. The route handler re-runs the
 * same Zod schemas and decides.
 */

type Errors = Record<string, string>;

const STEPS = [
  { key: "identity", label: "Identity", hint: "Who is flying" },
  { key: "academic", label: "Academic", hint: "Where you study" },
  { key: "logistics", label: "Logistics", hint: "Kit and documents" },
  { key: "launch", label: "Launch", hint: "Confirm and submit" },
] as const;

/** Which panel each field lives on, so a server error can jump the user to it. */
const FIELD_STEP: Record<string, number> = {
  firstName: 0,
  lastName: 0,
  gender: 0,
  email: 0,
  phoneNumber: 0,
  whatsappNumber: 0,
  college: 1,
  rollNumber: 1,
  tshirtSize: 2,
  referralCode: 2,
  idCard: 2,
  consent: 2,
};

export function RegistrationConsole({
  user,
  existing,
  googleReady,
  unavailable = false,
}: {
  user: SessionUser | null;
  existing: PublicRegistration | null;
  googleReady: boolean;
  /** The session could not be resolved at all — not the same as signed out. */
  unavailable?: boolean;
}) {
  const uid = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [registration, setRegistration] = useState<PublicRegistration | null>(existing);

  const [idCard, setIdCard] = useState<File | null>(null);
  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
    gender: "",
    email: user?.email ?? "",
    phoneNumber: "",
    whatsappNumber: "",
    college: "",
    rollNumber: "",
    tshirtSize: "",
    referralCode: "",
    consent: false,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    clearError(key as string);
  };

  const clearError = (key: string) =>
    setErrors((e) => {
      if (!e[key]) return e;
      const rest = { ...e };
      delete rest[key];
      return rest;
    });

  const flatten = (issues: { path: PropertyKey[]; message: string }[]) => {
    const out: Errors = {};
    for (const i of issues) {
      const k = String(i.path[0] ?? "form");
      if (!out[k]) out[k] = i.message;
    }
    return out;
  };

  const validateStep = (index: number) => {
    if (index === 2) {
      const result = logisticsSchema.safeParse(form);
      const found: Errors = result.success ? {} : flatten(result.error.issues);
      // The file lives outside the schema, so check it alongside.
      if (!idCard) {
        found.idCard = "Attach a photo of your student ID";
      } else {
        const meta = idCardMetaSchema.safeParse({
          name: idCard.name,
          size: idCard.size,
          type: idCard.type,
        });
        if (!meta.success) found.idCard = meta.error.issues[0]?.message ?? "Invalid file";
      }
      if (Object.keys(found).length) {
        setErrors(found);
        return false;
      }
      setErrors({});
      return true;
    }

    const schema = [personalSchema, academicSchema][index];
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

  const pickFile = (file: File | null) => {
    setIdCard(file);
    clearError("idCard");
    if (!file) return;
    const meta = idCardMetaSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!meta.success) {
      setErrors((e) => ({ ...e, idCard: meta.error.issues[0]?.message ?? "Invalid file" }));
    }
  };

  const submit = async () => {
    for (let i = 0; i < 3; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    if (!idCard) return;

    setSubmitting(true);
    setErrors({});
    try {
      const body = new FormData();
      for (const [key, value] of Object.entries(form)) {
        body.append(key, typeof value === "boolean" ? String(value) : value);
      }
      body.append("idCard", idCard);

      const res = await fetch("/api/register", { method: "POST", body });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setRegistration(data.registration);
        return;
      }

      // The server already registered this account — show that state instead.
      if (data?.error === "ALREADY_REGISTERED") {
        if (data.registration) setRegistration(data.registration);
        else setErrors({ form: data.message ?? "You are already registered." });
        return;
      }

      if (data?.error === "UNAUTHENTICATED") {
        setErrors({ form: "Your session expired. Sign in again to submit." });
        return;
      }

      if (data?.fieldErrors) {
        setErrors(data.fieldErrors);
        const first = Object.keys(data.fieldErrors)[0];
        const target = FIELD_STEP[first];
        if (target !== undefined) setStep(target);
        return;
      }

      setErrors({ form: data?.message ?? "Something went wrong. Try again." });
    } catch {
      setErrors({ form: "Could not reach mission control. Check your connection." });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- gates ---------------- */

  if (registration) return <Cleared registration={registration} />;
  if (unavailable) return <Unavailable />;
  if (!user) return <SignInCard googleReady={googleReady} />;

  return (
    <div>
      {/* ---------------- progress ---------------- */}
      {/* A grid, not a wrapping flex row: four steps with labels overflow an
          896px container and used to break 3 + 1, which read as a mistake. */}
      <ol className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 sm:gap-x-3">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
              className="group flex min-w-0 items-center gap-2.5 text-left disabled:cursor-default"
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
              <span className="min-w-0">
                <span
                  className={`block truncate font-display text-[0.6875rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-500 ${
                    i <= step ? "text-white" : "text-text-faint"
                  }`}
                >
                  {s.label}
                </span>
                <span className="mt-1 hidden truncate text-[0.6875rem] text-text-faint lg:block">
                  {s.hint}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* ---------------- who is signed in ---------------- */}
      <div className="mt-8 rounded-xl border border-[var(--line)] bg-[rgba(16,9,34,0.66)] px-5 py-3.5">
        <p className="text-sm text-text-muted">
          Signed in as <span className="text-violet-200">{user.email}</span>
        </p>
      </div>

      {/* ---------------- panel ---------------- */}
      <div className="panel panel-form ticked mt-6 rounded-2xl p-6 sm:mt-8 sm:p-10">
        {errors.form ? (
          <p role="alert" className="mb-6 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errors.form}
          </p>
        ) : null}

        {step === 0 ? (
          <Fieldset legend="Identity" note="Step 1 of 4">
            <Field id={`${uid}-first`} label="First name" error={errors.firstName}>
              <input
                id={`${uid}-first`}
                className="input"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? `${uid}-first-err` : undefined}
              />
            </Field>
            <Field id={`${uid}-last`} label="Last name" error={errors.lastName}>
              <input
                id={`${uid}-last`}
                className="input"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? `${uid}-last-err` : undefined}
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
            <Field id={`${uid}-phone`} label="Phone number" error={errors.phoneNumber}>
              <input
                id={`${uid}-phone`}
                type="tel"
                inputMode="tel"
                className="input"
                value={form.phoneNumber}
                onChange={(e) => set("phoneNumber", e.target.value)}
                autoComplete="tel"
                placeholder="+91 98765 43210"
                aria-invalid={!!errors.phoneNumber}
                aria-describedby={errors.phoneNumber ? `${uid}-phone-err` : undefined}
              />
            </Field>
            <Field id={`${uid}-wa`} label="WhatsApp number" error={errors.whatsappNumber}>
              <input
                id={`${uid}-wa`}
                type="tel"
                inputMode="tel"
                className="input"
                value={form.whatsappNumber}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                placeholder="Same as phone if identical"
                aria-invalid={!!errors.whatsappNumber}
                aria-describedby={errors.whatsappNumber ? `${uid}-wa-err` : undefined}
              />
            </Field>
            <Field id={`${uid}-gender`} label="Gender" error={errors.gender} full>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <Chip
                    key={g}
                    active={form.gender === g}
                    onClick={() => set("gender", g)}
                    label={g}
                  />
                ))}
              </div>
            </Field>
          </Fieldset>
        ) : null}

        {step === 1 ? (
          <Fieldset legend="Academic" note="Step 2 of 4">
            <Field id={`${uid}-college`} label="College" error={errors.college} full>
              <input
                id={`${uid}-college`}
                className="input"
                value={form.college}
                onChange={(e) => set("college", e.target.value)}
                autoComplete="organization"
                placeholder="e.g. NIT Rourkela"
                aria-invalid={!!errors.college}
                aria-describedby={errors.college ? `${uid}-college-err` : undefined}
              />
            </Field>
            <Field id={`${uid}-roll`} label="Roll number" error={errors.rollNumber} full>
              <input
                id={`${uid}-roll`}
                className="input"
                value={form.rollNumber}
                onChange={(e) => set("rollNumber", e.target.value)}
                placeholder="e.g. 124EI0035"
                aria-invalid={!!errors.rollNumber}
                aria-describedby={errors.rollNumber ? `${uid}-roll-err` : undefined}
              />
            </Field>
            <p className="hud col-span-full">
              Your roll number identifies you within your college. One registration per
              roll number.
            </p>
          </Fieldset>
        ) : null}

        {step === 2 ? (
          <Fieldset legend="Logistics" note="Step 3 of 4">
            <Field id={`${uid}-id`} label="Student ID card" error={errors.idCard} full>
              <input
                ref={fileInput}
                id={`${uid}-id`}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="sr-only"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                aria-invalid={!!errors.idCard}
                aria-describedby={errors.idCard ? `${uid}-id-err` : undefined}
              />
              <div
                className={`flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4 transition-colors duration-400 ${
                  errors.idCard
                    ? "border-rose-500/50"
                    : idCard
                      ? "border-[var(--violet-300)] bg-[rgba(124,58,237,0.12)]"
                      : "border-[var(--line)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="btn-ghost shrink-0 !py-2.5 !text-[0.6875rem]"
                >
                  {idCard ? "Replace file" : "Choose file"}
                </button>
                <span className="min-w-0 flex-1 text-sm text-text-muted">
                  {idCard ? (
                    <>
                      <span className="block truncate text-text">{idCard.name}</span>
                      <span className="hud mt-1 block">
                        {(idCard.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    "JPG, PNG, WebP or PDF · 5 MB maximum"
                  )}
                </span>
                {idCard ? (
                  <button
                    type="button"
                    onClick={() => {
                      pickFile(null);
                      if (fileInput.current) fileInput.current.value = "";
                    }}
                    className="hud shrink-0 underline underline-offset-4 transition-colors hover:text-rose-300"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </Field>

            <Field id={`${uid}-tee`} label="T-shirt size (optional)" error={errors.tshirtSize} full>
              <div className="flex flex-wrap gap-2">
                {TSHIRT_SIZES.map((t) => (
                  <Chip
                    key={t}
                    active={form.tshirtSize === t}
                    /* Selecting the active size again clears it — the field stays optional. */
                    onClick={() => set("tshirtSize", form.tshirtSize === t ? "" : t)}
                    label={t}
                  />
                ))}
              </div>
              <p className="hud mt-3">
                Leave blank if you would rather not say. It will not hold up your
                registration.
              </p>
            </Field>

            <Field
              id={`${uid}-ref`}
              label="Referral code (optional)"
              error={errors.referralCode}
              full
            >
              <input
                id={`${uid}-ref`}
                className="input"
                value={form.referralCode}
                onChange={(e) => set("referralCode", e.target.value)}
                placeholder="From a campus ambassador, if you have one"
                aria-invalid={!!errors.referralCode}
                aria-describedby={errors.referralCode ? `${uid}-ref-err` : undefined}
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
              <Row k="Name" v={`${form.firstName} ${form.lastName}`} />
              <Row k="Gender" v={form.gender} />
              <Row k="Contact" v={`${form.email} · ${form.phoneNumber}`} />
              <Row k="WhatsApp" v={form.whatsappNumber} />
              <Row k="College" v={form.college} />
              <Row k="Roll number" v={form.rollNumber} />
              <Row k="ID card" v={idCard?.name ?? "—"} />
              <Row k="T-shirt" v={form.tshirtSize || "Not specified"} />
              {form.referralCode ? <Row k="Referral" v={form.referralCode} /> : null}
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
            disabled={step === 0 || submitting}
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
              aria-busy={submitting}
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

/** Shown when the session store is unreachable, so nobody is told to sign in
    again when they are in fact still signed in. */
function Unavailable() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="panel panel-form ticked rounded-2xl px-8 py-16 sm:px-14">
        <p className="hud animate-fade-up">Signal lost</p>
        <h2 className="section-title mt-6 animate-fade-up [--fade-delay:0.1s]">
          Mission control is offline
        </h2>
        <p className="body-copy mx-auto mt-6 max-w-md animate-fade-up [--fade-delay:0.2s]">
          We could not reach the registration system just now. Your place and any
          details you have already submitted are safe — try again in a moment.
        </p>
        <div className="mt-10 animate-fade-up [--fade-delay:0.3s]">
          <Link href="/register" className="btn-primary px-7 py-3.5 text-[0.8125rem]">
            Try again
          </Link>
        </div>
      </div>
    </div>
  );
}

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

function Cleared({ registration }: { registration: PublicRegistration }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="panel panel-form ticked rounded-2xl px-8 py-16 sm:px-14">
        <p className="hud animate-fade-up">Cleared for launch</p>
        <h2 className="section-title mt-6 animate-fade-up [--fade-delay:0.1s]">
          You are on the manifest
        </h2>
        <p className="body-copy mx-auto mt-6 max-w-md animate-fade-up [--fade-delay:0.2s]">
          Registered as{" "}
          <span className="text-text">
            {registration.firstName} {registration.lastName}
          </span>{" "}
          of {registration.college}. A confirmation is on its way to{" "}
          {registration.email} with joining instructions and arena timings.
        </p>
        <p className="mt-10 animate-fade-up [--fade-delay:0.3s]">
          <span className="hud block">Your reference</span>
          <span className="mt-3 block font-display text-2xl font-black tracking-[0.22em] text-white">
            {registration.registrationId}
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
