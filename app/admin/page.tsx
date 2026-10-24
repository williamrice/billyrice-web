import Link from "next/link";
import { ArrowRight, FileText, FolderKanban, Newspaper, Settings2, Workflow } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import prisma from "@/lib/prisma";
import { getPublicResumeProfileId } from "@/features/settings/queries/settings";
import { getAllowedAdminSession } from "@/lib/auth-guards";
import { AdminSignIn } from "@/components/admin/AdminSignIn";

export default async function AdminPage() {
  if (!(await getAllowedAdminSession())) return <AdminSignIn />;

  const [projectCount, postCount, diagramCount, resumeProfiles, publicProfileId] = await Promise.all([
    prisma.project.count(),
    prisma.post.count(),
    prisma.mermaidDiagram.count(),
    prisma.professionalProfile.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, label: true, published: true, updatedAt: true },
    }),
    getPublicResumeProfileId(),
  ]);
  const publicProfile = resumeProfiles.find((profile) => profile.id === publicProfileId);

  const cards = [
    {
      title: "Diagrams",
      value: String(diagramCount),
      detail: diagramCount === 1 ? "saved Mermaid diagram" : "saved Mermaid diagrams",
      href: "/admin/tools/mermaid",
      action: "Open diagram library",
      icon: Workflow,
    },
    {
      title: "Writing",
      value: String(postCount),
      detail: postCount === 1 ? "saved article" : "saved articles",
      href: "/admin/blog",
      action: "Manage writing",
      icon: Newspaper,
    },
    {
      title: "Projects",
      value: String(projectCount),
      detail: projectCount === 1 ? "case study" : "case studies",
      href: "/admin/project-manager",
      action: "Manage projects",
      icon: FolderKanban,
    },
    {
      title: "Resume versions",
      value: String(resumeProfiles.length),
      detail: publicProfile ? `${publicProfile.label} is public` : "No public version configured",
      href: "/admin/resume",
      action: "Manage resume",
      icon: FileText,
    },
    {
      title: "Site settings",
      value: publicProfile ? "Ready" : "Review",
      detail: "Public content and presentation",
      href: "/admin/settings",
      action: "Configure site",
      icon: Settings2,
    },
  ];

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Dashboard"
        description="Manage site content and settings."
        action={<Link href="/" className="admin-button-secondary">View public site</Link>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" aria-label="Content overview">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="admin-card group flex min-h-52 flex-col hover:border-primary/60">
            <div className="flex items-start justify-between">
              <card.icon className="size-5 text-primary" />
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <p className="mt-8 text-3xl font-semibold tracking-[-.04em] text-foreground">{card.value}</p>
            <h2 className="mt-2 text-sm font-semibold text-foreground">{card.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.detail}</p>
            <p className="mt-auto pt-5 text-xs font-semibold text-primary">{card.action}</p>
          </Link>
        ))}
      </section>

      <section className="admin-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="admin-card-title">Publishing status</h2>
            <p className="admin-card-description">
              {publicProfile
                ? `${publicProfile.label} is the resume version visitors currently see.`
                : "Publish a resume version and select it in Settings before launch."}
            </p>
          </div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${publicProfile ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
            <span className={`size-1.5 rounded-full ${publicProfile ? "bg-success" : "bg-warning"}`} />
            {publicProfile ? "Configured" : "Needs attention"}
          </span>
        </div>
      </section>
    </div>
  );
}
