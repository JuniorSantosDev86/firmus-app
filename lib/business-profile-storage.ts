import type { BusinessProfile } from "@/lib/domain";

const STORAGE_KEY = "firmus.business-profile";

export type BusinessProfileInput = {
  businessName: string;
  professionalName: string;
  shortDescription: string;
  city: string;
  whatsapp: string;
  logoUrl: string;
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

function normalizeProfile(raw: unknown): BusinessProfile | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;

  return {
    id: typeof data.id === "string" && data.id.length > 0 ? data.id : "default",
    businessName: asRequiredString(data.businessName),
    professionalName: asRequiredString(data.professionalName),
    shortDescription: asNullableString(data.shortDescription),
    city: asNullableString(data.city),
    whatsapp: asNullableString(data.whatsapp),
    logoUrl: asNullableString(data.logoUrl),
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

export function readBusinessProfile(): BusinessProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeProfile(parsed);
  } catch {
    return null;
  }
}

export function writeBusinessProfile(
  input: BusinessProfileInput
): BusinessProfile {
  const now = new Date().toISOString();
  const existing = readBusinessProfile();

  const profile: BusinessProfile = {
    id: existing?.id ?? "default",
    businessName: input.businessName.trim(),
    professionalName: input.professionalName.trim(),
    shortDescription: asNullableString(input.shortDescription),
    city: asNullableString(input.city),
    whatsapp: asNullableString(input.whatsapp),
    logoUrl: asNullableString(input.logoUrl),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

  return profile;
}
