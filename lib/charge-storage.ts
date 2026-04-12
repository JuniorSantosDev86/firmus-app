import type { Charge, ChargeStatus } from "@/lib/domain";
import { createTimelineEvent } from "@/lib/services/timeline";

const STORAGE_KEY = "firmus.charges";

export type ChargeInput = {
  clientId: string;
  quoteId?: string;
  amountInCents: number;
  dueDate: string;
  status: ChargeStatus;
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

function asChargeStatus(value: unknown): ChargeStatus {
  return value === "paid" ? "paid" : "pending";
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

function generateChargeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `charge_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

function normalizeCharge(raw: unknown): Charge | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const clientId = asNonEmptyString(data.clientId);
  if (clientId === null) {
    return null;
  }

  const quoteId = asNonEmptyString(data.quoteId);

  return {
    id: asNonEmptyString(data.id) ?? generateChargeId(),
    clientId,
    quoteId: quoteId === null ? undefined : quoteId,
    amountInCents: asNonNegativeInteger(data.amountInCents),
    dueDate: asIsoDate(data.dueDate),
    status: asChargeStatus(data.status),
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof data.updatedAt === "string"
        ? data.updatedAt
        : new Date().toISOString(),
  };
}

function normalizeCharges(raw: unknown): Charge[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeCharge(item))
    .filter((charge): charge is Charge => charge !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function saveCharges(charges: Charge[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(charges));
}

export function getCharges(): Charge[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeCharges(parsed);
  } catch {
    return [];
  }
}

export function upsertCharge(input: ChargeInput, chargeId?: string): Charge[] {
  const existing = getCharges();
  const now = new Date().toISOString();
  const existingCharge =
    typeof chargeId === "string"
      ? existing.find((charge) => charge.id === chargeId) ?? null
      : null;
  const isUpdate = existingCharge !== null;

  const clientId = input.clientId.trim();
  if (clientId.length === 0) {
    return existing;
  }

  const id = existingCharge?.id ?? chargeId ?? generateChargeId();
  const nextCharge: Charge = {
    id,
    clientId,
    quoteId:
      typeof input.quoteId === "string" && input.quoteId.trim().length > 0
        ? input.quoteId.trim()
        : undefined,
    amountInCents: asNonNegativeInteger(input.amountInCents),
    dueDate: asIsoDate(input.dueDate),
    status: asChargeStatus(input.status),
    createdAt: existingCharge?.createdAt ?? now,
    updatedAt: now,
  };

  const next = isUpdate
    ? existing.map((charge) => (charge.id === id ? nextCharge : charge))
    : [...existing, nextCharge];
  const normalized = next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  saveCharges(normalized);

  if (!isUpdate) {
    createTimelineEvent({
      type: "charge_created",
      entityType: "charge",
      entityId: nextCharge.id,
    });
  }

  if (existingCharge?.status === "pending" && nextCharge.status === "paid") {
    createTimelineEvent({
      type: "charge_paid",
      entityType: "charge",
      entityId: nextCharge.id,
    });
  }

  return normalized;
}
