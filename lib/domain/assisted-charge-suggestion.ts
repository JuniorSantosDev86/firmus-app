export type AssistedChargeSuggestionType =
  | "charge_from_approved_quote"
  | "followup_for_overdue_charge"
  | "charge_from_pending_reminder"
  | "charge_gap_for_active_client"
  | "unknown";

export type SuggestionReasonCode =
  | "approved_quote_without_charge"
  | "overdue_charge_without_followup"
  | "pending_reminder_for_charge_action"
  | "client_activity_without_recent_charge"
  | "derived_from_known_pattern";

export type AssistedChargeSuggestion = {
  id: string;
  type: AssistedChargeSuggestionType;
  clientId: string;
  clientName?: string;
  suggestedAmountInCents?: number;
  suggestedDueDate?: string;
  reasonCodes: SuggestionReasonCode[];
  explanation: string;
  sourceEntityIds: string[];
  status: "open" | "dismissed" | "accepted";
  createdAt: string;
  updatedAt: string;
};
