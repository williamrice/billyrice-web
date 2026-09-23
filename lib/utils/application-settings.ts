import "server-only";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import type { ZodType } from "zod";
import prisma from "@/lib/prisma";

const SETTING_CACHE_TTL_SECONDS = 300;
const settingCacheTag = (key: string) => `application-setting:${key}`;

async function readCachedApplicationSetting(key: string) {
  "use cache";
  cacheLife({
    stale: SETTING_CACHE_TTL_SECONDS,
    revalidate: SETTING_CACHE_TTL_SECONDS,
    expire: 86_400,
  });
  cacheTag(settingCacheTag(key));
  return prisma.applicationSetting.findUnique({
    where: { key },
    select: { value: true },
  });
}

export async function readApplicationSetting<T>(
  key: string,
  schema: ZodType<T>,
  fallback: T,
) {
  const setting = await readCachedApplicationSetting(key);
  const parsed = schema.safeParse(setting?.value);
  return parsed.success ? parsed.data : fallback;
}

export async function invalidateApplicationSettings(keys: string[]) {
  keys.forEach((key) => updateTag(settingCacheTag(key)));
}
