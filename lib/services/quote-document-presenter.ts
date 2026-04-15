import { readBusinessProfile } from "@/lib/business-profile-storage";
import { readClients } from "@/lib/client-storage";
import type { BusinessProfile, Client, Quote, QuoteItem, QuoteStatus } from "@/lib/domain";
import { readQuoteStore } from "@/lib/quote-storage";

export type QuoteDocumentLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPriceInCents: number;
  lineTotalInCents: number;
};

export type QuoteDocumentSnapshot = {
  publicId: string;
  quote: {
    id: string;
    status: QuoteStatus;
    approvedAt: string | null;
    issueDate: string;
    validUntil: string | null;
    subtotalInCents: number;
    discountInCents: number;
    totalInCents: number;
    itemCount: number;
  };
  business: {
    businessName: string;
    professionalName: string;
    shortDescription: string | null;
    city: string | null;
    whatsapp: string | null;
    logoUrl: string | null;
  };
  client: {
    name: string;
    whatsapp: string | null;
    email: string | null;
    city: string | null;
  };
  items: QuoteDocumentLineItem[];
};

function getLineItems(quote: Quote, allItems: QuoteItem[]): QuoteDocumentLineItem[] {
  const lookup = new Map(allItems.map((item) => [item.id, item]));

  return quote.itemIds
    .map((itemId) => lookup.get(itemId))
    .filter((item): item is QuoteItem => item !== undefined)
    .map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPriceInCents: item.unitPriceInCents,
      lineTotalInCents: item.lineTotalInCents,
    }));
}

function toBusinessView(profile: BusinessProfile | null): QuoteDocumentSnapshot["business"] {
  return {
    businessName: profile?.businessName || "Firmus",
    professionalName: profile?.professionalName || "",
    shortDescription: profile?.shortDescription ?? null,
    city: profile?.city ?? null,
    whatsapp: profile?.whatsapp ?? null,
    logoUrl: profile?.logoUrl ?? null,
  };
}

function toClientView(client: Client | null): QuoteDocumentSnapshot["client"] {
  return {
    name: client?.name ?? "Cliente",
    whatsapp: client?.whatsapp ?? null,
    email: client?.email ?? null,
    city: client?.city ?? null,
  };
}

export function getQuoteDocumentSnapshot(publicId: string): QuoteDocumentSnapshot | null {
  const normalizedPublicId = publicId.trim();
  if (normalizedPublicId.length === 0) {
    return null;
  }

  const { quotes, items } = readQuoteStore();
  const quote = quotes.find((item) => item.id === normalizedPublicId) ?? null;
  if (!quote) {
    return null;
  }

  const profile = readBusinessProfile();
  const clients = readClients();
  const client = clients.find((item) => item.id === quote.clientId) ?? null;
  const lineItems = getLineItems(quote, items);

  return {
    publicId: normalizedPublicId,
    quote: {
      id: quote.id,
      status: quote.status,
      approvedAt: quote.approvedAt ?? null,
      issueDate: quote.issueDate,
      validUntil: quote.validUntil,
      subtotalInCents: quote.subtotalInCents,
      discountInCents: quote.discountInCents,
      totalInCents: quote.totalInCents,
      itemCount: lineItems.length,
    },
    business: toBusinessView(profile),
    client: toClientView(client),
    items: lineItems,
  };
}
