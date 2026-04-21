import { readBusinessProfile } from "../../business-profile-storage";
import { getCharges } from "../../charge-storage";
import { readClients } from "../../client-storage";
import type { NFSeRecord } from "../../domain";
import { readNFSeRecords, upsertNFSeRecord } from "../../nfse-storage";
import { readQuoteStore } from "../../quote-storage";
import { createTimelineEvent } from "../timeline";

import {
  buildNFSeDescription,
  mapBusinessSnapshot,
  mapClientSnapshot,
  mapServiceSnapshot,
} from "./nfse-mappers";
import { evaluateBusinessProfileNFSeReadiness } from "./nfse-readiness";
import { validateNFSeDraftContext } from "./nfse-validation";

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

function generateNFSeRecordId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `nfse_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

export type PrepareNFSeDraftResult =
  | {
      ok: true;
      record: NFSeRecord;
      readiness: ReturnType<typeof evaluateBusinessProfileNFSeReadiness>;
    }
  | {
      ok: false;
      errors: ReturnType<typeof validateNFSeDraftContext>["errors"];
    };

export function prepareNFSeDraftFromCharge(chargeId: string): PrepareNFSeDraftResult {
  const charge = getCharges().find((item) => item.id === chargeId) ?? null;
  const businessProfile = readBusinessProfile();
  const client = charge ? readClients().find((item) => item.id === charge.clientId) ?? null : null;

  const validation = validateNFSeDraftContext({
    charge,
    client,
    businessProfile,
  });

  if (!validation.ok || !charge || !businessProfile || !client) {
    return {
      ok: false,
      errors: validation.errors,
    };
  }

  const readiness = evaluateBusinessProfileNFSeReadiness(businessProfile);
  const quoteStore = readQuoteStore();
  const quote = charge.quoteId
    ? quoteStore.quotes.find((item) => item.id === charge.quoteId) ?? null
    : null;
  const quoteItems = quote
    ? quoteStore.items.filter((item) => item.quoteId === quote.id)
    : [];

  const description = buildNFSeDescription({
    charge,
    quote,
    quoteItems,
  });

  const existing = readNFSeRecords().find((item) => item.chargeId === charge.id) ?? null;
  const now = new Date().toISOString();

  const issueStatus =
    existing?.issueStatus === "issued" || existing?.issueStatus === "failed"
      ? existing.issueStatus
      : readiness.isReady
        ? "ready"
        : "draft";

  const record: NFSeRecord = {
    id: existing?.id ?? generateNFSeRecordId(),
    chargeId: charge.id,
    clientId: client.id,
    quoteId: quote?.id,
    amountInCents: charge.amountInCents,
    description,
    competenceDate: toIsoDate(charge.dueDate),
    serviceCity: businessProfile.serviceCity ?? businessProfile.city ?? client.city ?? "Não informado",
    issueStatus,
    serviceSnapshot: mapServiceSnapshot({
      charge,
      description,
      quote,
    }),
    clientSnapshot: mapClientSnapshot(client),
    businessSnapshot: mapBusinessSnapshot(businessProfile),
    documentNumber: existing?.documentNumber,
    providerReference: existing?.providerReference,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  upsertNFSeRecord(record);
  createTimelineEvent({
    type: "nfse_draft_created",
    entityId: charge.id,
    entityType: "charge",
    metadata: {
      nfseId: record.id,
      issueStatus: record.issueStatus,
    },
  });

  return {
    ok: true,
    record,
    readiness,
  };
}
