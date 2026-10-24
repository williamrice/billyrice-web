"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProject } from "@/actions/projects";
import { toast } from "sonner";
import type { Project } from "@/prisma/generated/prisma/client";

export default function ProjectList({ projects: initialProjects }: { projects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const router = useRouter();
  async function handleDelete(id: number) {
    if (!window.confirm("Delete this project? This action cannot be undone.")) return;
    const result = await deleteProject(id);
    if (result.success) {
      setProjects((current) => current.filter((project) => project.id !== id));
      toast.success("Project deleted.");
      router.refresh();
    } else {
      toast.error("The project could not be deleted.");
    }
  }

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="admin-card py-14 text-center">
          <h2 className="admin-card-title">No projects yet</h2>
          <p className="admin-card-description">Add the first project.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-secondary/80">
                <tr>
                  {["Project", "Status", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className={`border-b border-border px-5 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground ${heading === "Actions" ? "text-right" : "text-left"}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="group hover:bg-secondary/70">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{project.title}</p>
                      <p className="mt-1 max-w-xl truncate text-xs text-muted-foreground">{project.description}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${project.featured ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        <span className={`size-1.5 rounded-full ${project.featured ? "bg-primary" : "bg-muted-foreground"}`} />
                        {project.featured ? "Featured" : "Standard"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <Link
                        href={`/admin/project-manager/edit/${project.id}`}
                        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
                        aria-label={`Edit ${project.title}`}
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-destructive"
                        aria-label={`Delete ${project.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
