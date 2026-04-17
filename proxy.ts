import { NextRequest, NextResponse } from "next/server";

import { isPrivateRoute } from "@/lib/auth/route-boundary";
import { readSessionFromRequest } from "@/lib/auth/session";
import { checkSecurityEnv } from "@/lib/security/env";
import { recordSecurityAudit } from "@/lib/services/security-audit";

function buildLoginRedirect(request: NextRequest): NextResponse {
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", target);
  return NextResponse.redirect(loginUrl);
}

function isLoginPath(pathname: string): boolean {
  return pathname === "/login";
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const privateRoute = isPrivateRoute(pathname);

  const security = checkSecurityEnv();
  if (!security.ok) {
    if (privateRoute) {
      await recordSecurityAudit({
        action: "security_config_error",
        actorType: "system",
        route: pathname,
        metadata: { reason: "proxy_env_invalid" },
      });

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "config");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  const session = readSessionFromRequest(request);

  if (privateRoute && !session) {
    await recordSecurityAudit({
      action: pathname.startsWith("/api/")
        ? "private_api_access_denied"
        : "private_route_access_denied",
      actorType: "anonymous",
      route: pathname,
      metadata: {
        method: request.method,
      },
    });

    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
    }

    return buildLoginRedirect(request);
  }

  if (session && isLoginPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
