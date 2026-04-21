import type { BusinessProfile } from "@/lib/domain";
import type { NFSeTaxRegime } from "@/lib/domain/nfse";

const STORAGE_KEY = "firmus.business-profile";
const CNPJ_MAX_DIGITS = 14;

export const BUSINESS_PROFILE_CNPJ_MAX_LENGTH = 18;
export const BUSINESS_PROFILE_MUNICIPAL_REGISTRATION_MAX_LENGTH = 32;
export const BUSINESS_PROFILE_SERVICE_CITY_MAX_LENGTH = 80;

export type BusinessProfileInput = {
  businessName: string;
  professionalName: string;
  shortDescription: string;
  city: string;
  whatsapp: string;
  logoUrl: string;
  cnpj: string;
  municipalRegistration: string;
  serviceCity: string;
  taxRegime: string;
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

function asNullableLimitedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : null;
}

function formatCNPJFromDigits(digits: string): string {
  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function normalizeCNPJInput(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const digits = value.replace(/\D/g, "").slice(0, CNPJ_MAX_DIGITS);
  if (digits.length === 0) {
    return null;
  }

  return formatCNPJFromDigits(digits).slice(0, BUSINESS_PROFILE_CNPJ_MAX_LENGTH);
}

function asTaxRegime(value: unknown): NFSeTaxRegime | null {
  if (value === "mei" || value === "simples" || value === "outro") {
    return value;
  }

  return null;
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
    cnpj: normalizeCNPJInput(data.cnpj),
    municipalRegistration: asNullableLimitedString(
      data.municipalRegistration,
      BUSINESS_PROFILE_MUNICIPAL_REGISTRATION_MAX_LENGTH
    ),
    serviceCity: asNullableLimitedString(data.serviceCity, BUSINESS_PROFILE_SERVICE_CITY_MAX_LENGTH),
    taxRegime: asTaxRegime(data.taxRegime),
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
    cnpj: normalizeCNPJInput(input.cnpj),
    municipalRegistration: asNullableLimitedString(
      input.municipalRegistration,
      BUSINESS_PROFILE_MUNICIPAL_REGISTRATION_MAX_LENGTH
    ),
    serviceCity: asNullableLimitedString(input.serviceCity, BUSINESS_PROFILE_SERVICE_CITY_MAX_LENGTH),
    taxRegime: asTaxRegime(input.taxRegime),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

  return profile;
}
