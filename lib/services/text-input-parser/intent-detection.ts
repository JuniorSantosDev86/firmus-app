import type { IntentDetectionResult, NormalizedInput } from "./types";

const ACTION_HINT = /\b(cria|criar|gera|gerar|faz|fazer|monta|montar|prepara|preparar|registra|registrar|agenda|agendar)\b/;

const INTENT_RULES = {
  create_quote: {
    markers: [/\borcamento\b/, /\bproposta\b/, /\bcotacao\b/],
    contextual: [/\bvalor\b/, /\breferente\b/, /\bservico\b/],
  },
  create_charge: {
    markers: [/\bcobranca\b/, /\bcobrar\b/, /\bfatura\b/, /\bboleto\b/],
    contextual: [/\bvencimento\b/, /\bpagar\b/, /\bvalor\b/],
  },
  create_reminder: {
    markers: [/\blembrete\b/, /\blembrar\b/, /\bfollow\s*-?\s*up\b/, /\bavisar\b/],
    contextual: [/\bhoje\b/, /\bamanha\b/, /\bdia\s+\d{1,2}\b/],
  },
} as const;

export function detectIntent(input: NormalizedInput): IntentDetectionResult {
  const text = input.normalized;

  const scores = {
    create_quote: 0,
    create_charge: 0,
    create_reminder: 0,
  };

  for (const [intent, rule] of Object.entries(INTENT_RULES) as Array<
    [keyof typeof INTENT_RULES, (typeof INTENT_RULES)[keyof typeof INTENT_RULES]]
  >) {
    for (const marker of rule.markers) {
      if (marker.test(text)) {
        scores[intent] += 3;
      }
    }

    for (const contextual of rule.contextual) {
      if (contextual.test(text)) {
        scores[intent] += 1;
      }
    }
  }

  if (ACTION_HINT.test(text)) {
    scores.create_quote += 1;
    scores.create_charge += 1;
    scores.create_reminder += 1;
  }

  const ranked = Object.entries(scores)
    .map(([intentType, score]) => ({ intentType, score }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1];

  if (!top || top.score < 3) {
    return {
      intentType: "unknown",
      warnings: ["Não identifiquei a intenção com segurança."],
      certaintyScore: 0,
    };
  }

  if (second && second.score > 0 && top.score - second.score <= 1) {
    return {
      intentType: "unknown",
      warnings: ["A instrução está ambígua entre mais de uma intenção. Ajuste o texto."],
      certaintyScore: 1,
    };
  }

  return {
    intentType: top.intentType as IntentDetectionResult["intentType"],
    warnings: [],
    certaintyScore: top.score,
  };
}
