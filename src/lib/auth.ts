import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";
import { otpEmail, sendEmail } from "@/lib/email";
import { getDb, getMongoClient } from "@/lib/db/mongo";
import { env } from "@/lib/env";

/**
 * Better Auth server instance.
 *
 * Sessions live in the same Atlas database as the registrations, via the
 * official MongoDB adapter. Google is the only provider: this is a campus
 * festival, and an OAuth identity is what ties a person to exactly one
 * registration.
 *
 * The instance is built lazily and cached, because reading the environment at
 * module scope would break `next build` when secrets are absent.
 */

async function build() {
  const [db, client] = await Promise.all([getDb(), getMongoClient()]);

  return betterAuth({
    appName: "INNOVISION 2026",
    baseURL: env.authUrl,
    secret: env.authSecret,
    database: mongodbAdapter(db, {
      client,
      // Atlas is a replica set, so multi-document transactions are available.
      // Turn off via MONGO_TRANSACTIONS=false when pointing at a standalone.
      transaction: env.mongoTransactions,
    }),
    socialProviders: {
      google: {
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret,
      },
    },
    account: {
      accountLinking: {
        // Google verifies its addresses, so linking a returning user to their
        // existing account by email is safe and avoids accidental duplicates.
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300, // 5 minutes
        // A code that lands on a stranger's screen is a full account takeover,
        // so give it a short life and few attempts.
        allowedAttempts: 5,
        async sendVerificationOTP({ email, otp, type }) {
          const message = otpEmail(otp, type);
          const result = await sendEmail({ to: email, ...message });
          if (!result.ok) throw new Error(result.message);
        },
      }),
      // nextCookies() must stay last: it writes the Set-Cookie headers after
      // the other plugins have finished with the response.
      nextCookies(),
    ],
  });
}

/* Inferred, not annotated: Better Auth's `Auth` type is generic over the exact
   options object, so a hand-written annotation loses the plugin surface. */
type AuthInstance = Awaited<ReturnType<typeof build>>;

/*
 * Module-scoped, deliberately NOT on globalThis.
 *
 * The database handles below are globalThis-cached, because leaking a
 * connection pool on every hot reload is expensive. The auth instance is the
 * opposite case: it is cheap to rebuild, and caching it globally meant editing
 * this file did nothing in dev — the old instance survived HMR, so a newly
 * added plugin's routes stayed 404 until a full restart. A module-level
 * binding is reset by HMR and evaluated once in production, which is what we
 * want in both.
 */
let authPromise: Promise<AuthInstance> | undefined;

export function getAuth(): Promise<AuthInstance> {
  authPromise ??= build();
  return authPromise;
}
