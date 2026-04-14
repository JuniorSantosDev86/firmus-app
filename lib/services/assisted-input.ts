import { readClients } from "@/lib/client-storage";
import { buildAssistedActionDraft, findClientByText } from "@/lib/assisted-input/draft-builders";
import { executeAssistedActionDraft } from "@/lib/assisted-input/execute-assisted-action";
import type {
  AssistedActionDraft,
  AssistedDraftValidation,
  AssistedInputInterpretation,
  ConfirmAssistedDraftResult,
} from "@/lib/assisted-input/types";
import { validateAssistedActionDraft } from "@/lib/assisted-input/validators";
import { parseTextInputIntent } from "@/lib/services/text-input-parser";

function getUniqueWarnings(warnings: string[]): string[] {
  const deduped = new Set<string>();

  for (const warning of warnings) {
    const normalized = warning.trim();
    if (normalized.length === 0) {
      continue;
    }

    deduped.add(normalized);
  }

  return Array.from(deduped);
}

function generateEntityId(prefix: "assist"): string {
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

export function validateAssistedDraftAction(
  draftAction: AssistedActionDraft
): AssistedDraftValidation {
  return validateAssistedActionDraft(draftAction);
}

export function interpretAssistedInput(rawText: string): AssistedInputInterpretation {
  const parsedIntent = parseTextInputIntent(rawText);
  const availableClients = readClients();
  const matchedClient = findClientByText(
    availableClients,
    parsedIntent.extractedFields.clientNameCandidate,
    parsedIntent.rawText
  );
  const draftAction = buildAssistedActionDraft(parsedIntent, matchedClient);
  const validation = validateAssistedActionDraft(draftAction);

  return {
    parsedIntent,
    draftAction,
    matchedClient,
    availableClients,
    warnings: getUniqueWarnings([...parsedIntent.warnings, ...validation.warnings]),
    canConfirm: validation.canConfirm,
  };
}

export function confirmAssistedDraftAction(
  draftAction: AssistedActionDraft
): ConfirmAssistedDraftResult {
  return executeAssistedActionDraft(draftAction);
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

export type {
  AssistedActionDraft,
  AssistedDraftValidation,
  AssistedInputInterpretation,
  ConfirmAssistedDraftResult,
};
