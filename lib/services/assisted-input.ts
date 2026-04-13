import { getCharges, upsertCharge } from "@/lib/charge-storage";
import { readClients } from "@/lib/client-storage";
import type { AssistedDraftAction, ParsedAssistedIntent } from "@/lib/domain/assisted-input";
import type { Client } from "@/lib/domain/client";
import { createReminder } from "@/lib/services/reminders";
import { parseTextInputIntent } from "@/lib/services/text-input-parser";

export type AssistedInputInterpretation = {
  parsedIntent: ParsedAssistedIntent;
  draftAction: AssistedDraftAction;
  matchedClient: Client | null;
  availableClients: Client[];
  warnings: string[];
  canConfirm: boolean;
};

export type AssistedDraftValidation = {
  canConfirm: boolean;
  warnings: string[];
};

export type ConfirmAssistedDraftResult =
  | { ok: true; entityType: "reminder" | "charge"; entityId: string }
  | { ok: false; reason: string };

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function generateEntityId(prefix: "charge" | "assist"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

function toDateInputValue(value: string): string | undefined {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString().slice(0, 10);
}

function findClientByText(clients: Client[], candidate?: string, rawText?: string): Client | null {
  const byCandidate = normalizeText(candidate ?? "");
  if (byCandidate.length > 0) {
    const exact = clients.find((client) => normalizeText(client.name) === byCandidate);
    if (exact) {
      return exact;
    }

    const contained = clients.find((client) => normalizeText(client.name).includes(byCandidate));
    if (contained) {
      return contained;
    }
  }

  const normalizedRaw = normalizeText(rawText ?? "");
  if (normalizedRaw.length === 0) {
    return null;
  }

  return clients.find((client) => normalizedRaw.includes(normalizeText(client.name))) ?? null;
}

function buildDraftAction(parsedIntent: ParsedAssistedIntent, matchedClient: Client | null): AssistedDraftAction {
  if (parsedIntent.intentType === "create_reminder") {
    return {
      actionType: "create_reminder",
      title: "Criar lembrete",
      description: "Lembrete será criado apenas após sua confirmação.",
      payload: {
        title: parsedIntent.extractedFields.reminderTitle ?? parsedIntent.rawText.trim(),
        dueDate: parsedIntent.extractedFields.dueDate,
        clientId: matchedClient?.id,
      },
    };
  }

  if (parsedIntent.intentType === "create_charge") {
    return {
      actionType: "create_charge",
      title: "Criar cobrança",
      description: "Cobrança será criada apenas após sua confirmação.",
      payload: {
        clientId: matchedClient?.id,
        amountInCents: parsedIntent.extractedFields.amountInCents,
        dueDate: parsedIntent.extractedFields.dueDate,
      },
    };
  }

  if (parsedIntent.intentType === "use_template") {
    return {
      actionType: "suggest_template",
      title: "Sugerir modelo",
      description: "Nenhuma ação automática será executada.",
      payload: {
        templateCategory: parsedIntent.extractedFields.templateCategory,
      },
    };
  }

  return {
    actionType: "none",
    title: "Sem ação confirmável",
    payload: {},
  };
}

export function validateAssistedDraftAction(draftAction: AssistedDraftAction): AssistedDraftValidation {
  if (draftAction.actionType === "create_reminder") {
    const title =
      typeof draftAction.payload.title === "string" ? draftAction.payload.title.trim() : "";

    if (title.length === 0) {
      return { canConfirm: false, warnings: ["Ajuste os campos antes de confirmar."] };
    }

    return { canConfirm: true, warnings: [] };
  }

  if (draftAction.actionType === "create_charge") {
    const clientId =
      typeof draftAction.payload.clientId === "string" ? draftAction.payload.clientId.trim() : "";
    const amountInCents =
      typeof draftAction.payload.amountInCents === "number"
        ? draftAction.payload.amountInCents
        : NaN;
    const dueDate =
      typeof draftAction.payload.dueDate === "string" ? draftAction.payload.dueDate.trim() : "";

    if (clientId.length === 0 || !Number.isFinite(amountInCents) || amountInCents <= 0 || dueDate.length === 0) {
      return { canConfirm: false, warnings: ["Ajuste os campos antes de confirmar."] };
    }

    return { canConfirm: true, warnings: [] };
  }

  return {
    canConfirm: false,
    warnings: draftAction.actionType === "none" ? ["Não consegui interpretar com segurança."] : [],
  };
}

export function interpretAssistedInput(rawText: string): AssistedInputInterpretation {
  const parsedIntent = parseTextInputIntent(rawText);
  const availableClients = readClients();
  const matchedClient = findClientByText(
    availableClients,
    parsedIntent.extractedFields.clientNameCandidate,
    parsedIntent.rawText
  );
  const draftAction = buildDraftAction(parsedIntent, matchedClient);
  const validation = validateAssistedDraftAction(draftAction);

  return {
    parsedIntent,
    draftAction,
    matchedClient,
    availableClients,
    warnings: [...parsedIntent.warnings, ...validation.warnings],
    canConfirm: validation.canConfirm,
  };
}

export function confirmAssistedDraftAction(draftAction: AssistedDraftAction): ConfirmAssistedDraftResult {
  const validation = validateAssistedDraftAction(draftAction);
  if (!validation.canConfirm) {
    return { ok: false, reason: "Ajuste os campos antes de confirmar." };
  }

  if (draftAction.actionType === "create_reminder") {
    const title = String(draftAction.payload.title ?? "").trim();
    const clientId =
      typeof draftAction.payload.clientId === "string" && draftAction.payload.clientId.trim().length > 0
        ? draftAction.payload.clientId.trim()
        : undefined;
    const dueDate =
      typeof draftAction.payload.dueDate === "string" && draftAction.payload.dueDate.trim().length > 0
        ? draftAction.payload.dueDate.trim()
        : undefined;

    const created = createReminder({
      title,
      dueDate,
      clientId,
      sourceType: clientId ? "client_followup" : "manual",
    });

    if (!created) {
      return { ok: false, reason: "Não foi possível criar o lembrete." };
    }

    return { ok: true, entityType: "reminder", entityId: created.id };
  }

  if (draftAction.actionType === "create_charge") {
    const clientId = String(draftAction.payload.clientId ?? "").trim();
    const amountInCents = Number(draftAction.payload.amountInCents);
    const dueDate = String(draftAction.payload.dueDate ?? "").trim();
    const chargeId = generateEntityId("charge");
    const previousIds = new Set(getCharges().map((charge) => charge.id));

    const next = upsertCharge(
      {
        clientId,
        amountInCents,
        dueDate,
        status: "pending",
      },
      chargeId
    );

    const created =
      next.find((charge) => charge.id === chargeId) ??
      next.find((charge) => !previousIds.has(charge.id)) ??
      null;

    if (!created) {
      return { ok: false, reason: "Não foi possível criar a cobrança." };
    }

    return { ok: true, entityType: "charge", entityId: created.id };
  }

  return { ok: false, reason: "Ação não confirmável." };
}

export function createAssistedInterpretationId(): string {
  return generateEntityId("assist");
}

export function normalizeDraftDueDate(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return toDateInputValue(value);
}
