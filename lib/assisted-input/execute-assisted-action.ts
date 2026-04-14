import { routeAssistedActionCreation } from "@/lib/assisted-input/action-router";
import type {
  AssistedActionDraft,
  ConfirmAssistedDraftResult,
} from "@/lib/assisted-input/types";
import { validateAssistedActionDraft } from "@/lib/assisted-input/validators";

export function executeAssistedActionDraft(
  draftAction: AssistedActionDraft
): ConfirmAssistedDraftResult {
  const validation = validateAssistedActionDraft(draftAction);
  if (!validation.canConfirm) {
    const reason =
      validation.warnings[0] ?? "Ajuste os campos obrigatórios antes de confirmar.";
    return { ok: false, success: false, reason };
  }

  return routeAssistedActionCreation(draftAction);
}
