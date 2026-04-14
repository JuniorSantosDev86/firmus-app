import type { Client } from "@/lib/domain/client";
import type { ParsedAssistedIntent } from "@/lib/domain/assisted-input";

export type AssistedActionType =
  | "create_quote"
  | "create_reminder"
  | "create_charge"
  | "suggest_template"
  | "none";

type AssistedBaseDraft = {
  actionType: AssistedActionType;
  title: string;
  description?: string;
};

export type AssistedChargeDraft = AssistedBaseDraft & {
  actionType: "create_charge";
  payload: {
    clientId?: string;
    amountInCents?: number;
    dueDate?: string;
  };
};

export type AssistedQuoteDraft = AssistedBaseDraft & {
  actionType: "create_quote";
  payload: {
    clientId?: string;
    amountInCents?: number;
    validUntil?: string;
    title?: string;
  };
};

export type AssistedReminderDraft = AssistedBaseDraft & {
  actionType: "create_reminder";
  payload: {
    title?: string;
    dueDate?: string;
    clientId?: string;
    description?: string;
  };
};

export type AssistedTemplateSuggestionDraft = AssistedBaseDraft & {
  actionType: "suggest_template";
  payload: {
    templateCategory?: string;
  };
};

export type AssistedNoActionDraft = AssistedBaseDraft & {
  actionType: "none";
  payload: Record<string, never>;
};

export type AssistedActionDraft =
  | AssistedChargeDraft
  | AssistedQuoteDraft
  | AssistedReminderDraft
  | AssistedTemplateSuggestionDraft
  | AssistedNoActionDraft;

export type AssistedDraftValidation = {
  canConfirm: boolean;
  warnings: string[];
};

export type AssistedInputInterpretation = {
  parsedIntent: ParsedAssistedIntent;
  draftAction: AssistedActionDraft;
  matchedClient: Client | null;
  availableClients: Client[];
  warnings: string[];
  canConfirm: boolean;
};

export type ConfirmAssistedDraftResult =
  | {
      ok: true;
      success: true;
      entityType: "reminder" | "charge" | "quote";
      entityId: string;
      message: string;
      href: "/reminders" | "/charges" | "/quotes";
    }
  | {
      ok: false;
      success: false;
      reason: string;
    };
