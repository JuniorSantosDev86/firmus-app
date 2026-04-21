import type { DateExtractionOptions, DateExtractionResult, NormalizedInput } from "./types";

const PTBR_MONTHS: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

export function extractDueDate(
  input: NormalizedInput,
  options: DateExtractionOptions = {}
): DateExtractionResult {
  const warnings: string[] = [];
  const now = options.referenceDate ? new Date(options.referenceDate) : new Date();
  const text = input.normalized;

  if (text.includes("depois de amanha")) {
    const next = new Date(now);
    next.setDate(now.getDate() + 2);
    return { dueDate: toDateInputValue(next), warnings };
  }

  if (text.includes("amanha")) {
    const next = new Date(now);
    next.setDate(now.getDate() + 1);
    return { dueDate: toDateInputValue(next), warnings };
  }

  if (text.includes("hoje")) {
    return { dueDate: toDateInputValue(now), warnings };
  }

  const inDaysMatch = text.match(/\b(?:daqui\s+a|em)\s+(\d{1,2})\s+dias?\b/);
  if (inDaysMatch?.[1]) {
    const days = Number.parseInt(inDaysMatch[1], 10);
    if (Number.isFinite(days) && days > 0) {
      const next = new Date(now);
      next.setDate(now.getDate() + days);
      return { dueDate: toDateInputValue(next), warnings };
    }
  }

  const explicitDate = input.trimmed.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (explicitDate) {
    const day = Number.parseInt(explicitDate[1], 10);
    const month = Number.parseInt(explicitDate[2], 10);
    const yearValue = explicitDate[3] ? Number.parseInt(explicitDate[3], 10) : now.getFullYear();
    const year = yearValue < 100 ? 2000 + yearValue : yearValue;

    if (month >= 1 && month <= 12 && isValidDateParts(year, month - 1, day)) {
      return { dueDate: toDateInputValue(new Date(year, month - 1, day)), warnings };
    }

    warnings.push("A data informada não é válida. Ajuste antes de confirmar.");
    return { warnings };
  }

  const monthNameDate = text.match(
    /\b(\d{1,2})\s+de\s+(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de\s+(\d{4}))?\b/
  );
  if (monthNameDate) {
    const day = Number.parseInt(monthNameDate[1], 10);
    const month = PTBR_MONTHS[monthNameDate[2]];
    const year = monthNameDate[3] ? Number.parseInt(monthNameDate[3], 10) : now.getFullYear();

    if (month !== undefined && isValidDateParts(year, month, day)) {
      return { dueDate: toDateInputValue(new Date(year, month, day)), warnings };
    }

    warnings.push("A data informada não é válida. Ajuste antes de confirmar.");
    return { warnings };
  }

  const dayMatch = text.match(/\bdia\s+(\d{1,2})(?:\s+(proximo|seguinte))?\b/);
  if (!dayMatch?.[1]) {
    return { warnings };
  }

  const desiredDay = Number.parseInt(dayMatch[1], 10);
  if (!Number.isFinite(desiredDay) || desiredDay < 1 || desiredDay > 31) {
    return { warnings };
  }

  const inferred = new Date(now.getFullYear(), now.getMonth(), desiredDay);
  if (desiredDay < now.getDate()) {
    inferred.setMonth(inferred.getMonth() + 1);
    warnings.push("O mês da data foi inferido automaticamente. Confirme antes de criar.");
  } else if (dayMatch[2]) {
    warnings.push("O mês da data foi inferido automaticamente. Confirme antes de criar.");
  }

  if (inferred.getDate() !== desiredDay) {
    warnings.push("A data informada não existe no mês inferido. Ajuste antes de confirmar.");
    return { warnings };
  }

  return {
    dueDate: toDateInputValue(inferred),
    warnings,
  };
}
