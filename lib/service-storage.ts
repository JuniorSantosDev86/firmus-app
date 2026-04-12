import type { Service } from "@/lib/domain";
import { createTimelineEvent } from "@/lib/services/timeline";

const STORAGE_KEY = "firmus.services";

export type ServiceInput = {
  name: string;
  description: string;
  basePrice: string;
  estimatedDeliveryDays: string;
  isActive: boolean;
};

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asRequiredString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizePriceInput(value: string): string {
  return value.replace(/[^\d.,]/g, "").trim();
}

function parsePriceToCents(value: string): number {
  const cleaned = normalizePriceInput(value);
  if (cleaned.length === 0) {
    return 0;
  }

  let normalized = cleaned;
  const lastDot = normalized.lastIndexOf(".");
  const lastComma = normalized.lastIndexOf(",");

  if (lastDot >= 0 && lastComma >= 0) {
    if (lastComma > lastDot) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    normalized = normalized.replace(/,/g, ".");
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed * 100);
}

function asNullableDeliveryDays(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function generateServiceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `service_${Date.now()}`;
}

function normalizeService(raw: unknown): Service | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const name = asRequiredString(data.name);

  if (name.length === 0) {
    return null;
  }

  const basePriceInCents =
    typeof data.basePriceInCents === "number" &&
    Number.isInteger(data.basePriceInCents) &&
    data.basePriceInCents >= 0
      ? data.basePriceInCents
      : 0;

  return {
    id:
      typeof data.id === "string" && data.id.trim().length > 0
        ? data.id
        : generateServiceId(),
    name,
    description: asNullableString(data.description),
    basePriceInCents,
    estimatedDeliveryDays: asNullableDeliveryDays(data.estimatedDeliveryDays),
    isActive: asBoolean(data.isActive),
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

function normalizeServices(raw: unknown): Service[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeService(item))
    .filter((service): service is Service => service !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function saveServices(services: Service[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

export function readServices(): Service[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeServices(parsed);
  } catch {
    return [];
  }
}

export function upsertService(input: ServiceInput, serviceId?: string): Service[] {
  const now = new Date().toISOString();
  const existing = readServices();
  const isUpdate =
    typeof serviceId === "string" &&
    existing.some((service) => service.id === serviceId);
  const name = input.name.trim();

  if (name.length === 0) {
    return existing;
  }

  const nextService: Service = {
    id: serviceId ?? generateServiceId(),
    name,
    description: asNullableString(input.description),
    basePriceInCents: parsePriceToCents(input.basePrice),
    estimatedDeliveryDays: asNullableDeliveryDays(input.estimatedDeliveryDays),
    isActive: input.isActive,
    createdAt: now,
    updatedAt: now,
  };

  const next = existing.find((service) => service.id === nextService.id)
    ? existing.map((service) => {
        if (service.id !== nextService.id) {
          return service;
        }

        return {
          ...nextService,
          createdAt: service.createdAt,
        };
      })
    : [...existing, nextService];

  const normalized = next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveServices(normalized);
  if (!isUpdate) {
    createTimelineEvent({
      type: "service_created",
      entityType: "service",
      entityId: nextService.id,
    });
  }

  return normalized;
}

export function deleteService(serviceId: string): Service[] {
  const existing = readServices();
  const next = existing.filter((service) => service.id !== serviceId);

  if (next.length === existing.length) {
    return existing;
  }

  saveServices(next);
  return next;
}
