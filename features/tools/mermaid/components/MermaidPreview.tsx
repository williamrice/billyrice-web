"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clipboard, Download, Expand, Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { MermaidDiagnostic } from "@/lib/utils/mermaid-editor";
import { calculateMermaidFitZoom, getMermaidSvgDimensions } from "@/lib/utils/mermaid";
import { MermaidToolbarButton } from "./MermaidToolbarButton";

const ZOOM_MIN = 25;
const ZOOM_MAX = 400;

export function MermaidPreview({
  svg,
  diagnostic,
  onCopySvg,
  onDownloadSvg,
}: {
  svg: string;
  diagnostic?: MermaidDiagnostic;
  onCopySvg: () => void;
  onDownloadSvg: () => void;
}) {
  const previewRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const svgDimensions = useMemo(() => getMermaidSvgDimensions(svg), [svg]);
  const canExport = Boolean(svg) && !diagnostic;

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === previewRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (!previewRef.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await previewRef.current.requestFullscreen();
    } catch {
      toast.error("Fullscreen mode is not available.");
    }
  }

  function fitDiagram() {
    if (!viewportRef.current || !svgDimensions) return;
    const styles = window.getComputedStyle(viewportRef.current);
    const width = viewportRef.current.clientWidth - Number.parseFloat(styles.paddingLeft) - Number.parseFloat(styles.paddingRight);
    const height = viewportRef.current.clientHeight - Number.parseFloat(styles.paddingTop) - Number.parseFloat(styles.paddingBottom);
    setZoom(calculateMermaidFitZoom(width, height, svgDimensions.width, svgDimensions.height));
    viewportRef.current.scrollTo({ top: 0, left: 0 });
  }

  function startPanning(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.pointerType === "touch" || !viewportRef.current) return;
    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      left: viewportRef.current.scrollLeft,
      top: viewportRef.current.scrollTop,
    };
    viewportRef.current.setPointerCapture(event.pointerId);
    setIsPanning(true);
  }

  function panPreview(event: React.PointerEvent<HTMLDivElement>) {
    if (!panStartRef.current || !viewportRef.current) return;
    event.preventDefault();
    viewportRef.current.scrollLeft = panStartRef.current.left - (event.clientX - panStartRef.current.x);
    viewportRef.current.scrollTop = panStartRef.current.top - (event.clientY - panStartRef.current.y);
  }

  function stopPanning(event: React.PointerEvent<HTMLDivElement>) {
    if (!panStartRef.current || !viewportRef.current) return;
    if (viewportRef.current.hasPointerCapture(event.pointerId)) {
      viewportRef.current.releasePointerCapture(event.pointerId);
    }
    panStartRef.current = null;
    setIsPanning(false);
  }

  return (
    <section ref={previewRef} className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#f8faf9] text-gray-950 fullscreen:min-h-dvh" aria-label="Diagram preview">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-4">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-teal-700"><Check className="size-4" /> Live preview</span>
        <div className="flex items-center gap-1">
          <MermaidToolbarButton label="Zoom out" onClick={() => setZoom((value) => Math.max(ZOOM_MIN, value - 25))} className="border-gray-200 hover:border-teal-600"><Minus className="size-4" /></MermaidToolbarButton>
          <MermaidToolbarButton label="Reset zoom to 100%" onClick={() => setZoom(100)} className="w-14 border-transparent font-mono text-[10px] text-gray-500 hover:border-gray-200 hover:text-teal-700">{zoom}%</MermaidToolbarButton>
          <MermaidToolbarButton label="Zoom in" onClick={() => setZoom((value) => Math.min(ZOOM_MAX, value + 25))} className="border-gray-200 hover:border-teal-600"><Plus className="size-4" /></MermaidToolbarButton>
          <MermaidToolbarButton label="Fit diagram to preview" disabled={!svgDimensions} onClick={fitDiagram} className="border-gray-200 hover:border-teal-600"><Maximize2 className="size-4" /></MermaidToolbarButton>
          <MermaidToolbarButton label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={toggleFullscreen} className="border-gray-200 hover:border-teal-600">{isFullscreen ? <Minimize2 className="size-4" /> : <Expand className="size-4" />}</MermaidToolbarButton>
          <MermaidToolbarButton label="Copy SVG" disabled={!canExport} onClick={onCopySvg} className="border-gray-200 hover:border-teal-600"><Clipboard className="size-4" /></MermaidToolbarButton>
          <MermaidToolbarButton label="Download SVG" disabled={!canExport} onClick={onDownloadSvg} className="border-gray-200 hover:border-teal-600"><Download className="size-4" /></MermaidToolbarButton>
        </div>
      </div>
      {diagnostic && <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{diagnostic.message} The last valid preview remains below.</div>}
      <div
        ref={viewportRef}
        tabIndex={0}
        aria-label="Diagram canvas. Drag to pan."
        onPointerDown={startPanning}
        onPointerMove={panPreview}
        onPointerUp={stopPanning}
        onPointerCancel={stopPanning}
        className={`min-h-0 flex-1 overflow-auto p-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 sm:p-10 ${isPanning ? "cursor-grabbing select-none" : "cursor-grab"}`}
      >
        {svg ? (
          <div className="mx-auto [&_svg]:block [&_svg]:h-auto! [&_svg]:w-full! [&_svg]:max-w-none!" style={{ width: svgDimensions ? `${svgDimensions.width * (zoom / 100)}px` : `${zoom}%` }} dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="grid min-h-80 place-items-center text-sm text-gray-500">Rendering preview…</div>
        )}
      </div>
    </section>
  );
}
