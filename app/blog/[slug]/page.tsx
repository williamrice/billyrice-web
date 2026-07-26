import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarkdownContent } from "@/features/publishing/components/MarkdownContent";
import { getPublishedPostBySlug } from "@/features/publishing/queries/posts";
import { SITE_NAME } from "@/lib/site";
import { formatLongDate } from "@/lib/utils/dates";
import { absoluteUrl } from "@/lib/utils/urls";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: absoluteUrl(`/blog/${post.slug}`) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: absoluteUrl(`/blog/${post.slug}`),
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: { "@type": "Person", name: SITE_NAME, url: absoluteUrl("/resume") },
  };

  return (
    <>
      <Script
        id="blog-post-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }}
      />
      <article className="pb-24 pt-32 sm:pb-32 sm:pt-40">
        <header className="site-shell">
          <Link href="/blog" className="text-link inline-flex"><ArrowLeft className="size-4" /> All writing</Link>
          <p className="eyebrow mt-12">{formatLongDate(post.publishedAt)}</p>
          <h1 className="mt-7 max-w-5xl text-balance text-[clamp(2.7rem,8vw,6.5rem)] font-medium leading-[.96] tracking-[-.06em]">
            {post.title}
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-8 text-muted-foreground sm:text-2xl sm:leading-9">{post.excerpt}</p>
        </header>
        <div className="site-shell mt-16 border-t border-border pt-12 sm:mt-20 sm:pt-16">
          <div className="mx-auto max-w-3xl">
            <MarkdownContent markdown={post.markdown} />
          </div>
        </div>
      </article>
    </>
  );
}
