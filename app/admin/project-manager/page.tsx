import { getAllProjects } from "@/features/projects/queries/projects";
import ProjectList from "./ProjectList";
import AddProjectButton from "@/components/AddProjectButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAllowedAdminSession } from "@/lib/auth-guards";
import { AdminSignIn } from "@/components/admin/AdminSignIn";

export default async function ProjectManagerPage() {
  if (!(await getAllowedAdminSession())) return <AdminSignIn />;

  const projects = await getAllProjects();

  return (
    <div className="admin-page">
      <AdminPageHeader
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
