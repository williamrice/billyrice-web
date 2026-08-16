"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, GripVertical, PanelLeftOpen, RotateCcw, Save, X } from "lucide-react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { copyTextToClipboard, downloadTextFile } from "@/lib/utils/browser-files";
import { createMermaidLayout, hasMermaidEditorChanged, MERMAID_LAYOUT_KEY, normalizeMermaidDiagnostic, parseMermaidLayout, type MermaidDiagnostic, type MermaidLayout } from "@/lib/utils/mermaid-editor";
import { createMermaidLocalDraft, getMermaidDraftKey, mermaidDownloadFilename, parseMermaidLocalDraft } from "@/lib/utils/mermaid";
import { createMermaidRenderConfig } from "@/lib/utils/mermaid-rendering";
import { slugify } from "@/lib/utils/strings";
import { createMermaidDiagram, loadMermaidRevision, updateMermaidDiagram } from "../commands/diagrams";
import { starterMermaidSource, type MermaidEditorDiagram, type MermaidTheme, type MermaidVisibility } from "../types/diagram";
import { MermaidOwnerFields } from "./MermaidOwnerFields";
import { MermaidPreview } from "./MermaidPreview";
import { MermaidToolbarButton } from "./MermaidToolbarButton";

const MermaidSourceEditor = dynamic(
  () => import("./MermaidSourceEditor.js").then((module) => module.MermaidSourceEditor),
  { ssr: false, loading: () => <div className="grid min-h-[34rem] place-items-center bg-[#07110f] text-sm text-gray-400">Loading editor…</div> },
);

