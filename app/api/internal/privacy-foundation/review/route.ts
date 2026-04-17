import { NextRequest, NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth/guards";
import { recordPrivacyFoundationReview } from "@/lib/services/privacy-foundation";
import { recordSecurityAudit } from "@/lib/services/security-audit";

export async function POST(request: NextRequest) {
  const user = requireApiSession(request);
  if (!user) {
    await recordSecurityAudit({
      action: "private_api_access_denied",
      actorType: "anonymous",
      route: "/api/internal/privacy-foundation/review",
      metadata: { method: "POST" },
    });

    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  const privacy = await recordPrivacyFoundationReview(user.username);
  return NextResponse.json({ ok: true, privacy });
}
