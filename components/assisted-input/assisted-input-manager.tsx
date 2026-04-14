"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { AssistedDraftAction } from "@/lib/domain/assisted-input";
import {
  confirmAssistedDraftAction,
  interpretAssistedInput,
  normalizeDraftDueDate,
  validateAssistedDraftAction,
  type AssistedInputInterpretation,
} from "@/lib/services/assisted-input";

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

function getUniqueWarnings(warnings: string[]): string[] {
  const deduped = new Set<string>();

  for (const warning of warnings) {
    const normalized = warning.trim();
    if (normalized.length === 0) {
      continue;
    }

    deduped.add(normalized);
  }

  return Array.from(deduped);
}

function formatMoneyFromCents(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function getIntentLabel(intentType: AssistedInputInterpretation["parsedIntent"]["intentType"]): string {
  if (intentType === "create_quote") return "Criar orçamento";
  if (intentType === "create_reminder") return "Criar lembrete";
  if (intentType === "create_charge") return "Criar cobrança";
  if (intentType === "use_template") return "Sugerir modelo";
  return "Não classificado";
}

function updateDraftPayload(
  current: AssistedDraftAction | null,
  patch: Record<string, unknown>
): AssistedDraftAction | null {
  if (!current) {
    return null;
  }

  return {
    ...current,
    payload: {
      ...current.payload,
      ...patch,
    },
  };
}

export function AssistedInputManager() {
  const [textInput, setTextInput] = useState("");
  const [interpretation, setInterpretation] = useState<AssistedInputInterpretation | null>(null);
  const [draftAction, setDraftAction] = useState<AssistedDraftAction | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const draftValidation = useMemo(() => {
    if (!draftAction) {
      return { canConfirm: false, warnings: [] };
    }

    return validateAssistedDraftAction(draftAction);
  }, [draftAction]);
  const interpretationWarnings = useMemo(
    () => getUniqueWarnings(interpretation?.warnings ?? []),
    [interpretation]
  );
  const validationWarnings = useMemo(
    () => getUniqueWarnings(draftValidation.warnings),
    [draftValidation.warnings]
  );

  function handleInterpret() {
    const next = interpretAssistedInput(textInput);
    setInterpretation(next);
    setDraftAction(next.draftAction);
    setFeedback(null);
  }

  function handleConfirm() {
    if (!draftAction) {
      return;
    }

    const result = confirmAssistedDraftAction(draftAction);
    if (!result.ok) {
      setFeedback({ type: "error", message: result.reason });
      return;
    }

    const entityLabel =
      result.entityType === "reminder"
        ? "Lembrete"
        : result.entityType === "charge"
          ? "Cobrança"
          : "Orçamento";
    setFeedback({
      type: "success",
      message: `${entityLabel} criada com sucesso (${result.entityId.slice(0, 8)}).`,
    });
  }

  const payload = draftAction?.payload ?? {};
  const amountInputValue =
    typeof payload.amountInCents === "number" && Number.isFinite(payload.amountInCents)
      ? (payload.amountInCents / 100).toFixed(2)
      : "";
  const dueDateInputValue = normalizeDraftDueDate(payload.dueDate) ?? "";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Digite sua instrução</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Exemplos: &quot;Criar cobrança para Ana de R$ 250,00 para amanhã&quot; ou &quot;Lembrete de follow-up com Bruno hoje&quot;.
        </p>

        <div className="mt-4 space-y-3">
          <textarea
            value={textInput}
            onChange={(event) => setTextInput(event.target.value)}
            rows={4}
            placeholder="Escreva uma instrução operacional curta..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          <Button type="button" onClick={handleInterpret}>
            Interpretar
          </Button>
        </div>
      </section>

      {interpretation ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">O que entendi</h2>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              Intento: <span className="font-medium text-foreground">{getIntentLabel(interpretation.parsedIntent.intentType)}</span>
            </p>
            <p>
              Confiança: <span className="font-medium text-foreground">{interpretation.parsedIntent.confidence}</span>
            </p>
            <p>
              Cliente:{" "}
              <span className="font-medium text-foreground">
                {interpretation.matchedClient?.name ??
                  interpretation.parsedIntent.extractedFields.clientNameCandidate ??
                  "—"}
              </span>
            </p>
            <p>
              Valor:{" "}
              <span className="font-medium text-foreground">
                {formatMoneyFromCents(interpretation.parsedIntent.extractedFields.amountInCents)}
              </span>
            </p>
            <p>
              Vencimento:{" "}
              <span className="font-medium text-foreground">
                {interpretation.parsedIntent.extractedFields.dueDate ?? "—"}
              </span>
            </p>
            <p>
              Título:{" "}
              <span className="font-medium text-foreground">
                {interpretation.parsedIntent.extractedFields.reminderTitle ?? "—"}
              </span>
            </p>
          </div>

          {interpretationWarnings.length > 0 ? (
            <ul className="mt-4 space-y-1 text-sm text-amber-700">
              {interpretationWarnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>• {warning}</li>
              ))}
            </ul>
          ) : null}

          {draftAction?.actionType === "create_reminder" ? (
            <div className="mt-5 space-y-3 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">Ajuste os campos antes de confirmar</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">Título</label>
                  <input
                    value={typeof payload.title === "string" ? payload.title : ""}
                    onChange={(event) =>
                      setDraftAction((current) =>
                        updateDraftPayload(current, { title: event.target.value })
                      )
                    }
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">Data</label>
                  <input
                    type="date"
                    value={dueDateInputValue}
                    onChange={(event) =>
                      setDraftAction((current) =>
                        updateDraftPayload(current, { dueDate: event.target.value || undefined })
                      )
                    }
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="grid gap-1 sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Cliente</label>
                  <select
                    value={typeof payload.clientId === "string" ? payload.clientId : ""}
                    onChange={(event) =>
                      setDraftAction((current) =>
                        updateDraftPayload(current, {
                          clientId: event.target.value.length > 0 ? event.target.value : undefined,
                        })
                      )
                    }
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="">Sem cliente</option>
                    {interpretation.availableClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : null}

          {draftAction?.actionType === "create_charge" ? (
            <div className="mt-5 space-y-3 rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">Ajuste os campos antes de confirmar</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1 sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Cliente</label>
                  <select
                    value={typeof payload.clientId === "string" ? payload.clientId : ""}
                    onChange={(event) =>
                      setDraftAction((current) =>
                        updateDraftPayload(current, { clientId: event.target.value })
                      )
                    }
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="">Selecione</option>
                    {interpretation.availableClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">Valor (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountInputValue}
                    onChange={(event) => {
                      const parsed = Number(event.target.value);
                      setDraftAction((current) =>
                        updateDraftPayload(current, {
                          amountInCents:
                            Number.isFinite(parsed) && parsed > 0
                              ? Math.round(parsed * 100)
                              : undefined,
                        })
                      );
                    }}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">Vencimento</label>
                  <input
                    type="date"
                    value={dueDateInputValue}
                    onChange={(event) =>
                      setDraftAction((current) =>
                        updateDraftPayload(current, { dueDate: event.target.value || undefined })
                      )
                    }
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {draftAction?.actionType === "suggest_template" ? (
            <p className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Sugestão identificada de uso de modelo. Nenhuma criação automática foi executada.
            </p>
          ) : null}

          {draftAction?.actionType === "none" ? (
            <p className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Nenhuma ação foi preparada. Ajuste o texto e interprete novamente.
            </p>
          ) : null}

          {draftAction && (draftAction.actionType === "create_reminder" || draftAction.actionType === "create_charge") ? (
            <div className="mt-5">
              <Button type="button" onClick={handleConfirm} disabled={!draftValidation.canConfirm}>
                Confirmar criação
              </Button>
            </div>
          ) : null}

          {validationWarnings.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-amber-700">
              {validationWarnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>• {warning}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-5 text-sm text-muted-foreground">
          Entrada assistida pronta para interpretar instruções curtas e mostrar um rascunho antes de criar qualquer ação real.
        </section>
      )}

      {feedback ? (
        <p
          className={
            feedback.type === "success"
              ? "text-sm text-emerald-700"
              : "text-sm text-rose-700"
          }
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
