import "server-only";

import prisma from "@/lib/prisma";
import type { z } from "zod";
import { externalPostInputSchema, postInputSchema } from "../schemas/post";
import { PublicationStatus } from "../types/publication";

type PostInput = z.infer<typeof postInputSchema>;
type ExternalPostInput = z.infer<typeof externalPostInputSchema>;

export async function createPostRecord(input: PostInput, source = "admin") {
  const data = postInputSchema.parse(input);
  const publishedAt = data.status === PublicationStatus.Published ? new Date() : null;

  return prisma.$transaction(async (transaction) => {
    const post = await transaction.post.create({
      data: { ...data, source, publishedAt },
    });
    await transaction.postRevision.create({
      data: {
        postId: post.id,
        version: 1,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        markdown: post.markdown,
        status: post.status,
        source,
      },
    });
    return post;
  });
}

export async function updatePostRecord(id: string, input: PostInput, source = "admin") {
  const data = postInputSchema.parse(input);

  return prisma.$transaction(async (transaction) => {
    const current = await transaction.post.findUniqueOrThrow({
      where: { id },
      select: { publishedAt: true },
    });
    const latestRevision = await transaction.postRevision.aggregate({
      where: { postId: id },
      _max: { version: true },
    });
    const publishedAt =
      data.status === PublicationStatus.Published
        ? current.publishedAt ?? new Date()
        : null;
    const post = await transaction.post.update({
      where: { id },
      data: { ...data, source, publishedAt },
    });
    await transaction.postRevision.create({
      data: {
        postId: post.id,
        version: (latestRevision._max.version ?? 0) + 1,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        markdown: post.markdown,
        status: post.status,
        source,
      },
    });
    return post;
  });
}

export async function upsertExternalPostRecord(input: ExternalPostInput) {
  const data = externalPostInputSchema.parse(input);
  const existing = await prisma.post.findUnique({
    where: { externalId: data.externalId },
    select: { id: true },
  });
  const postData = postInputSchema.parse(data);

  if (existing) {
    return updatePostRecord(existing.id, postData, data.source);
  }

  const post = await createPostRecord(postData, data.source);
  return prisma.post.update({
    where: { id: post.id },
    data: { externalId: data.externalId },
  });
}
