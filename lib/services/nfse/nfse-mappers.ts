import type { BusinessProfile, Charge, Client, Quote, QuoteItem } from "../../domain";

function toIsoDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

export function buildNFSeDescription(input: {
  charge: Charge;
  quote: Quote | null;
  quoteItems: QuoteItem[];
}): string {
  const { charge, quote, quoteItems } = input;

  if (quote && quoteItems.length > 0) {
    const descriptions = quoteItems
      .map((item) => item.description.trim())
      .filter((description) => description.length > 0)
      .slice(0, 3);

    if (descriptions.length > 0) {
      return descriptions.join(" | ");
    }
  }

  return `Serviços prestados referentes à cobrança ${charge.id.slice(0, 8)}.`;
}

export function mapBusinessSnapshot(profile: BusinessProfile) {
  return {
    businessName: profile.businessName,
    cnpj: profile.cnpj,
    municipalRegistration: profile.municipalRegistration,
    serviceCity: profile.serviceCity,
    taxRegime: profile.taxRegime,
  };
}

export function mapClientSnapshot(client: Client) {
  return {
    name: client.name,
    email: client.email,
    city: client.city,
  };
}

export function mapServiceSnapshot(input: {
  charge: Charge;
  description: string;
  quote: Quote | null;
}) {
  return {
    source: input.quote ? ("quote" as const) : ("charge" as const),
    quoteId: input.quote?.id,
    chargeDueDate: toIsoDate(input.charge.dueDate),
    description: input.description,
  };
}

export function getNFSeIssueStatusLabel(status: "draft" | "ready" | "issued" | "failed"): string {
  if (status === "draft") {
    return "Rascunho";
  }

  if (status === "ready") {
    return "Pronta para emissão";
  }

  if (status === "issued") {
    return "Emitida";
  }

  return "Falha";
}
