import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

/** Better Auth mounts its whole surface here: sign-in, callback, session, sign-out. */
const handler = async (request: Request) => {
  const auth = await getAuth();
  return auth.handler(request);
};

export const { GET, POST } = toNextJsHandler(handler);
