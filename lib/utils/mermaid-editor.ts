import { MERMAID_SOURCE_MAX_LENGTH } from "@/features/tools/mermaid/schemas/diagram";
import type { MermaidTheme, MermaidVisibility } from "@/features/tools/mermaid/types/diagram";

export const MERMAID_LAYOUT_KEY = "billyrice:mermaid-layout:v1";

export type MermaidDiagnostic = {
  message: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

export type MermaidLayout = {
  version: 1;
  source: number;
  preview: number;
  collapsed: boolean;
};

export type MermaidEditorState = {
  title: string;
  slug: string;
  source: string;
  theme: MermaidTheme;
  visibility: MermaidVisibility;
  notes: string;
};

type MermaidParserError = Error & {
  hash?: {
    loc?: {
      first_line?: number;
      last_line?: number;
      first_column?: number;
      last_column?: number;
    };
  };
};

const DEFAULT_LAYOUT: MermaidLayout = {
  version: 1,
  source: 50,
  preview: 50,
  collapsed: false,
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function stripMermaidMarkdownFence(value: string) {
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  const lines = normalized.split("\n");
  if (lines.length < 3) return null;

  const opening = lines[0].match(/^(`{3,}|~{3,})\s*(mermaid|mmd)\s*$/i);
  if (!opening) return null;

  const fence = opening[1];
  const closing = lines.at(-1)?.trim() ?? "";
  const closingPattern = fence[0] === "`" ? /^`+$/ : /^~+$/;
  if (!closingPattern.test(closing) || closing.length < fence.length) return null;
  if (lines.slice(1, -1).some((line) => /^\s*(?:`{3,}|~{3,})/.test(line))) return null;

  const source = lines.slice(1, -1).join("\n");
  return source.length <= MERMAID_SOURCE_MAX_LENGTH ? source : null;
}

export function hasMermaidEditorChanged(
  current: MermaidEditorState,
  baseline: MermaidEditorState,
) {
  return Object.keys(current).some((key) => {
    const field = key as keyof MermaidEditorState;
    return current[field] !== baseline[field];
  });
}

export function normalizeMermaidDiagnostic(error: unknown, source: string): MermaidDiagnostic {
  const parserError = error as MermaidParserError;
  const message = (error instanceof Error ? error.message : "The diagram could not be rendered.")
    .split("\n")
    .find((line) => line.trim())
    ?.trim() || "The diagram could not be rendered.";
  const lines = source.split("\n");
  const fallbackLine = Math.max(1, lines.findIndex((line) => line.trim()) + 1);
  const location = parserError?.hash?.loc;
  const startLineNumber = clamp(location?.first_line ?? fallbackLine, 1, Math.max(lines.length, 1));
  const endLineNumber = clamp(
    location?.last_line ?? startLineNumber,
    startLineNumber,
    Math.max(lines.length, 1),
  );
  const startLineLength = lines[startLineNumber - 1]?.length ?? 0;
  const endLineLength = lines[endLineNumber - 1]?.length ?? 0;
  const startColumn = clamp((location?.first_column ?? 0) + 1, 1, startLineLength + 1);
  const minimumEndColumn = endLineNumber === startLineNumber
    ? Math.min(startColumn + 1, endLineLength + 1)
    : 1;
  const endColumn = clamp(
    (location?.last_column ?? endLineLength) + 1,
    minimumEndColumn,
    endLineLength + 1,
  );

  return { message, startLineNumber, startColumn, endLineNumber, endColumn };
}

export function parseMermaidLayout(value: string | null): MermaidLayout {
  if (!value) return DEFAULT_LAYOUT;
  try {
    const parsed = JSON.parse(value) as Partial<MermaidLayout>;
    if (
      parsed.version !== 1 ||
      typeof parsed.source !== "number" ||
      typeof parsed.preview !== "number" ||
      typeof parsed.collapsed !== "boolean" ||
      parsed.source < 25 ||
      parsed.preview < 35 ||
      Math.abs(parsed.source + parsed.preview - 100) > 0.5
    ) return DEFAULT_LAYOUT;
    return parsed as MermaidLayout;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function createMermaidLayout(
  source: number,
  preview: number,
  collapsed: boolean,
): MermaidLayout {
  return { version: 1, source, preview, collapsed };
}
