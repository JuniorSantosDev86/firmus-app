import { upsertCharge } from "@/lib/charge-storage";
import { upsertQuote } from "@/lib/quote-storage";
import { createReminder } from "@/lib/services/reminders";
import type {
  AssistedActionDraft,
  ConfirmAssistedDraftResult,
} from "@/lib/assisted-input/types";

function generateEntityId(prefix: "charge" | "quote"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function createChargeFromDraft(draftAction: AssistedActionDraft): ConfirmAssistedDraftResult {
  if (draftAction.actionType !== "create_charge") {
    return { ok: false, success: false, reason: "Rascunho inválido para cobrança." };
  }

  const chargeId = generateEntityId("charge");
  const nextCharges = upsertCharge(
    {
      clientId: draftAction.payload.clientId ?? "",
      amountInCents: draftAction.payload.amountInCents ?? 0,
      dueDate: draftAction.payload.dueDate ?? "",
      status: "pending",
    },
    chargeId
  );

  const created = nextCharges.find((charge) => charge.id === chargeId) ?? null;
  if (!created) {
    return { ok: false, success: false, reason: "Não foi possível criar a cobrança." };
  }

  return {
    ok: true,
    success: true,
    entityType: "charge",
    entityId: created.id,
    message: "Cobrança criada com sucesso.",
    href: "/charges",
  };
}

function createQuoteFromDraft(draftAction: AssistedActionDraft): ConfirmAssistedDraftResult {
  if (draftAction.actionType !== "create_quote") {
    return { ok: false, success: false, reason: "Rascunho inválido para orçamento." };
  }

  const quoteId = generateEntityId("quote");
  const nextStore = upsertQuote(
    {
      clientId: draftAction.payload.clientId ?? "",
      status: "draft",
      issueDate: getTodayDate(),
      validUntil: draftAction.payload.validUntil?.trim() ? draftAction.payload.validUntil : null,
      discountInCents: 0,
      items: [
        {
          serviceId: null,
          description: draftAction.payload.title ?? "Orçamento",
          quantity: 1,
          unitPriceInCents: Math.max(0, draftAction.payload.amountInCents ?? 0),
        },
      ],
    },
    quoteId
  );

  const created = nextStore.quotes.find((quote) => quote.id === quoteId) ?? null;
  if (!created) {
    return { ok: false, success: false, reason: "Não foi possível criar o orçamento." };
  }

  return {
    ok: true,
    success: true,
    entityType: "quote",
    entityId: created.id,
    message: "Orçamento criado com sucesso.",
    href: "/quotes",
  };
}

function createReminderFromDraft(draftAction: AssistedActionDraft): ConfirmAssistedDraftResult {
  if (draftAction.actionType !== "create_reminder") {
    return { ok: false, success: false, reason: "Rascunho inválido para lembrete." };
  }

  const title = (draftAction.payload.title ?? "").trim();
  const clientId = draftAction.payload.clientId?.trim();
  const dueDate = draftAction.payload.dueDate?.trim();
  const description = draftAction.payload.description?.trim();

  const created = createReminder({
    title,
    description: description && description.length > 0 ? description : undefined,
    dueDate: dueDate && dueDate.length > 0 ? dueDate : undefined,
    clientId: clientId && clientId.length > 0 ? clientId : undefined,
    sourceType: clientId && clientId.length > 0 ? "client_followup" : "manual",
  });

  if (!created) {
    return { ok: false, success: false, reason: "Não foi possível criar o lembrete." };
  }

  return {
    ok: true,
    success: true,
    entityType: "reminder",
    entityId: created.id,
    message: "Lembrete criado com sucesso.",
    href: "/reminders",
  };
}

export function routeAssistedActionCreation(
  draftAction: AssistedActionDraft
): ConfirmAssistedDraftResult {
  if (draftAction.actionType === "create_charge") {
    return createChargeFromDraft(draftAction);
  }

  if (draftAction.actionType === "create_quote") {
    return createQuoteFromDraft(draftAction);
  }

  if (draftAction.actionType === "create_reminder") {
    return createReminderFromDraft(draftAction);
  }

  return { ok: false, success: false, reason: "Ação não confirmável." };
}
