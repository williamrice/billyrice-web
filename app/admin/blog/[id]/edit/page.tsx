import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostEditor } from "@/features/publishing/components/PostEditor";
import { deletePost, updatePost } from "@/features/publishing/commands/posts";
import { getAdminPost } from "@/features/publishing/queries/posts";
import { DeletePostForm } from "@/features/publishing/components/DeletePostForm";
import { PublicationStatus } from "@/features/publishing/types/publication";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) notFound();

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Publishing"
        title={`Edit ${post.title}`}
        description={`Revision ${post.revisions[0]?.version ?? 0} · Last saved ${post.updatedAt.toLocaleString("en-US")}`}
        action={
          <div className="flex gap-2">
            {post.status === PublicationStatus.Published && (
              <Link href={`/blog/${post.slug}`} target="_blank" className="admin-button-secondary">
                View <ExternalLink className="size-4" />
              </Link>
            )}
            <Link href="/admin/blog" className="admin-button-secondary"><ArrowLeft className="size-4" /> Writing</Link>
          </div>
        }
      />
      <PostEditor key={post.updatedAt.toISOString()} action={updatePost} post={post} />
      <details className="admin-card border-red-200">
        <summary className="cursor-pointer text-sm font-semibold text-red-800">Danger zone</summary>
        <p className="mt-3 text-sm text-gray-600">Deleting a post also deletes its complete revision history.</p>
        <DeletePostForm postId={post.id} action={deletePost} />
      </details>
    </div>
  );
}
