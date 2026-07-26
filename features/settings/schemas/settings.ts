import { z } from "zod";

export const publicResumeProfileSettingSchema = z.object({
  profileId: z.string().trim().min(1),
});
