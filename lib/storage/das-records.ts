import type { DASRecord } from "@/lib/domain";

export const DAS_RECORDS_STORAGE_KEY = "firmus.das-records";

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asIsoTimestamp(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
}

function asCompetenceMonth(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const month = Number.parseInt(match[2], 10);
  if (month < 1 || month > 12) {
    return null;
  }

  return `${match[1]}-${match[2]}`;
}

function asStatus(value: unknown): DASRecord["status"] {
  if (value === "paid" || value === "paid_externally") {
    return "paid";
  }

  return "pending";
}

function normalizeRecord(raw: unknown): DASRecord | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const id = asNonEmptyString(data.id);
  const competenceMonth = asCompetenceMonth(data.competenceMonth ?? data.competence);
  const now = new Date().toISOString();

  if (!id || !competenceMonth) {
    return null;
  }

  const status = asStatus(data.status);
  const paidAtRaw = asNonEmptyString(data.paidAt);
  const paidAt = status === "paid" ? asIsoTimestamp(paidAtRaw, now) : undefined;

  return {
    id,
    competenceMonth,
    status,
    paidAt,
    createdAt: asIsoTimestamp(data.createdAt, now),
    updatedAt: asIsoTimestamp(data.updatedAt, now),
  };
}

function sortRecords(records: DASRecord[]): DASRecord[] {
  return records
    .slice()
    .sort((a, b) => {
      const competenceOrder = b.competenceMonth.localeCompare(a.competenceMonth);
      if (competenceOrder !== 0) {
        return competenceOrder;
      }

      const updatedAtOrder = b.updatedAt.localeCompare(a.updatedAt);
      if (updatedAtOrder !== 0) {
        return updatedAtOrder;
      }

      return a.id.localeCompare(b.id);
    });
}

function normalizeRecords(raw: unknown): DASRecord[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return sortRecords(
    raw.map((item) => normalizeRecord(item)).filter((item): item is DASRecord => item !== null)
  );
}

export function saveDASRecords(records: DASRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DAS_RECORDS_STORAGE_KEY, JSON.stringify(sortRecords(records)));
}

export function readDASRecords(): DASRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(DAS_RECORDS_STORAGE_KEY);
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

export function createDASRecordIfAbsent(competenceMonth: string): { created: boolean; record: DASRecord } {
  const normalizedCompetence = asCompetenceMonth(competenceMonth);
  if (!normalizedCompetence) {
    throw new Error("competenceMonth must match YYYY-MM");
  }

  const existing = readDASRecords();
  const found = existing.find((record) => record.competenceMonth === normalizedCompetence);
  if (found) {
    return { created: false, record: found };
  }

  const now = new Date().toISOString();
  const record: DASRecord = {
    id: `das-${normalizedCompetence}`,
    competenceMonth: normalizedCompetence,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const next = sortRecords([record, ...existing]);
  saveDASRecords(next);

  return { created: true, record };
}

export function markDASRecordAsPaid(recordId: string, paidAt: string = new Date().toISOString()): DASRecord | null {
  const existing = readDASRecords();
  const current = existing.find((record) => record.id === recordId);
  if (!current) {
    return null;
  }

  if (current.status === "paid") {
    return current;
  }

  const updated: DASRecord = {
    ...current,
    status: "paid",
    paidAt: asIsoTimestamp(paidAt, new Date().toISOString()),
    updatedAt: new Date().toISOString(),
  };

  const next = existing.map((record) => (record.id === recordId ? updated : record));
  saveDASRecords(next);
  return updated;
}
