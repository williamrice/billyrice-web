"use client";

import Image from "next/image";
import CredlyBadge from "./CredlyBadge";
import type { Badge } from "@/app/credentials/page";
import { ArrowUpRight } from "lucide-react";

export default function BadgeCard({ title, type, badgeId, imageUrl, viewUrl }: Badge) {
  const content = type === "image" && imageUrl ? (
    <div className="relative h-48 w-full">
      <Image src={imageUrl} alt={`Badge: ${title}`} fill sizes="330px" className="object-contain" />
    </div>
  ) : type === "credly" && badgeId ? (
    <div className="flex min-h-48 w-full justify-center">
      <CredlyBadge badgeId={badgeId} title={title} />
    </div>
  ) : null;

  return (
    <article className="flex h-full flex-col border border-border bg-card/50 p-6">
      <p className="eyebrow mb-6">Verified credential</p>
      <div className="flex grow items-center justify-center bg-background/60 p-4">{viewUrl ? <a href={viewUrl} target="_blank" rel="noreferrer" className="block w-full">{content}</a> : content}</div>
      <div className="mt-6 flex items-start justify-between gap-4">
        <h2 className="text-lg font-medium tracking-tight">{title}</h2>
        {viewUrl && <ArrowUpRight className="size-4 shrink-0 text-primary" />}
      </div>
    </article>
  );
}
