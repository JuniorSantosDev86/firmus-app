import type {
  NormalizedInput,
  TextFieldExtractionResult,
} from "./types";
import { stripLeadingArticles } from "./normalization";

function cleanupText(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[.,;:!?]+$/g, "").trim();
}

function stripClientTrailingContext(value: string): string {
  let cleaned = value;

  cleaned = cleaned.replace(
    /\s*,?\s*(?:depois\s+de\s+amanh[ãa](?=\s|$|[.,;:!?])|amanh[ãa](?=\s|$|[.,;:!?])|hoje)\b.*$/i,
    ""
  );
  cleaned = cleaned.replace(/\s+(?:em|daqui\s+a)\s+\d{1,2}\s+dias?\b.*$/i, "");
  cleaned = cleaned.replace(/\s+dia\s+\d{1,2}(?:[/-]\d{1,2}(?:[/-]\d{2,4})?)?\b.*$/i, "");
  cleaned = cleaned.replace(/\s+de\s+r\$\s*[\d.,]+.*$/i, "");
  cleaned = cleaned.replace(/\s+de\s+\d+(?:[.,]\d+)?\s*(?:reais|real)\b.*$/i, "");
  cleaned = cleaned.replace(/\s+(?:com\s+vencimento|vencimento)\b.*$/i, "");

  return cleanupText(cleaned);
}

export function extractClient(input: NormalizedInput): string | undefined {
  const pattern =
    /\b(?:para|pra|pro|com\s+o\s+cliente|cliente|com)\s+(.+?)(?=(?:,|;|\.|\breferente\b|\bsobre\b|\bservi[cç]o\b|\bcom\s+vencimento\b|\bvencimento\b|\bhoje\b|\bamanh[ãa](?=\s|$|[.,;:!?])|\bdepois\s+de\s+amanh[ãa](?=\s|$|[.,;:!?])|\bdia\s+\d{1,2}\b|\bem\s+\d{1,2}\s+dias\b|\bdaqui\s+a\s+\d{1,2}\s+dias\b|\bde\s+r\$\s*[\d.,]*|\bde\s+\d+(?:[.,]\d+)?\s*(?:reais|real)\b|\bpara\s+\d{1,2}[/-]\d{1,2}\b|$))/gi;

  for (const match of input.trimmed.matchAll(pattern)) {
    if (!match[1]) {
      continue;
    }

    const normalized = stripClientTrailingContext(
      stripLeadingArticles(match[1])
    );
    if (normalized.length < 2) {
      continue;
    }

    if (/^(hoje|amanha|depois de amanha|vencimento)$/i.test(normalized)) {
      continue;
    }

    return normalized.slice(0, 120);
  }

  return undefined;
}

export function extractTitleAndDescription(
  input: NormalizedInput,
  intentType: "create_quote" | "create_reminder" | "create_charge" | "use_template" | "unknown"
): TextFieldExtractionResult {
  if (intentType !== "create_quote" && intentType !== "create_reminder") {
    return {};
  }

  const titlePatterns = [
    /\breferente\s+a\s+(?:um|uma)?\s*([^,.\n]+?)(?=\s+(?:com\s+vencimento|vencimento|hoje|amanh[ãa]|dia\s+\d{1,2}|em\s+\d+\s+dias|de\s+r\$\s*[\d.,]*|de\s+\d+(?:[.,]\d+)?\s*(?:reais|real)|para\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|$))/i,
    /\bsobre\s+([^,.\n]+?)(?=\s+(?:com\s+vencimento|vencimento|hoje|amanh[ãa]|dia\s+\d{1,2}|em\s+\d+\s+dias|de\s+r\$\s*[\d.,]*|de\s+\d+(?:[.,]\d+)?\s*(?:reais|real)|para\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|$))/i,
    /\bservi[cç]o\s+de\s+([^,.\n]+?)(?=\s+(?:com\s+vencimento|vencimento|hoje|amanh[ãa]|dia\s+\d{1,2}|em\s+\d+\s+dias|de\s+r\$\s*[\d.,]*|de\s+\d+(?:[.,]\d+)?\s*(?:reais|real)|para\s+\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|$))/i,
    /\bassunto\s+([^,.\n]+)$/i,
  ];

  for (const pattern of titlePatterns) {
    const match = input.trimmed.match(pattern);
    if (!match?.[1]) {
      continue;
    }

    const title = cleanupText(
      match[1].replace(/^(?:de|do|da|dos|das|um|uma|o|a)\s+/i, "")
    ).slice(0, 120);

    if (title.length === 0) {
      continue;
    }

    return {
      titleCandidate: title,
      descriptionCandidate: intentType === "create_reminder" ? title : undefined,
    };
  }

  if (intentType === "create_reminder") {
    const fallback = cleanupText(
      input.trimmed
        .replace(/\blembrete\b/gi, "")
        .replace(/\blembrar\b/gi, "")
        .replace(/\bfollow\s*-?\s*up\b/gi, "")
        .replace(/\bcom\s+[^,.\n]+$/i, "")
        .replace(/\b(?:hoje|amanh[ãa]|depois\s+de\s+amanh[ãa])\b/gi, "")
        .replace(/\b(?:dia\s+\d{1,2}|em\s+\d{1,2}\s+dias|daqui\s+a\s+\d{1,2}\s+dias)\b/gi, "")
        .replace(/\s{2,}/g, " ")
    );

    if (fallback.length > 0) {
      return {
        titleCandidate: fallback.slice(0, 120),
        descriptionCandidate: fallback.slice(0, 240),
      };
    }
  }

  return {};
}
