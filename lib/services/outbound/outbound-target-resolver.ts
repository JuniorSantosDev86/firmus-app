import type { OutboundRecipient } from "@/lib/domain/outbound";

function asOptionalText(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function sanitizeOutboundText(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

export function normalizeOutboundPhone(phone: string | undefined): string | undefined {
  const raw = asOptionalText(phone);
  if (!raw) {
    return undefined;
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) {
    return undefined;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  if (digits.length > 15) {
    return undefined;
  }

  return digits;
}

export function normalizeOutboundEmail(email: string | undefined): string | undefined {
  const raw = asOptionalText(email);
  if (!raw) {
    return undefined;
  }

  const normalized = raw.toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  return isValid ? normalized : undefined;
}

export function resolveOutboundRecipient(recipient: OutboundRecipient): OutboundRecipient {
  return {
    clientId: asOptionalText(recipient.clientId),
    name: asOptionalText(recipient.name),
    phone: normalizeOutboundPhone(recipient.phone),
    email: normalizeOutboundEmail(recipient.email),
  };
}
