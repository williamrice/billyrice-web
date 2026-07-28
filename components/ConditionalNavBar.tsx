"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar";

export default function ConditionalNavBar({
  projectsEnabled,
}: {
  projectsEnabled: boolean;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return <Navbar projectsEnabled={projectsEnabled} />;
}
