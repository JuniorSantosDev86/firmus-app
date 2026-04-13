import type {
  AssistedIntentConfidence,
  AssistedIntentType,
  ParsedAssistedIntent,
} from "@/lib/domain/assisted-input";

const REMINDER_KEYWORDS = ["lembrete", "lembrar", "follow-up", "follow up"];
const CHARGE_KEYWORDS = ["cobranca", "cobrança", "cobrar", "pagamento"];
const TEMPLATE_KEYWORDS = ["modelo", "template", "mensagem pronta"];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function containsAnyKeyword(value: string, keywords: string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword));
}

function toDateInputValue(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate()
  ).padStart(2, "0")}`;
}

function parseDueDate(rawText: string): string | undefined {
  const normalized = normalizeText(rawText);
  const today = new Date();

  if (normalized.includes("amanha")) {
    const next = new Date(today);
    next.setDate(today.getDate() + 1);
    return toDateInputValue(next);
  }

  if (normalized.includes("hoje")) {
    return toDateInputValue(today);
  }

  if (normalized.includes("proxima semana")) {
    const next = new Date(today);
    next.setDate(today.getDate() + 7);
    return toDateInputValue(next);
  }

  const match = rawText.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (!match) {
    return undefined;
  }

  const day = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const capturedYear = match[3] ? Number.parseInt(match[3], 10) : today.getFullYear();
  const year = capturedYear < 100 ? 2000 + capturedYear : capturedYear;

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return undefined;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return toDateInputValue(date);
}

function parseAmountInCents(rawText: string): number | undefined {
  const normalized = rawText.replace(/\s+/g, " ").trim();
  const explicitCurrency = normalized.match(/r\$\s*([\d.]+(?:,\d{1,2})?)/i);
  const candidate = explicitCurrency?.[1] ?? normalized.match(/(\d+[.,]\d{1,2})/)?.[1];

  if (!candidate) {
    return undefined;
  }

  const parsed = Number(candidate.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.round(parsed * 100);
}

function cleanClientCandidate(value: string): string | undefined {
  const cleaned = value
    .replace(/\b(amanha|hoje|ate|até|no dia|dia|valor|r\$)\b.*/i, "")
    .replace(/[.,;:!?]+$/g, "")
    .trim();

  return cleaned.length > 1 ? cleaned : undefined;
}

function parseClientNameCandidate(rawText: string): string | undefined {
  const quoted = rawText.match(/["“](.+?)["”]/);
  if (quoted?.[1]) {
    return cleanClientCandidate(quoted[1]);
  }

  const withClientKeyword = rawText.match(/\bcliente\s+([a-zA-ZÀ-ÿ0-9\s]+)$/i);
  if (withClientKeyword?.[1]) {
    return cleanClientCandidate(withClientKeyword[1]);
  }

  const withParaKeyword = rawText.match(/\bpara\s+([a-zA-ZÀ-ÿ0-9\s]+)$/i);
  if (withParaKeyword?.[1]) {
    return cleanClientCandidate(withParaKeyword[1]);
  }

  return undefined;
}

function parseReminderTitle(rawText: string): string | undefined {
  const stripped = rawText
    .replace(/\blembrete\b/gi, "")
    .replace(/\blembrar\b/gi, "")
    .replace(/\bde\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (stripped.length === 0) {
    return undefined;
  }

  return stripped.slice(0, 120);
}

function parseTemplateCategory(rawText: string): string | undefined {
  const normalized = normalizeText(rawText);

  if (normalized.includes("pagamento") || normalized.includes("cobranca")) {
    return "payment_reminder";
  }

  if (normalized.includes("aprovacao") || normalized.includes("aprovar")) {
    return "approval_prompt";
  }

  if (normalized.includes("follow-up") || normalized.includes("follow up")) {
    return "quote_followup";
  }

  if (containsAnyKeyword(normalized, TEMPLATE_KEYWORDS)) {
    return "general";
  }

  return undefined;
}

function classifyIntent(rawText: string): {
  intentType: AssistedIntentType;
  warnings: string[];
} {
  const normalized = normalizeText(rawText);
  const hasReminder = containsAnyKeyword(normalized, REMINDER_KEYWORDS);
  const hasCharge = containsAnyKeyword(normalized, CHARGE_KEYWORDS);
  const hasTemplate = containsAnyKeyword(normalized, TEMPLATE_KEYWORDS);

  if (hasReminder && hasCharge) {
    return {
      intentType: "unknown",
      warnings: ["A instrução parece misturar lembrete e cobrança."],
    };
  }

  if (hasCharge) {
    return { intentType: "create_charge", warnings: [] };
  }

  if (hasReminder) {
    return { intentType: "create_reminder", warnings: [] };
  }

  if (hasTemplate) {
    return { intentType: "use_template", warnings: [] };
  }

  return { intentType: "unknown", warnings: [] };
}

function resolveConfidence(
  intentType: AssistedIntentType,
  extractedFields: ParsedAssistedIntent["extractedFields"]
): AssistedIntentConfidence {
  if (intentType === "unknown") {
    return "low";
  }

  if (intentType === "create_charge") {
    if (
      typeof extractedFields.amountInCents === "number" &&
      typeof extractedFields.dueDate === "string"
    ) {
      return "high";
    }

    return "medium";
  }

  if (intentType === "create_reminder") {
    return extractedFields.reminderTitle ? "high" : "medium";
  }

  if (intentType === "use_template") {
    return extractedFields.templateCategory ? "high" : "medium";
  }

  return "low";
}

export function parseTextInputIntent(rawText: string): ParsedAssistedIntent {
  const trimmed = rawText.trim();
  const warnings: string[] = [];

  if (trimmed.length < 3) {
    return {
      rawText,
      intentType: "unknown",
      confidence: "low",
      extractedFields: {},
      warnings: ["Escreva uma instrução mais completa para interpretar com segurança."],
    };
  }

  const classified = classifyIntent(trimmed);
  warnings.push(...classified.warnings);

  const extractedFields: ParsedAssistedIntent["extractedFields"] = {
    clientNameCandidate: parseClientNameCandidate(trimmed),
    amountInCents: parseAmountInCents(trimmed),
    dueDate: parseDueDate(trimmed),
    reminderTitle: classified.intentType === "create_reminder" ? parseReminderTitle(trimmed) : undefined,
    templateCategory: classified.intentType === "use_template" ? parseTemplateCategory(trimmed) : undefined,
  };

  if (classified.intentType === "create_charge" && extractedFields.amountInCents === undefined) {
    warnings.push("Não identifiquei o valor da cobrança.");
  }

  if (classified.intentType === "create_charge" && extractedFields.dueDate === undefined) {
    warnings.push("Não identifiquei a data de vencimento.");
  }

  if (classified.intentType === "create_reminder" && extractedFields.reminderTitle === undefined) {
    warnings.push("Não identifiquei um título claro para o lembrete.");
  }

  if (classified.intentType === "unknown") {
    warnings.push("Não consegui interpretar com segurança.");
  }

  return {
    rawText,
    intentType: classified.intentType,
    confidence: resolveConfidence(classified.intentType, extractedFields),
    extractedFields,
    warnings,
  };
}
