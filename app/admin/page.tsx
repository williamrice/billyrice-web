import Link from "next/link";
import { ArrowRight, FileText, FolderKanban, Newspaper, Settings2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import prisma from "@/lib/prisma";
import { getPublicResumeProfileId } from "@/features/settings/queries/settings";

export default async function AdminPage() {
  const [projectCount, postCount, resumeProfiles, publicProfileId] = await Promise.all([
    prisma.project.count(),
    prisma.post.count(),
    prisma.professionalProfile.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, label: true, published: true, updatedAt: true },
    }),
    getPublicResumeProfileId(),
  ]);
  const publicProfile = resumeProfiles.find((profile) => profile.id === publicProfileId);

  const cards = [
    {
      title: "Writing",
      value: String(postCount),
      detail: postCount === 1 ? "article in the publishing system" : "articles in the publishing system",
      href: "/admin/blog",
      action: "Manage writing",
      icon: Newspaper,
    },
    {
      title: "Projects",
      value: String(projectCount),
      detail: projectCount === 1 ? "case study in the portfolio" : "case studies in the portfolio",
      href: "/admin/project-manager",
      action: "Manage projects",
      icon: FolderKanban,
    },
    {
      title: "Resume versions",
      value: String(resumeProfiles.length),
      detail: publicProfile ? `${publicProfile.label} is public` : "No public version configured",
      href: "/admin/resume",
      action: "Open resume studio",
      icon: FileText,
    },
    {
      title: "Site settings",
      value: publicProfile ? "Ready" : "Review",
      detail: "PostgreSQL-backed configuration with Redis caching",
      href: "/admin/settings",
      action: "Configure site",
      icon: Settings2,
    },
  ];

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Owner workspace"
        title="Dashboard"
        description="A concise view of the content and configuration currently driving billyrice.com."
        action={<Link href="/" className="admin-button-secondary">View public site</Link>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Content overview">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="admin-card group flex min-h-52 flex-col hover:border-teal-300">
            <div className="flex items-start justify-between">
              <card.icon className="size-5 text-teal-700" />
              <ArrowRight className="size-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" />
            </div>
            <p className="mt-8 text-3xl font-semibold tracking-[-.04em] text-gray-950">{card.value}</p>
            <h2 className="mt-2 text-sm font-semibold text-gray-900">{card.title}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">{card.detail}</p>
            <p className="mt-auto pt-5 text-xs font-semibold text-teal-800">{card.action}</p>
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
          <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${publicProfile ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
            <span className={`size-1.5 rounded-full ${publicProfile ? "bg-emerald-600" : "bg-amber-600"}`} />
            {publicProfile ? "Configured" : "Needs attention"}
          </span>
        </div>
      </section>
    </div>
  );
}
