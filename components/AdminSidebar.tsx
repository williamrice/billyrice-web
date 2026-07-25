"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Folder, Home, Settings } from "lucide-react";
import Signout from "./auth-helpers/Signout";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Projects", href: "/admin/project-manager", icon: Folder },
  { name: "Resume", href: "/admin/resume", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const { data, error, refetch, isPending, isRefetching } =
    authClient.useSession();

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <nav>
        <ul>
          {navItems.map((item: NavItem) => (
            <li key={item.name} className="mb-2">
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                  pathname === item.href ? "bg-gray-700" : ""
                }`}
              >
                <item.icon className="mr-2" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        {data && (
          <div className="mt-8">
            <p className="text-gray-400">Signed in as:</p>
            <p className="text-white font-semibold">{data.user?.name}</p>
            <Signout />
          </div>
        )}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
