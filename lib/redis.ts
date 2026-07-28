import "server-only";

import { createClient, type RedisClientType } from "redis";
import { env } from "@/lib/env";

let clientPromise: Promise<RedisClientType | null> | undefined;

export function getRedisClient() {
  if (!clientPromise) {
    clientPromise = connectRedis();
  }
  return clientPromise;
}

async function connectRedis(): Promise<RedisClientType | null> {
  if (!env.REDIS_URL) return null;

  const client = createClient({ url: env.REDIS_URL });
  client.on("error", () => {
    // Callers fall back to PostgreSQL. Avoid logging connection details.
  });

  try {
    await client.connect();
    return client as RedisClientType;
  } catch {
    client.destroy();
    return null;
  }
}
