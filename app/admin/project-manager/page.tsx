import { getAllProjects } from "@/actions/projects";
import ProjectList from "./ProjectList";
import AddProjectButton from "@/components/AddProjectButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function ProjectManagerPage() {
  const projects = await getAllProjects();

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Manage projects shown across the site."
        action={<AddProjectButton />}
      />
      <ProjectList
        key={projects.map((project) => `${project.id}:${project.updatedAt.toISOString()}`).join("|")}
        projects={projects}
      />
    </div>
  );
}
