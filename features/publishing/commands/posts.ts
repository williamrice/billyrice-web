"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAllowedAdminSession } from "@/lib/auth-guards";
import { requireFormString } from "@/lib/utils/form-data";
import { revalidatePublishingContent } from "@/lib/utils/cache-invalidation";
import { parsePostFormData } from "../schemas/post";
import { createPostRecord, updatePostRecord } from "../services/posts";

export async function createPost(formData: FormData) {
  await requireAllowedAdminSession();
  const post = await createPostRecord(parsePostFormData(formData));
  revalidatePublishingContent(post.slug);
  redirect(`/admin/blog/${post.id}/edit?saved=true`);
}

export async function updatePost(formData: FormData) {
  await requireAllowedAdminSession();
  const id = requireFormString(formData, "id", "Post ID is required");
  const previous = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
  const post = await updatePostRecord(id, parsePostFormData(formData));
  revalidatePublishingContent(previous?.slug);
  revalidatePublishingContent(post.slug);
  redirect(`/admin/blog/${post.id}/edit?saved=true`);
}

export async function deletePost(formData: FormData) {
  await requireAllowedAdminSession();
  const id = requireFormString(formData, "id", "Post ID is required");
  const post = await prisma.post.delete({ where: { id }, select: { slug: true } });
  revalidatePublishingContent(post.slug);
  redirect("/admin/blog");
}
