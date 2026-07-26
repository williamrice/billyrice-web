"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";
import { MarkdownContent } from "./MarkdownContent";
import { slugifyPostTitle } from "../schemas/post";
import {
  PublicationStatus,
  publicationStatusOptions,
} from "../types/publication";

type EditorPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  markdown: string;
  status: PublicationStatus;
};

export function PostEditor({
  post,
  action,
}: {
  post: EditorPost;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [markdown, setMarkdown] = useState(post.markdown);
  const [status, setStatus] = useState(post.status);

  return (
    <form action={action} className="space-y-6">
      {post.id && <input type="hidden" name="id" value={post.id} />}
      <div className="admin-card admin-form-grid">
        <label>
          <span className="admin-label">Title</span>
          <input
            className="admin-field"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label>
          <span className="admin-label">Publication state</span>
          <select
            className="admin-field"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PublicationStatus)}
          >
            {publicationStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="admin-label">Slug</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="admin-field font-mono"
              name="slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="custom-post-slug"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
            />
            <button
              type="button"
              className="admin-button-secondary shrink-0"
              onClick={() => setSlug(slugifyPostTitle(title))}
            >
              <WandSparkles className="size-4" /> Generate
            </button>
          </div>
          <span className="mt-1.5 block text-xs font-normal text-gray-500">
            Published at /blog/{slug || "your-slug"}
          </span>
        </label>
        <label className="sm:col-span-2">
          <span className="admin-label">Excerpt</span>
          <textarea
            name="excerpt"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="A concise summary for lists and search results."
            required
          />
        </label>
      </div>

      <div className="grid min-h-[42rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] xl:grid-cols-2">
        <section className="flex min-h-[32rem] flex-col border-b border-gray-200 xl:border-b-0 xl:border-r">
          <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-gray-500">Markdown</span>
            <span className="text-xs text-gray-400">{markdown.length.toLocaleString()} characters</span>
          </div>
          <textarea
            className="min-h-0 flex-1 resize-none rounded-none! border-0! bg-white! p-5! font-mono text-[13px]! leading-6! ring-0! sm:p-6!"
            name="markdown"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            spellCheck
            required
          />
        </section>
        <section className="min-h-[32rem] bg-[#0d1514] text-white">
          <div className="flex h-12 items-center border-b border-white/10 px-4">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-teal-400">Live preview</span>
          </div>
          <div className="max-h-[calc(42rem-3rem)] overflow-y-auto p-5 sm:p-7">
            {markdown ? (
              <MarkdownContent markdown={markdown} />
            ) : (
              <p className="text-sm text-gray-500">Start writing to preview the article.</p>
            )}
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button className="admin-button min-w-36">Save post</button>
      </div>
    </form>
  );
}
