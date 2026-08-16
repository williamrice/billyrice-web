import { describe, expect, it } from "vitest";
import {
  createMermaidLocalDraft,
  getMermaidDraftKey,
  getMermaidErrorMessage,
  hasMermaidContentChanged,
  mermaidDownloadFilename,
  parseMermaidLocalDraft,
} from "../../lib/utils/mermaid";
import { createMermaidRenderConfig } from "../../lib/utils/mermaid-rendering";

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
});
