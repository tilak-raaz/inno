import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

/**
 * Three outcomes, not two.
 *
 * "anonymous" and "unavailable" must stay distinct: if the database is
 * unreachable, a signed-in user would otherwise be shown the sign-in screen
 * and told to authenticate again, which is both wrong and alarming. Callers
 * turn "unavailable" into a 503 or a service notice instead of a 401.
 */
export type SessionResult =
  | { status: "authenticated"; user: SessionUser }
  | { status: "anonymous" }
  | { status: "unavailable" };

/**
 * The authenticated user, resolved server-side from the session cookie.
 *
 * This is the ONLY place identity comes from. No route handler, service or
 * server component ever reads a user id out of a request body or query string.
 */
export async function getSession(requestHeaders?: Headers): Promise<SessionResult> {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: requestHeaders ?? (await headers()),
    });
    if (!session?.user?.id || !session.user.email) return { status: "anonymous" };
    return {
      status: "authenticated",
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    };
  } catch (error) {
    // A missing cookie is not an error — reaching here means the lookup itself
    // failed (database down, bad credentials, misconfiguration).
    console.error("[auth] session lookup failed", error);
    return { status: "unavailable" };
  }
}
