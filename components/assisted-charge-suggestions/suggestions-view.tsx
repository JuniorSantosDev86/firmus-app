"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { AssistedChargeSuggestion } from "@/lib/domain/assisted-charge-suggestion";
import {
  SUGGESTION_REASON_LABELS,
  SUGGESTION_TYPE_LABELS,
  acceptAssistedChargeSuggestion,
  dismissAssistedChargeSuggestion,
  getOpenAssistedChargeSuggestions,
} from "@/lib/services/assisted-charge-suggestions";

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

function formatMoneyFromCents(value?: number): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function formatDateValue(value?: string): string {
  if (!value) {
    return "—";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("pt-BR");
}

export function SuggestionsView() {
  const [suggestions, setSuggestions] = useState<AssistedChargeSuggestion[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [busySuggestionId, setBusySuggestionId] = useState<string | null>(null);

  function refreshSuggestions() {
    setSuggestions(getOpenAssistedChargeSuggestions());
  }

  useEffect(() => {
    queueMicrotask(() => {
      refreshSuggestions();
    });
  }, []);

  function handleDismiss(suggestionId: string) {
    setBusySuggestionId(suggestionId);
    dismissAssistedChargeSuggestion(suggestionId);
    refreshSuggestions();
    setFeedback({ type: "success", message: "Sugestão dispensada." });
    setBusySuggestionId(null);
  }

  function handleAccept(suggestionId: string) {
    setBusySuggestionId(suggestionId);
    const result = acceptAssistedChargeSuggestion(suggestionId);

    if (!result.ok) {
      setFeedback({ type: "error", message: result.reason });
      setBusySuggestionId(null);
      return;
    }

    refreshSuggestions();
    setFeedback({
      type: "success",
      message: `Cobrança criada com sucesso (${result.chargeId.slice(0, 8)}).`,
    });
    setBusySuggestionId(null);
  }

  return (
    <div className="space-y-6">
      <section className="firmus-panel">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Sugestões abertas</h2>

        {suggestions.length === 0 ? (
          <p className="mt-4 firmus-empty-state">
            Nenhuma sugestão disponível no momento.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="firmus-subpanel"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">
                      {SUGGESTION_TYPE_LABELS[suggestion.type]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {suggestion.clientName ?? "Cliente desconhecido"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Valor sugerido: {formatMoneyFromCents(suggestion.suggestedAmountInCents)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vencimento sugerido: {formatDateValue(suggestion.suggestedDueDate)}
                    </p>
                    <p className="text-sm text-foreground">{suggestion.explanation}</p>
                    <div>
                      <p className="text-sm font-medium text-foreground">Motivos</p>
                      <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                        {suggestion.reasonCodes.map((reasonCode) => (
                          <li key={`${suggestion.id}-${reasonCode}`}>• {SUGGESTION_REASON_LABELS[reasonCode]}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAccept(suggestion.id)}
                      disabled={busySuggestionId === suggestion.id}
                    >
                      Criar cobrança
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(suggestion.id)}
                      disabled={busySuggestionId === suggestion.id}
                    >
                      Dispensar
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {feedback ? (
        <p
          className={
            feedback.type === "success" ? "text-sm text-[#166534]" : "text-sm text-[#B91C1C]"
          }
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
