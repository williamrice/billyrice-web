import AddProjectForm from "../../../components/AddProjectForm";
import { getAllowedAdminSession } from "@/lib/auth-guards";
import { AdminSignIn } from "@/components/admin/AdminSignIn";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AddProjectPage() {
  if (!(await getAllowedAdminSession())) return <AdminSignIn />;

  return (
    <div className="admin-page max-w-5xl">
      <AdminPageHeader
        title="Add project"
        description="Add a project to the portfolio."
        action={<Link href="/admin/project-manager" className="admin-button-secondary"><ArrowLeft className="size-4" /> Projects</Link>}
      />
      <AddProjectForm />
    </div>
  );
}
