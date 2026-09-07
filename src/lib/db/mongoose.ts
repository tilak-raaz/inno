import mongoose from "mongoose";
import { env } from "@/lib/env";

/**
 * Mongoose connection for the application's own collections.
 *
 * Shares the Atlas cluster with Better Auth but keeps its own connection, so
 * the auth adapter and the app models stay independent. Cached on globalThis
 * to survive hot reloads.
 */

declare global {
  var __innoMongoose: Promise<typeof mongoose> | undefined;
}

export function connectMongoose(): Promise<typeof mongoose> {
  if (!globalThis.__innoMongoose) {
    mongoose.set("strictQuery", true);
    globalThis.__innoMongoose = mongoose.connect(env.mongoUri, {
      dbName: env.mongoDbName,
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });
  }
  return globalThis.__innoMongoose;
}
