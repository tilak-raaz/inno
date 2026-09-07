import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createRegistration,
  findByUserId,
  type PublicRegistration,
} from "@/lib/services/registration";
import { deleteIdCard, uploadIdCard } from "@/lib/storage/idCard";
import { fieldErrors, registrationSchema } from "@/lib/validation/registration";

/**
 * Registration intake.
 *
 * GET  — the signed-in user's registration, if any.
 * POST — multipart/form-data: the profile fields plus the ID card.
 *
 * The order matters and mirrors the intended flow: authenticate, validate the
 * fields, check for an existing registration, store the ID card, then write.
 * If the write fails after the upload, the object is removed again so an
 * abandoned attempt does not leave an orphaned document in storage.
 *
 * The user id is never read from the request. It comes from the session.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Fail = {
  ok: false;
  error: string;
  message?: string;
  field?: string;
  fieldErrors?: Record<string, string>;
  registration?: PublicRegistration;
};

const fail = (body: Fail, status: number) => NextResponse.json(body, { status });

export async function GET() {
  const session = await getSession();
  if (session.status === "unavailable") {
    return fail({ ok: false, error: "UNAVAILABLE", message: "Service is temporarily unavailable." }, 503);
  }
  if (session.status === "anonymous") {
    return fail({ ok: false, error: "UNAUTHENTICATED", message: "Sign in to continue." }, 401);
  }
  const user = session.user;

  try {
    const registration = await findByUserId(user.id);
    return NextResponse.json({ ok: true, registration });
  } catch (error) {
    console.error("[api/register] lookup failed", error);
    return fail({ ok: false, error: "SERVER", message: "Could not load your registration." }, 500);
  }
}

export async function POST(request: Request) {
  /* 1 — identity, server-side only */
  const session = await getSession(request.headers);
  if (session.status === "unavailable") {
    return fail(
      { ok: false, error: "UNAVAILABLE", message: "Service is temporarily unavailable. Try again shortly." },
      503,
    );
  }
  if (session.status === "anonymous") {
    return fail(
      { ok: false, error: "UNAUTHENTICATED", message: "Sign in before registering." },
      401,
    );
  }
  const user = session.user;

  /* 2 — parse the multipart body */
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail({ ok: false, error: "BAD_REQUEST", message: "Malformed submission." }, 400);
  }

  const raw = {
    firstName: form.get("firstName"),
    lastName: form.get("lastName"),
    gender: form.get("gender"),
    email: form.get("email"),
    phoneNumber: form.get("phoneNumber"),
    whatsappNumber: form.get("whatsappNumber"),
    college: form.get("college"),
    rollNumber: form.get("rollNumber"),
    tshirtSize: form.get("tshirtSize"),
    referralCode: form.get("referralCode"),
    consent: form.get("consent") === "true",
  };

  /* 3 — authoritative validation; the client's pass counts for nothing here */
  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(
      {
        ok: false,
        error: "VALIDATION",
        message: "Some details need fixing.",
        fieldErrors: fieldErrors(parsed.error),
      },
      422,
    );
  }
  const profile = parsed.data;

  /* 4 — already registered? say so before touching storage */
  let existing: PublicRegistration | null = null;
  try {
    existing = await findByUserId(user.id);
  } catch (error) {
    console.error("[api/register] duplicate pre-check failed", error);
    return fail({ ok: false, error: "SERVER", message: "Something went wrong. Try again." }, 500);
  }
  if (existing) {
    return fail(
      {
        ok: false,
        error: "ALREADY_REGISTERED",
        message: "You are already on the manifest.",
        registration: existing,
      },
      409,
    );
  }

  /* 5 — ID card: sniffed, size-checked, stored under a server-made key */
  const upload = await uploadIdCard(form.get("idCard") as File | null, user.id);
  if (!upload.ok) {
    const status = upload.code === "NOT_CONFIGURED" || upload.code === "UPLOAD_FAILED" ? 503 : 422;
    return fail(
      {
        ok: false,
        error: "UPLOAD",
        message: upload.message,
        fieldErrors: { idCard: upload.message },
      },
      status,
    );
  }

  /* 6 — write */
  const created = await createRegistration({
    userId: user.id,
    userEmail: user.email,
    profile,
    idCard: upload.file,
  });

  if (!created.ok) {
    // Don't leave the upload behind if the row never landed.
    await deleteIdCard(upload.file);

    if (created.code === "DUPLICATE") {
      if (created.field === "account") {
        const current = await findByUserId(user.id).catch(() => null);
        return fail(
          {
            ok: false,
            error: "ALREADY_REGISTERED",
            message: created.message,
            registration: current ?? undefined,
          },
          409,
        );
      }
      return fail(
        {
          ok: false,
          error: "DUPLICATE",
          field: created.field,
          message: created.message,
          fieldErrors: { [created.field]: created.message },
        },
        409,
      );
    }

    return fail({ ok: false, error: "SERVER", message: created.message }, 500);
  }

  return NextResponse.json({ ok: true, registration: created.registration }, { status: 201 });
}
