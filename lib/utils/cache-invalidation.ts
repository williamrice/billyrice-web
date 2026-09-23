import "server-only";

import { revalidatePath, updateTag } from "next/cache";

export function revalidateResumeContent() {
  updateTag("published-resume");
  revalidatePath("/resume");
  revalidatePath("/admin");
  revalidatePath("/admin/resume");
  revalidatePath("/admin/settings");
}

export function revalidatePublishingContent(slug?: string) {
  updateTag("published-posts");
  if (slug) updateTag(`published-post:${slug}`);
  revalidatePath("/blog");
  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}
