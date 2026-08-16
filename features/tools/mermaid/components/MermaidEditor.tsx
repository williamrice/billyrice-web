"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clipboard,
  Code2,
  Download,
  Expand,
  FileDown,
  FolderOpen,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { copyTextToClipboard, downloadTextFile } from "@/lib/utils/browser-files";
import { slugify } from "@/lib/utils/strings";
import {
  createMermaidLocalDraft,
  getMermaidDraftKey,
  getMermaidErrorMessage,
  hasMermaidContentChanged,
  mermaidDownloadFilename,
  parseMermaidLocalDraft,
} from "@/lib/utils/mermaid";
import { createMermaidRenderConfig } from "@/lib/utils/mermaid-rendering";
import {
  createMermaidDiagram,
  loadMermaidRevision,
  updateMermaidDiagram,
} from "../commands/diagrams";
import { MERMAID_SOURCE_MAX_LENGTH } from "../schemas/diagram";
import {
  mermaidThemes,
  starterMermaidSource,
  type MermaidEditorDiagram,
  type MermaidTheme,
  type MermaidVisibility,
} from "../types/diagram";

const ZOOM_MIN = 25;
const ZOOM_MAX = 400;

export function MermaidEditor({
  diagram,
  canManage,
}: {
  diagram?: MermaidEditorDiagram;
  canManage: boolean;
}) {
  const router = useRouter();
  const renderId = useId().replace(/:/g, "");
  const previewRef = useRef<HTMLDivElement>(null);
  const renderSequence = useRef(0);
  const [title, setTitle] = useState(diagram?.title ?? "Untitled diagram");
  const [slug, setSlug] = useState(diagram?.slug ?? "untitled-diagram");
  const [source, setSource] = useState(diagram?.source ?? starterMermaidSource);
  const [theme, setTheme] = useState<MermaidTheme>(diagram?.theme ?? "default");
  const [visibility, setVisibility] = useState<MermaidVisibility>(diagram?.visibility ?? "private");
  const [currentRevision, setCurrentRevision] = useState(diagram?.currentRevision ?? 0);
  const [baseline, setBaseline] = useState({
    title: diagram?.title ?? "Untitled diagram",
    slug: diagram?.slug ?? "untitled-diagram",
    source: diagram?.source ?? starterMermaidSource,
    theme: diagram?.theme ?? "default" as MermaidTheme,
    visibility: diagram?.visibility ?? "private" as MermaidVisibility,
  });
  const [svg, setSvg] = useState("");
  const [renderError, setRenderError] = useState<string>();
  const [zoom, setZoom] = useState(100);
  const [localDraftRestored, setLocalDraftRestored] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();

  const draftKey = getMermaidDraftKey(diagram?.id);
  const isDirty = useMemo(
    () =>
      title !== baseline.title ||
      slug !== baseline.slug ||
      visibility !== baseline.visibility ||
      hasMermaidContentChanged(source, theme, baseline.source, baseline.theme),
    [baseline, slug, source, theme, title, visibility],
  );

  useEffect(() => {
    const draft = parseMermaidLocalDraft(window.localStorage.getItem(draftKey));
    let restoreTimeout: number | undefined;
    if (
      draft &&
      (draft.source !== baseline.source || draft.theme !== baseline.theme) &&
      (draft.baseRevision === null || draft.baseRevision === currentRevision)
    ) {
      restoreTimeout = window.setTimeout(() => {
        setSource(draft.source);
        setTheme(draft.theme);
        setLocalDraftRestored(true);
        setHydrated(true);
      }, 0);
    } else {
      restoreTimeout = window.setTimeout(() => setHydrated(true), 0);
    }
    return () => window.clearTimeout(restoreTimeout);
  }, [baseline.source, baseline.theme, currentRevision, draftKey]);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify(createMermaidLocalDraft(source, theme, diagram ? currentRevision : null)),
      );
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [currentRevision, diagram, draftKey, hydrated, source, theme]);

  useEffect(() => {
    const sequence = ++renderSequence.current;
    const timeout = window.setTimeout(async () => {
      if (!source.trim()) {
        setRenderError("Enter Mermaid source to create a preview.");
        return;
      }

      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize(createMermaidRenderConfig(theme));
        const result = await mermaid.render(`mermaid-${renderId}-${sequence}`, source);
        if (sequence !== renderSequence.current) return;
        setSvg(result.svg);
        setRenderError(undefined);
      } catch (error) {
        if (sequence !== renderSequence.current) return;
        setRenderError(getMermaidErrorMessage(error));
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [renderId, source, theme]);

  function saveDiagram() {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("title", title);
        formData.set("slug", slug);
        formData.set("source", source);
        formData.set("theme", theme);
        formData.set("visibility", visibility);
        let result;

        if (diagram) {
          formData.set("id", diagram.id);
          formData.set("expectedRevision", String(currentRevision));
          formData.set("previousSlug", diagram.slug);
          result = await updateMermaidDiagram(formData);
        } else {
          result = await createMermaidDiagram(formData);
        }

        setCurrentRevision(result.currentRevision);
        setBaseline({ title, slug: result.slug, source, theme, visibility });
        window.localStorage.removeItem(draftKey);
        toast.success(result.changed ? `Revision ${result.currentRevision} saved.` : "No changes to save.");
        if (!diagram || result.slug !== diagram.slug) {
          router.replace(`/tools/mermaid/${result.slug}`);
        } else {
          router.refresh();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "The diagram could not be saved.");
      }
    });
  }

  function restoreRevision(version: number) {
    if (isDirty && !window.confirm("Replace your unsaved source and theme with this revision?")) return;
    startTransition(async () => {
      try {
        if (!diagram) return;
        const revision = await loadMermaidRevision(diagram.id, version);
        setSource(revision.source);
        setTheme(revision.theme);
        toast.success(`Revision ${version} loaded. Save to create a new revision.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "The revision could not be loaded.");
      }
    });
  }

  function clearDiagram() {
    if (isDirty && !window.confirm("Clear the current source and discard unsaved changes?")) return;
    setSource("");
    setTheme("default");
  }

  async function copyValue(value: string, message: string) {
    try {
      await copyTextToClipboard(value);
      toast.success(message);
    } catch {
      toast.error("Clipboard access was not available.");
    }
  }

  async function toggleFullscreen() {
    if (!previewRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await previewRef.current.requestFullscreen();
    }
  }

  return (
    <div className="site-shell pb-20 pt-28 sm:pt-32">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Mermaid renderer</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-.045em] sm:text-5xl">
            {diagram ? diagram.title : "Diagram workbench"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Write Mermaid syntax, inspect the live SVG, and export the result. Drafts stay in this browser unless the owner saves them.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage && (
            <a href="/admin/tools/mermaid" className="inline-flex min-h-10 items-center gap-2 border border-border px-3 text-sm hover:border-primary hover:text-primary">
              <FolderOpen className="size-4" /> Library
            </a>
          )}
          <button type="button" onClick={clearDiagram} className="inline-flex min-h-10 items-center gap-2 border border-border px-3 text-sm hover:border-primary hover:text-primary">
            <RotateCcw className="size-4" /> Clear
          </button>
          {canManage && (
            <button type="button" onClick={saveDiagram} disabled={isPending || Boolean(renderError)} className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="size-4" /> {isPending ? "Saving…" : diagram ? "Save revision" : "Save diagram"}
            </button>
          )}
        </div>
      </div>

      {localDraftRestored && (
        <div className="mb-4 border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground" role="status">
          A newer local draft was restored from this browser.
        </div>
      )}

      {canManage && (
        <section className="mb-5 grid gap-4 border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto]" aria-label="Owner save settings">
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className="h-11 w-full border border-input bg-background px-3 outline-none focus:border-primary" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 flex items-center justify-between font-medium"><span>Slug</span><button type="button" onClick={() => setSlug(slugify(title))} className="text-xs text-primary">Generate</button></span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="h-11 w-full border border-input bg-background px-3 font-mono text-sm outline-none focus:border-primary" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">Visibility</span>
            <select value={visibility} onChange={(event) => setVisibility(event.target.value as MermaidVisibility)} className="h-11 border border-input bg-background px-3 outline-none focus:border-primary">
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>
        </section>
      )}

      <div className="grid min-h-[42rem] overflow-hidden border border-border bg-card xl:grid-cols-2">
        <section className="flex min-h-[34rem] flex-col border-b border-border xl:border-b-0 xl:border-r" aria-label="Mermaid source editor">
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground"><Code2 className="size-4 text-primary" /> Source</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Theme
                <select value={theme} onChange={(event) => setTheme(event.target.value as MermaidTheme)} className="h-9 border border-input bg-background px-2 text-foreground outline-none focus:border-primary">
                  {mermaidThemes.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <button type="button" disabled={!svg || Boolean(renderError)} onClick={() => copyValue(source, "Mermaid source copied.")} className="grid size-9 place-items-center border border-border hover:border-primary hover:text-primary disabled:opacity-40" aria-label="Copy Mermaid source"><Clipboard className="size-4" /></button>
              <button type="button" disabled={!svg || Boolean(renderError)} onClick={() => downloadTextFile(source, mermaidDownloadFilename(title, "mmd"), "text/plain;charset=utf-8")} className="grid size-9 place-items-center border border-border hover:border-primary hover:text-primary disabled:opacity-40" aria-label="Download Mermaid source"><FileDown className="size-4" /></button>
            </div>
          </div>
          <label htmlFor={`source-${renderId}`} className="sr-only">Mermaid diagram source</label>
          <textarea id={`source-${renderId}`} value={source} onChange={(event) => setSource(event.target.value)} maxLength={MERMAID_SOURCE_MAX_LENGTH} spellCheck={false} className="min-h-[30rem] flex-1 resize-none bg-[#07110f] p-5 font-mono text-[13px] leading-6 text-gray-200 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-6" />
          <div className="border-t border-border px-4 py-2 text-right font-mono text-[10px] text-muted-foreground">{source.length.toLocaleString()} / {MERMAID_SOURCE_MAX_LENGTH.toLocaleString()}</div>
        </section>

        <section ref={previewRef} className="flex min-h-[34rem] min-w-0 flex-col bg-[#f8faf9] text-gray-950 fullscreen:min-h-dvh" aria-label="Diagram preview">
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-4">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-teal-700"><Check className="size-4" /> Live preview</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setZoom((value) => Math.max(ZOOM_MIN, value - 25))} className="grid size-9 place-items-center border border-gray-200 hover:border-teal-600" aria-label="Zoom out"><Minus className="size-4" /></button>
              <span className="w-14 text-center font-mono text-[10px] text-gray-500">{zoom}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(ZOOM_MAX, value + 25))} className="grid size-9 place-items-center border border-gray-200 hover:border-teal-600" aria-label="Zoom in"><Plus className="size-4" /></button>
              <button type="button" onClick={() => setZoom(100)} className="grid size-9 place-items-center border border-gray-200 hover:border-teal-600" aria-label="Fit diagram"><Maximize2 className="size-4" /></button>
              <button type="button" onClick={toggleFullscreen} className="grid size-9 place-items-center border border-gray-200 hover:border-teal-600" aria-label="Toggle fullscreen"><Expand className="size-4" /></button>
              <button type="button" disabled={!svg || Boolean(renderError)} onClick={() => copyValue(svg, "SVG copied.")} className="grid size-9 place-items-center border border-gray-200 hover:border-teal-600 disabled:opacity-40" aria-label="Copy SVG"><Clipboard className="size-4" /></button>
              <button type="button" disabled={!svg || Boolean(renderError)} onClick={() => downloadTextFile(svg, mermaidDownloadFilename(title, "svg"), "image/svg+xml;charset=utf-8")} className="grid size-9 place-items-center border border-gray-200 hover:border-teal-600 disabled:opacity-40" aria-label="Download SVG"><Download className="size-4" /></button>
            </div>
          </div>
          {renderError && <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{renderError} The last valid preview remains below.</div>}
          <div className="min-h-0 flex-1 overflow-auto p-6 sm:p-10">
            {svg ? (
              <div className="mx-auto origin-top-left transition-transform motion-reduce:transition-none [&_svg]:h-auto [&_svg]:max-w-none" style={{ width: `${zoom}%` }} dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <div className="grid min-h-80 place-items-center text-sm text-gray-500">Rendering preview…</div>
            )}
          </div>
        </section>
      </div>

      {canManage && diagram && diagram.revisions.length > 0 && (
        <section className="mt-8 border border-border bg-card p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-primary">Owner history</p><h2 className="mt-2 text-2xl font-medium tracking-tight">Revisions</h2></div>
            <span className="text-sm text-muted-foreground">Current revision {currentRevision}</span>
          </div>
          <ol className="mt-5 divide-y divide-border border-y border-border">
            {diagram.revisions.map((revision) => (
              <li key={revision.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-medium">Revision {revision.version}{revision.version === currentRevision ? " · current" : ""}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(revision.createdAt).toLocaleString("en-US")} · {revision.theme} · {revision.visibility}</p></div>
                <button type="button" disabled={isPending || revision.version === currentRevision} onClick={() => restoreRevision(revision.version)} className="inline-flex min-h-9 items-center justify-center border border-border px-3 text-xs hover:border-primary hover:text-primary disabled:opacity-40">Load source and theme</button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
