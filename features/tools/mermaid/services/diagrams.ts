import "server-only";

import prisma from "@/lib/prisma";
import {
  MermaidDiagramTheme,
  MermaidDiagramVisibility,
  type Prisma,
} from "@/prisma/generated/prisma/client";
import type { z } from "zod";
import {
  mermaidDiagramInputSchema,
  updateMermaidDiagramSchema,
} from "../schemas/diagram";
import type { MermaidSaveResult, MermaidTheme, MermaidVisibility } from "../types/diagram";

type DiagramInput = z.infer<typeof mermaidDiagramInputSchema>;
type DiagramUpdate = z.infer<typeof updateMermaidDiagramSchema>;

export function toPrismaMermaidTheme(theme: MermaidTheme): MermaidDiagramTheme {
  return theme.toUpperCase() as MermaidDiagramTheme;
}

export function fromPrismaMermaidTheme(theme: MermaidDiagramTheme): MermaidTheme {
  return theme.toLowerCase() as MermaidTheme;
}

export function toPrismaMermaidVisibility(visibility: MermaidVisibility): MermaidDiagramVisibility {
  return visibility.toUpperCase() as MermaidDiagramVisibility;
}

export function fromPrismaMermaidVisibility(
  visibility: MermaidDiagramVisibility,
): MermaidVisibility {
  return visibility.toLowerCase() as MermaidVisibility;
}

async function assertSlugAvailable(
  transaction: Prisma.TransactionClient,
  slug: string,
  diagramId?: string,
) {
  const [diagram, redirect] = await Promise.all([
    transaction.mermaidDiagram.findUnique({ where: { slug }, select: { id: true } }),
    transaction.mermaidDiagramSlugRedirect.findUnique({
      where: { slug },
      select: { diagramId: true },
    }),
  ]);

  if ((diagram && diagram.id !== diagramId) || (redirect && redirect.diagramId !== diagramId)) {
    throw new Error("That diagram slug is already in use.");
  }
}

export async function createMermaidDiagramRecord(
  ownerId: string,
  input: DiagramInput,
): Promise<MermaidSaveResult> {
  const data = mermaidDiagramInputSchema.parse(input);
  const theme = toPrismaMermaidTheme(data.theme);
  const visibility = toPrismaMermaidVisibility(data.visibility);

  return prisma.$transaction(async (transaction) => {
    await assertSlugAvailable(transaction, data.slug);
    const diagram = await transaction.mermaidDiagram.create({
      data: { ...data, ownerId, theme, visibility },
    });
    await transaction.mermaidDiagramRevision.create({
      data: {
        diagramId: diagram.id,
        version: 1,
        title: diagram.title,
        slug: diagram.slug,
        source: diagram.source,
        theme: diagram.theme,
        visibility: diagram.visibility,
      },
    });

    return { id: diagram.id, slug: diagram.slug, currentRevision: 1, changed: true };
  });
}

export async function updateMermaidDiagramRecord(
  ownerId: string,
  input: DiagramUpdate,
): Promise<MermaidSaveResult> {
  const data = updateMermaidDiagramSchema.parse(input);

  return prisma.$transaction(async (transaction) => {
    const current = await transaction.mermaidDiagram.findFirst({
      where: { id: data.id, ownerId },
    });
    if (!current) throw new Error("Diagram not found.");
    if (current.currentRevision !== data.expectedRevision) {
      throw new Error("A newer revision exists. Refresh before saving your changes.");
    }

    const theme = toPrismaMermaidTheme(data.theme);
    const visibility = toPrismaMermaidVisibility(data.visibility);
    const changed =
      current.title !== data.title ||
      current.slug !== data.slug ||
      current.source !== data.source ||
      current.theme !== theme ||
      current.visibility !== visibility;

    if (!changed) {
      return {
        id: current.id,
        slug: current.slug,
        currentRevision: current.currentRevision,
        changed: false,
      };
    }

    await assertSlugAvailable(transaction, data.slug, current.id);
    if (current.slug !== data.slug) {
      await transaction.mermaidDiagramSlugRedirect.deleteMany({
        where: { slug: data.slug, diagramId: current.id },
      });
      await transaction.mermaidDiagramSlugRedirect.upsert({
        where: { slug: current.slug },
        create: { slug: current.slug, diagramId: current.id },
        update: { diagramId: current.id },
      });
    }

    const nextRevision = current.currentRevision + 1;
    const updated = await transaction.mermaidDiagram.updateMany({
      where: { id: current.id, ownerId, currentRevision: data.expectedRevision },
      data: {
        title: data.title,
        slug: data.slug,
        source: data.source,
        theme,
        visibility,
        currentRevision: nextRevision,
      },
    });
    if (updated.count !== 1) {
      throw new Error("A newer revision exists. Refresh before saving your changes.");
    }

    await transaction.mermaidDiagramRevision.create({
      data: {
        diagramId: current.id,
        version: nextRevision,
        title: data.title,
        slug: data.slug,
        source: data.source,
        theme,
        visibility,
      },
    });

    return { id: current.id, slug: data.slug, currentRevision: nextRevision, changed: true };
  });
}
