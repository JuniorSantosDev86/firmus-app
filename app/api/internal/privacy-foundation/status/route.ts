import { NextRequest, NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth/guards";
import { getPrivacyFoundationStatus } from "@/lib/services/privacy-foundation";
import { listRecentSecurityAudit, recordSecurityAudit } from "@/lib/services/security-audit";

export async function GET(request: NextRequest) {
  const user = requireApiSession(request);
  if (!user) {
    await recordSecurityAudit({
      action: "private_api_access_denied",
      actorType: "anonymous",
      route: "/api/internal/privacy-foundation/status",
      metadata: { method: "GET" },
    });

    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  const [privacy, audit] = await Promise.all([
    getPrivacyFoundationStatus(),
    listRecentSecurityAudit(20),
  ]);

  return NextResponse.json({
    ok: true,
    privacy,
    securityAudit: audit.map((record) => ({
      action: record.action,
      actorType: record.actorType,
      occurredAt: record.occurredAt,
      route: record.route,
    })),
  });
}
