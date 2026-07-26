import { describe, expect, it } from "vitest";
import { publicResumeProfileSettingSchema } from "../../features/settings/schemas/settings";

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
});
