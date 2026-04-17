import type { SecurityAuditRecord } from "@/lib/domain/security-audit";
import {
  readSecureFoundationStore,
  updateSecureFoundationStore,
  type SecureFoundationStore,
} from "@/lib/server/secure-file-store";

const MAX_AUDIT_EVENTS = 500;

export async function appendSecurityAuditRecord(record: SecurityAuditRecord): Promise<void> {
  await updateSecureFoundationStore((current) => {
    const nextAuditEvents = [record, ...current.auditEvents].slice(0, MAX_AUDIT_EVENTS);

    return {
      ...current,
      auditEvents: nextAuditEvents,
    };
  });
}

export async function readSecurityAuditRecords(limit = 30): Promise<SecurityAuditRecord[]> {
  const store = await readSecureFoundationStore();
  return store.auditEvents.slice(0, Math.max(0, limit));
}

export async function readPrivacyFoundationMeta(): Promise<SecureFoundationStore["privacy"]> {
  const store = await readSecureFoundationStore();
  return store.privacy;
}

export async function writePrivacyFoundationLastReviewedAt(timestamp: string): Promise<void> {
  await updateSecureFoundationStore((current) => ({
    ...current,
    privacy: {
      ...current.privacy,
      lastReviewedAt: timestamp,
    },
  }));
}
