"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAllowedAdminSession } from "@/lib/auth-guards";
import { postInputSchema } from "../schemas/post";
import { createPostRecord, updatePostRecord } from "../services/posts";

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function parsePostForm(formData: FormData) {
  return postInputSchema.parse({
    title: formValue(formData, "title"),
    slug: formValue(formData, "slug"),
    excerpt: formValue(formData, "excerpt"),
    markdown: formValue(formData, "markdown"),
    status: formValue(formData, "status"),
  });
}

async function requireOwner() {
  const session = await getAllowedAdminSession();
  if (!session) throw new Error("Unauthorized");
}

function revalidatePublishing(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPost(formData: FormData) {
  await requireOwner();
  const post = await createPostRecord(parsePostForm(formData));
  revalidatePublishing(post.slug);
  redirect(`/admin/blog/${post.id}/edit`);
}

export async function updatePost(formData: FormData) {
  await requireOwner();
  const id = formValue(formData, "id");
  if (!id) throw new Error("Post ID is required");
  const previous = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
  const post = await updatePostRecord(id, parsePostForm(formData));
  revalidatePublishing(previous?.slug);
  revalidatePublishing(post.slug);
  redirect(`/admin/blog/${post.id}/edit?saved=true`);
}

export async function deletePost(formData: FormData) {
  await requireOwner();
  const id = formValue(formData, "id");
  if (!id) throw new Error("Post ID is required");
  const post = await prisma.post.delete({ where: { id }, select: { slug: true } });
  revalidatePublishing(post.slug);
  redirect("/admin/blog");
}
