import "server-only";

import { cache } from "react";
import prisma from "@/lib/prisma";
import { PublicationStatus } from "../types/publication";

export const getPublishedPosts = cache(async () =>
  prisma.post.findMany({
    where: {
      status: PublicationStatus.Published,
      publishedAt: { lte: new Date() },
    },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      updatedAt: true,
    },
  }),
);

export const getPublishedPostBySlug = cache(async (slug: string) =>
  prisma.post.findFirst({
    where: {
      slug,
      status: PublicationStatus.Published,
      publishedAt: { lte: new Date() },
    },
  }),
);

export const getAdminPosts = cache(async () =>
  prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { revisions: true } } },
  }),
);

export const getAdminPost = cache(async (id: string) =>
  prisma.post.findUnique({
    where: { id },
    include: {
      revisions: {
        orderBy: { version: "desc" },
        select: { id: true, version: true, status: true, source: true, createdAt: true },
      },
    },
  }),
);
