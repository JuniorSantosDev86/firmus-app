import type { AutomationRuleCandidate } from "@/lib/domain/automation-rule";

const STORAGE_KEY = "firmus.automationExecutionLog";

export type AutomationExecutionLogEntry = {
  fingerprint: string;
  ruleId: string;
  matchId: string;
  candidateSourceType: AutomationRuleCandidate["sourceType"];
  executedAt: string;
  reminderId?: string;
};

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asIsoString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
}

function normalizeEntry(raw: unknown): AutomationExecutionLogEntry | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const fingerprint = asOptionalString(data.fingerprint);
  const ruleId = asOptionalString(data.ruleId);
  const matchId = asOptionalString(data.matchId);

  if (!fingerprint || !ruleId || !matchId) {
    return null;
  }

  const sourceType = data.candidateSourceType;
  if (sourceType !== "event" && sourceType !== "derived_condition") {
    return null;
  }

  const now = new Date().toISOString();

  const entry: AutomationExecutionLogEntry = {
    fingerprint,
    ruleId,
    matchId,
    candidateSourceType: sourceType,
    executedAt: asIsoString(data.executedAt, now),
  };

  const reminderId = asOptionalString(data.reminderId);
  if (reminderId) {
    entry.reminderId = reminderId;
  }

  return entry;
}

function normalizeEntries(raw: unknown): AutomationExecutionLogEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeEntry(item))
    .filter((item): item is AutomationExecutionLogEntry => item !== null)
    .sort((a, b) => b.executedAt.localeCompare(a.executedAt));
}

function saveAutomationExecutionLog(entries: AutomationExecutionLogEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getAutomationExecutionLog(): AutomationExecutionLogEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeEntries(parsed);
    saveAutomationExecutionLog(normalized);
    return normalized;
  } catch {
    return [];
  }
}

export function hasAutomationExecutionFingerprint(fingerprint: string): boolean {
  const normalized = fingerprint.trim();
  if (normalized.length === 0) {
    return false;
  }

  return getAutomationExecutionLog().some((entry) => entry.fingerprint === normalized);
}

export function recordAutomationExecution(entry: AutomationExecutionLogEntry): void {
  const existing = getAutomationExecutionLog();
  if (existing.some((item) => item.fingerprint === entry.fingerprint)) {
    return;
  }

  saveAutomationExecutionLog([entry, ...existing]);
}
