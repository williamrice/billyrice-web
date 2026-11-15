export default function RouteLoading() {
  return (
    <section className="site-shell py-32" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="space-y-6" aria-hidden="true">
        <div className="h-10 w-2/3 max-w-lg animate-pulse rounded bg-secondary" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-secondary/70" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-secondary/50" />
      </div>
    </section>
  );
}
