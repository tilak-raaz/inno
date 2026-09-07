import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/registrationSchema";

/**
 * Registration intake.
 *
 * Validates with the same schema the form uses, then issues a reference.
 * TODO: persist the payload — this handler deliberately does not write
 * anywhere yet, so wire it to your database or sheet before going live.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request" }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const reference = `IV26-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  return NextResponse.json({ ok: true, reference });
}
