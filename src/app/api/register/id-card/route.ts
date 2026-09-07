import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { findIdCardByUserId } from "@/lib/services/registration";
import { signedIdCardUrl } from "@/lib/storage/idCard";

/**
 * Hands the signed-in user a short-lived signed URL for their own ID card.
 *
 * There is no id in the path on purpose: the document is looked up from the
 * session, so there is nothing to tamper with and no way to ask for somebody
 * else's card.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (session.status === "unavailable") {
    return NextResponse.json(
      { ok: false, error: "UNAVAILABLE", message: "Service is temporarily unavailable." },
      { status: 503 },
    );
  }
  if (session.status === "anonymous") {
    return NextResponse.json(
      { ok: false, error: "UNAUTHENTICATED", message: "Sign in to continue." },
      { status: 401 },
    );
  }
  const user = session.user;

  try {
    const card = await findIdCardByUserId(user.id);
    if (!card) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND", message: "No ID card on file." },
        { status: 404 },
      );
    }

    const url = signedIdCardUrl(card);
    if (!url) {
      return NextResponse.json(
        { ok: false, error: "SERVER", message: "Storage is not configured." },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true, url, expiresIn: 120 });
  } catch (error) {
    console.error("[api/register/id-card] failed", error);
    return NextResponse.json(
      { ok: false, error: "SERVER", message: "Could not load your ID card." },
      { status: 500 },
    );
  }
}
