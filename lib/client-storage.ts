import type { Client } from "@/lib/domain";

const STORAGE_KEY = "firmus.clients";

export type ClientInput = {
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  notes: string;
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

function generateClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `client_${Date.now()}`;
}

function normalizeClient(raw: unknown): Client | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const name = asRequiredString(data.name);

  if (name.length === 0) {
    return null;
  }

  return {
    id:
      typeof data.id === "string" && data.id.trim().length > 0
        ? data.id
        : generateClientId(),
    name,
    whatsapp: asNullableString(data.whatsapp),
    email: asNullableString(data.email),
    city: asNullableString(data.city),
    notes: asNullableString(data.notes),
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

function normalizeClients(raw: unknown): Client[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeClient(item))
    .filter((client): client is Client => client !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function saveClients(clients: Client[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function readClients(): Client[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeClients(parsed);
  } catch {
    return [];
  }
}

export function upsertClient(input: ClientInput, clientId?: string): Client[] {
  const now = new Date().toISOString();
  const existing = readClients();
  const name = input.name.trim();
  if (name.length === 0) {
    return existing;
  }

  const nextClient: Client = {
    id: clientId ?? generateClientId(),
    name,
    whatsapp: asNullableString(input.whatsapp),
    email: asNullableString(input.email),
    city: asNullableString(input.city),
    notes: asNullableString(input.notes),
    createdAt: now,
    updatedAt: now,
  };

  const next = existing.find((client) => client.id === nextClient.id)
    ? existing.map((client) => {
        if (client.id !== nextClient.id) {
          return client;
        }

        return {
          ...nextClient,
          createdAt: client.createdAt,
        };
      })
    : [...existing, nextClient];

  const normalized = next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveClients(normalized);

  return normalized;
}
