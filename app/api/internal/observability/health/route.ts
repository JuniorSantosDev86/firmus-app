import { NextRequest, NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth/guards";
import { toControlledObservabilityFailure } from "@/lib/domain/observability-stability";
import { collectObservabilityHealthReport } from "@/lib/services/observability-stability";
import { recordSecurityAudit } from "@/lib/services/security-audit";

export async function GET(request: NextRequest) {
  const user = requireApiSession(request);
  if (!user) {
    await recordSecurityAudit({
      action: "private_api_access_denied",
      actorType: "anonymous",
      route: "/api/internal/observability/health",
      metadata: { method: "GET" },
    });

    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  try {
    const health = await collectObservabilityHealthReport();
    return NextResponse.json({
      ok: true,
      health,
    });
  } catch (error) {
    const failure = toControlledObservabilityFailure(error);
    return NextResponse.json({ ok: false, failure }, { status: failure.status });
  }
}
