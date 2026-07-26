import { z } from "zod";

const optionalText = z.string().trim().max(1000).transform((value) => value || null);
const optionalUrl = z.string().trim().transform((value, context) => {
  if (!value) return null;
  const parsed = z.url().safeParse(value);
  if (!parsed.success) {
    context.addIssue({ code: "custom", message: "Enter a valid URL" });
    return z.NEVER;
  }
  return value;
});

export const profileSchema = z.object({
  label: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(100),
  headline: z.string().trim().min(8).max(180),
  introduction: z.string().trim().min(20).max(3000),
  location: z.string().trim().min(2).max(120),
  email: optionalText.pipe(z.email().nullable()),
  availability: optionalText,
  published: z.boolean(),
});

export const duplicateProfileSchema = z.object({
  sourceProfileId: z.string().trim().min(1),
  label: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const positionSchema = z.object({
  organizationName: z.string().trim().min(2).max(160),
  organizationLocation: optionalText,
  organizationUrl: optionalUrl,
  title: z.string().trim().min(2).max(160),
  kind: z.enum(["work", "leadership", "service"]),
  startDate: z.coerce.date(),
  endDate: z.union([z.coerce.date(), z.null()]),
  summary: z.string().trim().min(10).max(3000),
  sortOrder: z.coerce.number().int().min(0).max(999),
}).refine(
  ({ startDate, endDate }) => endDate === null || endDate >= startDate,
  { path: ["endDate"], message: "End date cannot be before start date" },
);

export const accomplishmentSchema = z.object({
  positionId: z.string().min(1),
  statement: z.string().trim().min(8).max(1000),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.enum(["Implementation", "Architecture", "Applied AI", "Leadership", "Platform"]),
  summary: optionalText,
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(2).max(160),
  credential: z.string().trim().min(2).max(160),
  field: z.string().trim().min(2).max(160),
  completedAt: z.union([z.coerce.date(), z.null()]),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export const credentialSchema = z.object({
  name: z.string().trim().min(2).max(180),
  issuer: z.string().trim().min(2).max(160),
  issuedAt: z.union([z.coerce.date(), z.null()]),
  url: optionalUrl,
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export const resumeProjectSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  sortOrder: z.coerce.number().int().min(0).max(999),
  note: optionalText,
});
