import "server-only";

import { cache } from "react";
import {
  invalidateApplicationSettings,
  readApplicationSetting,
} from "@/lib/utils/application-settings";
import {
  defaultDeviconSetting,
  defaultProjectsSetting,
  deviconSettingSchema,
  projectsSettingSchema,
  publicResumeProfileSettingSchema,
} from "../schemas/settings";

export const PUBLIC_RESUME_PROFILE_KEY = "resume.publicProfile";
export const DEVICON_SETTING_KEY = "appearance.devicons";
export const PROJECTS_SETTING_KEY = "features.projects";

export async function getPublicResumeProfileId() {
  const setting = await readApplicationSetting(
    PUBLIC_RESUME_PROFILE_KEY,
    publicResumeProfileSettingSchema.nullable(),
    null,
  );
  return setting?.profileId ?? null;
}

export async function invalidatePublicResumeSetting() {
  await invalidateApplicationSettings([PUBLIC_RESUME_PROFILE_KEY]);
}

export const getDeviconSetting = cache(() =>
  readApplicationSetting(
    DEVICON_SETTING_KEY,
    deviconSettingSchema,
    defaultDeviconSetting,
  ),
);

export const getProjectsSetting = cache(() =>
  readApplicationSetting(
    PROJECTS_SETTING_KEY,
    projectsSettingSchema,
    defaultProjectsSetting,
  ),
);
