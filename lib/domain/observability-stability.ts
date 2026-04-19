export const SECURE_STORE_BACKUP_SCHEMA = "firmus.secure-store.backup.v1";

export type ObservabilitySignalStatus = "healthy" | "degraded";

export type ObservabilitySignal = {
  id: string;
  label: string;
  status: ObservabilitySignalStatus;
  message: string;
};

export type ObservabilityHealthReport = {
  status: ObservabilitySignalStatus;
  generatedAt: string;
  summary: {
    healthy: number;
    degraded: number;
  };
  signals: ObservabilitySignal[];
};

export type SecureStoreSnapshot = {
  version: 1;
  auditEvents: Array<{
    id: string;
    action: string;
    actorType: string;
    actorId: string | null;
    route: string | null;
    metadata: Record<string, string | number | boolean | null>;
    occurredAt: string;
  }>;
  privacy: {
    lastReviewedAt: string | null;
  };
};

export type SecureStoreBackupEnvelope = {
  schema: typeof SECURE_STORE_BACKUP_SCHEMA;
  createdAt: string;
  store: SecureStoreSnapshot;
};

export type SecureStoreBackupSummary = {
  auditEventCount: number;
  lastReviewedAt: string | null;
};

export type ObservabilityFailureCode =
  | "OBS_INVALID_BACKUP_PAYLOAD"
  | "OBS_RESTORE_WRITE_FAILED"
  | "OBS_RESTORE_VERIFICATION_FAILED"
  | "OBS_UNEXPECTED";

export type ControlledObservabilityFailure = {
  code: ObservabilityFailureCode;
  message: string;
  recoverable: boolean;
  status: number;
};

export class ObservabilityStabilityError extends Error {
  constructor(
    public readonly code: ObservabilityFailureCode,
    message: string,
    public readonly status: number,
    public readonly recoverable: boolean
  ) {
    super(message);
    this.name = "ObservabilityStabilityError";
  }
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMetadataValue(value: unknown): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isMetadataRecord(value: unknown): value is Record<string, string | number | boolean | null> {
  if (!isRecordObject(value)) {
    return false;
  }

  return Object.values(value).every(isMetadataValue);
}

function isSecurityAuditLike(value: unknown): value is SecureStoreSnapshot["auditEvents"][number] {
  if (!isRecordObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.action === "string" &&
    typeof value.actorType === "string" &&
    (typeof value.actorId === "string" || value.actorId === null) &&
    (typeof value.route === "string" || value.route === null) &&
    isMetadataRecord(value.metadata) &&
    typeof value.occurredAt === "string"
  );
}

export function isSecureStoreSnapshot(value: unknown): value is SecureStoreSnapshot {
  if (!isRecordObject(value)) {
    return false;
  }

  if (value.version !== 1 || !Array.isArray(value.auditEvents) || !isRecordObject(value.privacy)) {
    return false;
  }

  const lastReviewedAt = value.privacy.lastReviewedAt;
  if (!(lastReviewedAt === null || typeof lastReviewedAt === "string")) {
    return false;
  }

  return value.auditEvents.every(isSecurityAuditLike);
}

export function isSecureStoreBackupEnvelope(value: unknown): value is SecureStoreBackupEnvelope {
  if (!isRecordObject(value)) {
    return false;
  }

  if (value.schema !== SECURE_STORE_BACKUP_SCHEMA || typeof value.createdAt !== "string") {
    return false;
  }

  return isSecureStoreSnapshot(value.store);
}

export function summarizeSecureStoreSnapshot(store: SecureStoreSnapshot): SecureStoreBackupSummary {
  return {
    auditEventCount: store.auditEvents.length,
    lastReviewedAt: store.privacy.lastReviewedAt,
  };
}

export function summarizeSecureStoreBackup(backup: SecureStoreBackupEnvelope): SecureStoreBackupSummary {
  return summarizeSecureStoreSnapshot(backup.store);
}

export function buildObservabilityHealthReport(
  signals: ObservabilitySignal[],
  generatedAt = new Date().toISOString()
): ObservabilityHealthReport {
  const degraded = signals.filter((signal) => signal.status === "degraded").length;
  const healthy = signals.length - degraded;

  return {
    status: degraded > 0 ? "degraded" : "healthy",
    generatedAt,
    summary: {
      healthy,
      degraded,
    },
    signals,
  };
}

export function toControlledObservabilityFailure(error: unknown): ControlledObservabilityFailure {
  if (error instanceof ObservabilityStabilityError) {
    return {
      code: error.code,
      message: error.message,
      recoverable: error.recoverable,
      status: error.status,
    };
  }

  return {
    code: "OBS_UNEXPECTED",
    message: "Falha inesperada ao processar a operação de observabilidade.",
    recoverable: false,
    status: 500,
  };
}
