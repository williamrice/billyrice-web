import { Project } from "@/prisma/generated/prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TechnologyPill from "./TechnologyPill";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex min-w-0 flex-col overflow-hidden border border-border bg-card/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted">
        <Image
          src={project.featuredImageSrc}
          alt={project.featuredImageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover grayscale-[35%] transition duration-500 group-hover:scale-[1.025] group-hover:grayscale-0"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <h2 className="text-2xl font-medium tracking-[-.03em] text-foreground">
            {project.title}
          </h2>
          <ArrowUpRight className="mt-1 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <p className="mt-5 line-clamp-4 leading-7 text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {project.technologies.slice(0, 4).map((technology) => (
            <TechnologyPill key={technology} technology={technology} />
          ))}
        </div>
      </div>
    </Link>
  );
}
