import type {
  AssistedIntentConfidence,
  AssistedIntentType,
  ParsedAssistedIntent,
} from "../../domain/assisted-input";
import { uniqueNonEmpty } from "./normalization";

function getRequiredMissingFields(
  intentType: AssistedIntentType,
  extractedFields: ParsedAssistedIntent["extractedFields"]
): string[] {
  const missingFields: string[] = [];

  if (intentType === "create_charge") {
    if (!extractedFields.clientNameCandidate) missingFields.push("cliente");
    if (extractedFields.amountInCents === undefined) missingFields.push("valor");
    if (!extractedFields.dueDate) missingFields.push("vencimento");
  }

  if (intentType === "create_quote") {
    if (!extractedFields.clientNameCandidate) missingFields.push("cliente");
    if (extractedFields.amountInCents === undefined) missingFields.push("valor");
    if (!extractedFields.titleCandidate) missingFields.push("título/contexto");
  }

  if (intentType === "create_reminder") {
    if (!extractedFields.titleCandidate) missingFields.push("título");
  }

  return missingFields;
}

export function shapeWarningsAndMissingFields(params: {
  intentType: AssistedIntentType;
  rawWarnings: string[];
  extractedFields: ParsedAssistedIntent["extractedFields"];
}): {
  warnings: string[];
  missingFields: string[];
} {
  const missingFields = getRequiredMissingFields(params.intentType, params.extractedFields);
  const warnings = [...params.rawWarnings];

  if (params.intentType === "unknown") {
    warnings.push("Não identifiquei a intenção com segurança.");
  }

  if (missingFields.length > 0) {
    warnings.push(`Campos pendentes para confirmação: ${missingFields.join(", ")}.`);
  }

  return {
    warnings: uniqueNonEmpty(warnings),
    missingFields,
  };
}

export function computeConfidence(params: {
  intentType: AssistedIntentType;
  certaintyScore: number;
  missingFields: string[];
  warnings: string[];
}): AssistedIntentConfidence {
  if (params.intentType === "unknown") {
    return "low";
  }

  let score = 1;
  if (params.certaintyScore >= 4) {
    score += 2;
  } else if (params.certaintyScore >= 3) {
    score += 1;
  }

  score -= Math.min(2, params.missingFields.length);

  const ambiguityWarnings = params.warnings.filter(
    (warning) => warning.includes("ambígua") || warning.includes("segurança")
  ).length;
  score -= Math.min(1, ambiguityWarnings);

  if (score >= 3) return "high";
  if (score >= 2) return "medium";
  return "low";
}
