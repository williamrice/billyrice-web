import { z } from "zod";
import {
  availableDevicons,
  type DeviconSetting,
} from "../types/devicons";

export const publicResumeProfileSettingSchema = z.object({
  profileId: z.string().trim().min(1),
});

export const deviconIdSchema = z.enum(availableDevicons.map((icon) => icon.id));

export const deviconSettingSchema = z.object({
  enabled: z.boolean(),
  version: z.string().trim().regex(/^v\d+\.\d+\.\d+$/, "Use a version like v2.17.0"),
  icons: z.array(deviconIdSchema).min(1, "Select at least one icon").max(24),
  opacity: z.number().min(0.01).max(0.2),
  size: z.number().int().min(40).max(120),
  motionEnabled: z.boolean(),
});

export const projectsSettingSchema = z.object({
  enabled: z.boolean(),
});

export const defaultDeviconSetting = {
  enabled: true,
  version: "v2.17.0",
  icons: [
    "typescript",
    "react",
    "nextjs",
    "nodejs",
    "csharp",
    "dotnetcore",
    "php",
    "wordpress",
    "mysql",
    "postgresql",
    "tailwindcss",
    "html5",
  ],
  opacity: 0.075,
  size: 72,
  motionEnabled: true,
} satisfies DeviconSetting;

export const defaultProjectsSetting = {
  enabled: true,
} satisfies z.infer<typeof projectsSettingSchema>;
