import { describe, expect, it } from "vitest";
import {
  calculateMermaidFitZoom,
  createMermaidLocalDraft,
  getMermaidDraftKey,
  getMermaidErrorMessage,
  getMermaidSvgDimensions,
  hasMermaidContentChanged,
  mermaidDownloadFilename,
  parseMermaidLocalDraft,
} from "../../lib/utils/mermaid";
import { createMermaidRenderConfig } from "../../lib/utils/mermaid-rendering";
import {
  createMermaidLayout,
  hasMermaidEditorChanged,
  normalizeMermaidDiagnostic,
  parseMermaidLayout,
  stripMermaidMarkdownFence,
} from "../../lib/utils/mermaid-editor";
import { getMermaidCompletions, mermaidStarterCompletions } from "../../features/tools/mermaid/editor/completions";

describe("Mermaid editor utilities", () => {
  it("uses separate storage keys for new and saved diagrams", () => {
    expect(getMermaidDraftKey()).toBe("billyrice:mermaid-draft:new");
    expect(getMermaidDraftKey("diagram-1")).toBe("billyrice:mermaid-draft:diagram-1");
  });

  it("round-trips versioned local drafts and rejects invalid data", () => {
    const draft = createMermaidLocalDraft("flowchart LR\nA-->B", "forest", 3);
    expect(parseMermaidLocalDraft(JSON.stringify(draft))).toMatchObject({ theme: "forest", baseRevision: 3 });
    expect(parseMermaidLocalDraft('{"version":2}')).toBeNull();
    expect(parseMermaidLocalDraft("not-json")).toBeNull();
  });

  it("detects source or theme changes", () => {
    expect(hasMermaidContentChanged("A", "default", "A", "default")).toBe(false);
    expect(hasMermaidContentChanged("B", "default", "A", "default")).toBe(true);
    expect(hasMermaidContentChanged("A", "dark", "A", "default")).toBe(true);
  });

  it("creates portable filenames and concise errors", () => {
    expect(mermaidDownloadFilename("Résumé / Request Flow", "svg")).toBe("resume-request-flow.svg");
    expect(mermaidDownloadFilename("***", "mmd")).toBe("mermaid-diagram.mmd");
    expect(getMermaidErrorMessage(new Error("Parse error\nline two"))).toBe("Parse error");
  });

  it("locks the Mermaid security and resource limits", () => {
    const config = createMermaidRenderConfig("dark");
    expect(config).toMatchObject({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "dark",
      maxEdges: 500,
      suppressErrorRendering: true,
    });
    expect(config.secure).toEqual(expect.arrayContaining(["securityLevel", "maxTextSize", "maxEdges", "theme"]));
  });

  it("reads Mermaid viewBox dimensions and calculates a bounded fit zoom", () => {
    expect(getMermaidSvgDimensions('<svg viewBox="0 0 800 400"></svg>')).toEqual({
      width: 800,
      height: 400,
    });
    expect(getMermaidSvgDimensions("<svg></svg>")).toBeNull();
    expect(calculateMermaidFitZoom(600, 300, 800, 400)).toBe(75);
    expect(calculateMermaidFitZoom(4000, 2000, 100, 50)).toBe(400);
    expect(calculateMermaidFitZoom(100, 100, 1000, 1000)).toBe(25);
  });

  it("strips a complete Mermaid Markdown fence without changing other pastes", () => {
    expect(stripMermaidMarkdownFence("```mermaid\nflowchart LR\n  A --> B\n```"))
      .toBe("flowchart LR\n  A --> B");
    expect(stripMermaidMarkdownFence("~~~~ MMD\nsequenceDiagram\n  A->>B: Hi\n~~~~"))
      .toBe("sequenceDiagram\n  A->>B: Hi");
    expect(stripMermaidMarkdownFence("Text\n```mermaid\nA-->B\n```" )).toBeNull();
    expect(stripMermaidMarkdownFence("```javascript\nA-->B\n```" )).toBeNull();
    expect(stripMermaidMarkdownFence("```mermaid\nA-->B\n```\n```mermaid\nB-->C\n```" )).toBeNull();
  });

  it("normalizes parser locations and falls back to the first source line", () => {
    const rangedError = Object.assign(new Error("Parse error\nDetails"), {
      hash: { loc: { first_line: 2, last_line: 2, first_column: 2, last_column: 5 } },
    });
    expect(normalizeMermaidDiagnostic(rangedError, "flowchart LR\n  A -- B")).toEqual({
      message: "Parse error",
      startLineNumber: 2,
      startColumn: 3,
      endLineNumber: 2,
      endColumn: 6,
    });
    expect(normalizeMermaidDiagnostic(new Error("Unknown diagram"), "\nflowchart LR")).toMatchObject({
      startLineNumber: 2,
      startColumn: 1,
    });
  });

  it("recovers invalid panel layouts and round-trips valid ones", () => {
    const layout = createMermaidLayout(40, 60, true);
    expect(parseMermaidLayout(JSON.stringify(layout))).toEqual(layout);
    expect(parseMermaidLayout("not-json")).toMatchObject({ source: 50, preview: 50, collapsed: false });
    expect(parseMermaidLayout('{"version":1,"source":10,"preview":90,"collapsed":false}'))
      .toMatchObject({ source: 50, preview: 50 });
  });

  it("includes private notes in owner dirty-state detection", () => {
    const baseline = {
      title: "Flow",
      slug: "flow",
      source: "flowchart LR\nA-->B",
      theme: "default" as const,
      visibility: "private" as const,
      notes: "Original note",
    };
    expect(hasMermaidEditorChanged(baseline, baseline)).toBe(false);
    expect(hasMermaidEditorChanged({ ...baseline, notes: "Updated note" }, baseline)).toBe(true);
  });

  it("offers starters for blank documents and contextual Mermaid keywords", () => {
    expect(mermaidStarterCompletions.map(({ label }) => label)).toEqual(expect.arrayContaining([
      "flowchart", "sequenceDiagram", "classDiagram", "stateDiagram-v2", "erDiagram", "gantt",
      "mindmap", "timeline", "kanban", "architecture-beta",
    ]));
    expect(getMermaidCompletions("flowchart LR\n  A --> B").map(({ label }) => label))
      .toEqual(expect.arrayContaining(["title", "subgraph", "direction"]));
    expect(getMermaidCompletions("   ")).toBe(mermaidStarterCompletions);
  });

});
