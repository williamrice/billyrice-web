"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAllowedAdminSession } from "@/lib/auth-guards";
import { publicResumeProfileSettingSchema } from "../schemas/settings";
import {
  invalidatePublicResumeSetting,
  PUBLIC_RESUME_PROFILE_KEY,
} from "../queries/settings";

export async function setPublicResumeProfile(formData: FormData) {
  const session = await getAllowedAdminSession();
  if (!session) throw new Error("Unauthorized");

  const data = publicResumeProfileSettingSchema.parse({
    profileId: String(formData.get("profileId") ?? ""),
  });
  const profile = await prisma.professionalProfile.findUnique({
    where: { id: data.profileId },
    select: { id: true, published: true },
  });
  if (!profile?.published) {
    throw new Error("The public resume version must be published");
  }

  await prisma.applicationSetting.upsert({
    where: { key: PUBLIC_RESUME_PROFILE_KEY },
    create: { key: PUBLIC_RESUME_PROFILE_KEY, value: data },
    update: { value: data },
  });
  await invalidatePublicResumeSetting();
  revalidatePath("/resume");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=true");
}
