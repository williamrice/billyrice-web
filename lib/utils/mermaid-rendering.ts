import type { MermaidConfig } from "mermaid";
import type { MermaidTheme } from "@/features/tools/mermaid/types/diagram";
import { MERMAID_SOURCE_MAX_LENGTH } from "@/features/tools/mermaid/schemas/diagram";

export function createMermaidRenderConfig(theme: MermaidTheme): MermaidConfig {
  return {
    startOnLoad: false,
    securityLevel: "strict",
    secure: ["secure", "securityLevel", "startOnLoad", "maxTextSize", "maxEdges", "theme"],
    theme,
    maxTextSize: MERMAID_SOURCE_MAX_LENGTH,
    maxEdges: 500,
    suppressErrorRendering: true,
  };
}
