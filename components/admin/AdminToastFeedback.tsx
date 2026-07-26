"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AdminToastFeedback() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const saved = searchParams.get("saved");
    const success = searchParams.get("success");
    if (saved === "true" || success === "true") {
      toast.success("Changes saved.", { id: "admin-action-feedback" });
    }
    if (success === "false") {
      toast.error("The action could not be completed.", { id: "admin-action-feedback" });
    }
    if (!saved && !success) return;

    const next = new URLSearchParams(searchParams);
    next.delete("saved");
    next.delete("success");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
