import { readBusinessProfile } from "@/lib/business-profile-storage";

type PublicBioCta = {
  label: string;
  href: string;
};

export type PublicBioSnapshot = {
  businessName: string;
  professionalName: string | null;
  shortDescription: string | null;
  city: string | null;
  whatsapp: string | null;
  whatsappHref: string | null;
  logoUrl: string | null;
  primaryCta: PublicBioCta | null;
};

function asNullableText(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toWhatsAppHref(whatsapp: string | null): string | null {
  if (!whatsapp) {
    return null;
  }

  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 10) {
    return null;
  }

  return `https://wa.me/${digits}`;
}

function toSafeLogoUrl(logoUrl: string | null): string | null {
  if (!logoUrl) {
    return null;
  }

  try {
    const parsed = new URL(logoUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function getPublicBioSnapshot(): PublicBioSnapshot | null {
  const profile = readBusinessProfile();
  if (!profile) {
    return null;
  }

  const businessName = asNullableText(profile.businessName);
  if (!businessName) {
    return null;
  }

  const whatsapp = asNullableText(profile.whatsapp);
  const whatsappHref = toWhatsAppHref(whatsapp);

  return {
    businessName,
    professionalName: asNullableText(profile.professionalName),
    shortDescription: asNullableText(profile.shortDescription),
    city: asNullableText(profile.city),
    whatsapp,
    whatsappHref,
    logoUrl: toSafeLogoUrl(asNullableText(profile.logoUrl)),
    primaryCta: whatsappHref
      ? {
          label: "Conversar no WhatsApp",
          href: whatsappHref,
        }
      : null,
  };
}
