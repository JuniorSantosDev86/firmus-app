"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AUTOMATION_ACTION_TYPES,
  AUTOMATION_DERIVED_TRIGGER_TYPES,
  AUTOMATION_EVENT_TRIGGER_TYPES,
  type AutomationRuleActionType,
  type AutomationDerivedTriggerType,
  type AutomationEventTriggerType,
  type AutomationRule,
  type AutomationRuleEvaluationResult,
} from "@/lib/domain/automation-rule";
import { evaluateAutomationRules } from "@/lib/services/automation-rule-evaluator";
import {
  executeAutomationRuleMatches,
  type AutomationRuleExecutionResult,
} from "@/lib/services/automation-rule-executor";
import {
  createAutomationRule,
  listAutomationRules,
  toggleAutomationRule,
} from "@/lib/services/automation-rule-service";

const EVENT_LABELS: Record<AutomationEventTriggerType, string> = {
  quote_approved: "Orçamento aprovado",
  charge_created: "Cobrança criada",
  charge_paid: "Cobrança paga",
};

const DERIVED_LABELS: Record<AutomationDerivedTriggerType, string> = {
  charge_overdue: "Cobrança em atraso",
  charge_due_soon: "Cobrança próxima do vencimento",
};

const ACTION_LABELS: Record<AutomationRuleActionType, string> = {
  create_reminder_candidate: "Criar lembrete real",
  create_reminder_preview: "Gerar prévia de lembrete",
  mark_rule_match_for_review: "Marcar correspondência para revisão",
};

type TriggerMode = "event" | "derived_condition";

type RuleFormValues = {
  name: string;
  isActive: boolean;
  triggerType: TriggerMode;
  eventType: AutomationEventTriggerType;
  conditionType: AutomationDerivedTriggerType;
  daysAhead: string;
  actionType: AutomationRuleActionType;
};

const INITIAL_FORM_VALUES: RuleFormValues = {
  name: "",
  isActive: true,
  triggerType: "event",
  eventType: "quote_approved",
  conditionType: "charge_overdue",
  daysAhead: "7",
  actionType: "create_reminder_preview",
};

const INITIAL_EVALUATION: AutomationRuleEvaluationResult = {
  evaluatedAt: "",
  activeRulesCount: 0,
  sourceSnapshot: {
    timelineEventsCount: 0,
    chargesCount: 0,
  },
  matches: [],
};

const INITIAL_EXECUTION_RESULT: AutomationRuleExecutionResult = {
  executedAt: "",
  totalMatches: 0,
  createdCount: 0,
  duplicateCount: 0,
  nonExecutableCount: 0,
  outcomes: [],
};

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "sem data";
  }

  return parsed.toLocaleString("pt-BR");
}

function summarizeTrigger(rule: AutomationRule): string {
  if ("eventType" in rule.triggerConfig) {
    return `Evento: ${EVENT_LABELS[rule.triggerConfig.eventType]}`;
  }

  const base = `Condição: ${DERIVED_LABELS[rule.triggerConfig.conditionType]}`;
  if (rule.triggerConfig.conditionType === "charge_due_soon") {
    return `${base} (até ${rule.triggerConfig.daysAhead ?? 7} dias)`;
  }

  return base;
}

function summarizeAction(rule: AutomationRule): string {
  return `Ação: ${ACTION_LABELS[rule.actionType]}`;
}

