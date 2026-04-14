import type { ParsedAssistedIntent } from "@/lib/domain/assisted-input";
import type { Client } from "@/lib/domain/client";
import type { AssistedActionDraft } from "@/lib/assisted-input/types";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function findClientByText(
  clients: Client[],
  candidate?: string,
  rawText?: string
): Client | null {
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

export function buildAssistedActionDraft(
  parsedIntent: ParsedAssistedIntent,
  matchedClient: Client | null
): AssistedActionDraft {
  if (parsedIntent.intentType === "create_quote") {
    return {
      actionType: "create_quote",
      title: "Criar orçamento",
      description: "Revise os campos do rascunho antes de confirmar a criação.",
      payload: {
        clientId: matchedClient?.id,
        amountInCents: parsedIntent.extractedFields.amountInCents,
        validUntil: parsedIntent.extractedFields.dueDate,
        title: parsedIntent.extractedFields.reminderTitle,
      },
    };
  }

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
