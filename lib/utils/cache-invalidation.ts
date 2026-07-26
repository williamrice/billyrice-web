import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateResumeContent() {
  revalidatePath("/resume");
  revalidatePath("/admin");
  revalidatePath("/admin/resume");
  revalidatePath("/admin/settings");
}

export function revalidatePublishingContent(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}
