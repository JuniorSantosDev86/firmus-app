import { NextRequest, NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth/guards";
import { ObservabilityStabilityError, toControlledObservabilityFailure } from "@/lib/domain/observability-stability";
import { restoreSecureStoreBackup } from "@/lib/services/observability-stability";
import { recordSecurityAudit } from "@/lib/services/security-audit";

function resolveRestorePayload(body: unknown): { backup: unknown; dryRun: boolean } {
  if (typeof body !== "object" || body === null) {
    throw new ObservabilityStabilityError(
      "OBS_INVALID_BACKUP_PAYLOAD",
      "Payload inválido para restauração.",
      400,
      true
    );
  }

  const payload = body as Record<string, unknown>;
  return {
    backup: payload.backup,
    dryRun: payload.dryRun === true,
  };
}

export async function POST(request: NextRequest) {
  const user = requireApiSession(request);
  if (!user) {
    await recordSecurityAudit({
      action: "private_api_access_denied",
      actorType: "anonymous",
      route: "/api/internal/observability/restore",
      metadata: { method: "POST" },
    });

    return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { backup, dryRun } = resolveRestorePayload(body);
    const result = await restoreSecureStoreBackup(backup, { dryRun });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const failure = toControlledObservabilityFailure(error);
    return NextResponse.json({ ok: false, failure }, { status: failure.status });
  }
}
