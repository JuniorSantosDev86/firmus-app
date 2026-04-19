import type { SecurityAuditRecord } from "@/lib/domain/security-audit";
import {
  buildObservabilityHealthReport,
  isSecureStoreBackupEnvelope,
  type ObservabilityHealthReport,
  type SecureStoreBackupEnvelope,
  summarizeSecureStoreBackup,
  summarizeSecureStoreSnapshot,
  ObservabilityStabilityError,
} from "@/lib/domain/observability-stability";
import { checkSecurityEnv } from "@/lib/security/env";
import {
  readSecureFoundationStore,
  writeSecureFoundationStore,
  type SecureFoundationStore,
} from "@/lib/server/secure-file-store";

export type RestoreSecureStoreResult = {
  dryRun: boolean;
  restored: boolean;
  summary: {
    auditEventCount: number;
    lastReviewedAt: string | null;
  };
};

function toSnapshot(
  store: SecureFoundationStore
): SecureStoreBackupEnvelope["store"] {
  return {
    version: store.version,
    auditEvents: store.auditEvents,
    privacy: store.privacy,
  };
}

function toFoundationStore(
  snapshot: SecureStoreBackupEnvelope["store"]
): SecureFoundationStore {
  return {
    version: 1,
    auditEvents: snapshot.auditEvents as SecurityAuditRecord[],
    privacy: {
      lastReviewedAt: snapshot.privacy.lastReviewedAt,
    },
  };
}

function assertValidBackupEnvelope(value: unknown): SecureStoreBackupEnvelope {
  if (!isSecureStoreBackupEnvelope(value)) {
    throw new ObservabilityStabilityError(
      "OBS_INVALID_BACKUP_PAYLOAD",
      "Payload de backup inválido. Envie um envelope compatível com o schema de backup v1.",
      400,
      true
    );
  }

  return value;
}

export async function collectObservabilityHealthReport(): Promise<ObservabilityHealthReport> {
  const runtime = checkSecurityEnv();
  const store = await readSecureFoundationStore();
  const backup = await createSecureStoreBackup();

  const backupSummary = summarizeSecureStoreBackup(backup);
  const backupIntegrityOk = isSecureStoreBackupEnvelope(backup);

  return buildObservabilityHealthReport([
    {
      id: "auth-and-security-env",
      label: "Configuração de segurança",
      status: runtime.ok ? "healthy" : "degraded",
      message: runtime.ok
        ? "Configuração de autenticação carregada com segurança."
        : "Configuração de segurança incompleta para operação confiável.",
    },
    {
      id: "secure-store-read",
      label: "Leitura da store protegida",
      status: "healthy",
      message: `Store disponível para leitura (eventos: ${store.auditEvents.length}).`,
    },
    {
      id: "backup-envelope-integrity",
      label: "Integridade do envelope de backup",
      status: backupIntegrityOk ? "healthy" : "degraded",
      message: backupIntegrityOk
        ? `Backup validado (eventos: ${backupSummary.auditEventCount}).`
        : "Falha ao validar o envelope de backup atual.",
    },
  ]);
}

export async function createSecureStoreBackup(): Promise<SecureStoreBackupEnvelope> {
  const store = await readSecureFoundationStore();
  return {
    schema: "firmus.secure-store.backup.v1",
    createdAt: new Date().toISOString(),
    store: toSnapshot(store),
  };
}

export async function restoreSecureStoreBackup(
  input: unknown,
  options?: { dryRun?: boolean }
): Promise<RestoreSecureStoreResult> {
  const backup = assertValidBackupEnvelope(input);
  const summary = summarizeSecureStoreBackup(backup);

  if (options?.dryRun) {
    return {
      dryRun: true,
      restored: false,
      summary,
    };
  }

  try {
    await writeSecureFoundationStore(toFoundationStore(backup.store));
  } catch {
    throw new ObservabilityStabilityError(
      "OBS_RESTORE_WRITE_FAILED",
      "Falha ao restaurar backup na store protegida.",
      503,
      true
    );
  }

  const persisted = await readSecureFoundationStore();
  const persistedSummary = summarizeSecureStoreSnapshot(toSnapshot(persisted));

  if (
    persistedSummary.auditEventCount !== summary.auditEventCount ||
    persistedSummary.lastReviewedAt !== summary.lastReviewedAt
  ) {
    throw new ObservabilityStabilityError(
      "OBS_RESTORE_VERIFICATION_FAILED",
      "Restauração executada, mas a verificação pós-restore não confirmou os dados esperados.",
      500,
      false
    );
  }

  return {
    dryRun: false,
    restored: true,
    summary: persistedSummary,
  };
}
