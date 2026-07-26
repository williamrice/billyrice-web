"use client";

import { Trash2 } from "lucide-react";

export function DeletePostForm({
  postId,
  action,
}: {
  postId: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={action}
      className="mt-4"
      onSubmit={(event) => {
        if (!window.confirm("Delete this post and its complete revision history?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={postId} />
      <button className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-red-50 px-4 text-sm font-semibold text-red-800 hover:bg-red-100">
        <Trash2 className="size-4" /> Delete post
      </button>
    </form>
  );
}
