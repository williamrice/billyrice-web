"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAllowedAdminSession } from "@/lib/auth-guards";
import { getFormString, requireFormString } from "@/lib/utils/form-data";
import {
  mermaidRevisionRequestSchema,
  parseMermaidDiagramFormData,
  parseMermaidDiagramUpdateFormData,
} from "../schemas/diagram";
import { createMermaidDiagramRecord, updateMermaidDiagramRecord } from "../services/diagrams";
import { fromPrismaMermaidTheme } from "../services/diagrams";

function revalidateMermaidRoutes(...slugs: Array<string | undefined>) {
  revalidatePath("/tools");
  revalidatePath("/tools/mermaid");
  revalidatePath("/admin/tools/mermaid");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/tools/mermaid/${slug}`);
  }
}

export async function createMermaidDiagram(formData: FormData) {
  const session = await requireAllowedAdminSession();
  const result = await createMermaidDiagramRecord(
    session.user.id,
    parseMermaidDiagramFormData(formData),
  );
  revalidateMermaidRoutes(result.slug);
  return result;
}

export async function updateMermaidDiagram(formData: FormData) {
  const session = await requireAllowedAdminSession();
  const previousSlug = getFormString(formData, "previousSlug").trim() || undefined;
  const result = await updateMermaidDiagramRecord(
    session.user.id,
    parseMermaidDiagramUpdateFormData(formData),
  );
  revalidateMermaidRoutes(previousSlug, result.slug);
  return result;
}

export async function loadMermaidRevision(diagramId: string, version: number) {
  const session = await requireAllowedAdminSession();
  const request = mermaidRevisionRequestSchema.parse({ diagramId, version });
  const revision = await prisma.mermaidDiagramRevision.findFirst({
    where: {
      diagramId: request.diagramId,
      version: request.version,
      diagram: { ownerId: session.user.id },
    },
    select: { version: true, source: true, notes: true, theme: true },
  });
  if (!revision) throw new Error("Revision not found.");

  return { ...revision, notes: revision.notes ?? "", theme: fromPrismaMermaidTheme(revision.theme) };
}

export async function deleteMermaidDiagram(formData: FormData) {
  const session = await requireAllowedAdminSession();
  const id = requireFormString(formData, "id", "Diagram ID is required");
  const diagram = await prisma.mermaidDiagram.findFirst({
    where: { id, ownerId: session.user.id },
    select: { slug: true },
  });
  if (!diagram) throw new Error("Diagram not found.");
  await prisma.mermaidDiagram.delete({ where: { id } });
  revalidateMermaidRoutes(diagram.slug);
}
