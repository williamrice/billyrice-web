export default function TechnologyPill({ technology }: { technology: string }) {
  return (
    <span className="inline-flex border border-border bg-card/50 px-3 py-2 font-mono text-[10px] uppercase tracking-[.13em] text-muted-foreground">
      {technology}
    </span>
  );
}
