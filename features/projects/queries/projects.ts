import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import prisma from "@/lib/prisma";

export async function getAllProjects() {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  return prisma.project.findMany();
}

export async function getProjectById(id: number) {
  "use cache";
  cacheLife("hours");
  cacheTag("projects", `project:${id}`);
  if (!Number.isSafeInteger(id) || id < 1) return null;
  return prisma.project.findUnique({
    where: { id },
    include: { galleryImages: true },
  });
}
