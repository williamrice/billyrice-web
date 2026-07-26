import "server-only";

import prisma from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { publicResumeProfileSettingSchema } from "../schemas/settings";

export const PUBLIC_RESUME_PROFILE_KEY = "resume.publicProfile";
const cacheKey = `setting:${PUBLIC_RESUME_PROFILE_KEY}`;

export async function getPublicResumeProfileId() {
  const redis = await getRedisClient();

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = publicResumeProfileSettingSchema.safeParse(JSON.parse(cached));
        if (parsed.success) return parsed.data.profileId;
      }
    } catch {
      // PostgreSQL remains authoritative when Redis is unavailable or stale.
    }
  }

  const setting = await prisma.applicationSetting.findUnique({
    where: { key: PUBLIC_RESUME_PROFILE_KEY },
    select: { value: true },
  });
  const parsed = publicResumeProfileSettingSchema.safeParse(setting?.value);
  if (!parsed.success) return null;

  if (redis) {
    try {
      await redis.set(cacheKey, JSON.stringify(parsed.data), { EX: 300 });
    } catch {
      // A cache write failure must not fail a public read.
    }
  }
  return parsed.data.profileId;
}

export async function invalidatePublicResumeSetting() {
  const redis = await getRedisClient();
  if (!redis) return;
  try {
    await redis.del(cacheKey);
  } catch {
    // The short TTL bounds stale cache behavior.
  }
}
