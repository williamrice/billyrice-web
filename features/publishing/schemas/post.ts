import { z } from "zod";
import { PublicationStatus } from "../types/publication";

export const publicationStatusSchema = z.enum(PublicationStatus);

export const postInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  excerpt: z.string().trim().min(10).max(500),
  markdown: z.string().trim().min(20).max(200_000),
  status: publicationStatusSchema,
});

export const externalPostInputSchema = postInputSchema.extend({
  externalId: z.string().trim().min(1).max(200),
  source: z.string().trim().min(1).max(50).default("api"),
});

export function slugifyPostTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}
