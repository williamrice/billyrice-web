export default function AdminLoading() {
  return (
    <div className="admin-page" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="admin-page-header" aria-hidden="true">
        <div className="w-full">
          <div className="h-9 w-56 animate-pulse rounded-md bg-secondary" />
          <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-secondary/70" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="admin-card min-h-40">
            <div className="h-5 w-32 animate-pulse rounded bg-secondary" />
            <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-secondary/70" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-secondary/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
