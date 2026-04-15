import type { Quote, QuoteItem, QuoteStatus } from "@/lib/domain";
import { createTimelineEvent } from "@/lib/services/timeline";

const STORAGE_KEY = "firmus.quotes";

type QuoteStore = {
  quotes: Quote[];
  items: QuoteItem[];
};

export type QuoteItemInput = {
  id?: string;
  serviceId: string | null;
  description: string;
  quantity: number;
  unitPriceInCents: number;
};

export type QuoteInput = {
  clientId: string;
  status: QuoteStatus;
  issueDate: string;
  validUntil: string | null;
  discountInCents: number;
  items: QuoteItemInput[];
};

const QUOTE_STATUSES: ReadonlySet<QuoteStatus> = new Set([
  "draft",
  "sent",
  "approved",
  "rejected",
  "expired",
  "canceled",
]);

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

function sanitizeNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeNonNegativeInteger(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function sanitizePositiveNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const normalized = value.trim().replace(",", ".");
  if (normalized.length === 0) {
    return 0;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
}

function sanitizeIsoDate(value: unknown): string {
  if (typeof value !== "string") {
    return new Date().toISOString().slice(0, 10);
  }

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  return new Date().toISOString().slice(0, 10);
}

function sanitizeOptionalTimestamp(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function sanitizeStatus(value: unknown): QuoteStatus {
  if (typeof value === "string" && QUOTE_STATUSES.has(value as QuoteStatus)) {
    return value as QuoteStatus;
  }

  return "draft";
}

export function parseMoneyInputToCents(value: string): number {
  const cleaned = value.replace(/[^\d.,]/g, "").trim();
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

export function parseQuantityInput(value: string): number {
  return sanitizePositiveNumber(value);
}

export function calculateLineTotalInCents(
  quantity: number,
  unitPriceInCents: number
): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0;
  }

  if (!Number.isInteger(unitPriceInCents) || unitPriceInCents < 0) {
    return 0;
  }

  return Math.max(0, Math.round(quantity * unitPriceInCents));
}

export function calculateQuoteTotals(
  lineTotalsInCents: number[],
  discountInCents: number
): {
  subtotalInCents: number;
  discountInCents: number;
  totalInCents: number;
} {
  const subtotalInCents = lineTotalsInCents.reduce(
    (sum, value) => sum + sanitizeNonNegativeInteger(value),
    0
  );

  const sanitizedDiscount = Math.min(
    sanitizeNonNegativeInteger(discountInCents),
    subtotalInCents
  );

  return {
    subtotalInCents,
    discountInCents: sanitizedDiscount,
    totalInCents: subtotalInCents - sanitizedDiscount,
  };
}

function normalizeQuoteItem(raw: unknown): QuoteItem | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const quoteId = sanitizeNonEmptyString(data.quoteId);
  const description = sanitizeNonEmptyString(data.description);
  const quantity = sanitizePositiveNumber(data.quantity);

  if (quoteId === null || description === null || quantity <= 0) {
    return null;
  }

  const unitPriceInCents = sanitizeNonNegativeInteger(data.unitPriceInCents);
  const lineTotalInCents = calculateLineTotalInCents(quantity, unitPriceInCents);

  return {
    id: sanitizeNonEmptyString(data.id) ?? generateId("quote-item"),
    quoteId,
    serviceId: sanitizeNonEmptyString(data.serviceId),
    description,
    quantity,
    unitPriceInCents,
    lineTotalInCents,
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

function normalizeQuote(raw: unknown, allItems: QuoteItem[]): Quote | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const id = sanitizeNonEmptyString(data.id) ?? generateId("quote");
  const clientId = sanitizeNonEmptyString(data.clientId);
  const status = sanitizeStatus(data.status);

  if (clientId === null) {
    return null;
  }

  const quoteItems = allItems.filter((item) => item.quoteId === id);
  const itemLookup = new Map(quoteItems.map((item) => [item.id, item]));
  const rawItemIds = Array.isArray(data.itemIds)
    ? data.itemIds.filter((value): value is string => typeof value === "string")
    : [];

  const orderedItemIds = rawItemIds.filter((itemId) => itemLookup.has(itemId));
  const missingItemIds = quoteItems
    .map((item) => item.id)
    .filter((itemId) => !orderedItemIds.includes(itemId));
  const itemIds = [...orderedItemIds, ...missingItemIds];

  const lineTotals = itemIds
    .map((itemId) => itemLookup.get(itemId))
    .filter((item): item is QuoteItem => item !== undefined)
    .map((item) => item.lineTotalInCents);

  const totals = calculateQuoteTotals(
    lineTotals,
    sanitizeNonNegativeInteger(data.discountInCents)
  );

  return {
    id,
    clientId,
    status,
    approvedAt: status === "approved" ? sanitizeOptionalTimestamp(data.approvedAt) : null,
    issueDate: sanitizeIsoDate(data.issueDate),
    validUntil:
      data.validUntil === null
        ? null
        : sanitizeNonEmptyString(data.validUntil) ?? null,
    itemIds,
    subtotalInCents: totals.subtotalInCents,
    discountInCents: totals.discountInCents,
    totalInCents: totals.totalInCents,
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

function normalizeQuoteStore(raw: unknown): QuoteStore {
  if (typeof raw !== "object" || raw === null) {
    return { quotes: [], items: [] };
  }

  const data = raw as Record<string, unknown>;
  const normalizedItems = Array.isArray(data.items)
    ? data.items
        .map((item) => normalizeQuoteItem(item))
        .filter((item): item is QuoteItem => item !== null)
    : [];

  const normalizedQuotes = Array.isArray(data.quotes)
    ? data.quotes
        .map((quote) => normalizeQuote(quote, normalizedItems))
        .filter((quote): quote is Quote => quote !== null)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    : [];

  const validQuoteIds = new Set(normalizedQuotes.map((quote) => quote.id));
  const items = normalizedItems.filter((item) => validQuoteIds.has(item.quoteId));

  return {
    quotes: normalizedQuotes,
    items,
  };
}

function saveQuoteStore(store: QuoteStore) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function readQuoteStore(): QuoteStore {
  if (typeof window === "undefined") {
    return { quotes: [], items: [] };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { quotes: [], items: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeQuoteStore(parsed);
    saveQuoteStore(normalized);
    return normalized;
  } catch {
    return { quotes: [], items: [] };
  }
}

export function upsertQuote(input: QuoteInput, quoteId?: string): QuoteStore {
  const existing = readQuoteStore();
  const existingQuote = quoteId
    ? existing.quotes.find((quote) => quote.id === quoteId) ?? null
    : null;
  const isUpdate = existingQuote !== null;
  const quoteIdentifier = existingQuote?.id ?? quoteId ?? generateId("quote");
  const now = new Date().toISOString();
  const nextStatus = sanitizeStatus(input.status);
  const approvedAt =
    nextStatus === "approved"
      ? sanitizeOptionalTimestamp(existingQuote?.approvedAt) ?? now
      : null;

  const preparedItems = input.items
    .map((item) => {
      const description = item.description.trim();
      const quantity = sanitizePositiveNumber(item.quantity);
      const unitPriceInCents = sanitizeNonNegativeInteger(item.unitPriceInCents);

      if (description.length === 0 || quantity <= 0) {
        return null;
      }

      const existingItem =
        typeof item.id === "string"
          ? existing.items.find((storedItem) => storedItem.id === item.id) ?? null
          : null;

      return {
        id: existingItem?.id ?? item.id ?? generateId("quote-item"),
        quoteId: quoteIdentifier,
        serviceId: item.serviceId,
        description,
        quantity,
        unitPriceInCents,
        lineTotalInCents: calculateLineTotalInCents(quantity, unitPriceInCents),
        createdAt: existingItem?.createdAt ?? now,
        updatedAt: now,
      } satisfies QuoteItem;
    })
    .filter((item): item is QuoteItem => item !== null);

  if (preparedItems.length === 0) {
    return existing;
  }

  const totals = calculateQuoteTotals(
    preparedItems.map((item) => item.lineTotalInCents),
    input.discountInCents
  );

  const nextQuote: Quote = {
    id: quoteIdentifier,
    clientId: input.clientId,
    status: nextStatus,
    approvedAt,
    issueDate: sanitizeIsoDate(input.issueDate),
    validUntil:
      input.validUntil === null
        ? null
        : sanitizeNonEmptyString(input.validUntil) ?? null,
    itemIds: preparedItems.map((item) => item.id),
    subtotalInCents: totals.subtotalInCents,
    discountInCents: totals.discountInCents,
    totalInCents: totals.totalInCents,
    createdAt: existingQuote?.createdAt ?? now,
    updatedAt: now,
  };

  const quotes = existingQuote
    ? existing.quotes.map((quote) =>
        quote.id === nextQuote.id ? nextQuote : quote
      )
    : [...existing.quotes, nextQuote];

  const items = [
    ...existing.items.filter((item) => item.quoteId !== quoteIdentifier),
    ...preparedItems,
  ];

  const normalized: QuoteStore = {
    quotes: quotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    items,
  };

  saveQuoteStore(normalized);
  if (!isUpdate) {
    createTimelineEvent({
      type: "quote_created",
      entityType: "quote",
      entityId: nextQuote.id,
    });
  }

  return normalized;
}

export function deleteQuote(quoteId: string): QuoteStore {
  const existing = readQuoteStore();

  const nextQuotes = existing.quotes.filter((quote) => quote.id !== quoteId);
  if (nextQuotes.length === existing.quotes.length) {
    return existing;
  }

  const nextStore: QuoteStore = {
    quotes: nextQuotes,
    items: existing.items.filter((item) => item.quoteId !== quoteId),
  };

  saveQuoteStore(nextStore);
  return nextStore;
}

export function markQuoteAsApproved(quoteId: string, approvedAtIso: string): Quote | null {
  const existing = readQuoteStore();
  const target = existing.quotes.find((quote) => quote.id === quoteId) ?? null;
  if (!target) {
    return null;
  }

  const nextApprovedAt = sanitizeOptionalTimestamp(approvedAtIso) ?? new Date().toISOString();

  const nextQuote: Quote = {
    ...target,
    status: "approved",
    approvedAt: nextApprovedAt,
    updatedAt: new Date().toISOString(),
  };

  const nextStore: QuoteStore = {
    quotes: existing.quotes
      .map((quote) => (quote.id === quoteId ? nextQuote : quote))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    items: existing.items,
  };

  saveQuoteStore(nextStore);
  return nextQuote;
}
