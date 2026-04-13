import { getChargeStatus } from "@/lib/charge-status";
import { getCharges, upsertCharge } from "@/lib/charge-storage";
import { readClients } from "@/lib/client-storage";
import type { Charge, Client, Quote, Reminder } from "@/lib/domain";
import type {
  AssistedChargeSuggestion,
  AssistedChargeSuggestionType,
  SuggestionReasonCode,
} from "@/lib/domain/assisted-charge-suggestion";
import { readQuoteStore } from "@/lib/quote-storage";
import { getReminders } from "@/lib/reminder-storage";
import {
  markAssistedChargeSuggestionAccepted,
  markAssistedChargeSuggestionDismissed,
  readAssistedChargeSuggestionState,
} from "@/lib/storage/assisted-charge-suggestion-state";
import { getTimelineEvents } from "@/lib/storage/timeline-events";

export const SUGGESTION_REASON_LABELS: Record<SuggestionReasonCode, string> = {
  approved_quote_without_charge: "Orçamento aprovado sem cobrança vinculada.",
  overdue_charge_without_followup: "Cobrança em atraso sem lembrete de follow-up.",
  pending_reminder_for_charge_action: "Lembrete pendente com indicação de ação de cobrança.",
  client_activity_without_recent_charge: "Cliente ativo sem cobrança recente registrada.",
  derived_from_known_pattern: "Padrão operacional conhecido detectado.",
};

export const SUGGESTION_TYPE_LABELS: Record<AssistedChargeSuggestionType, string> = {
  charge_from_approved_quote: "Cobrança a partir de orçamento aprovado",
  followup_for_overdue_charge: "Nova cobrança para follow-up de atraso",
  charge_from_pending_reminder: "Cobrança a partir de lembrete pendente",
  charge_gap_for_active_client: "Cobrança sugerida para cliente ativo",
  unknown: "Sugestão não classificada",
};

type SuggestionBuildInput = {
  type: AssistedChargeSuggestionType;
  clientId: string;
  clientName?: string;
  suggestedAmountInCents?: number;
  suggestedDueDate?: string;
  reasonCodes: SuggestionReasonCode[];
  explanation: string;
  sourceEntityIds: string[];
  createdAt: string;
};

export type AcceptSuggestionResult =
  | { ok: true; chargeId: string }
  | { ok: false; reason: string };

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function toDateInputFromUnknown(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return toDateInputValue(parsed);
}

function addDays(baseDate: Date, days: number): string {
  const next = new Date(baseDate);
  next.setDate(baseDate.getDate() + days);
  return toDateInputValue(next);
}

function buildSuggestionId(
  type: AssistedChargeSuggestionType,
  clientId: string,
  sourceEntityIds: string[]
): string {
  return [type, clientId, ...sourceEntityIds]
    .map((item) => item.replace(/[^a-zA-Z0-9_-]/g, ""))
    .join("__");
}

