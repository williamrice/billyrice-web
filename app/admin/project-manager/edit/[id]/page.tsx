import { getProjectById } from '@/features/projects/queries/projects';
import EditProjectForm from './EditProjectForm';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAllowedAdminSession } from "@/lib/auth-guards";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  // The admin layout shows sign-in; never load owner data without a session.
  if (!(await getAllowedAdminSession())) return null;

  const { id } = await params;

  const projectId = parseInt(id);

  const project = await getProjectById(projectId);

  if (!project) {
    return <div className="admin-card">Project not found.</div>;
  }

  return (
    <div className="admin-page max-w-5xl">
      <AdminPageHeader
        title={`Edit ${project.title}`}
        description="Edit project details, links, and media."
        action={<Link href="/admin/project-manager" className="admin-button-secondary"><ArrowLeft className="size-4" /> Projects</Link>}
      />
      <div className="admin-card"><EditProjectForm project={project} /></div>
    </div>
  );
}
