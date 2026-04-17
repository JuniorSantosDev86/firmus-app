import { NextRequest, NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth/guards";
import { checkSecurityEnv, evaluateSecurityEnv } from "@/lib/security/env";
import { recordSecurityAudit } from "@/lib/services/security-audit";

export async function GET(request: NextRequest) {
  const user = requireApiSession(request);
  if (!user) {
    await recordSecurityAudit({
      action: "private_api_access_denied",
      actorType: "anonymous",
      route: "/api/internal/security/bootstrap",
      metadata: { method: "GET" },
    });

    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  const runtime = checkSecurityEnv();

  let missingMandatoryFailsSafely = false;
  try {
    evaluateSecurityEnv({ NODE_ENV: "production" });
    missingMandatoryFailsSafely = false;
  } catch {
    missingMandatoryFailsSafely = true;
  }

  return NextResponse.json({
    ok: true,
    runtimeConfigReady: runtime.ok,
    usesDevelopmentDefaults: runtime.ok ? runtime.env.usesDevelopmentDefaults : null,
    missingMandatoryFailsSafely,
  });
}
