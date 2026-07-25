import ProjectCard from "@/components/ProjectCard";
import { getAllProjects } from "@/actions/projects";
import Header from "@/components/Header";
import type { Metadata } from "next";
import { generateMetadataWithCanonical } from "@/lib/metadata";
import BrandIcon from "@/components/BrandIcon";

export const metadata: Metadata = generateMetadataWithCanonical(
  "/projects",
  "Projects | William Rice",
  "Software implementation and architecture case studies by William Rice.",
);

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <>
      <Header>
        <h1>Selected systems and implementation work.</h1>
      </Header>
      <section className="section-block">
        <div className="site-shell">
          <div className="section-heading">
            <p className="eyebrow mb-7">Case studies</p>
            <h2>How the work gets built.</h2>
            <p>
              A closer look at constraints, technical decisions, and shipped
              outcomes. More implementation work is available on{" "}
              <a className="text-link inline-flex items-center gap-2" href="https://github.com/williamrice" target="_blank" rel="noreferrer">
                <BrandIcon brand="github" className="size-4" /> GitHub
              </a>.
            </p>
          </div>
          {projects.length ? (
            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          ) : (
            <div className="mt-16 border border-border bg-card/40 p-8 text-muted-foreground">
              Case studies are being prepared. The clean database state is supported.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
