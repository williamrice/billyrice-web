import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";
import CodeMark from "@/components/CodeMark";
import { getPublishedPosts } from "@/features/publishing/queries/posts";
import { generateMetadataWithCanonical } from "@/lib/utils/metadata";
import { formatLongDate } from "@/lib/utils/dates";

export const metadata: Metadata = generateMetadataWithCanonical(
  "/blog",
  "Writing",
  "Notes on software implementation, applied AI, architecture, and technical leadership by Billy Rice.",
);

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Header><h1>Writing about systems, implementation, and leverage.</h1></Header>
      <section className="section-block">
        <div className="site-shell">
          <div className="section-heading">
            <p className="eyebrow mb-7">Writing</p>
            <h2>Notes from the work.</h2>
            <p>Technical essays, practical lessons, and deeper context behind the systems I build.</p>
          </div>

          {posts.length ? (
            <div className="mt-16 border-t border-border">
              {posts.map((post) => (
                <article key={post.id} className="group grid gap-6 border-b border-border py-10 md:grid-cols-[4rem_1fr_auto] md:items-start md:gap-10 md:py-12">
                  <CodeMark />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">{formatLongDate(post.publishedAt)}</p>
                    <h2 className="mt-3 text-2xl font-medium tracking-[-.035em] sm:text-3xl">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary">{post.title}</Link>
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{post.excerpt}</p>
                  </div>
                  <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="mt-1 grid size-10 place-items-center rounded-full border border-border text-muted-foreground group-hover:border-primary/60 group-hover:text-primary">
                    <ArrowUpRight className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-16 border border-border bg-card/40 p-8 text-muted-foreground">
              The first article is being drafted.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
