"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProject } from "@/actions/projects";
import type { Project } from "@/prisma/generated/prisma/client";

export default function ProjectList({ projects: initialProjects }: { projects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const router = useRouter();
  const success = useSearchParams().get("success");

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this project? This action cannot be undone.")) return;
    const result = await deleteProject(id);
    if (result.success) {
      setProjects((current) => current.filter((project) => project.id !== id));
      router.refresh();
    } else {
      window.alert("Failed to delete project");
    }
  }

  return (
    <div className="space-y-4">
      {success === "true" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
          Project successfully saved.
        </div>
      )}
      {success === "false" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900">
          The project could not be saved. Please try again.
        </div>
      )}

      {projects.length === 0 ? (
        <div className="admin-card py-14 text-center">
          <h2 className="admin-card-title">No projects yet</h2>
          <p className="admin-card-description">Create the first case study to populate the portfolio.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  {["Project", "Status", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className={`border-b border-gray-200 px-5 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-gray-500 ${heading === "Actions" ? "text-right" : "text-left"}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <tr key={project.id} className="group hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-950">{project.title}</p>
                      <p className="mt-1 max-w-xl truncate text-xs text-gray-500">{project.description}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${project.featured ? "bg-teal-50 text-teal-800" : "bg-gray-100 text-gray-600"}`}>
                        <span className={`size-1.5 rounded-full ${project.featured ? "bg-teal-600" : "bg-gray-400"}`} />
                        {project.featured ? "Featured" : "Standard"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <Link
                        href={`/admin/project-manager/edit/${project.id}`}
                        className="inline-flex size-9 items-center justify-center rounded-md text-gray-500 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-teal-700"
                        aria-label={`Edit ${project.title}`}
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="inline-flex size-9 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-700"
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
