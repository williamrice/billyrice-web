import "server-only";

import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import prisma from "@/lib/prisma";
import { PublicationStatus } from "../types/publication";

export async function getPublishedPosts() {
  "use cache";
  cacheLife("minutes");
  cacheTag("published-posts");
  return prisma.post.findMany({
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
  });
}

export async function getPublishedPostBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("published-posts", `published-post:${slug}`);
  return prisma.post.findFirst({
    where: {
      slug,
      status: PublicationStatus.Published,
      publishedAt: { lte: new Date() },
    },
  });
}

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
