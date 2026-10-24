import Signin from "@/components/auth-helpers/Signin";

export function AdminSignIn() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-inset p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-foreground shadow-2xl shadow-black/40 sm:p-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Owner access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Administration</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Sign in with the owner account to continue.
        </p>
        <div className="mt-7"><Signin /></div>
      </div>
    </div>
  );
}
