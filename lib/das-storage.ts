import type { DASRecord } from "@/lib/domain";

const STORAGE_KEY = "firmus.das-records";

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asIsoDate(value: unknown): string {
  if (typeof value !== "string") {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function asNonNegativeInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function asStatus(value: unknown): DASRecord["status"] {
  if (
    value === "pending" ||
    value === "guided" ||
    value === "handed_off" ||
    value === "paid_externally"
  ) {
    return value;
  }

  return "pending";
}

function normalizeRecord(raw: unknown): DASRecord | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const id = asNonEmptyString(data.id);
  const competence = asNonEmptyString(data.competence);

  if (!id || !competence) {
    return null;
  }

  const normalized: DASRecord = {
    id,
    competence,
    dueDate: asIsoDate(data.dueDate),
    status: asStatus(data.status),
    createdAt: asIsoDate(data.createdAt),
    updatedAt: asIsoDate(data.updatedAt),
  };

  const amountInCents = asNonNegativeInteger(data.amountInCents);
  if (typeof amountInCents === "number") {
    normalized.amountInCents = amountInCents;
  }

  const officialUrl = asNonEmptyString(data.officialUrl);
  if (officialUrl) {
    normalized.officialUrl = officialUrl;
  }

  return normalized;
}

function normalizeRecords(raw: unknown): DASRecord[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeRecord(item))
    .filter((item): item is DASRecord => item !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function saveDASRecords(records: DASRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function readDASRecords(): DASRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeRecords(parsed);
    saveDASRecords(normalized);
    return normalized;
  } catch {
    return [];
  }
}

export function upsertDASRecord(record: DASRecord): DASRecord[] {
  const existing = readDASRecords();
  const next = existing.some((item) => item.id === record.id)
    ? existing.map((item) => (item.id === record.id ? record : item))
    : [record, ...existing];

  const normalized = next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveDASRecords(normalized);
  return normalized;
}
