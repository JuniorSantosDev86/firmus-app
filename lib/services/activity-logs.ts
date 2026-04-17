import type { ActivityLogCategoryFilter, ActivityLogEntry, ActivityLogMetadataValue } from "@/lib/domain/activity-log";
import type { SecurityAuditRecord } from "@/lib/domain/security-audit";
import {
  filterActivityLogs,
  normalizeActivityLogLimit,
  normalizeActivityLogQuery,
  resolveActivityLogCategoryFromAction,
  resolveActivityLogStatusFromAction,
  sortActivityLogsReverseChronological,
  toActivityLogMessage,
} from "@/lib/domain/activity-log";
import { listActivityLogSourceRecords } from "@/lib/repositories/activity-log-repository";

export type ListActivityLogsInput = {
  category?: ActivityLogCategoryFilter;
  query?: string;
  limit?: number;
};

export type ListActivityLogsResult = {
  entries: ActivityLogEntry[];
  totalMatched: number;
  limit: number;
  hasMore: boolean;
};

function toMetadata(
  record: SecurityAuditRecord
): Record<string, ActivityLogMetadataValue> | undefined {
  const pairs = Object.entries(record.metadata ?? {}).filter(([, value]) => {
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    );
  });

  if (pairs.length === 0) {
    return undefined;
  }

  return Object.fromEntries(pairs);
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toActorLabel(record: SecurityAuditRecord): string | null {
  if (record.actorType === "owner") {
    return record.actorId ? `Operador (${record.actorId})` : "Operador interno";
  }

  if (record.actorType === "system") {
    return "Sistema";
  }

  if (record.actorType === "anonymous") {
    const username = asNonEmptyString(record.metadata?.username);
    if (record.action === "auth_login_failure" && username && username !== "empty") {
      return `Tentativa (${username})`;
    }

    return "Não autenticado";
  }

  return null;
}

function toContextMessage(record: SecurityAuditRecord): string {
  if (
    (record.action === "private_route_access_denied" ||
      record.action === "private_api_access_denied") &&
    record.route
  ) {
    return `Rota: ${record.route}.`;
  }

  if (record.action === "auth_login_failure") {
    const username = asNonEmptyString(record.metadata?.username);
    if (username && username !== "empty") {
      return `Usuário informado: ${username}.`;
    }
  }

  if (
    record.action === "privacy_foundation_review_recorded" &&
    typeof record.metadata?.reviewedAt === "string"
  ) {
    return `Revisado em ${record.metadata.reviewedAt}.`;
  }

  if (record.route) {
    return `Origem: ${record.route}.`;
  }

  return "";
}

function toEntityRef(record: SecurityAuditRecord): {
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
} {
  const entityType = asNonEmptyString(record.metadata?.entityType);
  const entityId = asNonEmptyString(record.metadata?.entityId);
  const entityLabel = asNonEmptyString(record.metadata?.entityLabel);

  if (!entityType && !entityId && !entityLabel) {
    return {};
  }

  return {
    entityType: entityType ?? undefined,
    entityId: entityId ?? undefined,
    entityLabel: entityLabel ?? undefined,
  };
}

export function normalizeSecurityAuditRecordToActivityLogEntry(
  record: SecurityAuditRecord
): ActivityLogEntry {
  const action = record.action;
  const baseMessage = toActivityLogMessage(action);
  const contextMessage = toContextMessage(record);

  return {
    id: record.id,
    category: resolveActivityLogCategoryFromAction(action),
    action,
    occurredAt: record.occurredAt,
    status: resolveActivityLogStatusFromAction(action),
    message: contextMessage ? `${baseMessage} ${contextMessage}` : baseMessage,
    actorType: record.actorType,
    actorLabel: toActorLabel(record),
    ...toEntityRef(record),
    metadata: toMetadata(record),
  };
}

export async function listActivityLogs(input: ListActivityLogsInput = {}): Promise<ListActivityLogsResult> {
  const normalizedCategory = input.category ?? "todos";
  const normalizedQuery = normalizeActivityLogQuery(input.query);
  const normalizedLimit = normalizeActivityLogLimit(
    typeof input.limit === "number" ? String(input.limit) : undefined,
    40,
    1,
    200
  );

  const source = await listActivityLogSourceRecords();
  const normalized = source.map(normalizeSecurityAuditRecordToActivityLogEntry);
  const sorted = sortActivityLogsReverseChronological(normalized);
  const filtered = filterActivityLogs(sorted, {
    category: normalizedCategory,
    query: normalizedQuery,
  });

  return {
    entries: filtered.slice(0, normalizedLimit),
    totalMatched: filtered.length,
    limit: normalizedLimit,
    hasMore: filtered.length > normalizedLimit,
  };
}
