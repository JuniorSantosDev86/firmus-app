import { NextRequest, NextResponse } from "next/server";

import { clearSessionCookie, readSessionFromRequest } from "@/lib/auth/session";
import { recordSecurityAudit } from "@/lib/services/security-audit";

export async function POST(request: NextRequest) {
  const session = readSessionFromRequest(request);

  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  clearSessionCookie(response.cookies);

  await recordSecurityAudit({
    action: "auth_logout",
    actorType: session ? "owner" : "anonymous",
    actorId: session?.username ?? null,
    route: "/api/auth/logout",
  });

  return response;
}
