import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { getCurrentUser, type CurrentUser } from "@/lib/auth/current-user";
import { readSessionFromRequest } from "@/lib/auth/session";

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export function requireApiSession(request: NextRequest): CurrentUser | null {
  const session = readSessionFromRequest(request);
  if (!session) {
    return null;
  }

  return {
    id: "owner",
    username: session.username,
  };
}
