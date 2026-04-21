import type { ParsedAssistedIntent } from "../../domain/assisted-input";
import { extractAmount } from "./amount-extraction";
import { extractDueDate } from "./date-extraction";
import { detectIntent } from "./intent-detection";
import { normalizeInput, uniqueNonEmpty } from "./normalization";
import { extractClient, extractTitleAndDescription } from "./text-field-extraction";
import {
  computeConfidence,
  shapeWarningsAndMissingFields,
} from "./warning-shaping";
import type { ParseTextInputIntentOptions } from "./types";

export function parseTextInputIntent(
  rawText: string,
  options: ParseTextInputIntentOptions = {}
): ParsedAssistedIntent {
  const input = normalizeInput(rawText);

  if (input.trimmed.length < 3) {
    return {
      rawText,
      intentType: "unknown",
      confidence: "low",
      extractedFields: {},
      missingFields: ["instrução"],
      warnings: ["Escreva uma instrução mais completa para interpretar com segurança."],
    };
  }

  const detectedIntent = detectIntent(input);
  const amountExtraction = extractAmount(input);
  const dateExtraction = extractDueDate(input, { referenceDate: options.referenceDate });
  const clientNameCandidate = extractClient(input);
  const textFields = extractTitleAndDescription(input, detectedIntent.intentType);

  const extractedFields: ParsedAssistedIntent["extractedFields"] = {
    clientNameCandidate,
    amountInCents: amountExtraction.amountInCents,
    dueDate: dateExtraction.dueDate,
    titleCandidate: textFields.titleCandidate,
    descriptionCandidate: textFields.descriptionCandidate,
    reminderTitle: textFields.titleCandidate,
  };

  const shaped = shapeWarningsAndMissingFields({
    intentType: detectedIntent.intentType,
    extractedFields,
    rawWarnings: uniqueNonEmpty([
      ...detectedIntent.warnings,
      ...amountExtraction.warnings,
      ...dateExtraction.warnings,
    ]),
  });

  return {
    rawText: input.raw,
    intentType: detectedIntent.intentType,
    confidence: computeConfidence({
      intentType: detectedIntent.intentType,
      certaintyScore: detectedIntent.certaintyScore,
      missingFields: shaped.missingFields,
      warnings: shaped.warnings,
    }),
    extractedFields,
    missingFields: shaped.missingFields,
    warnings: shaped.warnings,
  };
}
