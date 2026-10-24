import { cache } from "react";
import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "./auth";
import { isAllowedAuthEmail } from "./auth-allowlist";

// Cached per request so the admin layout and page share one session lookup.
export const getAllowedAdminSession = cache(async () => {
  // A session check is always request-time work (Better Auth reads the clock and
  // generates IDs), so keep it out of any prerendered shell.
  await connection();
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
