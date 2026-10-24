import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostEditor } from "@/features/publishing/components/PostEditor";
import { createPost } from "@/features/publishing/commands/posts";
import { PublicationStatus } from "@/features/publishing/types/publication";
import { getAllowedAdminSession } from "@/lib/auth-guards";

const starterMarkdown = `## Start with the idea

Write the article in **Markdown**. Raw HTML is intentionally disabled.

### What this supports

- Headings and lists
- Links and images
- Tables and task lists
- Fenced code blocks

\`\`\`ts
const dependable = true;
\`\`\`
`;

export default async function NewPostPage() {
  // The admin layout shows sign-in; never load owner data without a session.
  if (!(await getAllowedAdminSession())) return null;

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="New post"
        description="Write and preview a new article."
        action={<Link href="/admin/blog" className="admin-button-secondary"><ArrowLeft className="size-4" /> Writing</Link>}
      />
      <PostEditor
        action={createPost}
        post={{
          title: "",
          slug: "",
          excerpt: "",
          markdown: starterMarkdown,
          status: PublicationStatus.Draft,
        }}
      />
    </div>
  );
}
