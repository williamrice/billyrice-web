import "server-only";

import prisma from "@/lib/prisma";
import { MermaidDiagramVisibility } from "@/prisma/generated/prisma/client";
import type {
  MermaidEditorDiagram,
  MermaidLibraryDiagram,
  OwnerMermaidDiagram,
  PublicMermaidDiagram,
  MermaidRevisionSummary,
} from "../types/diagram";
import {
  fromPrismaMermaidTheme,
  fromPrismaMermaidVisibility,
} from "../services/diagrams";

function mapRevision(revision: {
  id: string;
  version: number;
  title: string;
  slug: string;
  theme: Parameters<typeof fromPrismaMermaidTheme>[0];
  visibility: Parameters<typeof fromPrismaMermaidVisibility>[0];
  createdAt: Date;
}): MermaidRevisionSummary {
  return {
    ...revision,
    theme: fromPrismaMermaidTheme(revision.theme),
    visibility: fromPrismaMermaidVisibility(revision.visibility),
    createdAt: revision.createdAt.toISOString(),
  };
}

export async function getMermaidDiagramForEditor(
  slug: string,
  ownerId?: string,
): Promise<{ diagram: MermaidEditorDiagram | null; canManage: boolean; redirectSlug?: string }> {
  const diagram = await prisma.mermaidDiagram.findUnique({
    where: { slug },
    include: {
      revisions: ownerId
        ? { orderBy: { version: "desc" }, select: {
            id: true, version: true, title: true, slug: true, theme: true,
            visibility: true, createdAt: true,
          } }
        : false,
    },
  });

  if (diagram) {
    const canManage = diagram.ownerId === ownerId;
    if (diagram.visibility !== MermaidDiagramVisibility.PUBLIC && !canManage) {
      return { diagram: null, canManage: false };
    }

    const publicDiagram: PublicMermaidDiagram = {
      id: diagram.id,
      title: diagram.title,
      slug: diagram.slug,
      source: diagram.source,
      theme: fromPrismaMermaidTheme(diagram.theme),
      visibility: fromPrismaMermaidVisibility(diagram.visibility),
      currentRevision: diagram.currentRevision,
      updatedAt: diagram.updatedAt.toISOString(),
    };
    const ownerDiagram: OwnerMermaidDiagram | undefined = canManage ? {
      ...publicDiagram,
      notes: diagram.notes ?? "",
      revisions: diagram.revisions ? diagram.revisions.map(mapRevision) : [],
    } : undefined;

    return {
      canManage,
      diagram: ownerDiagram ?? publicDiagram,
    };
  }

  const oldSlug = await prisma.mermaidDiagramSlugRedirect.findUnique({
    where: { slug },
    include: { diagram: { select: { slug: true, ownerId: true, visibility: true } } },
  });
  if (
    oldSlug &&
    (oldSlug.diagram.visibility === MermaidDiagramVisibility.PUBLIC || oldSlug.diagram.ownerId === ownerId)
  ) {
    return { diagram: null, canManage: false, redirectSlug: oldSlug.diagram.slug };
  }

  return { diagram: null, canManage: false };
}

export async function getMermaidDiagramLibrary(
  ownerId: string,
  search = "",
): Promise<MermaidLibraryDiagram[]> {
  const query = search.trim().slice(0, 100);
  const diagrams = await prisma.mermaidDiagram.findMany({
    where: {
      ownerId,
      ...(query ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { revisions: true } } },
  });

  return diagrams.map((diagram) => ({
    id: diagram.id,
    title: diagram.title,
    slug: diagram.slug,
    theme: fromPrismaMermaidTheme(diagram.theme),
    visibility: fromPrismaMermaidVisibility(diagram.visibility),
    currentRevision: diagram.currentRevision,
    updatedAt: diagram.updatedAt.toISOString(),
    revisionCount: diagram._count.revisions,
  }));
}
