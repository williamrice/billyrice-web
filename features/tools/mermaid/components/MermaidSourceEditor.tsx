"use client";

import { useEffect, useRef } from "react";
import Editor, { loader, type OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Clipboard, Code2, FileDown, PanelLeftClose } from "lucide-react";
import { toast } from "sonner";
import { MERMAID_SOURCE_MAX_LENGTH } from "../schemas/diagram";
import { mermaidThemes, type MermaidTheme } from "../types/diagram";
import { registerMermaidLanguage, MERMAID_LANGUAGE_ID } from "../editor/mermaid-language";
import type { MermaidDiagnostic } from "@/lib/utils/mermaid-editor";
import { stripMermaidMarkdownFence } from "@/lib/utils/mermaid-editor";
import { MermaidToolbarButton } from "./MermaidToolbarButton";

if (typeof self !== "undefined") {
  const workerScope = self as typeof self & {
    MonacoEnvironment?: { getWorker: () => Worker };
  };
  workerScope.MonacoEnvironment = {
    getWorker: () => new Worker("/vendor/monaco/editor.worker.js", { name: "monaco-editor-worker" }),
  };
}
loader.config({ monaco });

export function MermaidSourceEditor({
  source,
  theme,
  diagnostic,
  diagramType,
  checking,
  canExport,
  onSourceChange,
  onThemeChange,
  onCopySource,
  onDownloadSource,
  onCollapse,
}: {
  source: string;
  theme: MermaidTheme;
  diagnostic?: MermaidDiagnostic;
  diagramType?: string;
  checking: boolean;
  canExport: boolean;
  onSourceChange: (source: string) => void;
  onThemeChange: (theme: MermaidTheme) => void;
  onCopySource: () => void;
  onDownloadSource: () => void;
  onCollapse: () => void;
}) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    const domNode = editor.getDomNode();
    const handlePaste = (event: ClipboardEvent) => {
      const pasted = event.clipboardData?.getData("text/plain");
      if (!pasted) return;
      const stripped = stripMermaidMarkdownFence(pasted);
      if (stripped === null) return;
      event.preventDefault();
      const selection = editor.getSelection();
      if (!selection) return;
      editor.pushUndoStop();
      editor.executeEdits("mermaid-fenced-paste", [{ range: selection, text: stripped }]);
      editor.pushUndoStop();
      toast.success("Removed Mermaid code fence.");
    };
    const handleWheel = (event: WheelEvent) => {
      if (!event.deltaY || event.ctrlKey || event.metaKey) return;
      const multiplier = event.deltaMode === 1
        ? editor.getOption(monacoInstance.editor.EditorOption.lineHeight)
        : event.deltaMode === 2 ? editor.getLayoutInfo().height : 1;
      const currentScrollTop = editor.getScrollTop();
      const maximumScrollTop = Math.max(0, editor.getScrollHeight() - editor.getLayoutInfo().height);
      const nextScrollTop = Math.min(
        maximumScrollTop,
        Math.max(0, currentScrollTop + event.deltaY * multiplier),
      );
      if (nextScrollTop === currentScrollTop) return;
      event.preventDefault();
      event.stopPropagation();
      editor.setScrollTop(nextScrollTop, monacoInstance.editor.ScrollType.Immediate);
    };
    domNode?.addEventListener("paste", handlePaste);
    domNode?.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    editor.onDidDispose(() => {
      domNode?.removeEventListener("paste", handlePaste);
      domNode?.removeEventListener("wheel", handleWheel, { capture: true });
    });
    monacoInstance.editor.setModelMarkers(
      editor.getModel()!,
      MERMAID_LANGUAGE_ID,
      diagnostic ? [{ ...diagnostic, severity: monacoInstance.MarkerSeverity.Error }] : [],
    );
  };

  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(
      model,
      MERMAID_LANGUAGE_ID,
      diagnostic ? [{ ...diagnostic, severity: monaco.MarkerSeverity.Error }] : [],
    );
  }, [diagnostic]);

  function focusDiagnostic() {
    const editor = editorRef.current;
    if (!editor || !diagnostic) return;
    const range = new monaco.Range(
      diagnostic.startLineNumber,
      diagnostic.startColumn,
      diagnostic.endLineNumber,
      diagnostic.endColumn,
    );
    editor.setSelection(range);
    editor.revealRangeInCenter(range);
    editor.focus();
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-card" aria-label="Mermaid source editor">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground"><Code2 className="size-4 text-primary" /> Source</span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Theme
            <select value={theme} onChange={(event) => onThemeChange(event.target.value as MermaidTheme)} className="h-9 border border-input bg-background px-2 text-foreground outline-none focus:border-primary">
              {mermaidThemes.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <MermaidToolbarButton label="Copy Mermaid source" disabled={!canExport} onClick={onCopySource} className="border-border hover:border-primary hover:text-primary"><Clipboard className="size-4" /></MermaidToolbarButton>
          <MermaidToolbarButton label="Download Mermaid source" disabled={!canExport} onClick={onDownloadSource} className="border-border hover:border-primary hover:text-primary"><FileDown className="size-4" /></MermaidToolbarButton>
          <MermaidToolbarButton label="Collapse source editor" onClick={onCollapse} className="hidden border-border hover:border-primary hover:text-primary xl:grid"><PanelLeftClose className="size-4" /></MermaidToolbarButton>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-[#07110f]" aria-label="Mermaid diagram source">
        <Editor
          beforeMount={registerMermaidLanguage}
          onMount={handleMount}
          language={MERMAID_LANGUAGE_ID}
          theme="vs-dark"
          value={source}
          onChange={(value) => onSourceChange((value ?? "").slice(0, MERMAID_SOURCE_MAX_LENGTH))}
          loading={<div className="grid h-full place-items-center text-sm text-gray-400">Loading editor…</div>}
          options={{
            automaticLayout: true,
            contextmenu: true,
            fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, monospace",
            fontSize: 13,
            lineHeight: 24,
            minimap: { enabled: false },
            padding: { top: 20, bottom: 20 },
            quickSuggestions: { other: true, comments: false, strings: false },
            scrollBeyondLastLine: false,
            scrollbar: {
              alwaysConsumeMouseWheel: false,
              handleMouseWheel: true,
              vertical: "visible",
            },
            snippetSuggestions: "top",
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </div>
      <div className="flex min-h-10 items-center justify-between gap-4 border-t border-border px-4 py-2 font-mono text-[10px] text-muted-foreground">
        {diagnostic ? (
          <button type="button" onClick={focusDiagnostic} className="truncate text-left text-red-400 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            1 error · {diagnostic.message}
          </button>
        ) : (
          <span aria-live="polite">{checking ? "Checking…" : diagramType ? `Valid · ${diagramType}` : "Ready"}</span>
        )}
        <span className="shrink-0">{source.length.toLocaleString()} / {MERMAID_SOURCE_MAX_LENGTH.toLocaleString()}</span>
      </div>
    </section>
  );
}
