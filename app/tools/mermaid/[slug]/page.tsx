import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MermaidEditor } from "@/features/tools/mermaid/components/MermaidEditor";
import { getMermaidDiagramForEditor } from "@/features/tools/mermaid/queries/diagrams";
import { getAllowedAdminSession } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Shared Mermaid Diagram",
  robots: { index: false, follow: false },
};

export default async function SavedMermaidDiagramPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, session] = await Promise.all([params, getAllowedAdminSession()]);
  const result = await getMermaidDiagramForEditor(slug, session?.user.id);
  if (result.redirectSlug) permanentRedirect(`/tools/mermaid/${result.redirectSlug}`);
  if (!result.diagram) notFound();

  return <MermaidEditor diagram={result.diagram} canManage={result.canManage} />;
}
