import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Project } from "@/prisma/generated/prisma/client";
import { getAllProjects } from "@/actions/projects";
import FeaturedProjectCard from "./FeaturedProjectCard";
import { Reveal } from "./PortfolioMotion";
import { getProjectsSetting } from "@/features/settings/queries/settings";

export default async function FeaturedProjects() {
  const projectsSetting = await getProjectsSetting();
  if (!projectsSetting.enabled) return null;

  const projects = await getAllProjects();
  const featuredProjects = projects.filter((project: Project) => project.featured).slice(0, 3);

  return (
    <section className="section-block border-t border-border" id="work">
      <div className="site-shell">
        <Reveal className="section-heading md:flex md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-7">Selected systems</p>
            <h2>Proof, not a project gallery.</h2>
          </div>
          <Link className="text-link group mt-7 md:mt-0" href="/projects">
            All case studies <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
        {featuredProjects.length ? (
          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {featuredProjects.map((project: Project) => (
              <FeaturedProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Reveal className="mt-16 grid gap-px border border-border bg-border md:grid-cols-3">
            {[
              ["01", "Implementation", "Production software with the seams, tradeoffs, and operational details made visible."],
              ["02", "Architecture", "Design decisions explained through constraints, alternatives, and durable outcomes."],
              ["03", "Leadership", "Examples of alignment, mentorship, and delivery across organizational boundaries."],
            ].map(([number, title, body]) => (
              <div className="min-h-72 bg-background p-8" key={number}>
                <span className="font-mono text-xs text-primary">{number}</span>
                <h3 className="mt-20 text-2xl font-medium tracking-tight">{title}</h3>
                <p className="mt-4 leading-7 text-muted-foreground">{body}</p>
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
