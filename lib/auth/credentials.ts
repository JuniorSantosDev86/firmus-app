import { getSecurityEnv } from "@/lib/security/env";
import { verifyPasswordWithScrypt } from "@/lib/security/crypto";

export function verifyOwnerCredentials(username: string, password: string): boolean {
  const env = getSecurityEnv();
  if (username.trim() !== env.authUsername) {
    return false;
  }

  return verifyPasswordWithScrypt(password, env.authPasswordHash);
}
