import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Workflow } from "lucide-react";

export const metadata: Metadata = {
  title: "Tools",
  description: "Small browser-based tools for working with software and technical ideas.",
};

export default function ToolsPage() {
  return (
    <div className="site-shell pb-24 pt-32 sm:pt-40">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Public workbench</p>
      <h1 className="mt-4 text-5xl font-medium tracking-[-.05em] sm:text-6xl">Tools</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Focused utilities that run in your browser and keep the useful controls close at hand.</p>
      <section className="mt-12 grid gap-5 md:grid-cols-2" aria-label="Available tools">
        <Link href="/tools/mermaid" className="group flex min-h-64 flex-col border border-border bg-card p-6 hover:border-primary sm:p-8">
          <Workflow className="size-7 text-primary" />
          <h2 className="mt-10 text-2xl font-medium tracking-tight">Mermaid renderer</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Write Mermaid syntax, preview diagrams live, and export clean SVG or source files.</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-primary">Open renderer <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </section>
    </div>
  );
}
