import AdminSidebar from '@/components/AdminSidebar';
import { getAllowedAdminSession } from '@/lib/auth-guards';
import { AdminToastFeedback } from '@/components/admin/AdminToastFeedback';

// The owner session decides whether this layout shows the admin shell, so there
// is no static shell to show first. Pages below still stream via loading.tsx.
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAllowedAdminSession();

  // Pages render the sign-in card themselves; signed out, skip the admin chrome.
  if (!session) return children;

  return (
    <div className="admin-shell min-h-dvh bg-background text-foreground lg:flex">
      <AdminSidebar />
      <main className="admin-surface min-w-0 flex-1 px-4 py-7 sm:px-7 sm:py-9 lg:px-10 xl:px-14">
        <AdminToastFeedback />
        {children}
      </main>
    </div>
  );
}
