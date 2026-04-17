import { getCharges } from "@/lib/charge-storage";
import { readClients } from "@/lib/client-storage";
import type { Charge, Client, Quote, Reminder, TimelineEvent } from "@/lib/domain";
import type {
  ReactivationOpportunityKind,
  ReactivationRadarCandidate,
  ReactivationReasonCode,
} from "@/lib/domain/reactivation-radar";
import { readQuoteStore } from "@/lib/quote-storage";
import { getReminders } from "@/lib/reminder-storage";
import { createReminder } from "@/lib/services/reminders";
import { getTimelineEvents } from "@/lib/storage/timeline-events";

const MIN_CLIENT_AGE_DAYS = 30;
const MIN_STALLED_FOLLOW_UP_DAYS = 21;
const MIN_WIN_BACK_DAYS = 75;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const REACTIVATION_REASON_LABELS: Record<ReactivationReasonCode, string> = {
  inactive_after_paid_work: "Cliente sem atividade após trabalho pago.",
  inactive_after_approved_quote: "Cliente sem avanço após orçamento aprovado.",
  quote_stalled_without_progress: "Orçamento antigo sem progresso recente.",
  no_recent_activity_after_commercial_signal: "Sem atividade recente após sinal comercial relevante.",
};

export const REACTIVATION_KIND_LABELS: Record<ReactivationOpportunityKind, string> = {
  win_back: "Win-back",
  stalled_follow_up: "Follow-up",
};

export type CreateReactivationReminderResult =
  | { ok: true; reminderId: string }
  | { ok: false; reason: string };

type ClientContext = {
  client: Client;
  quotes: Quote[];
  charges: Charge[];
  reminders: Reminder[];
  latestTimelineActivityAt?: string;
};

