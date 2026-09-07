import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";

/**
 * Native MongoDB client — used by the Better Auth adapter, which wants a `Db`.
 *
 * Cached on globalThis so Next's dev server does not open a new pool on every
 * hot reload.
 */

declare global {
  var __innoMongo: { client: MongoClient; promise: Promise<MongoClient> } | undefined;
}

function clientPromise(): Promise<MongoClient> {
  if (!globalThis.__innoMongo) {
    const client = new MongoClient(env.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
    globalThis.__innoMongo = { client, promise: client.connect() };
  }
  return globalThis.__innoMongo.promise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  const name = env.mongoDbName;
  return name ? client.db(name) : client.db();
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise();
}
