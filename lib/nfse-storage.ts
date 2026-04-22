import type { NFSeRecord } from "@/lib/domain";

const STORAGE_KEY = "firmus.nfse-records";

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

function asNonNegativeInteger(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function asIssueStatus(value: unknown): NFSeRecord["issueStatus"] {
  if (value === "ready" || value === "issuing" || value === "issued" || value === "failed") {
    return value;
  }

  return "draft";
}

function normalizeRecord(raw: unknown): NFSeRecord | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const id = asNonEmptyString(data.id);
  const chargeId = asNonEmptyString(data.chargeId);
  const clientId = asNonEmptyString(data.clientId);
  const description = asNonEmptyString(data.description);
  const serviceCity = asNonEmptyString(data.serviceCity);

  if (!id || !chargeId || !clientId || !description || !serviceCity) {
    return null;
  }

  const serviceSnapshot = data.serviceSnapshot as Record<string, unknown> | undefined;
  const clientSnapshot = data.clientSnapshot as Record<string, unknown> | undefined;
  const businessSnapshot = data.businessSnapshot as Record<string, unknown> | undefined;

  if (!serviceSnapshot || !clientSnapshot || !businessSnapshot) {
    return null;
  }

  const serviceDescription = asNonEmptyString(serviceSnapshot.description);
  const clientName = asNonEmptyString(clientSnapshot.name);
  const businessName = asNonEmptyString(businessSnapshot.businessName);
  const chargeDueDate = asNonEmptyString(serviceSnapshot.chargeDueDate);

  if (!serviceDescription || !clientName || !businessName || !chargeDueDate) {
    return null;
  }

  return {
    id,
    chargeId,
    clientId,
    quoteId: asNonEmptyString(data.quoteId) ?? undefined,
    amountInCents: asNonNegativeInteger(data.amountInCents),
    description,
    competenceDate: asIsoDate(data.competenceDate),
    serviceCity,
    issueStatus: asIssueStatus(data.issueStatus),
    serviceSnapshot: {
      source: serviceSnapshot.source === "quote" ? "quote" : "charge",
      quoteId: asNonEmptyString(serviceSnapshot.quoteId) ?? undefined,
      chargeDueDate: asIsoDate(chargeDueDate),
      description: serviceDescription,
    },
    clientSnapshot: {
      name: clientName,
      email: asNonEmptyString(clientSnapshot.email),
      city: asNonEmptyString(clientSnapshot.city),
    },
    businessSnapshot: {
      businessName,
      cnpj: asNonEmptyString(businessSnapshot.cnpj),
      municipalRegistration: asNonEmptyString(businessSnapshot.municipalRegistration),
      serviceCity: asNonEmptyString(businessSnapshot.serviceCity),
      taxRegime:
        businessSnapshot.taxRegime === "mei" ||
        businessSnapshot.taxRegime === "simples" ||
        businessSnapshot.taxRegime === "outro"
          ? businessSnapshot.taxRegime
          : null,
    },
    documentNumber: asNonEmptyString(data.documentNumber) ?? undefined,
    providerReference: asNonEmptyString(data.providerReference) ?? undefined,
    issuedAt: asNonEmptyString(data.issuedAt) ?? undefined,
    lastError: asNonEmptyString(data.lastError) ?? undefined,
    createdAt: asIsoDate(data.createdAt),
    updatedAt: asIsoDate(data.updatedAt),
  };
}

function normalizeRecords(raw: unknown): NFSeRecord[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeRecord(item))
    .filter((item): item is NFSeRecord => item !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function saveNFSeRecords(records: NFSeRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function readNFSeRecords(): NFSeRecord[] {
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
    saveNFSeRecords(normalized);
    return normalized;
  } catch {
    return [];
  }
}

export function upsertNFSeRecord(record: NFSeRecord): NFSeRecord[] {
  const existing = readNFSeRecords();
  const next = existing.some((item) => item.id === record.id)
    ? existing.map((item) => (item.id === record.id ? record : item))
    : [record, ...existing];

  const normalized = next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveNFSeRecords(normalized);
  return normalized;
}
