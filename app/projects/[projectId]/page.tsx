import { getProjectById } from "@/actions/projects";
import Header from "@/components/Header";
import TechnologyPill from "@/components/TechnologyPill";
import ImageLightbox from "@/components/ImageLightbox";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Eye } from "lucide-react";
import BrandIcon from "@/components/BrandIcon";

export default async function IndividualProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProjectById(Number.parseInt(projectId, 10));

  if (!project) {
    return (
      <section className="site-shell flex min-h-[70dvh] flex-col items-start justify-center pt-24">
        <p className="eyebrow mb-7">404 / Project</p>
        <h1 className="text-5xl font-medium tracking-[-.05em]">Project not found.</h1>
        <p className="mt-5 text-muted-foreground">The case study may have moved or is not published.</p>
        <Link href="/projects" className="button-primary mt-8"><ArrowLeft className="size-4" /> Back to projects</Link>
      </section>
    );
  }

  const sections = [
    ["01", "Description", project.description],
    ["02", "Problem", project.problem],
    ["03", "Solution", project.solution],
    ["04", "Story", project.story],
  ] as const;

  return (
    <>
      <Header><h1>{project.title}</h1></Header>
      <article className="section-block">
        <div className="site-shell max-w-6xl">
          <div className="flex flex-col gap-8 border-b border-border pb-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((technology) => <TechnologyPill key={technology} technology={technology} />)}
            </div>
            <div className="flex flex-wrap gap-3">
              {project.githubUrl && (
                <Link href={project.githubUrl} target="_blank" className="button-quiet">
                  <BrandIcon brand="github" className="size-4" /> Source
                </Link>
              )}
              {project.liveUrl && (
                <Link href={project.liveUrl} target="_blank" className="button-primary">
                  <Eye className="size-4" /> Live project
                </Link>
              )}
            </div>
          </div>

          <div className="my-14 overflow-hidden border border-border bg-card">
            <div className="relative aspect-[16/9]">
              <ImageLightbox src={project.featuredImageSrc} alt={project.featuredImageAlt} fill sizes="(max-width: 1200px) 100vw, 1100px" className="object-cover" priority />
            </div>
          </div>

          <div className="border-t border-border">
            {sections.map(([number, title, content]) => (
              <section key={title} className="grid gap-6 border-b border-border py-12 md:grid-cols-[5rem_1fr_2fr] md:gap-10">
                <span className="font-mono text-xs text-primary">{number}</span>
                <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
                <p className="text-lg leading-8 text-muted-foreground">{content}</p>
              </section>
            ))}
          </div>

          {project.galleryImages.length > 0 && (
            <section className="py-14">
              <p className="eyebrow mb-8">Gallery</p>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {project.galleryImages.map((image, index) => (
                  <div key={image.id ?? index} className="relative aspect-[4/3] overflow-hidden border border-border">
                    <ImageLightbox src={image.imagePath} alt={`Gallery image ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" priority={false} />
                  </div>
                ))}
              </div>
            </section>
          )}
          <Link href="/projects" className="text-link group mt-12 inline-flex">
            <ArrowLeft className="size-4" /> Back to projects <ArrowUpRight className="size-3 opacity-0" />
          </Link>
        </div>
      </article>
    </>
  );
}
