import { redirect } from "next/navigation";
import AddProjectForm from "../../../components/AddProjectForm";
import { getAllowedAdminSession } from "@/lib/auth-guards";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AddProjectPage() {
  const session = await getAllowedAdminSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="admin-page max-w-5xl">
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Add project"
        description="Create a new case study with clear context, outcomes, technology, and accessible media."
        action={<Link href="/admin/project-manager" className="admin-button-secondary"><ArrowLeft className="size-4" /> Projects</Link>}
      />
      <AddProjectForm />
    </div>
  );
}
