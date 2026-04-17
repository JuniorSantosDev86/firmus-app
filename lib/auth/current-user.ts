import { cookies } from "next/headers";

import { getSecurityEnv } from "@/lib/security/env";
import { readSessionFromToken, type FirmusSession } from "@/lib/auth/session";

export type CurrentUser = {
  id: "owner";
  username: string;
};

export async function readCurrentSession(): Promise<FirmusSession | null> {
  const env = getSecurityEnv();
  const store = await cookies();
  const token = store.get(env.sessionCookieName)?.value;
  return readSessionFromToken(token);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await readCurrentSession();
  if (!session) {
    return null;
  }

  return {
    id: session.userId,
    username: session.username,
  };
}
