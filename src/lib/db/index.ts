import { connectMongoose } from "./mongoose";
import { Registration } from "@/lib/models/Registration";

/**
 * Connects Mongoose and guarantees the unique indexes exist.
 *
 * `syncIndexes` runs once per process rather than per request — Atlas is the
 * source of truth for the constraints, and a duplicate registration must be
 * rejected by the database even if two requests race past the read check.
 */
let indexesReady: Promise<unknown> | undefined;

export async function connectDb() {
  const conn = await connectMongoose();
  indexesReady ??= Registration.syncIndexes().catch((error) => {
    // Never take the request down over index sync; log and carry on.
    console.error("[db] index sync failed", error);
    indexesReady = undefined;
  });
  await indexesReady;
  return conn;
}

export { Registration };
