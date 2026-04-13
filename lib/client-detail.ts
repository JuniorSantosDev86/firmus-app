import type { Charge, Client, Quote, TimelineEvent } from "@/lib/domain";
import { getCharges } from "@/lib/charge-storage";
import { readClients } from "@/lib/client-storage";
import { readQuoteStore } from "@/lib/quote-storage";
import { getTimelineEvents } from "@/lib/storage/timeline-events";

export type ClientDetailSnapshot = {
  client: Client | null;
  quotes: Quote[];
  charges: Charge[];
  timelineEvents: TimelineEvent[];
};

function getMetadataString(
  event: TimelineEvent,
  key: "clientId" | "chargeId"
): string | null {
  if (!event.metadata) {
    return null;
  }

  const value = event.metadata[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function buildClientDetailSnapshot(
  clientId: string,
  clients: Client[],
  quotes: Quote[],
  charges: Charge[],
  timelineEvents: TimelineEvent[]
): ClientDetailSnapshot {
  const client = clients.find((item) => item.id === clientId) ?? null;
  if (client === null) {
    return {
      client: null,
      quotes: [],
      charges: [],
      timelineEvents: [],
    };
  }

  const relatedQuotes = quotes.filter((quote) => quote.clientId === client.id);
  const relatedCharges = charges.filter((charge) => charge.clientId === client.id);
  const quoteIds = new Set(relatedQuotes.map((quote) => quote.id));
  const chargeIds = new Set(relatedCharges.map((charge) => charge.id));

  const relatedTimelineEvents = timelineEvents
    .filter((event) => {
      if (event.entityType === "client") {
        return event.entityId === client.id;
      }

      if (event.entityType === "quote") {
        return quoteIds.has(event.entityId);
      }

      if (event.entityType === "charge") {
        return chargeIds.has(event.entityId);
      }

      if (event.entityType === "reminder") {
        const relatedClientId = getMetadataString(event, "clientId");
        if (relatedClientId === client.id) {
          return true;
        }

        const relatedChargeId = getMetadataString(event, "chargeId");
        return relatedChargeId !== null && chargeIds.has(relatedChargeId);
      }

      return false;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  return {
    client,
    quotes: relatedQuotes,
    charges: relatedCharges,
    timelineEvents: relatedTimelineEvents,
  };
}

export function getClientDetailSnapshot(clientId: string): ClientDetailSnapshot {
  const clients = readClients();
  const quotes = readQuoteStore().quotes;
  const charges = getCharges();
  const timelineEvents = getTimelineEvents();

  return buildClientDetailSnapshot(clientId, clients, quotes, charges, timelineEvents);
}
