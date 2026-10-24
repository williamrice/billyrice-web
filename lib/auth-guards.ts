import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";
import { isAllowedAuthEmail } from "./auth-allowlist";

// Cached per request so the admin layout and page share one session lookup.
export const getAllowedAdminSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.isAdmin || !isAllowedAuthEmail(session.user.email)) {
    return null;
  }

  return session;
});

export async function requireAllowedAdminSession() {
  const session = await getAllowedAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
