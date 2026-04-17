import type { SecurityAuditRecord } from "@/lib/domain/security-audit";
import { readSecurityAuditRecords } from "@/lib/repositories/security-foundation-repository";

export const MAX_ACTIVITY_LOG_SOURCE_READ = 500;

export async function listActivityLogSourceRecords(
  limit = MAX_ACTIVITY_LOG_SOURCE_READ
): Promise<SecurityAuditRecord[]> {
  const normalizedLimit = Number.isInteger(limit)
    ? Math.min(MAX_ACTIVITY_LOG_SOURCE_READ, Math.max(1, limit))
    : MAX_ACTIVITY_LOG_SOURCE_READ;

  return readSecurityAuditRecords(normalizedLimit);
}
