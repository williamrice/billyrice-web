import "server-only";

import type { ZodType } from "zod";
import prisma from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";

const SETTING_CACHE_TTL_SECONDS = 300;

export async function readApplicationSetting<T>(
  key: string,
  schema: ZodType<T>,
  fallback: T,
) {
  const redis = await getRedisClient();
  const cacheKey = `setting:${key}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = schema.safeParse(JSON.parse(cached));
        if (parsed.success) return parsed.data;
      }
    } catch {
      // PostgreSQL remains authoritative when Redis is unavailable or stale.
    }
  }

  const setting = await prisma.applicationSetting.findUnique({
    where: { key },
    select: { value: true },
  });
  const parsed = schema.safeParse(setting?.value);
  const value = parsed.success ? parsed.data : fallback;

  if (redis) {
    try {
      await redis.set(cacheKey, JSON.stringify(value), {
        EX: SETTING_CACHE_TTL_SECONDS,
      });
    } catch {
      // A cache write failure must not fail a public read.
    }
  }

  return value;
}

export async function invalidateApplicationSettings(keys: string[]) {
  const redis = await getRedisClient();
  if (!redis || keys.length === 0) return;

  try {
    await redis.del(keys.map((key) => `setting:${key}`));
  } catch {
    // The short TTL bounds stale cache behavior.
  }
}
