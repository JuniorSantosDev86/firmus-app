import type { AmountExtractionResult, NormalizedInput } from "./types";

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

export function extractAmount(input: NormalizedInput): AmountExtractionResult {
  const raw = input.trimmed;

  const candidates: Array<{ value: string; score: number; index: number }> = [];

  const explicitCurrency = /r\$\s*([\d.]+(?:,[\d]{1,2})?|[\d]+(?:[.,]\d{1,2})?)/gi;
  for (const match of raw.matchAll(explicitCurrency)) {
    if (match[1]) {
      candidates.push({ value: match[1], score: 100, index: match.index ?? 0 });
    }
  }

  const withReais = /\b(\d+(?:[.,]\d{1,2})?)\s*(?:reais|real)\b/gi;
  for (const match of raw.matchAll(withReais)) {
    if (match[1]) {
      candidates.push({ value: match[1], score: 90, index: match.index ?? 0 });
    }
  }

  const contextual = /\b(?:valor\s+de|no\s+valor\s+de|valor)\s+(\d+(?:[.,]\d{1,2})?)\b/gi;
  for (const match of raw.matchAll(contextual)) {
    if (match[1]) {
      candidates.push({ value: match[1], score: 80, index: match.index ?? 0 });
    }
  }

  const decimalOnly = /\b(\d+[.,]\d{2})\b/g;
  for (const match of raw.matchAll(decimalOnly)) {
    if (match[1]) {
      candidates.push({ value: match[1], score: 60, index: match.index ?? 0 });
    }
  }

  const warnings: string[] = [];
  const parsedCandidates = candidates
    .map((candidate) => ({
      ...candidate,
      parsed: parseMoneyNumber(candidate.value),
    }))
    .filter((candidate) => candidate.parsed !== undefined) as Array<{
    value: string;
    score: number;
    index: number;
    parsed: number;
  }>;

  if (parsedCandidates.length === 0) {
    return { warnings };
  }

  const sorted = [...parsedCandidates].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.index - b.index;
  });

  const picked = sorted[0];
  if (!picked) {
    return { warnings };
  }

  const distinctValues = new Set(parsedCandidates.map((candidate) => candidate.parsed.toFixed(2)));
  if (distinctValues.size > 1) {
    warnings.push("Mais de um valor foi identificado. Revise o valor no rascunho.");
  }

  if (Number.isInteger(picked.parsed) && picked.parsed <= 31 && picked.score < 90) {
    return {
      warnings: ["O número encontrado parece uma data, não um valor monetário."],
    };
  }

  return {
    amountInCents: Math.round(picked.parsed * 100),
    warnings,
  };
}
