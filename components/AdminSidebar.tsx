"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Folder,
  Home,
  Newspaper,
  Settings,
  Workflow,
  Wrench,
} from "lucide-react";
import Signout from "./auth-helpers/Signout";

interface NavLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavLink[];
}

const navItems: Array<NavLink | NavGroup> = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Projects", href: "/admin/project-manager", icon: Folder },
  { name: "Resume", href: "/admin/resume", icon: FileText },
  { name: "Writing", href: "/admin/blog", icon: Newspaper },
  {
    name: "Tools",
    icon: Wrench,
    children: [{ name: "Mermaid", href: "/admin/tools/mermaid", icon: Workflow }],
  },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const { data } = authClient.useSession();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Tools: pathname.startsWith("/admin/tools"),
  });

  function toggleGroup(name: string) {
    setExpandedGroups((current) => ({ ...current, [name]: !current[name] }));
  }

  return (
    <aside className="border-b border-white/8 bg-[#07110f] text-white lg:min-h-dvh lg:w-64 lg:border-b-0 lg:border-r">
      <nav className="lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:p-5">
        <div className="hidden border-b border-white/10 pb-6 lg:block">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-teal-400">Billy Rice</p>
          <p className="mt-2 text-lg font-medium tracking-tight">Control room</p>
        </div>
        <ul className="flex gap-1 overflow-x-auto p-2.5 lg:mt-5 lg:block lg:space-y-1 lg:p-0">
          {navItems.map((item) => {
            if ("children" in item) {
              const isActive = item.children.some(
                (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
              );
              const isExpanded = expandedGroups[item.name] ?? false;
              const menuId = `admin-nav-${item.name.toLowerCase()}`;

              return (
                <li key={item.name} className="shrink-0">
                  <button
                    type="button"
                    aria-controls={menuId}
                    aria-expanded={isExpanded}
                    onClick={() => toggleGroup(item.name)}
                    className={`flex min-h-11 w-full items-center rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${
                      isActive
                        ? "bg-white/10 text-teal-300"
                        : "text-gray-400 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <item.icon className="mr-2 size-4" />
                    {item.name}
                    <ChevronDown
                      className={`ml-auto size-4 transition-transform motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isExpanded ? (
                    <ul id={menuId} className="mt-1 space-y-1 border-l border-white/10 pl-3 lg:ml-5">
                      {item.children.map((child) => {
                        const childIsActive =
                          pathname === child.href || pathname.startsWith(`${child.href}/`);

                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`flex min-h-10 items-center rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${
                                childIsActive
                                  ? "bg-white/10 text-teal-300"
                                  : "text-gray-400 hover:bg-white/6 hover:text-white"
                              }`}
                            >
                              <child.icon className="mr-2 size-4" />
                              {child.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            }

            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className={`flex min-h-11 items-center rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${
                    isActive
                      ? "bg-white/10 text-teal-300"
                      : "text-gray-400 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-2 size-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
        {data && (
          <div className="mt-auto hidden border-t border-white/10 pt-5 lg:block">
            <p className="font-mono text-[9px] uppercase tracking-[.16em] text-gray-500">Signed in as</p>
            <p className="mt-2 truncate text-sm font-medium text-white">{data.user?.name}</p>
            <div className="mt-4 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-teal-300">
                View site <ArrowUpRight className="size-3.5" />
              </Link>
              <Signout />
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