function buildSuggestion(
  input: SuggestionBuildInput,
  dismissedIds: Set<string>,
  acceptedIds: Set<string>
): AssistedChargeSuggestion {
  const id = buildSuggestionId(input.type, input.clientId, input.sourceEntityIds);

  const status = acceptedIds.has(id)
    ? "accepted"
    : dismissedIds.has(id)
      ? "dismissed"
      : "open";

  return {
    id,
    type: input.type,
    clientId: input.clientId,
    clientName: input.clientName,
    suggestedAmountInCents: input.suggestedAmountInCents,
    suggestedDueDate: input.suggestedDueDate,
    reasonCodes: input.reasonCodes,
    explanation: input.explanation,
    sourceEntityIds: input.sourceEntityIds,
    status,
    createdAt: input.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

function indexClientsById(clients: Client[]): Map<string, Client> {
  return new Map(clients.map((client) => [client.id, client]));
}

function hasChargeForQuote(quotesId: string, charges: Charge[]): boolean {
  return charges.some((charge) => charge.quoteId === quotesId);
}

function hasPendingFollowupReminder(reminders: Reminder[], chargeId: string): boolean {
  return reminders.some(
    (reminder) => reminder.status === "pending" && reminder.chargeId === chargeId
  );
}

function latestAmountFromHistory(clientId: string, charges: Charge[], quotes: Quote[]): number | undefined {
  const latestApprovedQuote = quotes
    .filter((quote) => quote.clientId === clientId && quote.status === "approved")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (latestApprovedQuote) {
    return latestApprovedQuote.totalInCents;
  }

  const latestCharge = charges
    .filter((charge) => charge.clientId === clientId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  return latestCharge?.amountInCents;
}

function hasRecentClientActivity(clientId: string): {
  hasActivity: boolean;
  sourceEntityId?: string;
} {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const events = getTimelineEvents()
    .filter((event) => event.timestamp >= thirtyDaysAgo)
    .sort((a, b) => b.timestamp - a.timestamp);

  const direct = events.find(
    (event) => event.entityType === "client" && event.entityId === clientId
  );
  if (direct) {
    return { hasActivity: true, sourceEntityId: direct.id };
  }

  const withClientMetadata = events.find(
    (event) =>
      typeof event.metadata?.clientId === "string" && event.metadata.clientId === clientId
  );
  if (withClientMetadata) {
    return { hasActivity: true, sourceEntityId: withClientMetadata.id };
  }

  return { hasActivity: false };
}

function hasChargeGap(clientId: string, charges: Charge[]): boolean {
  const latestCharge = charges
    .filter((charge) => charge.clientId === clientId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  if (!latestCharge) {
    return true;
  }

  const updatedAt = new Date(latestCharge.updatedAt).getTime();
  if (Number.isNaN(updatedAt)) {
    return true;
  }

  const fortyFiveDaysAgo = Date.now() - 45 * 24 * 60 * 60 * 1000;
  return updatedAt < fortyFiveDaysAgo;
}

function reminderLooksLikeChargeAction(reminder: Reminder): boolean {
  const content = `${reminder.title} ${reminder.description ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return (
    reminder.sourceType === "quote" ||
    content.includes("cobranca") ||
    content.includes("cobrar") ||
    content.includes("pagamento") ||
    content.includes("orcamento")
  );
}

function deriveSuggestions(): AssistedChargeSuggestion[] {
  const clients = readClients();
  const clientById = indexClientsById(clients);
  const charges = getCharges();
  const reminders = getReminders();
  const { quotes } = readQuoteStore();
  const now = new Date();

  const suggestionState = readAssistedChargeSuggestionState();
  const dismissedIds = new Set(suggestionState.dismissedIds);
  const acceptedIds = new Set(suggestionState.acceptedIds);

  const suggestions: AssistedChargeSuggestion[] = [];

  for (const quote of quotes
    .filter((item) => item.status === "approved")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
    if (hasChargeForQuote(quote.id, charges)) {
      continue;
    }

    suggestions.push(
      buildSuggestion(
        {
          type: "charge_from_approved_quote",
          clientId: quote.clientId,
          clientName: clientById.get(quote.clientId)?.name,
          suggestedAmountInCents: quote.totalInCents,
          suggestedDueDate: toDateInputFromUnknown(quote.validUntil) ?? addDays(now, 7),
          reasonCodes: ["approved_quote_without_charge", "derived_from_known_pattern"],
          explanation:
            "Existe orçamento aprovado sem cobrança vinculada. A sugestão cria uma cobrança com base no valor do orçamento.",
          sourceEntityIds: [quote.id],
          createdAt: quote.updatedAt,
        },
        dismissedIds,
        acceptedIds
      )
    );
  }

  for (const charge of charges) {
    if (getChargeStatus(charge) !== "overdue") {
      continue;
    }

    if (hasPendingFollowupReminder(reminders, charge.id)) {
      continue;
    }

    suggestions.push(
      buildSuggestion(
        {
          type: "followup_for_overdue_charge",
          clientId: charge.clientId,
          clientName: clientById.get(charge.clientId)?.name,
          suggestedAmountInCents: charge.amountInCents,
          suggestedDueDate: addDays(now, 3),
          reasonCodes: ["overdue_charge_without_followup", "derived_from_known_pattern"],
          explanation:
            "Há cobrança em atraso sem lembrete pendente associado. A sugestão prepara uma nova cobrança de follow-up.",
          sourceEntityIds: [charge.id],
          createdAt: charge.updatedAt,
        },
        dismissedIds,
        acceptedIds
      )
    );
  }

  for (const reminder of reminders
    .filter((item) => item.status === "pending" && item.clientId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
    if (!reminderLooksLikeChargeAction(reminder)) {
      continue;
    }

    const clientId = reminder.clientId as string;
    const amount = latestAmountFromHistory(clientId, charges, quotes);
    if (amount === undefined || amount <= 0) {
      continue;
    }

    const latestApprovedQuote = quotes
      .filter((quote) => quote.clientId === clientId && quote.status === "approved")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

    suggestions.push(
      buildSuggestion(
        {
          type: "charge_from_pending_reminder",
          clientId,
          clientName: clientById.get(clientId)?.name,
          suggestedAmountInCents: amount,
          suggestedDueDate: toDateInputFromUnknown(reminder.dueDate) ?? addDays(now, 5),
          reasonCodes: ["pending_reminder_for_charge_action", "derived_from_known_pattern"],
          explanation:
            "Existe lembrete pendente com contexto de cobrança. A sugestão usa histórico conhecido para propor valor e vencimento.",
          sourceEntityIds: latestApprovedQuote
            ? [reminder.id, latestApprovedQuote.id]
            : [reminder.id],
          createdAt: reminder.updatedAt,
        },
        dismissedIds,
        acceptedIds
      )
    );
  }

  const alreadySuggestedGapClients = new Set(
    suggestions
      .filter((item) =>
        item.type === "charge_from_approved_quote" ||
        item.type === "charge_from_pending_reminder"
      )
      .map((item) => item.clientId)
  );

  for (const client of clients) {
    if (alreadySuggestedGapClients.has(client.id)) {
      continue;
    }

    const activity = hasRecentClientActivity(client.id);
    if (!activity.hasActivity || !hasChargeGap(client.id, charges)) {
      continue;
    }

    const amount = latestAmountFromHistory(client.id, charges, quotes);
    if (amount === undefined || amount <= 0) {
      continue;
    }

    suggestions.push(
      buildSuggestion(
        {
          type: "charge_gap_for_active_client",
          clientId: client.id,
          clientName: client.name,
          suggestedAmountInCents: amount,
          suggestedDueDate: addDays(now, 7),
          reasonCodes: ["client_activity_without_recent_charge", "derived_from_known_pattern"],
          explanation:
            "Cliente com atividade recente e sem cobrança recente. A sugestão propõe cobrança com base no último padrão registrado.",
          sourceEntityIds: activity.sourceEntityId ? [client.id, activity.sourceEntityId] : [client.id],
          createdAt: client.updatedAt,
        },
        dismissedIds,
        acceptedIds
      )
    );
  }

  return suggestions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAssistedChargeSuggestions(): AssistedChargeSuggestion[] {
  return deriveSuggestions();
}

export function getOpenAssistedChargeSuggestions(): AssistedChargeSuggestion[] {
  return deriveSuggestions().filter((suggestion) => suggestion.status === "open");
}

export function dismissAssistedChargeSuggestion(suggestionId: string): void {
  markAssistedChargeSuggestionDismissed(suggestionId);
}

function createChargeFromSuggestion(suggestion: AssistedChargeSuggestion): AcceptSuggestionResult {
  if (
    typeof suggestion.suggestedAmountInCents !== "number" ||
    suggestion.suggestedAmountInCents <= 0 ||
    typeof suggestion.suggestedDueDate !== "string" ||
    suggestion.suggestedDueDate.trim().length === 0
  ) {
    return { ok: false, reason: "Sugestão sem dados suficientes para criar cobrança." };
  }

  const quotesById = new Map(readQuoteStore().quotes.map((quote) => [quote.id, quote]));
  const linkedQuote = suggestion.sourceEntityIds.find((entityId) => quotesById.has(entityId));
  const chargeId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `charge_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;

  const next = upsertCharge(
    {
      clientId: suggestion.clientId,
      quoteId: linkedQuote,
      amountInCents: suggestion.suggestedAmountInCents,
      dueDate: suggestion.suggestedDueDate,
      status: "pending",
    },
    chargeId
  );

  const created = next.find((charge) => charge.id === chargeId);
  if (!created) {
    return { ok: false, reason: "Não foi possível criar cobrança a partir da sugestão." };
  }

  return { ok: true, chargeId: created.id };
}

export function acceptAssistedChargeSuggestion(suggestionId: string): AcceptSuggestionResult {
  const suggestion = deriveSuggestions().find(
    (item) => item.id === suggestionId && item.status === "open"
  );

  if (!suggestion) {
    return { ok: false, reason: "Sugestão não encontrada ou já processada." };
  }

  const created = createChargeFromSuggestion(suggestion);
  if (!created.ok) {
    return created;
  }

  markAssistedChargeSuggestionAccepted(suggestionId);
  return created;
}
