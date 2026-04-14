import type {
  AssistedActionDraft,
  AssistedDraftValidation,
} from "@/lib/assisted-input/types";

export function validateAssistedActionDraft(
  draftAction: AssistedActionDraft
): AssistedDraftValidation {
  if (draftAction.actionType === "create_reminder") {
    const title = (draftAction.payload.title ?? "").trim();
    if (title.length === 0) {
      return {
        canConfirm: false,
        warnings: ["Informe um título válido para criar o lembrete."],
      };
    }

    return { canConfirm: true, warnings: [] };
  }

  if (draftAction.actionType === "create_charge") {
    const clientId = (draftAction.payload.clientId ?? "").trim();
    const amountInCents = draftAction.payload.amountInCents;
    const dueDate = (draftAction.payload.dueDate ?? "").trim();

    const warnings: string[] = [];
    if (clientId.length === 0) {
      warnings.push("Selecione um cliente para criar a cobrança.");
    }

    if (!Number.isFinite(amountInCents) || (amountInCents ?? 0) <= 0) {
      warnings.push("Informe um valor válido para a cobrança.");
    }

    if (dueDate.length === 0) {
      warnings.push("Informe a data de vencimento da cobrança.");
    }

    return { canConfirm: warnings.length === 0, warnings };
  }

  if (draftAction.actionType === "create_quote") {
    const clientId = (draftAction.payload.clientId ?? "").trim();
    const title = (draftAction.payload.title ?? "").trim();

    const warnings: string[] = [];
    if (clientId.length === 0) {
      warnings.push("Selecione um cliente para criar o orçamento.");
    }

    if (title.length === 0) {
      warnings.push("Informe um título ou contexto mínimo para o orçamento.");
    }

    return { canConfirm: warnings.length === 0, warnings };
  }

  if (draftAction.actionType === "suggest_template") {
    return {
      canConfirm: false,
      warnings: ["Esta interpretação gera apenas sugestão de modelo, sem criação automática."],
    };
  }

  return {
    canConfirm: false,
    warnings: ["Não consegui interpretar com segurança."],
  };
}
