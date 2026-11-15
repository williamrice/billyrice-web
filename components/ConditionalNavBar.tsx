"use client";

import Navbar from "@/components/NavBar";
import PublicSiteChrome from "@/components/PublicSiteChrome";

export default function ConditionalNavBar({
  projectsEnabled,
}: {
  projectsEnabled: boolean;
}) {
  return (
    <PublicSiteChrome>
      <Navbar projectsEnabled={projectsEnabled} />
    </PublicSiteChrome>
  );
}
