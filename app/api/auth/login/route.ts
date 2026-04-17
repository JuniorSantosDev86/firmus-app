import { NextRequest, NextResponse } from "next/server";

import { verifyOwnerCredentials } from "@/lib/auth/credentials";
import { createSessionToken, writeSessionCookie } from "@/lib/auth/session";
import { checkSecurityEnv } from "@/lib/security/env";
import { recordSecurityAudit } from "@/lib/services/security-audit";

async function readCredentials(request: NextRequest): Promise<{ username: string; password: string }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as { username?: unknown; password?: unknown };

    return {
      username: typeof payload.username === "string" ? payload.username : "",
      password: typeof payload.password === "string" ? payload.password : "",
    };
  }

  const formData = await request.formData();
  return {
    username: typeof formData.get("username") === "string" ? String(formData.get("username")) : "",
    password: typeof formData.get("password") === "string" ? String(formData.get("password")) : "",
  };
}

export async function POST(request: NextRequest) {
  const security = checkSecurityEnv();
  if (!security.ok) {
    await recordSecurityAudit({
      action: "security_config_error",
      actorType: "system",
      route: "/api/auth/login",
      metadata: {
        reason: "invalid_env",
      },
    });

    return NextResponse.json(
      {
        ok: false,
        error: "A autenticação está temporariamente indisponível.",
      },
      { status: 503 }
    );
  }

  const { username, password } = await readCredentials(request);
  const normalizedUsername = username.trim();

  if (!verifyOwnerCredentials(normalizedUsername, password)) {
    await recordSecurityAudit({
      action: "auth_login_failure",
      actorType: "anonymous",
      route: "/api/auth/login",
      metadata: {
        username: normalizedUsername.length > 0 ? normalizedUsername : "empty",
      },
    });

    return NextResponse.json(
      {
        ok: false,
        error: "Credenciais inválidas.",
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  writeSessionCookie(response.cookies, createSessionToken(normalizedUsername));

  await recordSecurityAudit({
    action: "auth_login_success",
    actorType: "owner",
    actorId: normalizedUsername,
    route: "/api/auth/login",
  });

  return response;
}