export function MermaidEditor({ diagram, canManage }: { diagram?: MermaidEditorDiagram; canManage: boolean }) {
  const router = useRouter();
  const renderId = useId().replace(/:/g, "");
  const renderSequence = useRef(0);
  const sourcePanelRef = usePanelRef();
  const ownerDiagram = canManage && diagram && "notes" in diagram ? diagram : undefined;
  const initialTitle = diagram?.title ?? "Untitled diagram";
  const initialSlug = diagram?.slug ?? "untitled-diagram";
  const initialSource = diagram?.source ?? starterMermaidSource;
  const initialTheme = diagram?.theme ?? "default";
  const initialVisibility = diagram?.visibility ?? "private";
  const initialNotes = ownerDiagram?.notes ?? "";
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [source, setSource] = useState(initialSource);
  const [theme, setTheme] = useState<MermaidTheme>(initialTheme);
  const [visibility, setVisibility] = useState<MermaidVisibility>(initialVisibility);
  const [notes, setNotes] = useState(initialNotes);
  const [currentRevision, setCurrentRevision] = useState(diagram?.currentRevision ?? 0);
  const [baseline, setBaseline] = useState({ title: initialTitle, slug: initialSlug, source: initialSource, theme: initialTheme, visibility: initialVisibility, notes: initialNotes });
  const [svg, setSvg] = useState("");
  const [diagnostic, setDiagnostic] = useState<MermaidDiagnostic>();
  const [diagramType, setDiagramType] = useState<string>();
  const [checking, setChecking] = useState(true);
  const [localDraftRestored, setLocalDraftRestored] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [layout, setLayout] = useState<MermaidLayout>(() => parseMermaidLayout(null));
  const [isPending, startTransition] = useTransition();
  const draftKey = getMermaidDraftKey(diagram?.id);
  const isDirty = useMemo(
    () => hasMermaidEditorChanged({ title, slug, source, theme, visibility, notes }, baseline),
    [baseline, notes, slug, source, theme, title, visibility],
  );
  const canExport = Boolean(svg) && !diagnostic && !checking;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 80rem)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const savedLayout = parseMermaidLayout(window.localStorage.getItem(MERMAID_LAYOUT_KEY));
    const timeout = window.setTimeout(() => setLayout(savedLayout), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const timeout = window.setTimeout(() => {
      if (layout.collapsed) sourcePanelRef.current?.collapse();
      else sourcePanelRef.current?.resize(`${layout.source}%`);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [isDesktop, layout.collapsed, layout.source, sourcePanelRef]);

  useEffect(() => {
    const draft = parseMermaidLocalDraft(window.localStorage.getItem(draftKey));
    const timeout = window.setTimeout(() => {
      if (draft && (draft.source !== baseline.source || draft.theme !== baseline.theme) && (draft.baseRevision === null || draft.baseRevision === currentRevision)) {
        setSource(draft.source);
        setTheme(draft.theme);
        setLocalDraftRestored(true);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [baseline.source, baseline.theme, currentRevision, draftKey]);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = window.setTimeout(() => window.localStorage.setItem(draftKey, JSON.stringify(createMermaidLocalDraft(source, theme, diagram ? currentRevision : null))), 250);
    return () => window.clearTimeout(timeout);
  }, [currentRevision, diagram, draftKey, hydrated, source, theme]);

  useEffect(() => {
    const sequence = ++renderSequence.current;
    const beginTimeout = window.setTimeout(() => setChecking(true), 0);
    const renderTimeout = window.setTimeout(async () => {
      if (!source.trim()) {
        if (sequence !== renderSequence.current) return;
        setDiagnostic(normalizeMermaidDiagnostic(new Error("Enter Mermaid source to create a preview."), source));
        setDiagramType(undefined);
        setChecking(false);
        return;
      }
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize(createMermaidRenderConfig(theme));
        const result = await mermaid.render(`mermaid-${renderId}-${sequence}`, source);
        if (sequence !== renderSequence.current) return;
        setSvg(result.svg);
        setDiagnostic(undefined);
        setDiagramType(result.diagramType);
        setChecking(false);
      } catch (error) {
        if (sequence !== renderSequence.current) return;
        setDiagnostic(normalizeMermaidDiagnostic(error, source));
        setDiagramType(undefined);
        setChecking(false);
      }
    }, 300);
    return () => {
      window.clearTimeout(beginTimeout);
      window.clearTimeout(renderTimeout);
    };
  }, [renderId, source, theme]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function persistLayout(next: MermaidLayout) {
    setLayout((current) => {
      if (
        current.source === next.source &&
        current.preview === next.preview &&
        current.collapsed === next.collapsed
      ) return current;
      window.localStorage.setItem(MERMAID_LAYOUT_KEY, JSON.stringify(next));
      return next;
    });
  }

  function collapseEditor() {
    const size = sourcePanelRef.current?.getSize().asPercentage;
    const sourceSize = size && size >= 25 ? size : layout.source;
    persistLayout(createMermaidLayout(sourceSize, 100 - sourceSize, true));
    sourcePanelRef.current?.collapse();
  }

  function showEditor() {
    persistLayout(createMermaidLayout(layout.source, layout.preview, false));
    sourcePanelRef.current?.expand();
  }

  function saveDiagram() {
    startTransition(async () => {
      try {
        const normalizedNotes = notes.trim();
        const formData = new FormData();
        formData.set("title", title);
        formData.set("slug", slug);
        formData.set("source", source);
        formData.set("notes", normalizedNotes);
        formData.set("theme", theme);
        formData.set("visibility", visibility);
        let result;
        if (diagram) {
          formData.set("id", diagram.id);
          formData.set("expectedRevision", String(currentRevision));
          formData.set("previousSlug", diagram.slug);
          result = await updateMermaidDiagram(formData);
        } else result = await createMermaidDiagram(formData);
        setNotes(normalizedNotes);
        setCurrentRevision(result.currentRevision);
        setBaseline({ title, slug: result.slug, source, theme, visibility, notes: normalizedNotes });
        window.localStorage.removeItem(draftKey);
        toast.success(result.changed ? `Revision ${result.currentRevision} saved.` : "No changes to save.");
        if (!diagram || result.slug !== diagram.slug) router.replace(`/tools/mermaid/${result.slug}`);
        else router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "The diagram could not be saved.");
      }
    });
  }

  function restoreRevision(version: number) {
    if (isDirty && !window.confirm("Replace your unsaved source, theme, and notes with this revision?")) return;
    startTransition(async () => {
      try {
        if (!ownerDiagram) return;
        const revision = await loadMermaidRevision(ownerDiagram.id, version);
        setSource(revision.source);
        setTheme(revision.theme);
        setNotes(revision.notes);
        toast.success(`Revision ${version} loaded. Save to create a new revision.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "The revision could not be loaded.");
      }
    });
  }

  function clearDiagram() {
    if ((source || theme !== "default" || notes) && !window.confirm("Clear the current source, theme, and private notes?")) return;
    setSource("");
    setTheme("default");
    setNotes("");
  }

  async function copyValue(value: string, message: string) {
    try {
      await copyTextToClipboard(value);
      toast.success(message);
    } catch {
      toast.error("Clipboard access was not available.");
    }
  }

  return (
    <TooltipProvider>
      <div className="site-shell pb-20 pt-28 sm:pt-32">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Mermaid renderer</p><h1 className="mt-3 text-4xl font-medium tracking-[-.045em] sm:text-5xl">{diagram ? diagram.title : "Diagram workbench"}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Write Mermaid syntax, preview the diagram, and export the result.</p></div>
          <div className="flex flex-wrap gap-2">
            {canManage && <a href="/admin/tools/mermaid" className="inline-flex min-h-10 items-center gap-2 border border-border px-3 text-sm hover:border-primary hover:text-primary"><FolderOpen className="size-4" /> Library</a>}
            <button type="button" onClick={clearDiagram} className="inline-flex min-h-10 items-center gap-2 border border-border px-3 text-sm hover:border-primary hover:text-primary"><RotateCcw className="size-4" /> Clear</button>
            {canManage && <button type="button" onClick={saveDiagram} disabled={isPending || Boolean(diagnostic) || checking} className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><Save className="size-4" /> {isPending ? "Saving…" : diagram ? "Save revision" : "Save diagram"}</button>}
          </div>
        </div>

        {localDraftRestored && <div className="mb-4 flex items-center justify-between gap-4 border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground" role="status"><span>A newer local draft was restored from this browser.</span><MermaidToolbarButton label="Dismiss restored draft notice" onClick={() => setLocalDraftRestored(false)} className="shrink-0 border-transparent hover:border-primary hover:text-primary"><X className="size-4" /></MermaidToolbarButton></div>}
        {canManage && <MermaidOwnerFields title={title} slug={slug} visibility={visibility} notes={notes} onTitleChange={setTitle} onSlugChange={setSlug} onGenerateSlug={() => setSlug(slugify(title))} onVisibilityChange={setVisibility} onNotesChange={setNotes} />}

        <Group id="mermaid-workspace" orientation={isDesktop ? "horizontal" : "vertical"} defaultLayout={{ source: layout.source, preview: layout.preview }} onLayoutChanged={(next) => { if (isDesktop && !layout.collapsed && next.source >= 25 && next.preview >= 35) persistLayout(createMermaidLayout(next.source, next.preview, false)); }} className="h-[min(52rem,120svh)] overflow-hidden border border-border bg-card xl:h-[min(34rem,65svh)]">
          <Panel id="source" panelRef={sourcePanelRef} defaultSize={`${layout.source}%`} minSize={isDesktop ? "25%" : "16rem"} collapsible={isDesktop} collapsedSize="2.75rem" className="overflow-hidden" onResize={(size, _id, previousSize) => {
            if (!isDesktop || !previousSize) return;
            if (size.inPixels <= 50 && !layout.collapsed) persistLayout(createMermaidLayout(layout.source, layout.preview, true));
            if (size.asPercentage >= 25 && layout.collapsed) persistLayout(createMermaidLayout(size.asPercentage, 100 - size.asPercentage, false));
          }}>
            <div className="relative h-full bg-[#07110f]">
              <div className={`h-full ${isDesktop && layout.collapsed ? "pointer-events-none absolute inset-0 opacity-0" : ""}`} aria-hidden={isDesktop && layout.collapsed} inert={isDesktop && layout.collapsed}>
                <MermaidSourceEditor source={source} theme={theme} diagnostic={diagnostic} diagramType={diagramType} checking={checking} canExport={canExport} onSourceChange={setSource} onThemeChange={setTheme} onCopySource={() => copyValue(source, "Mermaid source copied.")} onDownloadSource={() => downloadTextFile(source, mermaidDownloadFilename(title, "mmd"), "text/plain;charset=utf-8")} onCollapse={collapseEditor} />
              </div>
              {isDesktop && layout.collapsed && (
                <aside className="absolute inset-0 flex flex-col items-center gap-4 border-r border-gray-700 bg-[#07110f] py-3 text-gray-300" aria-label="Collapsed source editor">
                  <MermaidToolbarButton label="Show source editor" onClick={showEditor} className="border-gray-700 text-gray-200 hover:border-primary hover:text-primary">
                    <PanelLeftOpen className="size-4" />
                  </MermaidToolbarButton>
                  <span className="select-none font-mono text-[9px] font-semibold uppercase tracking-[.18em] text-gray-500 [writing-mode:vertical-rl]">Source editor</span>
                </aside>
              )}
            </div>
          </Panel>
          <Separator id="mermaid-workspace-divider" disabled={!isDesktop} className="group relative hidden w-2 items-center justify-center border-x border-border bg-secondary/40 outline-none hover:bg-primary/10 focus-visible:bg-primary/15 xl:flex"><GripVertical className="size-4 text-muted-foreground group-hover:text-primary" /></Separator>
          <Panel id="preview" defaultSize={`${layout.preview}%`} minSize={isDesktop ? "35%" : "16rem"}>
            <MermaidPreview svg={svg} diagnostic={diagnostic} onCopySvg={() => copyValue(svg, "SVG copied.")} onDownloadSvg={() => downloadTextFile(svg, mermaidDownloadFilename(title, "svg"), "image/svg+xml;charset=utf-8")} />
          </Panel>
        </Group>

        {ownerDiagram && ownerDiagram.revisions.length > 0 && <section className="mt-8 border border-border bg-card p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-primary">Revision history</p><h2 className="mt-2 text-2xl font-medium tracking-tight">Revisions</h2></div><span className="text-sm text-muted-foreground">Current revision {currentRevision}</span></div><ol className="mt-5 divide-y divide-border border-y border-border">{ownerDiagram.revisions.map((revision) => <li key={revision.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">Revision {revision.version}{revision.version === currentRevision ? " · current" : ""}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(revision.createdAt).toLocaleString("en-US")} · {revision.theme} · {revision.visibility}</p></div><button type="button" disabled={isPending || revision.version === currentRevision} onClick={() => restoreRevision(revision.version)} className="inline-flex min-h-9 items-center justify-center border border-border px-3 text-xs hover:border-primary hover:text-primary disabled:opacity-40">Load source, theme, and notes</button></li>)}</ol></section>}
      </div>
    </TooltipProvider>
  );
}
