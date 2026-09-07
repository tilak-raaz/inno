"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

/**
 * Browser-side auth. Only ever starts flows and reads session state — every
 * authorisation decision is made again on the server.
 */
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export const { signIn, signOut, useSession } = authClient;
