import AdminSidebar from '@/components/AdminSidebar';
import Signin from '@/components/auth-helpers/Signin';
import { getAllowedAdminSession } from '@/lib/auth-guards';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAllowedAdminSession();

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#07110f] p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 text-gray-950 shadow-2xl shadow-black/40 sm:p-10">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-teal-700">Owner access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Administration</h1>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            This website doesn&apos;t currently support registering or signing in
            with user accounts. The sign-in button below is for the web
            administrator only.
          </p>
          <div className="mt-7"><Signin /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-dvh bg-[#f3f6f5] text-gray-950 lg:flex">
      <AdminSidebar />
      <main className="admin-surface min-w-0 flex-1 px-4 py-7 sm:px-7 sm:py-9 lg:px-10 xl:px-14">
        {children}
      </main>
    </div>
  );
}
