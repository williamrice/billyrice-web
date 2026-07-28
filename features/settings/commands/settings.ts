"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAllowedAdminSession } from "@/lib/auth-guards";
import { getFormString } from "@/lib/utils/form-data";
import { invalidateApplicationSettings } from "@/lib/utils/application-settings";
import {
  deviconSettingSchema,
  projectsSettingSchema,
  publicResumeProfileSettingSchema,
} from "../schemas/settings";
import {
  DEVICON_SETTING_KEY,
  invalidatePublicResumeSetting,
  PROJECTS_SETTING_KEY,
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

export async function setDeviconSetting(formData: FormData) {
  const session = await getAllowedAdminSession();
  if (!session) throw new Error("Unauthorized");

  const data = deviconSettingSchema.parse({
    enabled: formData.get("enabled") === "on",
    version: getFormString(formData, "version"),
    icons: formData.getAll("icons").map(String),
    opacity: Number(getFormString(formData, "opacity")) / 100,
    size: Number(getFormString(formData, "size")),
    motionEnabled: formData.get("motionEnabled") === "on",
  });

  await prisma.applicationSetting.upsert({
    where: { key: DEVICON_SETTING_KEY },
    create: { key: DEVICON_SETTING_KEY, value: data },
    update: { value: data },
  });
  await invalidateApplicationSettings([DEVICON_SETTING_KEY]);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=true");
}

export async function setProjectsSetting(formData: FormData) {
  const session = await getAllowedAdminSession();
  if (!session) throw new Error("Unauthorized");

  const data = projectsSettingSchema.parse({
    enabled: formData.get("enabled") === "on",
  });

  await prisma.applicationSetting.upsert({
    where: { key: PROJECTS_SETTING_KEY },
    create: { key: PROJECTS_SETTING_KEY, value: data },
    update: { value: data },
  });
  await invalidateApplicationSettings([PROJECTS_SETTING_KEY]);
  revalidatePath("/", "layout");
  revalidatePath("/projects", "layout");
  revalidatePath("/resume");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=true");
}
