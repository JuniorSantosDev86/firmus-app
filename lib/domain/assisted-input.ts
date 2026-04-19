export type AssistedIntentType =
  | "create_quote"
  | "create_reminder"
  | "create_charge"
  | "use_template"
  | "unknown";

export type AssistedIntentConfidence = "high" | "medium" | "low";

export type ParsedAssistedIntent = {
  rawText: string;
  intentType: AssistedIntentType;
  confidence: AssistedIntentConfidence;
  extractedFields: {
    clientNameCandidate?: string;
    amountInCents?: number;
    dueDate?: string;
    titleCandidate?: string;
    descriptionCandidate?: string;
    reminderTitle?: string;
    templateCategory?: string;
  };
  missingFields: string[];
  warnings: string[];
};

export type AssistedDraftAction = {
  actionType:
    | "create_quote"
    | "create_reminder"
    | "create_charge"
    | "suggest_template"
    | "none";
  title: string;
  description?: string;
  payload: Record<string, unknown>;
};
