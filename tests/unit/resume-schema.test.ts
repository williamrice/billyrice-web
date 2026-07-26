import { describe, expect, it } from "vitest";
import {
  positionSchema,
  profileSchema,
  resumeProjectSchema,
  skillSchema,
} from "../../features/resume/schemas/resume";

describe("resume schemas", () => {
  it("accepts a complete professional profile", () => {
    const result = profileSchema.safeParse({
      label: "Primary",
      slug: "primary",
      name: "Billy Rice",
      headline: "Software engineer and applied AI implementation leader",
      introduction:
        "I build dependable production software and integrate AI where it creates measurable leverage.",
      location: "Lexington, Kentucky",
      email: "hello@billyrice.com",
      availability: "",
      published: true,
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.availability).toBeNull();
  });

  it("restricts capabilities to intentional resume categories", () => {
    const result = skillSchema.safeParse({
      name: "Prompt engineering",
      category: "Hype",
      summary: "",
      sortOrder: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a position whose end date precedes its start date", () => {
    const result = positionSchema.safeParse({
      organizationName: "Example Organization",
      organizationLocation: "",
      organizationUrl: "",
      title: "Software Engineer",
      kind: "work",
      startDate: new Date("2025-01-01T12:00:00Z"),
      endDate: new Date("2024-01-01T12:00:00Z"),
      summary: "Built and operated dependable production systems.",
      sortOrder: 0,
    });

    expect(result.success).toBe(false);
  });

  it("normalizes optional resume project context", () => {
    const result = resumeProjectSchema.safeParse({
      projectId: "12",
      sortOrder: "2",
      note: "",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.note).toBeNull();
  });
});
