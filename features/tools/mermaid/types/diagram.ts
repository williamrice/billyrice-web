export const mermaidThemes = ["default", "base", "dark", "forest", "neutral"] as const;
export type MermaidTheme = (typeof mermaidThemes)[number];

export const mermaidVisibilities = ["private", "public"] as const;
export type MermaidVisibility = (typeof mermaidVisibilities)[number];

export type MermaidRevisionSummary = {
  id: string;
  version: number;
  title: string;
  slug: string;
  theme: MermaidTheme;
  visibility: MermaidVisibility;
  createdAt: string;
};

export type MermaidEditorDiagram = {
  id: string;
  title: string;
  slug: string;
  source: string;
  theme: MermaidTheme;
  visibility: MermaidVisibility;
  currentRevision: number;
  updatedAt: string;
  revisions: MermaidRevisionSummary[];
};

export type MermaidLibraryDiagram = Omit<MermaidEditorDiagram, "source" | "revisions"> & {
  revisionCount: number;
};

export type MermaidSaveResult = {
  id: string;
  slug: string;
  currentRevision: number;
  changed: boolean;
};

export const starterMermaidSource = `flowchart LR
    Idea[Write Mermaid] --> Preview{Looks right?}
    Preview -- Yes --> Export[Export or save]
    Preview -- Not yet --> Idea`;
