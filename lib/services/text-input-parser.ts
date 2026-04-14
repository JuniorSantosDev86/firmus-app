import type {
  AssistedIntentConfidence,
  AssistedIntentType,
  ParsedAssistedIntent,
} from "@/lib/domain/assisted-input";

type NormalizedInput = {
  raw: string;
  trimmed: string;
  lowered: string;
  normalized: string;
};

type DetectedIntent = {
  intentType: AssistedIntentType;
  warnings: string[];
};

type DueDateExtraction = {
  dueDate?: string;
  warnings: string[];
};

function normalizeInput(rawText: string): NormalizedInput {
  const trimmed = rawText.trim();
  const lowered = trimmed.toLowerCase().replace(/\s+/g, " ");
  const normalized = lowered
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    raw: rawText,
    trimmed,
    lowered,
    normalized,
  };
}

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function stripLeadingArticles(value: string): string {
  return value.replace(/^(?:o|a|os|as|um|uma)\s+/i, "").trim();
}

function parseMoneyNumber(raw: string): number | undefined {
  const cleaned = raw.replace(/\s+/g, "").replace(/[^\d.,]/g, "");
  if (cleaned.length === 0) {
    return undefined;
  }

  let normalized = cleaned;
  const lastDot = normalized.lastIndexOf(".");
  const lastComma = normalized.lastIndexOf(",");

  if (lastDot >= 0 && lastComma >= 0) {
    if (lastComma > lastDot) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    normalized = normalized.replace(/,/g, ".");
  } else if (lastDot >= 0) {
    const decimalDigits = normalized.length - lastDot - 1;
    if (decimalDigits !== 2) {
      normalized = normalized.replace(/\./g, "");
    }
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function detectIntent(input: NormalizedInput): DetectedIntent {
  const text = input.normalized;

  const hasQuote =
    /\borcamento\b/.test(text) &&
    /(\bcria\b|\bcriar\b|\bgera\b|\bgerar\b|\bfaz\b|\bfazer\b|\bmonta\b|\bmontar\b|\bpara\b)/.test(
      text
    );

  const hasCharge =
    /\bcobranca\b/.test(text) ||
    /\bcobrar\b/.test(text) ||
    /(\bcria\b|\bcriar\b|\bgera\b|\bgerar\b|\bfaz\b|\bfazer\b)\s+(?:uma\s+)?\bcobranca\b/.test(text);

  const hasReminder =
    /\blembrete\b/.test(text) ||
    /\blembrar\b/.test(text) ||
    /\bfollow-up\b/.test(text) ||
    /\bfollow up\b/.test(text);

  const positiveCount = [hasQuote, hasCharge, hasReminder].filter(Boolean).length;
  if (positiveCount > 1) {
    return {
      intentType: "unknown",
      warnings: ["A instrução mistura mais de uma intenção. Confirme manualmente."],
    };
  }

  if (hasQuote) {
    return { intentType: "create_quote", warnings: [] };
  }

  if (hasCharge) {
    return { intentType: "create_charge", warnings: [] };
  }

  if (hasReminder) {
    return { intentType: "create_reminder", warnings: [] };
  }

  return { intentType: "unknown", warnings: [] };
}

function extractAmount(input: NormalizedInput): number | undefined {
  const raw = input.trimmed;

  const candidates: Array<{ value: string; score: number }> = [];

  const explicitCurrency = /r\$\s*([\d.,]+)/gi;
  for (const match of raw.matchAll(explicitCurrency)) {
    if (match[1]) {
      candidates.push({ value: match[1], score: 100 });
    }
  }

  const withReais = /\b(\d+(?:[.,]\d{1,2})?)\s*(?:reais|real)\b/gi;
  for (const match of raw.matchAll(withReais)) {
    if (match[1]) {
      candidates.push({ value: match[1], score: 90 });
    }
  }

  const withValueContext = /\b(?:no\s+valor\s+de|valor\s+de|valor|de)\s+(\d+(?:[.,]\d{1,2})?)\b/gi;
  for (const match of raw.matchAll(withValueContext)) {
    if (match[1]) {
      candidates.push({ value: match[1], score: 70 });
    }
  }

  const decimalOnly = /\b(\d+[.,]\d{2})\b/g;
  for (const match of raw.matchAll(decimalOnly)) {
    if (match[1]) {
      candidates.push({ value: match[1], score: 60 });
    }
  }

  const sorted = [...candidates].sort((a, b) => b.score - a.score);

  for (const candidate of sorted) {
    const parsed = parseMoneyNumber(candidate.value);
    if (parsed === undefined) {
      continue;
    }

    if (Number.isInteger(parsed) && parsed <= 31 && candidate.score < 90) {
      continue;
    }

    return Math.round(parsed * 100);
  }

  return undefined;
}

function extractClient(input: NormalizedInput): string | undefined {
  const pattern =
    /\b(?:para|pra|pro|com)\s+(.+?)(?=(?:,|;|\.|\breferente\b|\bsobre\b|\bservi[cç]o\b|\bcom\s+vencimento\b|\bvencimento\b|\bhoje\b|\bamanh[ãa]\b|\bdia\s+\d{1,2}\b|\bde\s+r\$\b|\bde\s+\d+(?:[.,]\d+)?\s*(?:reais|real)\b|\bpara\s+\d{1,2}[/-]\d{1,2}\b|$))/gi;

  for (const match of input.trimmed.matchAll(pattern)) {
    if (!match[1]) {
      continue;
    }

    let candidate = match[1].trim();
    candidate = stripLeadingArticles(candidate);
    candidate = candidate.replace(/\s+/g, " ").replace(/[.,;:!?]+$/g, "").trim();

    if (candidate.length >= 2) {
      return candidate;
    }
  }

  return undefined;
}

function extractDueDate(input: NormalizedInput): DueDateExtraction {
  const warnings: string[] = [];
  const now = new Date();
  const text = input.normalized;

  if (text.includes("amanha")) {
    const next = new Date(now);
    next.setDate(now.getDate() + 1);
    return { dueDate: toDateInputValue(next), warnings };
  }

  if (text.includes("hoje")) {
    return { dueDate: toDateInputValue(now), warnings };
  }

  const fullDate = input.trimmed.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (fullDate) {
    const day = Number.parseInt(fullDate[1], 10);
    const month = Number.parseInt(fullDate[2], 10);
    const yearValue = fullDate[3] ? Number.parseInt(fullDate[3], 10) : now.getFullYear();
    const year = yearValue < 100 ? 2000 + yearValue : yearValue;

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return { dueDate: toDateInputValue(date), warnings };
    }
  }

  const dayMatch = text.match(/\bdia\s+(\d{1,2})(?:\s+(proximo))?\b/);
  if (!dayMatch) {
    return { warnings };
  }

  const desiredDay = Number.parseInt(dayMatch[1], 10);
  if (!Number.isInteger(desiredDay) || desiredDay < 1 || desiredDay > 31) {
    return { warnings };
  }

  const inferred = new Date(now.getFullYear(), now.getMonth(), desiredDay);

  if (desiredDay < now.getDate()) {
    inferred.setMonth(inferred.getMonth() + 1);
  }

  if (inferred.getDate() !== desiredDay) {
    inferred.setDate(0);
    warnings.push("A data informada não existe neste mês. Ajuste antes de confirmar.");
  }

  if (dayMatch[2]) {
    warnings.push("O mês do vencimento foi inferido automaticamente. Confirme antes de criar.");
  }

  return {
    dueDate: toDateInputValue(inferred),
    warnings,
  };
}

function extractTitle(input: NormalizedInput, intentType: AssistedIntentType): string | undefined {
  if (intentType !== "create_quote" && intentType !== "create_reminder") {
    return undefined;
  }

  const titlePatterns = [
    /\breferente\s+a\s+(?:um|uma)?\s*([^,.\n]+?)(?=\s+(?:com\s+vencimento|vencimento|hoje|amanh[ãa]|dia\s+\d{1,2})|$)/i,
    /\bsobre\s+([^,.\n]+?)(?=\s+(?:com\s+vencimento|vencimento|hoje|amanh[ãa]|dia\s+\d{1,2})|$)/i,
    /\bservi[cç]o\s+de\s+([^,.\n]+?)(?=\s+(?:com\s+vencimento|vencimento|hoje|amanh[ãa]|dia\s+\d{1,2})|$)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = input.trimmed.match(pattern);
    if (!match?.[1]) {
      continue;
    }

    const cleaned = match[1]
      .replace(/^(?:de|do|da|dos|das|um|uma|o|a)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length > 0) {
      return cleaned.slice(0, 120);
    }
  }

  if (intentType === "create_reminder") {
    const fallback = input.trimmed
      .replace(/\blembrete\b/gi, "")
      .replace(/\blembrar\b/gi, "")
      .replace(/\bde\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (fallback.length > 0) {
      return fallback.slice(0, 120);
    }
  }

  return undefined;
}

function getUniqueWarnings(warnings: string[]): string[] {
  const unique = new Set<string>();

  for (const warning of warnings) {
    const normalized = warning.trim();
    if (normalized.length === 0) {
      continue;
    }

    unique.add(normalized);
  }

  return Array.from(unique);
}

function buildWarnings(params: {
  detectedIntent: DetectedIntent;
  amountInCents?: number;
  clientNameCandidate?: string;
  dueDate?: string;
  reminderTitle?: string;
  dueDateWarnings: string[];
}): string[] {
  const warnings: string[] = [...params.detectedIntent.warnings, ...params.dueDateWarnings];

  if (params.detectedIntent.intentType === "unknown") {
    warnings.push("Não identifiquei a intenção com segurança.");
  }

  if (
    (params.detectedIntent.intentType === "create_charge" ||
      params.detectedIntent.intentType === "create_quote") &&
    params.amountInCents === undefined
  ) {
    warnings.push("Não identifiquei o valor com segurança.");
  }

  if (params.detectedIntent.intentType === "create_charge" && params.dueDate === undefined) {
    warnings.push("Não identifiquei a data de vencimento.");
  }

  if (
    params.detectedIntent.intentType === "create_reminder" &&
    (!params.reminderTitle || params.reminderTitle.trim().length === 0)
  ) {
    warnings.push("Não identifiquei um título claro para o lembrete.");
  }

  if (
    (params.detectedIntent.intentType === "create_charge" ||
      params.detectedIntent.intentType === "create_quote") &&
    params.clientNameCandidate === undefined
  ) {
    warnings.push("Não identifiquei o cliente com segurança.");
  }

  return getUniqueWarnings(warnings);
}

function computeConfidence(
  intentType: AssistedIntentType,
  extractedFields: ParsedAssistedIntent["extractedFields"]
): AssistedIntentConfidence {
  if (intentType === "unknown") {
    return "low";
  }

  if (intentType === "create_charge") {
    const score =
      Number(extractedFields.amountInCents !== undefined) +
      Number(extractedFields.dueDate !== undefined) +
      Number(extractedFields.clientNameCandidate !== undefined);

    if (score >= 3) return "high";
    if (score >= 1) return "medium";
    return "low";
  }

  if (intentType === "create_quote") {
    const score =
      Number(extractedFields.amountInCents !== undefined) +
      Number(extractedFields.clientNameCandidate !== undefined) +
      Number(extractedFields.reminderTitle !== undefined);

    if (score >= 3) return "high";
    if (score >= 1) return "medium";
    return "low";
  }

  if (intentType === "create_reminder") {
    if (extractedFields.reminderTitle) {
      return "high";
    }

    return "medium";
  }

  return "low";
}

function buildInterpretationResult(params: {
  input: NormalizedInput;
  detectedIntent: DetectedIntent;
  extractedFields: ParsedAssistedIntent["extractedFields"];
  warnings: string[];
}): ParsedAssistedIntent {
  return {
    rawText: params.input.raw,
    intentType: params.detectedIntent.intentType,
    confidence: computeConfidence(params.detectedIntent.intentType, params.extractedFields),
    extractedFields: params.extractedFields,
    warnings: getUniqueWarnings(params.warnings),
  };
}

export function parseTextInputIntent(rawText: string): ParsedAssistedIntent {
  const input = normalizeInput(rawText);

  if (input.trimmed.length < 3) {
    return {
      rawText,
      intentType: "unknown",
      confidence: "low",
      extractedFields: {},
      warnings: ["Escreva uma instrução mais completa para interpretar com segurança."],
    };
  }

  const detectedIntent = detectIntent(input);
  const amountInCents = extractAmount(input);
  const clientNameCandidate = extractClient(input);
  const dueDateExtraction = extractDueDate(input);
  const reminderTitle = extractTitle(input, detectedIntent.intentType);

  const extractedFields: ParsedAssistedIntent["extractedFields"] = {
    clientNameCandidate,
    amountInCents,
    dueDate: dueDateExtraction.dueDate,
    reminderTitle,
  };

  const warnings = buildWarnings({
    detectedIntent,
    amountInCents,
    clientNameCandidate,
    dueDate: dueDateExtraction.dueDate,
    reminderTitle,
    dueDateWarnings: dueDateExtraction.warnings,
  });

  return buildInterpretationResult({
    input,
    detectedIntent,
    extractedFields,
    warnings,
  });
}
