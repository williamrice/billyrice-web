"use client";

import { ChevronDown } from "lucide-react";
import { MERMAID_NOTES_MAX_LENGTH } from "../schemas/diagram";
import type { MermaidVisibility } from "../types/diagram";

export function MermaidOwnerFields({
  title,
  slug,
  visibility,
  notes,
  onTitleChange,
  onSlugChange,
  onGenerateSlug,
  onVisibilityChange,
  onNotesChange,
}: {
  title: string;
  slug: string;
  visibility: MermaidVisibility;
  notes: string;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onGenerateSlug: () => void;
  onVisibilityChange: (value: MermaidVisibility) => void;
  onNotesChange: (value: string) => void;
}) {
  return (
    <section className="mb-5 grid gap-4 border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto]" aria-label="Owner save settings">
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Title</span>
        <input value={title} onChange={(event) => onTitleChange(event.target.value)} maxLength={120} className="h-11 w-full border border-input bg-background px-3 outline-none focus:border-primary" />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 flex items-center justify-between font-medium"><span>Slug</span><button type="button" onClick={onGenerateSlug} className="text-xs text-primary">Generate</button></span>
        <input value={slug} onChange={(event) => onSlugChange(event.target.value)} maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="h-11 w-full border border-input bg-background px-3 font-mono text-sm outline-none focus:border-primary" />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Visibility</span>
        <select value={visibility} onChange={(event) => onVisibilityChange(event.target.value as MermaidVisibility)} className="h-11 border border-input bg-background px-3 outline-none focus:border-primary">
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </label>
      <details className="group/notes border-t border-border pt-3 text-sm md:col-span-3">
        <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-3 font-medium outline-none focus-visible:text-primary [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2"><ChevronDown className="size-4 transition-transform group-open/notes:rotate-180 motion-reduce:transition-none" /> Private notes</span>
          <span className="font-mono text-[10px] font-normal text-muted-foreground">{notes.length.toLocaleString()} / {MERMAID_NOTES_MAX_LENGTH.toLocaleString()}</span>
        </summary>
        <div className="pt-3">
          <label htmlFor="mermaid-private-notes" className="sr-only">Private notes</label>
          <textarea
            id="mermaid-private-notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            maxLength={MERMAID_NOTES_MAX_LENGTH}
            rows={4}
            placeholder="Context, decisions, or reminders about this diagram"
            className="w-full resize-y border border-input bg-background px-3 py-2.5 leading-6 outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">Only visible to you. Saved with each revision.</p>
        </div>
      </details>
    </section>
  );
}
