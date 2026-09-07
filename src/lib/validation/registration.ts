import { z } from "zod";

/**
 * The single source of truth for what a valid registration looks like.
 *
 * The form validates step by step with the step schemas; the route handler
 * re-validates the whole payload with `registrationSchema` before touching the
 * database. Client-side validation is a convenience — the server never trusts
 * it.
 *
 * Every schema normalises as it parses, so the service layer and the database
 * always receive canonical values (lower-cased email, digits-only phone,
 * upper-cased roll number). That is what makes the uniqueness constraints
 * mean something.
 */

export const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;
export const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

export type Gender = (typeof GENDERS)[number];
export type TshirtSize = (typeof TSHIRT_SIZES)[number];

/* ------------------------------------------------------------------ *
 * normalisers — exported so the service and tests share exactly these
 * ------------------------------------------------------------------ */

export const normalizeEmail = (v: string) => v.trim().toLowerCase();

/** Keeps a leading +, drops every other non-digit. "+91 98765-43210" -> "+919876543210" */
export const normalizePhone = (v: string) => {
  const trimmed = v.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
};

/**
 * Reduces a college name to a comparison key: case-folded with every
 * separator removed, so "N.I.T  Rourkela", "NIT Rourkela" and "nit-rourkela"
 * all collapse to one value.
 *
 * Dropping separators rather than collapsing them to spaces matters — with
 * spaces, "N.I.T Rourkela" keys as "n i t rourkela" and slips past the
 * (collegeKey, rollKey) index as a distinct college.
 *
 * This is best-effort: college is free text, so a student who writes out
 * "National Institute of Technology Rourkela" still keys differently. The
 * per-account and per-phone constraints are the hard guarantees.
 */
export const collegeKey = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "");

export const rollKey = (v: string) => v.trim().toUpperCase().replace(/\s+/g, "");

export const normalizeReferral = (v: string) => v.trim().toUpperCase();

/** Treat an untouched optional control ("" or null) as absent. */
const blankToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

/* ------------------------------------------------------------------ *
 * field schemas
 * ------------------------------------------------------------------ */

const name = (label: string) =>
  z
    .string({ message: `Enter your ${label}` })
    .trim()
    .min(2, `${label[0].toUpperCase()}${label.slice(1)} must be at least 2 characters`)
    .max(60, `Keep your ${label} under 60 characters`)
    .regex(/^[\p{L}\p{M}'.\- ]+$/u, `${label[0].toUpperCase()}${label.slice(1)} contains invalid characters`);

const phone = (label: string) =>
  z
    .string({ message: `Enter your ${label}` })
    .trim()
    .transform(normalizePhone)
    .refine((v) => /^\+?\d{8,15}$/.test(v), {
      message: `Enter a valid ${label} (8–15 digits, optional country code)`,
    });

/* ------------------------------------------------------------------ *
 * step schemas — mirror the four panels of the console
 * ------------------------------------------------------------------ */

export const personalSchema = z.object({
  firstName: name("first name"),
  lastName: name("last name"),
  gender: z.enum(GENDERS, { message: "Select a gender" }),
  email: z
    .string({ message: "Enter your email address" })
    .trim()
    .transform(normalizeEmail)
    .refine((v) => z.email().safeParse(v).success, {
      message: "Enter a valid email address",
    }),
  phoneNumber: phone("phone number"),
  whatsappNumber: phone("WhatsApp number"),
});

export const academicSchema = z.object({
  college: z
    .string({ message: "Enter your college" })
    .trim()
    .min(2, "Enter your college")
    .max(120, "Keep the college name under 120 characters"),
  rollNumber: z
    .string({ message: "Enter your roll number" })
    .trim()
    .min(2, "Enter your roll number")
    .max(24, "Keep the roll number under 24 characters")
    .regex(/^[A-Za-z0-9][A-Za-z0-9/\-]*$/, "Roll number contains invalid characters"),
});

export const logisticsSchema = z.object({
  /* Optional by design: an omitted size must never block a registration. */
  tshirtSize: z.preprocess(
    blankToUndefined,
    z
      .enum(TSHIRT_SIZES, { message: "Choose one of XS–XXXL" })
      .optional(),
  ),
  referralCode: z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .transform(normalizeReferral)
      .refine((v) => /^[A-Z0-9][A-Z0-9\-]{2,23}$/.test(v), {
        message: "Referral codes are 3–24 letters, numbers or dashes",
      })
      .optional(),
  ),
  consent: z.literal(true, { message: "You must accept the code of conduct" }),
});

/**
 * Everything the user types — the three step schemas composed. Used by the
 * form for its final client-side pass and by the route handler as the
 * authoritative check.
 */
export const registrationSchema = personalSchema
  .extend(academicSchema.shape)
  .extend(logisticsSchema.shape);

export type ProfileInput = z.input<typeof registrationSchema>;
export type Profile = z.output<typeof registrationSchema>;

/* ------------------------------------------------------------------ *
 * upload validation
 * ------------------------------------------------------------------ */

export const MAX_ID_CARD_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_ID_CARD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

/**
 * Shape check only — the browser-declared type is a hint, never proof. The
 * server additionally sniffs magic bytes in `lib/storage`.
 */
export const idCardMetaSchema = z.object({
  name: z.string().trim().min(1, "Attach your ID card").max(255),
  size: z
    .number()
    .int()
    .positive("Attach your ID card")
    .max(MAX_ID_CARD_BYTES, "ID card must be 5 MB or smaller"),
  type: z
    .string()
    .refine((v) => (ACCEPTED_ID_CARD_TYPES as readonly string[]).includes(v), {
      message: "ID card must be a JPG, PNG, WebP or PDF",
    }),
});

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */

/** Flattens a ZodError into the { field: message } map the console renders. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
