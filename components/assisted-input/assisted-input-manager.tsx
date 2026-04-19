"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  type AssistedActionDraft,
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

function parseAmountInputToCents(raw: string): number | undefined {
  const cleaned = raw.trim().replace(/\s+/g, "").replace(/[^\d.,]/g, "");
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
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return Math.round(parsed * 100);
}

function getIntentLabel(intentType: AssistedInputInterpretation["parsedIntent"]["intentType"]): string {
  if (intentType === "create_quote") return "Criar orçamento";
  if (intentType === "create_reminder") return "Criar lembrete";
  if (intentType === "create_charge") return "Criar cobrança";
  if (intentType === "use_template") return "Sugerir modelo";
  return "Não classificado";
}

function updateDraftPayload(
  current: AssistedActionDraft | null,
  patch: Record<string, unknown>
): AssistedActionDraft | null {
  if (!current) {
    return null;
  }

  return {
    ...current,
    payload: {
      ...(current.payload as Record<string, unknown>),
      ...patch,
    },
  } as AssistedActionDraft;
}

export function AssistedInputManager() {
  const [textInput, setTextInput] = useState("");
  const [interpretation, setInterpretation] = useState<AssistedInputInterpretation | null>(null);
  const [draftAction, setDraftAction] = useState<AssistedActionDraft | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [chargeAmountInputValue, setChargeAmountInputValue] = useState("");

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
  const missingFields = useMemo(
    () => getUniqueWarnings(interpretation?.parsedIntent.missingFields ?? []),
    [interpretation?.parsedIntent.missingFields]
  );

  function handleInterpret() {
    const next = interpretAssistedInput(textInput);
    setInterpretation(next);
    setDraftAction(next.draftAction);
    if (next.draftAction.actionType === "create_charge") {
      const nextValue =
        typeof next.draftAction.payload.amountInCents === "number" &&
        Number.isFinite(next.draftAction.payload.amountInCents)
          ? (next.draftAction.payload.amountInCents / 100).toFixed(2)
          : "";
      setChargeAmountInputValue(nextValue);
    } else {
      setChargeAmountInputValue("");
    }
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

    setFeedback({
      type: "success",
      message: `${result.message} (${result.entityId.slice(0, 8)}).`,
    });
  }

  const payload = (draftAction?.payload ?? {}) as Record<string, unknown>;
  const amountInputValue =
    typeof payload.amountInCents === "number" && Number.isFinite(payload.amountInCents)
      ? (payload.amountInCents / 100).toFixed(2)
      : "";
  const dueDateInputValue =
    normalizeDraftDueDate(payload.dueDate ?? payload.validUntil) ?? "";

  return (
    <div className="space-y-6">
      <section className="firmus-panel">
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
            className="w-full firmus-textarea"
          />
          <Button type="button" onClick={handleInterpret}>
            Interpretar
          </Button>
        </div>
      </section>

      {interpretation ? (
        <section className="firmus-panel">
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
                {interpretation.parsedIntent.extractedFields.titleCandidate ??
                  interpretation.parsedIntent.extractedFields.reminderTitle ??
                  "—"}
              </span>
            </p>
          </div>

          {missingFields.length > 0 ? (
            <p className="mt-3 text-sm text-[#C2410C]">
              Campos pendentes: {missingFields.join(", ")}.
            </p>
          ) : null}

          {interpretationWarnings.length > 0 ? (
            <ul className="mt-4 space-y-1 text-sm text-[#C2410C]">
              {interpretationWarnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>• {warning}</li>
              ))}
            </ul>
          ) : null}

          {draftAction?.actionType === "create_reminder" ? (
            <div className="mt-5 space-y-3 firmus-subpanel">
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
                    className="firmus-input"
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
                    className="firmus-input"
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
                    className="firmus-input"
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
            <div className="mt-5 space-y-3 firmus-subpanel">
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
                    className="firmus-input"
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
                    type="text"
                    inputMode="decimal"
                    value={chargeAmountInputValue}
                    onChange={(event) => {
                      const nextRawValue = event.target.value;
                      const parsed = parseAmountInputToCents(nextRawValue);
                      setChargeAmountInputValue(nextRawValue);
                      setDraftAction((current) =>
                        updateDraftPayload(current, {
                          amountInCents: typeof parsed === "number" && parsed > 0 ? parsed : undefined,
                        })
                      );
                    }}
                    className="firmus-input"
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
                    className="firmus-input"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {draftAction?.actionType === "create_quote" ? (
            <div className="mt-5 space-y-3 firmus-subpanel">
              <p className="text-sm font-medium text-foreground">Ajuste os campos antes de confirmar</p>
              <div className="grid gap-3 sm:grid-cols-2">
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
                    className="firmus-input"
                  >
                    <option value="">Selecione</option>
                    {interpretation.availableClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1 sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Título/Contexto</label>
                  <input
                    value={typeof payload.title === "string" ? payload.title : ""}
                    onChange={(event) =>
                      setDraftAction((current) =>
                        updateDraftPayload(current, { title: event.target.value })
                      )
                    }
                    className="firmus-input"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">Valor estimado (R$)</label>
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
                            Number.isFinite(parsed) && parsed >= 0
                              ? Math.round(parsed * 100)
                              : undefined,
                        })
                      );
                    }}
                    className="firmus-input"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-muted-foreground">Validade</label>
                  <input
                    type="date"
                    value={dueDateInputValue}
                    onChange={(event) =>
                      setDraftAction((current) =>
                        updateDraftPayload(current, { validUntil: event.target.value || undefined })
                      )
                    }
                    className="firmus-input"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {draftAction?.actionType === "suggest_template" ? (
            <p className="mt-5 rounded-xl border border-dashed border-[#D4DEE8] bg-[#F8FBFF] px-4 py-3 text-sm text-muted-foreground">
              Sugestão identificada de uso de modelo. Nenhuma criação automática foi executada.
            </p>
          ) : null}

          {draftAction?.actionType === "none" ? (
            <p className="mt-5 rounded-xl border border-dashed border-[#D4DEE8] bg-[#F8FBFF] px-4 py-3 text-sm text-muted-foreground">
              Nenhuma ação foi preparada. Ajuste o texto e interprete novamente.
            </p>
          ) : null}

          {draftAction &&
          (draftAction.actionType === "create_reminder" ||
            draftAction.actionType === "create_charge" ||
            draftAction.actionType === "create_quote") ? (
            <div className="mt-5">
              <Button type="button" onClick={handleConfirm} disabled={!draftValidation.canConfirm}>
                Confirmar criação
              </Button>
            </div>
          ) : null}

          {validationWarnings.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-[#C2410C]">
              {validationWarnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>• {warning}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-[#D4DEE8] bg-[#F8FBFF] px-6 py-5 text-sm text-muted-foreground">
          Entrada assistida pronta para interpretar instruções curtas e mostrar um rascunho antes de criar qualquer ação real.
        </section>
      )}

      {feedback ? (
        <p
          className={
            feedback.type === "success"
              ? "text-sm text-[#166534]"
              : "text-sm text-[#B91C1C]"
          }
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
