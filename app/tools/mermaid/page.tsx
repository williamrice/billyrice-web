import type { Metadata } from "next";
import { MermaidEditor } from "@/features/tools/mermaid/components/MermaidEditor";
import { getAllowedAdminSession } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Mermaid Renderer",
  description: "Write, preview, and export Mermaid diagrams.",
};

export default async function MermaidToolPage() {
  const session = await getAllowedAdminSession();
  return <MermaidEditor canManage={Boolean(session)} />;
}
