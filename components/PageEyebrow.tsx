"use client";

import { usePathname } from "next/navigation";
import { formatPathSegment } from "@/lib/utils/strings";

export function PageEyebrow() {
  const pathname = usePathname();
  const pageSegment = pathname.split("/").filter(Boolean)[0] ?? "Home";

  return (
    <p className="eyebrow mb-7">
      Billy Rice / {formatPathSegment(pageSegment)}
    </p>
  );
}
