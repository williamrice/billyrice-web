import "server-only";

import { cache } from "react";
import prisma from "@/lib/prisma";
import { getPublicResumeProfileId } from "@/features/settings/queries/settings";

const resumeInclude = {
  positions: {
    include: {
      organization: true,
      accomplishments: { orderBy: { sortOrder: "asc" as const } },
    },
    orderBy: [{ sortOrder: "asc" as const }, { startDate: "desc" as const }],
  },
  skills: { orderBy: [{ category: "asc" as const }, { sortOrder: "asc" as const }] },
  education: { orderBy: { sortOrder: "asc" as const } },
  credentials: { orderBy: { sortOrder: "asc" as const } },
  projects: {
    include: { project: true },
    orderBy: { sortOrder: "asc" as const },
  },
};

export const getPublishedResume = cache(async () => {
  const configuredProfileId = await getPublicResumeProfileId();
  return prisma.professionalProfile.findFirst({
    where: configuredProfileId
      ? { id: configuredProfileId, published: true }
      : { published: true },
    orderBy: { createdAt: "asc" },
    include: resumeInclude,
  });
});

export const getResumeAdmin = cache(async (profileId?: string) =>
  prisma.professionalProfile.findUnique({
    where: { id: profileId ?? "primary" },
    include: resumeInclude,
  }),
);

export const getResumeProfiles = cache(async () =>
  prisma.professionalProfile.findMany({
    orderBy: [{ createdAt: "asc" }, { label: "asc" }],
    select: { id: true, label: true, slug: true, published: true, updatedAt: true },
  }),
);

export const getResumeProjectOptions = cache(async () =>
  prisma.project.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
);
