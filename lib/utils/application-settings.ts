import "server-only";

import { unstable_cache, updateTag } from "next/cache";
import type { ZodType } from "zod";
import prisma from "@/lib/prisma";

const SETTING_CACHE_TTL_SECONDS = 300;
const settingCacheTag = (key: string) => `application-setting:${key}`;

function readCachedApplicationSetting(key: string) {
  return unstable_cache(
    () =>
      prisma.applicationSetting.findUnique({
        where: { key },
        select: { value: true },
      }),
    ["application-setting", key],
    {
      revalidate: SETTING_CACHE_TTL_SECONDS,
      tags: [settingCacheTag(key)],
    },
  )();
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
