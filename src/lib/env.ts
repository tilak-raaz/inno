/**
 * Server-side environment access.
 *
 * Read lazily through these helpers rather than at module scope: `next build`
 * imports route modules while prerendering, and a missing variable should fail
 * the request with a clear message, not the whole build.
 *
 * Nothing here is ever imported from a client component.
 */

function required(name: string, ...fallbacks: string[]): string {
  for (const key of [name, ...fallbacks]) {
    const value = process.env[key];
    if (value && value.trim()) return value.trim();
  }
  throw new Error(
    `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
  );
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export const env = {
  get mongoUri() {
    return required("MONGO_URI", "MONGODB_URI");
  },
  get mongoDbName() {
    return optional("MONGO_DB");
  },
  /** Atlas is a replica set and supports transactions; a standalone mongod is not. */
  get mongoTransactions() {
    return optional("MONGO_TRANSACTIONS") !== "false";
  },
  get authSecret() {
    return required("BETTER_AUTH_SECRET", "AUTH_SECRET");
  },
  get authUrl() {
    return (
      optional("BETTER_AUTH_URL") ??
      optional("NEXT_PUBLIC_APP_URL") ??
      "http://localhost:3000"
    );
  },
  get googleClientId() {
    return required("GOOGLE_CLIENT_ID");
  },
  get googleClientSecret() {
    return required("GOOGLE_CLIENT_SECRET");
  },
  get cloudinary() {
    return {
      cloudName: required("CLOUDINARY_CLOUD_NAME"),
      apiKey: required("CLOUDINARY_API_KEY"),
      apiSecret: required("CLOUDINARY_API_SECRET"),
      folder: optional("CLOUDINARY_FOLDER") ?? "innovision2026/id-cards",
    };
  },
};

/** True when Google OAuth is configured; lets the UI explain itself instead of erroring. */
export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** True when Cloudinary is configured; the upload route reports this cleanly. */
export function isStorageConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}