export function AutomationRulesManager() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [formValues, setFormValues] = useState<RuleFormValues>(INITIAL_FORM_VALUES);
  const [evaluation, setEvaluation] =
    useState<AutomationRuleEvaluationResult>(INITIAL_EVALUATION);
  const [executionResult, setExecutionResult] =
    useState<AutomationRuleExecutionResult>(INITIAL_EXECUTION_RESULT);

  function refreshRules() {
    setRules(listAutomationRules());
  }

  useEffect(() => {
    queueMicrotask(() => {
      refreshRules();
      setEvaluation(evaluateAutomationRules());
    });
  }, []);

  function updateField<K extends keyof RuleFormValues>(
    key: K,
    value: RuleFormValues[K]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleCreateRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    if (name.length === 0) {
      return;
    }

    const daysAhead = Number.parseInt(formValues.daysAhead, 10);

    const created = createAutomationRule({
      name,
      isActive: formValues.isActive,
      triggerType: formValues.triggerType,
      triggerConfig:
        formValues.triggerType === "event"
          ? {
              eventType: formValues.eventType,
            }
          : {
              conditionType: formValues.conditionType,
              daysAhead:
                formValues.conditionType === "charge_due_soon" && Number.isInteger(daysAhead)
                  ? Math.min(30, Math.max(1, daysAhead))
                  : undefined,
            },
      actionType: formValues.actionType,
    });

    if (!created) {
      return;
    }

    setFormValues(INITIAL_FORM_VALUES);
    refreshRules();
  }

  function handleToggleRule(ruleId: string) {
    const updated = toggleAutomationRule(ruleId);
    if (!updated) {
      return;
    }

    refreshRules();
  }

  function handleEvaluateNow() {
    setEvaluation(evaluateAutomationRules());
  }

  function handleExecuteMatchesNow() {
    const currentEvaluation = evaluateAutomationRules();
    setEvaluation(currentEvaluation);
    setExecutionResult(executeAutomationRuleMatches(currentEvaluation.matches));
  }

  return (
    <div className="space-y-6" data-testid="automation-rules-manager">
      <section className="firmus-panel">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Nova regra</h2>

        <form className="mt-5 space-y-4" onSubmit={handleCreateRule} data-testid="automation-rule-form">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="automation-rule-name" className="text-sm font-medium">
                Nome da regra
              </label>
              <input
                id="automation-rule-name"
                required
                value={formValues.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="firmus-input"
                data-testid="automation-rule-name-input"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="automation-rule-trigger-type" className="text-sm font-medium">
                Tipo de gatilho
              </label>
              <select
                id="automation-rule-trigger-type"
                value={formValues.triggerType}
                onChange={(event) => updateField("triggerType", event.target.value as TriggerMode)}
                className="firmus-input"
                data-testid="automation-rule-trigger-type-select"
              >
                <option value="event">Evento</option>
                <option value="derived_condition">Condição derivada</option>
              </select>
            </div>

            {formValues.triggerType === "event" ? (
              <div className="grid gap-2">
                <label htmlFor="automation-rule-event-type" className="text-sm font-medium">
                  Evento
                </label>
                <select
                  id="automation-rule-event-type"
                  value={formValues.eventType}
                  onChange={(event) =>
                    updateField("eventType", event.target.value as AutomationEventTriggerType)
                  }
                  className="firmus-input"
                  data-testid="automation-rule-event-type-select"
                >
                  {AUTOMATION_EVENT_TRIGGER_TYPES.map((eventType) => (
                    <option key={eventType} value={eventType}>
                      {EVENT_LABELS[eventType]}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <label htmlFor="automation-rule-condition-type" className="text-sm font-medium">
                    Condição
                  </label>
                  <select
                    id="automation-rule-condition-type"
                    value={formValues.conditionType}
                    onChange={(event) =>
                      updateField("conditionType", event.target.value as AutomationDerivedTriggerType)
                    }
                    className="firmus-input"
                    data-testid="automation-rule-condition-type-select"
                  >
                    {AUTOMATION_DERIVED_TRIGGER_TYPES.map((conditionType) => (
                      <option key={conditionType} value={conditionType}>
                        {DERIVED_LABELS[conditionType]}
                      </option>
                    ))}
                  </select>
                </div>

                {formValues.conditionType === "charge_due_soon" ? (
                  <div className="grid gap-2">
                    <label htmlFor="automation-rule-days-ahead" className="text-sm font-medium">
                      Dias à frente
                    </label>
                    <input
                      id="automation-rule-days-ahead"
                      type="number"
                      min={1}
                      max={30}
                      value={formValues.daysAhead}
                      onChange={(event) => updateField("daysAhead", event.target.value)}
                      className="firmus-input"
                      data-testid="automation-rule-days-ahead-input"
                    />
                  </div>
                ) : null}
              </>
            )}

            <div className="grid gap-2">
              <label htmlFor="automation-rule-action-type" className="text-sm font-medium">
                Ação
              </label>
              <select
                id="automation-rule-action-type"
                value={formValues.actionType}
                onChange={(event) =>
                  updateField("actionType", event.target.value as AutomationRuleActionType)
                }
                className="firmus-input"
                data-testid="automation-rule-action-type-select"
              >
                {AUTOMATION_ACTION_TYPES.map((actionType) => (
                  <option key={actionType} value={actionType}>
                    {ACTION_LABELS[actionType]}
                  </option>
                ))}
              </select>
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={formValues.isActive}
                onChange={(event) => updateField("isActive", event.target.checked)}
                data-testid="automation-rule-active-checkbox"
              />
              Ativa na criação
            </label>
          </div>

          <Button type="submit" data-testid="automation-rule-create-button">
            Criar regra
          </Button>
        </form>
      </section>

      <section className="firmus-panel" data-testid="automation-rules-list-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Regras cadastradas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {rules.length === 0
                ? "Nenhuma regra criada ainda."
                : `${rules.length} regra${rules.length === 1 ? "" : "s"} cadastrada${rules.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleEvaluateNow}
            data-testid="automation-rules-evaluate-button"
          >
            Avaliar agora
          </Button>
          <Button
            type="button"
            onClick={handleExecuteMatchesNow}
            data-testid="automation-rules-execute-button"
          >
            Executar correspondências
          </Button>
        </div>

        {rules.length === 0 ? (
          <p className="firmus-empty-state">
            Crie uma regra para começar a avaliar eventos reais e condições derivadas.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {rules.map((rule) => (
              <li key={rule.id} className="firmus-list-card" data-testid={`automation-rule-item-${rule.id}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{rule.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{summarizeTrigger(rule)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{summarizeAction(rule)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Atualizada em {formatDateTime(rule.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        rule.isActive ? "firmus-chip-success" : "firmus-chip-info"
                      }`}
                    >
                      {rule.isActive ? "Ativa" : "Inativa"}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleRule(rule.id)}
                      data-testid={`automation-rule-toggle-${rule.id}`}
                    >
                      {rule.isActive ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="firmus-panel" data-testid="automation-rules-evaluation-panel">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Resultado da avaliação</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Regras ativas: {evaluation.activeRulesCount} | Eventos na timeline: {evaluation.sourceSnapshot.timelineEventsCount} |
          Cobranças: {evaluation.sourceSnapshot.chargesCount}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Última avaliação: {formatDateTime(evaluation.evaluatedAt)}
        </p>
        <div className="mt-3 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground" data-testid="automation-rules-execution-summary">
          <p>Última execução: {formatDateTime(executionResult.executedAt)}</p>
          <p>
            Criados: {executionResult.createdCount} | Duplicados: {executionResult.duplicateCount} |
            Não executáveis: {executionResult.nonExecutableCount}
          </p>
        </div>

        {evaluation.matches.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground" data-testid="automation-rules-empty-matches">
            Nenhuma correspondência encontrada para as regras ativas com os dados atuais.
          </p>
        ) : (
          <ul className="mt-4 space-y-3" data-testid="automation-rules-matches-list">
            {evaluation.matches.map((match) => (
              <li key={match.id} className="firmus-list-card" data-testid={`automation-rule-match-${match.id}`}>
                <p className="text-sm font-medium text-foreground">{match.ruleName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{match.inspection}</p>
                <p className="mt-1 text-sm text-muted-foreground">{match.actionPreview.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
