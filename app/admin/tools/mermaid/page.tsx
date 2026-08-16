import Link from "next/link";
import { Eye, EyeOff, Plus, Workflow } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteDiagramForm } from "@/features/tools/mermaid/components/DeleteDiagramForm";
import { deleteMermaidDiagram } from "@/features/tools/mermaid/commands/diagrams";
import { getMermaidDiagramLibrary } from "@/features/tools/mermaid/queries/diagrams";
import { requireAllowedAdminSession } from "@/lib/auth-guards";

export default async function MermaidLibraryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [session, params] = await Promise.all([requireAllowedAdminSession(), searchParams]);
  const search = params.q ?? "";
  const diagrams = await getMermaidDiagramLibrary(session.user.id, search);

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Tools"
        title="Mermaid library"
        description="Manage saved diagrams, revisions, and sharing."
        action={<Link href="/tools/mermaid" className="admin-button"><Plus className="size-4" /> New diagram</Link>}
      />
      <form className="admin-card flex flex-col gap-3 sm:flex-row" role="search">
        <label htmlFor="diagram-search" className="sr-only">Search saved diagrams</label>
        <input id="diagram-search" name="q" defaultValue={search} placeholder="Search by title, slug, or notes" className="admin-field flex-1" />
        <button className="admin-button-secondary">Search</button>
        {search && <Link href="/admin/tools/mermaid" className="admin-button-secondary">Clear</Link>}
      </form>
      {diagrams.length ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <ul className="divide-y divide-gray-100">
            {diagrams.map((diagram) => (
              <li key={diagram.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <Link href={`/tools/mermaid/${diagram.slug}`} className="group min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-semibold text-gray-950 group-hover:text-teal-800">{diagram.title}</h2><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${diagram.visibility === "public" ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>{diagram.visibility === "public" ? <Eye className="size-3" /> : <EyeOff className="size-3" />}{diagram.visibility}</span></div>
                  <p className="mt-1 truncate font-mono text-xs text-gray-500">/tools/mermaid/{diagram.slug}</p>
                  <p className="mt-2 text-xs text-gray-500">{diagram.revisionCount} revisions · Updated {new Date(diagram.updatedAt).toLocaleString("en-US")}</p>
                </Link>
                <DeleteDiagramForm id={diagram.id} title={diagram.title} action={deleteMermaidDiagram} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="admin-card py-14 text-center"><Workflow className="mx-auto size-7 text-teal-700" /><h2 className="mt-4 admin-card-title">{search ? "No matching diagrams" : "No saved diagrams yet"}</h2><p className="admin-card-description">{search ? "Try a different title or slug." : "Open the public renderer to create the first one."}</p></div>
      )}
    </div>
  );
}
