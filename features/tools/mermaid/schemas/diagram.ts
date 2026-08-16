import { z } from "zod";
import { getFormString } from "@/lib/utils/form-data";
import { mermaidThemes, mermaidVisibilities } from "../types/diagram";

export const MERMAID_SOURCE_MAX_LENGTH = 100_000;
export const MERMAID_NOTES_MAX_LENGTH = 5_000;

const mermaidNotesSchema = z
  .string()
  .trim()
  .max(MERMAID_NOTES_MAX_LENGTH)
  .transform((value) => value || null);

export const mermaidThemeSchema = z.enum(mermaidThemes);
export const mermaidVisibilitySchema = z.enum(mermaidVisibilities);

export const mermaidDiagramInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  source: z.string().min(1, "Diagram source is required").max(MERMAID_SOURCE_MAX_LENGTH),
  notes: mermaidNotesSchema,
  theme: mermaidThemeSchema,
  visibility: mermaidVisibilitySchema,
});

export const updateMermaidDiagramSchema = mermaidDiagramInputSchema.extend({
  id: z.string().cuid(),
  expectedRevision: z.coerce.number().int().positive(),
});

export const mermaidRevisionRequestSchema = z.object({
  diagramId: z.string().cuid(),
  version: z.coerce.number().int().positive(),
});

export function parseMermaidDiagramFormData(formData: FormData) {
  return mermaidDiagramInputSchema.parse({
    title: getFormString(formData, "title"),
    slug: getFormString(formData, "slug"),
    source: getFormString(formData, "source"),
    notes: getFormString(formData, "notes"),
    theme: getFormString(formData, "theme"),
    visibility: getFormString(formData, "visibility"),
  });
}

export function parseMermaidDiagramUpdateFormData(formData: FormData) {
  return updateMermaidDiagramSchema.parse({
    ...parseMermaidDiagramFormData(formData),
    id: getFormString(formData, "id"),
    expectedRevision: getFormString(formData, "expectedRevision"),
  });
}
