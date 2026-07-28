import { describe, expect, it } from "vitest";
import {
  defaultDeviconSetting,
  deviconSettingSchema,
  projectsSettingSchema,
  publicResumeProfileSettingSchema,
} from "../../features/settings/schemas/settings";

describe("application settings schemas", () => {
  it("accepts a configured public resume profile", () => {
    expect(
      publicResumeProfileSettingSchema.safeParse({ profileId: "profile-id" }).success,
    ).toBe(true);
  });

  it("rejects an empty public resume profile", () => {
    expect(
      publicResumeProfileSettingSchema.safeParse({ profileId: "" }).success,
    ).toBe(false);
  });

  it("accepts the default Devicon presentation setting", () => {
    expect(deviconSettingSchema.safeParse(defaultDeviconSetting).success).toBe(true);
  });

  it("rejects an unpinned Devicon version or empty icon pool", () => {
    expect(
      deviconSettingSchema.safeParse({
        ...defaultDeviconSetting,
        version: "latest",
        icons: [],
      }).success,
    ).toBe(false);
  });

  it("accepts enabled and disabled project visibility", () => {
    expect(projectsSettingSchema.safeParse({ enabled: true }).success).toBe(true);
    expect(projectsSettingSchema.safeParse({ enabled: false }).success).toBe(true);
  });
});
