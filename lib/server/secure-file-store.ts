import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { SecurityAuditRecord } from "@/lib/domain/security-audit";
import { getSecurityEnv } from "@/lib/security/env";

export type SecureFoundationStore = {
  version: 1;
  auditEvents: SecurityAuditRecord[];
  privacy: {
    lastReviewedAt: string | null;
  };
};

const EMPTY_STORE: SecureFoundationStore = {
  version: 1,
  auditEvents: [],
  privacy: {
    lastReviewedAt: null,
  },
};

function normalizeStore(raw: unknown): SecureFoundationStore {
  if (typeof raw !== "object" || raw === null) {
    return EMPTY_STORE;
  }

  const source = raw as Record<string, unknown>;

  const lastReviewedAt =
    typeof source.privacy === "object" && source.privacy !== null
      ? (() => {
          const privacy = source.privacy as Record<string, unknown>;
          return typeof privacy.lastReviewedAt === "string" ? privacy.lastReviewedAt : null;
        })()
      : null;

  const auditEvents = Array.isArray(source.auditEvents)
    ? source.auditEvents.filter(
        (item): item is SecurityAuditRecord => typeof item === "object" && item !== null
      )
    : [];

  return {
    version: 1,
    auditEvents,
    privacy: {
      lastReviewedAt,
    },
  };
}

async function ensureStoreFolder(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

export async function readSecureFoundationStore(): Promise<SecureFoundationStore> {
  const filePath = getSecurityEnv().secureStoreFile;

  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return normalizeStore(parsed);
  } catch {
    return EMPTY_STORE;
  }
}

export async function writeSecureFoundationStore(store: SecureFoundationStore): Promise<void> {
  const filePath = getSecurityEnv().secureStoreFile;
  await ensureStoreFolder(filePath);
  await writeFile(filePath, JSON.stringify(store, null, 2), "utf-8");
}

export async function updateSecureFoundationStore(
  updater: (current: SecureFoundationStore) => SecureFoundationStore
): Promise<SecureFoundationStore> {
  const current = await readSecureFoundationStore();
  const next = updater(current);
  await writeSecureFoundationStore(next);
  return next;
}
