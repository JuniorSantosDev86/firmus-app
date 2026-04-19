import type { AssistedIntentType, ParsedAssistedIntent } from "../../domain/assisted-input";

export type NormalizedInput = {
  raw: string;
  trimmed: string;
  lowered: string;
  normalized: string;
};

export type IntentDetectionResult = {
  intentType: AssistedIntentType;
  warnings: string[];
  certaintyScore: number;
};

export type AmountExtractionResult = {
  amountInCents?: number;
  warnings: string[];
};

export type DateExtractionResult = {
  dueDate?: string;
  warnings: string[];
};

export type TextFieldExtractionResult = {
  clientNameCandidate?: string;
  titleCandidate?: string;
  descriptionCandidate?: string;
};

export type ParserFieldSet = ParsedAssistedIntent["extractedFields"];
