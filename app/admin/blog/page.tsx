import Link from "next/link";
import { FilePenLine, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminPosts } from "@/features/publishing/queries/posts";
import { PublicationStatus } from "@/features/publishing/types/publication";

export default async function BlogAdminPage() {
  const posts = await getAdminPosts();

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Publishing"
        title="Writing"
        description="Create, revise, and publish Markdown articles without rebuilding the application."
        action={<Link href="/admin/blog/new" className="admin-button"><Plus className="size-4" /> New post</Link>}
      />

      {posts.length ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/blog/${post.id}/edit`}
                className="group grid gap-4 p-5 hover:bg-gray-50/80 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-gray-950">{post.title}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${post.status === PublicationStatus.Published ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                      {post.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-gray-500">/blog/{post.slug}</p>
                  <p className="mt-2 line-clamp-1 text-sm text-gray-500">{post.excerpt}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{post._count.revisions} revisions</span>
                  <FilePenLine className="size-4 text-gray-300 group-hover:text-teal-700" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="admin-card py-14 text-center">
          <h2 className="admin-card-title">No posts yet</h2>
          <p className="admin-card-description">Create the first draft and start writing in Markdown.</p>
        </div>
      )}
    </div>
  );
}
