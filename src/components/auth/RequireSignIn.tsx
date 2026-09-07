import { SignInCard } from "./SignInCard";
import { isGoogleConfigured } from "@/lib/env";
import { getSession } from "@/lib/session";

/**
 * Server-side gate for pages that require an account.
 *
 * The check runs on the server and the protected children are simply not
 * rendered for a signed-out visitor — there is no client-side flash of content
 * and nothing to bypass by editing a cookie, unlike a middleware check that
 * only looks for the cookie's presence.
 *
 * A database outage is reported as an outage rather than as "signed out", so
 * nobody is asked to authenticate again when they already are.
 */
export async function RequireSignIn({
  children,
  title,
  lead,
  callbackURL,
}: {
  children: React.ReactNode;
  title: string;
  lead: string;
  /** Where Google returns the visitor after the OAuth round trip. */
  callbackURL: string;
}) {
  const session = await getSession();

  if (session.status === "authenticated") return <>{children}</>;

  return (
    <div className="mx-auto max-w-5xl px-(--gutter) pb-28 pt-[calc(var(--nav-h)+3rem)] sm:pb-36 sm:pt-[calc(var(--nav-h)+5rem)]">
      {session.status === "unavailable" ? (
        <div className="mx-auto max-w-2xl text-center">
          <div className="panel panel-form ticked rounded-2xl px-8 py-16 sm:px-14">
            <p className="hud">Signal lost</p>
            <h1 className="section-title mt-6">Mission control is offline</h1>
            <p className="body-copy mx-auto mt-6 max-w-md">
              We could not reach the account system just now. Try again in a moment.
            </p>
          </div>
        </div>
      ) : (
        <SignInCard
          googleReady={isGoogleConfigured()}
          eyebrow="Members only"
          title={title}
          lead={lead}
          callbackURL={callbackURL}
        />
      )}
    </div>
  );
}
