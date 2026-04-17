import { randomUUID } from "node:crypto";

import type { SecurityAuditAction, SecurityAuditActorType, SecurityAuditRecord } from "@/lib/domain/security-audit";
import {
  appendSecurityAuditRecord,
  readSecurityAuditRecords,
} from "@/lib/repositories/security-foundation-repository";

type SecurityAuditInput = {
  action: SecurityAuditAction;
  actorType: SecurityAuditActorType;
  actorId?: string | null;
  route?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function recordSecurityAudit(input: SecurityAuditInput): Promise<SecurityAuditRecord> {
  const record: SecurityAuditRecord = {
    id: randomUUID(),
    action: input.action,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    route: input.route ?? null,
    metadata: input.metadata ?? {},
    occurredAt: new Date().toISOString(),
  };

  await appendSecurityAuditRecord(record);
  return record;
}

export async function listRecentSecurityAudit(limit = 20): Promise<SecurityAuditRecord[]> {
  return readSecurityAuditRecords(limit);
}
