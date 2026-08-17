import type { MermaidTheme } from "@/features/tools/mermaid/types/diagram";
import {
  MERMAID_SOURCE_MAX_LENGTH,
  mermaidThemeSchema,
} from "@/features/tools/mermaid/schemas/diagram";

const LOCAL_DRAFT_VERSION = 1;
const MERMAID_ZOOM_MIN = 25;
const MERMAID_ZOOM_MAX = 400;

export type MermaidSvgDimensions = {
  width: number;
  height: number;
};

export type MermaidLocalDraft = {
  version: typeof LOCAL_DRAFT_VERSION;
  source: string;
  theme: MermaidTheme;
  updatedAt: string;
  baseRevision: number | null;
};

export function getMermaidDraftKey(diagramId?: string) {
  return `billyrice:mermaid-draft:${diagramId ?? "new"}`;
}

export function parseMermaidLocalDraft(value: string | null): MermaidLocalDraft | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<MermaidLocalDraft>;
    if (
      parsed.version !== LOCAL_DRAFT_VERSION ||
      typeof parsed.source !== "string" ||
      parsed.source.length > MERMAID_SOURCE_MAX_LENGTH ||
      !mermaidThemeSchema.safeParse(parsed.theme).success ||
      typeof parsed.updatedAt !== "string" ||
      (parsed.baseRevision !== null && typeof parsed.baseRevision !== "number")
    ) {
      return null;
    }

    return parsed as MermaidLocalDraft;
  } catch {
    return null;
  }
}

export function createMermaidLocalDraft(
  source: string,
  theme: MermaidTheme,
  baseRevision: number | null,
): MermaidLocalDraft {
  return {
    version: LOCAL_DRAFT_VERSION,
    source,
    theme,
    updatedAt: new Date().toISOString(),
    baseRevision,
  };
}

export function hasMermaidContentChanged(
  source: string,
  theme: MermaidTheme,
  baselineSource: string,
  baselineTheme: MermaidTheme,
) {
  return source !== baselineSource || theme !== baselineTheme;
}

export function mermaidDownloadFilename(title: string, extension: "mmd" | "svg") {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "mermaid-diagram"}.${extension}`;
}

export function getMermaidErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "The diagram could not be rendered.";
  return message.split("\n").find((line) => line.trim())?.trim() || "The diagram could not be rendered.";
}

export function getMermaidSvgDimensions(svg: string): MermaidSvgDimensions | null {
  const viewBox = svg.match(/\bviewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i);
  if (!viewBox) return null;

  const width = Number(viewBox[1]);
  const height = Number(viewBox[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

export function calculateMermaidFitZoom(
  viewportWidth: number,
  viewportHeight: number,
  diagramWidth: number,
  diagramHeight: number,
) {
  if (
    viewportWidth <= 0 ||
    viewportHeight <= 0 ||
    diagramWidth <= 0 ||
    diagramHeight <= 0
  ) {
    return 100;
  }

  const scale = Math.min(viewportWidth / diagramWidth, viewportHeight / diagramHeight);
  return Math.min(MERMAID_ZOOM_MAX, Math.max(MERMAID_ZOOM_MIN, Math.floor(scale * 100)));
}
