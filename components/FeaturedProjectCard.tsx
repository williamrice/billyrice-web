import { Project } from "@/prisma/generated/prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex min-w-0 flex-col overflow-hidden border border-border bg-card/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={project.featuredImageSrc}
          alt={project.featuredImageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover grayscale-[35%] transition duration-500 group-hover:scale-[1.025] group-hover:grayscale-0"
        />
        <span className="absolute left-3 top-3 bg-background/85 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[.15em] text-primary backdrop-blur-md">
          Case study
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-medium tracking-[-.025em] text-foreground sm:text-2xl">
            {project.title}
          </h3>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {project.description}
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {project.technologies.slice(0, 4).map((tech: string) => (
            <span key={tech} className="border border-border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
