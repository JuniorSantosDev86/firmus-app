import { NextRequest, NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth/guards";
import { normalizeActivityLogCategoryFilter, normalizeActivityLogLimit, normalizeActivityLogQuery } from "@/lib/domain/activity-log";
import { listActivityLogs } from "@/lib/services/activity-logs";
import { recordSecurityAudit } from "@/lib/services/security-audit";

export async function GET(request: NextRequest) {
  const user = requireApiSession(request);
  if (!user) {
    await recordSecurityAudit({
      action: "private_api_access_denied",
      actorType: "anonymous",
      route: "/api/internal/activity-logs",
      metadata: { method: "GET" },
    });

    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  const category = normalizeActivityLogCategoryFilter(request.nextUrl.searchParams.get("category"));
  const query = normalizeActivityLogQuery(request.nextUrl.searchParams.get("q"));
  const limit = normalizeActivityLogLimit(request.nextUrl.searchParams.get("limit"));

  const result = await listActivityLogs({
    category,
    query,
    limit,
  });

  return NextResponse.json({
    ok: true,
    category,
    query,
    limit: result.limit,
    totalMatched: result.totalMatched,
    hasMore: result.hasMore,
    entries: result.entries,
  });
}
