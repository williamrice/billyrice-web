import { headers } from "next/headers";
import { auth } from "./auth";
import { isAllowedAuthEmail } from "./auth-allowlist";

export async function getAllowedAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.isAdmin || !isAllowedAuthEmail(session.user.email)) {
    return null;
  }

  return session;
}

export async function requireAllowedAdminSession() {
  const session = await getAllowedAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
