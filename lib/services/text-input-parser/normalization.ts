import type { NormalizedInput } from "./types";

export function normalizeInput(rawText: string): NormalizedInput {
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

export function uniqueNonEmpty(values: string[]): string[] {
  const unique = new Set<string>();

  for (const value of values) {
    const normalized = value.trim();
    if (normalized.length === 0) {
      continue;
    }

    unique.add(normalized);
  }

  return Array.from(unique);
}

export function stripLeadingArticles(value: string): string {
  return value.replace(/^(?:o|a|os|as|um|uma)\s+/i, "").trim();
}
