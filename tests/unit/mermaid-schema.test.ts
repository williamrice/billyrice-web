import { describe, expect, it } from "vitest";
import {
  MERMAID_SOURCE_MAX_LENGTH,
  mermaidDiagramInputSchema,
  updateMermaidDiagramSchema,
} from "../../features/tools/mermaid/schemas/diagram";

const validDiagram = {
  title: "Request lifecycle",
  slug: "request-lifecycle",
  source: "flowchart LR\n  Request --> Response",
  notes: "Why this request flow exists",
  theme: "neutral" as const,
  visibility: "private" as const,
};

describe("Mermaid diagram schemas", () => {
  it("accepts a bounded diagram with a supported theme", () => {
    expect(mermaidDiagramInputSchema.safeParse(validDiagram).success).toBe(true);
  });

  it("rejects unstable slugs and arbitrary presentation values", () => {
    expect(mermaidDiagramInputSchema.safeParse({ ...validDiagram, slug: "../Shared" }).success).toBe(false);
    expect(mermaidDiagramInputSchema.safeParse({ ...validDiagram, theme: "custom" }).success).toBe(false);
    expect(mermaidDiagramInputSchema.safeParse({ ...validDiagram, visibility: "unlisted" }).success).toBe(false);
  });

  it("rejects oversized source", () => {
    const source = "x".repeat(MERMAID_SOURCE_MAX_LENGTH + 1);
    expect(mermaidDiagramInputSchema.safeParse({ ...validDiagram, source }).success).toBe(false);
  });

  it("requires a positive expected revision for updates", () => {
    expect(updateMermaidDiagramSchema.safeParse({ ...validDiagram, id: "clz1234567890abcdefghijkl", expectedRevision: 0 }).success).toBe(false);
  });

  it("normalizes empty notes and rejects oversized notes", () => {
    expect(mermaidDiagramInputSchema.parse({ ...validDiagram, notes: "   " }).notes).toBeNull();
    expect(mermaidDiagramInputSchema.safeParse({ ...validDiagram, notes: "x".repeat(5_001) }).success).toBe(false);
  });
});