function toTimestamp(value: string | number | undefined | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function toIsoFromTimestamp(value: number): string {
  return new Date(value).toISOString();
}

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function daysSince(activityAt: string, referenceDate: Date): number | null {
  const activityMs = toTimestamp(activityAt);
  if (activityMs === null) {
    return null;
  }

  const diff = referenceDate.getTime() - activityMs;
  if (!Number.isFinite(diff) || diff < 0) {
    return 0;
  }

  return Math.floor(diff / DAY_IN_MS);
}

function sortByUpdatedAtDesc<T extends { updatedAt: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function isPendingCollectionCharge(charge: Charge): boolean {
  return charge.status === "pending";
}

function hasCollectionFollowupContext(context: ClientContext): boolean {
  if (context.charges.some(isPendingCollectionCharge)) {
    return true;
  }

  return context.reminders.some(
    (reminder) =>
      reminder.status === "pending" &&
      (reminder.chargeId !== undefined ||
        reminder.sourceType === "charge" ||
        reminder.sourceType === "automation_rule")
  );
}

function hasActiveClientFollowupReminder(reminders: Reminder[]): boolean {
  return reminders.some(
    (reminder) =>
      reminder.status === "pending" && reminder.clientId !== undefined && reminder.chargeId === undefined
  );
}

function hasChargeLinkedToQuote(charges: Charge[], quoteId: string): boolean {
  return charges.some((charge) => charge.quoteId === quoteId);
}

function normalizeForComparison(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildCandidateId(input: {
  clientId: string;
  opportunityKind: ReactivationOpportunityKind;
  reasonCode: ReactivationReasonCode;
  referenceQuoteId?: string;
  referenceChargeId?: string;
}): string {
  return [
    "reactivation",
    input.clientId,
    input.opportunityKind,
    input.reasonCode,
    input.referenceQuoteId ?? "without_quote",
    input.referenceChargeId ?? "without_charge",
  ]
    .map((part) => part.replace(/[^a-zA-Z0-9_-]/g, ""))
    .join("__");
}

function buildReminderTitle(clientName: string): string {
  return `Reativar cliente: ${clientName}`;
}

function getMostRecentActivityAt(context: ClientContext): string | null {
  const paidChargeActivity = context.charges
    .filter((charge) => charge.status === "paid")
    .map((charge) => charge.updatedAt);
  const quoteActivity = context.quotes.map((quote) => quote.updatedAt);
  const doneReminderActivity = context.reminders
    .filter((reminder) => reminder.status === "done")
    .map((reminder) => reminder.updatedAt);
  const timelineActivity = context.latestTimelineActivityAt ? [context.latestTimelineActivityAt] : [];

  const newest = [...paidChargeActivity, ...quoteActivity, ...doneReminderActivity, ...timelineActivity]
    .map((value) => ({ value, timestamp: toTimestamp(value) }))
    .filter((item): item is { value: string; timestamp: number } => item.timestamp !== null)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  return newest?.value ?? null;
}

function hasMeaningfulCommercialHistory(context: ClientContext): boolean {
  const hasPaidCharge = context.charges.some((charge) => charge.status === "paid");
  if (hasPaidCharge) {
    return true;
  }

  return context.quotes.some(
    (quote) =>
      (quote.status === "approved" || quote.status === "sent" || quote.status === "draft") &&
      quote.totalInCents > 0
  );
}

function buildWinBackCandidate(
  context: ClientContext,
  referenceDate: Date
): ReactivationRadarCandidate | null {
  const latestPaidCharge = sortByUpdatedAtDesc(
    context.charges.filter((charge) => charge.status === "paid")
  )[0];

  if (latestPaidCharge) {
    const daysInactive = daysSince(latestPaidCharge.updatedAt, referenceDate);
    if (daysInactive !== null && daysInactive >= MIN_WIN_BACK_DAYS) {
      const reasonCode: ReactivationReasonCode = "inactive_after_paid_work";
      return {
        id: buildCandidateId({
          clientId: context.client.id,
          opportunityKind: "win_back",
          reasonCode,
          referenceChargeId: latestPaidCharge.id,
        }),
        clientId: context.client.id,
        clientName: context.client.name,
        opportunityKind: "win_back",
        reasonCode,
        reasonLabel: REACTIVATION_REASON_LABELS[reasonCode],
        lastActivityAt: latestPaidCharge.updatedAt,
        daysInactive,
        referenceChargeId: latestPaidCharge.id,
        referenceAmountInCents: latestPaidCharge.amountInCents,
        suggestedActionLabel: "Criar lembrete de reativação",
      };
    }
  }

  const latestApprovedQuote = sortByUpdatedAtDesc(
    context.quotes.filter((quote) => quote.status === "approved" && quote.totalInCents > 0)
  )[0];
  if (!latestApprovedQuote) {
    return null;
  }

  const approvedSignalAt = latestApprovedQuote.approvedAt ?? latestApprovedQuote.updatedAt;
  const daysInactive = daysSince(approvedSignalAt, referenceDate);
  if (daysInactive === null || daysInactive < MIN_WIN_BACK_DAYS) {
    return null;
  }

  const reasonCode: ReactivationReasonCode = "inactive_after_approved_quote";
  return {
    id: buildCandidateId({
      clientId: context.client.id,
      opportunityKind: "win_back",
      reasonCode,
      referenceQuoteId: latestApprovedQuote.id,
    }),
    clientId: context.client.id,
    clientName: context.client.name,
    opportunityKind: "win_back",
    reasonCode,
    reasonLabel: REACTIVATION_REASON_LABELS[reasonCode],
    lastActivityAt: approvedSignalAt,
    daysInactive,
    referenceQuoteId: latestApprovedQuote.id,
    referenceAmountInCents: latestApprovedQuote.totalInCents,
    suggestedActionLabel: "Criar lembrete de reativação",
  };
}

function buildStalledFollowUpCandidate(
  context: ClientContext,
  referenceDate: Date
): ReactivationRadarCandidate | null {
  const staleOpenQuote = sortByUpdatedAtDesc(
    context.quotes.filter(
      (quote) =>
        (quote.status === "sent" || quote.status === "draft") &&
        quote.totalInCents > 0 &&
        !hasChargeLinkedToQuote(context.charges, quote.id)
    )
  )[0];

  if (staleOpenQuote) {
    const daysInactive = daysSince(staleOpenQuote.updatedAt, referenceDate);
    if (daysInactive !== null && daysInactive >= MIN_STALLED_FOLLOW_UP_DAYS) {
      const reasonCode: ReactivationReasonCode = "quote_stalled_without_progress";
      return {
        id: buildCandidateId({
          clientId: context.client.id,
          opportunityKind: "stalled_follow_up",
          reasonCode,
          referenceQuoteId: staleOpenQuote.id,
        }),
        clientId: context.client.id,
        clientName: context.client.name,
        opportunityKind: "stalled_follow_up",
        reasonCode,
        reasonLabel: REACTIVATION_REASON_LABELS[reasonCode],
        lastActivityAt: staleOpenQuote.updatedAt,
        daysInactive,
        referenceQuoteId: staleOpenQuote.id,
        referenceAmountInCents: staleOpenQuote.totalInCents,
        suggestedActionLabel: "Criar lembrete de reativação",
      };
    }
  }

  const approvedQuoteWithoutCharge = sortByUpdatedAtDesc(
    context.quotes.filter(
      (quote) =>
        quote.status === "approved" &&
        quote.totalInCents > 0 &&
        !hasChargeLinkedToQuote(context.charges, quote.id)
    )
  )[0];
  if (!approvedQuoteWithoutCharge) {
    return null;
  }

  const referenceAt = approvedQuoteWithoutCharge.approvedAt ?? approvedQuoteWithoutCharge.updatedAt;
  const daysInactive = daysSince(referenceAt, referenceDate);
  if (
    daysInactive === null ||
    daysInactive < MIN_STALLED_FOLLOW_UP_DAYS ||
    daysInactive >= MIN_WIN_BACK_DAYS
  ) {
    return null;
  }

  const reasonCode: ReactivationReasonCode = "no_recent_activity_after_commercial_signal";
  return {
    id: buildCandidateId({
      clientId: context.client.id,
      opportunityKind: "stalled_follow_up",
      reasonCode,
      referenceQuoteId: approvedQuoteWithoutCharge.id,
    }),
    clientId: context.client.id,
    clientName: context.client.name,
    opportunityKind: "stalled_follow_up",
    reasonCode,
    reasonLabel: REACTIVATION_REASON_LABELS[reasonCode],
    lastActivityAt: referenceAt,
    daysInactive,
    referenceQuoteId: approvedQuoteWithoutCharge.id,
    referenceAmountInCents: approvedQuoteWithoutCharge.totalInCents,
    suggestedActionLabel: "Criar lembrete de reativação",
  };
}

function getOpportunityPriority(kind: ReactivationOpportunityKind): number {
  return kind === "win_back" ? 2 : 1;
}

function listClientContexts(): ClientContext[] {
  const clients = readClients();
  const charges = getCharges();
  const reminders = getReminders();
  const quotes = readQuoteStore().quotes;
  const timelineEvents = getTimelineEvents();

  const quotesById = new Map(quotes.map((quote) => [quote.id, quote]));
  const chargesById = new Map(charges.map((charge) => [charge.id, charge]));
  const latestTimelineByClient = buildLatestTimelineByClient(timelineEvents, quotesById, chargesById);

  return clients.map((client) => ({
    client,
    quotes: quotes.filter((quote) => quote.clientId === client.id),
    charges: charges.filter((charge) => charge.clientId === client.id),
    reminders: reminders.filter((reminder) => reminder.clientId === client.id),
    latestTimelineActivityAt: latestTimelineByClient.get(client.id),
  }));
}

function buildLatestTimelineByClient(
  timelineEvents: TimelineEvent[],
  quotesById: Map<string, Quote>,
  chargesById: Map<string, Charge>
): Map<string, string> {
  const latestByClient = new Map<string, number>();

  function apply(clientId: string | undefined, timestamp: number): void {
    if (!clientId) {
      return;
    }

    const previous = latestByClient.get(clientId) ?? 0;
    if (timestamp > previous) {
      latestByClient.set(clientId, timestamp);
    }
  }

  for (const event of timelineEvents) {
    const timestamp = toTimestamp(event.timestamp);
    if (timestamp === null) {
      continue;
    }

    if (event.entityType === "client") {
      apply(event.entityId, timestamp);
      continue;
    }

    if (event.entityType === "quote") {
      apply(quotesById.get(event.entityId)?.clientId, timestamp);
      continue;
    }

    if (event.entityType === "charge") {
      apply(chargesById.get(event.entityId)?.clientId, timestamp);
      continue;
    }

    const metadataClientId =
      typeof event.metadata?.clientId === "string" ? event.metadata.clientId : undefined;
    if (metadataClientId) {
      apply(metadataClientId, timestamp);
      continue;
    }

    const metadataChargeId =
      typeof event.metadata?.chargeId === "string" ? event.metadata.chargeId : undefined;
    if (metadataChargeId) {
      apply(chargesById.get(metadataChargeId)?.clientId, timestamp);
    }
  }

  return new Map(
    [...latestByClient.entries()].map(([clientId, timestamp]) => [clientId, toIsoFromTimestamp(timestamp)])
  );
}

function hasEquivalentPendingReminder(candidate: ReactivationRadarCandidate, reminders: Reminder[]): boolean {
  const expectedFingerprint = `reactivation-radar:${candidate.id}`;
  const expectedTitle = normalizeForComparison(buildReminderTitle(candidate.clientName));

  return reminders.some((reminder) => {
    if (reminder.status !== "pending" || reminder.clientId !== candidate.clientId) {
      return false;
    }

    if (reminder.sourceFingerprint === expectedFingerprint) {
      return true;
    }

    if (
      candidate.referenceQuoteId &&
      reminder.quoteId === candidate.referenceQuoteId &&
      reminder.chargeId === undefined
    ) {
      return true;
    }

    return normalizeForComparison(reminder.title) === expectedTitle && reminder.chargeId === undefined;
  });
}

export function getReactivationRadarCandidates(
  referenceDate: Date = new Date()
): ReactivationRadarCandidate[] {
  const contexts = listClientContexts();
  const candidates: ReactivationRadarCandidate[] = [];

  for (const context of contexts) {
    const clientAgeInDays = daysSince(context.client.createdAt, referenceDate);
    if (clientAgeInDays === null || clientAgeInDays < MIN_CLIENT_AGE_DAYS) {
      continue;
    }

    if (!hasMeaningfulCommercialHistory(context)) {
      continue;
    }

    if (hasCollectionFollowupContext(context)) {
      continue;
    }

    if (hasActiveClientFollowupReminder(context.reminders)) {
      continue;
    }

    const mostRecentActivityAt = getMostRecentActivityAt(context);
    if (!mostRecentActivityAt) {
      continue;
    }

    const daysSinceRecentActivity = daysSince(mostRecentActivityAt, referenceDate);
    if (daysSinceRecentActivity === null || daysSinceRecentActivity < MIN_STALLED_FOLLOW_UP_DAYS) {
      continue;
    }

    const winBack = buildWinBackCandidate(context, referenceDate);
    if (winBack) {
      candidates.push(winBack);
      continue;
    }

    const stalled = buildStalledFollowUpCandidate(context, referenceDate);
    if (stalled) {
      candidates.push(stalled);
    }
  }

  return candidates.sort((a, b) => {
    const byKind = getOpportunityPriority(b.opportunityKind) - getOpportunityPriority(a.opportunityKind);
    if (byKind !== 0) {
      return byKind;
    }

    const byDays = b.daysInactive - a.daysInactive;
    if (byDays !== 0) {
      return byDays;
    }

    const byLastActivity = b.lastActivityAt.localeCompare(a.lastActivityAt);
    if (byLastActivity !== 0) {
      return byLastActivity;
    }

    return a.clientName.localeCompare(b.clientName);
  });
}

export function createReactivationReminderFromCandidate(
  candidateId: string,
  referenceDate: Date = new Date()
): CreateReactivationReminderResult {
  const candidate = getReactivationRadarCandidates(referenceDate).find((item) => item.id === candidateId) ?? null;
  if (!candidate) {
    return { ok: false, reason: "Oportunidade não disponível no radar atual." };
  }

  const reminders = getReminders();
  if (hasEquivalentPendingReminder(candidate, reminders)) {
    return { ok: false, reason: "Já existe lembrete ativo equivalente para este cliente." };
  }

  const created = createReminder({
    title: buildReminderTitle(candidate.clientName),
    description: `${candidate.reasonLabel} (${candidate.daysInactive} dias sem atividade relevante).`,
    dueDate: toDateInputValue(referenceDate),
    clientId: candidate.clientId,
    quoteId: candidate.referenceQuoteId,
    chargeId: candidate.referenceChargeId,
    sourceType: "client_followup",
    sourceFingerprint: `reactivation-radar:${candidate.id}`,
  });

  if (!created) {
    return { ok: false, reason: "Não foi possível criar o lembrete de reativação." };
  }

  return { ok: true, reminderId: created.id };
}
