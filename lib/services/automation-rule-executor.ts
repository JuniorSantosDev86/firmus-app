import {
  hasAutomationExecutionFingerprint,
  recordAutomationExecution,
} from "@/lib/automation-execution-log-storage";
import type {
  AutomationRule,
  AutomationRuleActionType,
  AutomationRuleCandidate,
  AutomationRuleMatch,
} from "@/lib/domain/automation-rule";
import { evaluateAutomationRulesForEvent } from "@/lib/services/automation-rule-evaluator";
import { listAutomationRules } from "@/lib/services/automation-rule-service";
import { createReminder } from "@/lib/services/reminders";

export type AutomationRuleExecutionStatus =
  | "created"
  | "duplicate"
  | "rule_inactive"
  | "non_executable_action"
  | "missing_reminder_preview"
  | "creation_failed";

export type AutomationRuleExecutionOutcome = {
  matchId: string;
  ruleId: string;
  ruleName: string;
  actionType: AutomationRuleActionType;
  candidateSourceType: AutomationRuleCandidate["sourceType"];
  fingerprint: string;
  status: AutomationRuleExecutionStatus;
  message: string;
  reminderId?: string;
};

export type AutomationRuleExecutionResult = {
  executedAt: string;
  totalMatches: number;
  createdCount: number;
  duplicateCount: number;
  nonExecutableCount: number;
  outcomes: AutomationRuleExecutionOutcome[];
};

function toDateKey(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function toExecutionFingerprint(match: AutomationRuleMatch): string {
  if (match.candidate.sourceType === "event") {
    return `rule:${match.ruleId}:event:${match.candidate.event.id}`;
  }

  const dueDateKey = toDateKey(match.candidate.charge.dueDate) ?? "without_due_date";

  return [
    "rule",
    match.ruleId,
    "derived",
    match.candidate.conditionType,
    match.candidate.charge.id,
    dueDateKey,
  ].join(":");
}

function toNonExecutableMessage(actionType: AutomationRuleActionType): string {
  if (actionType === "create_reminder_preview") {
    return "Ação de prévia não cria lembrete real.";
  }

  return "Ação de revisão não cria lembrete real.";
}

function toRuleMap(rules: AutomationRule[]): Map<string, AutomationRule> {
  return new Map(rules.map((rule) => [rule.id, rule]));
}

function buildReminderDescription(match: AutomationRuleMatch): string {
  if (match.candidate.sourceType === "event") {
    return `Criado automaticamente pela regra '${match.ruleName}' a partir do evento '${match.candidate.event.type}'.`;
  }

  return `Criado automaticamente pela regra '${match.ruleName}' para a condição '${match.candidate.conditionType}'.`;
}

function executeMatch(
  match: AutomationRuleMatch,
  ruleMap: Map<string, AutomationRule>
): AutomationRuleExecutionOutcome {
  const fingerprint = toExecutionFingerprint(match);
  const candidateSourceType = match.candidate.sourceType;

  const currentRule = ruleMap.get(match.ruleId);
  if (!currentRule || !currentRule.isActive) {
    return {
      matchId: match.id,
      ruleId: match.ruleId,
      ruleName: match.ruleName,
      actionType: match.actionPreview.actionType,
      candidateSourceType,
      fingerprint,
      status: "rule_inactive",
      message: "Regra ausente ou inativa no momento da execução.",
    };
  }

  if (match.actionPreview.actionType !== "create_reminder_candidate") {
    return {
      matchId: match.id,
      ruleId: match.ruleId,
      ruleName: match.ruleName,
      actionType: match.actionPreview.actionType,
      candidateSourceType,
      fingerprint,
      status: "non_executable_action",
      message: toNonExecutableMessage(match.actionPreview.actionType),
    };
  }

  if (hasAutomationExecutionFingerprint(fingerprint)) {
    return {
      matchId: match.id,
      ruleId: match.ruleId,
      ruleName: match.ruleName,
      actionType: match.actionPreview.actionType,
      candidateSourceType,
      fingerprint,
      status: "duplicate",
      message: "Execução já registrada para a mesma origem.",
    };
  }

  const reminderPreview = match.actionPreview.reminderPreview;
  if (!reminderPreview) {
    return {
      matchId: match.id,
      ruleId: match.ruleId,
      ruleName: match.ruleName,
      actionType: match.actionPreview.actionType,
      candidateSourceType,
      fingerprint,
      status: "missing_reminder_preview",
      message: "Regra executável sem prévia de lembrete válida.",
    };
  }

  const reminder = createReminder({
    title: reminderPreview.title,
    description: buildReminderDescription(match),
    dueDate: reminderPreview.dueDate,
    clientId:
      reminderPreview.clientId ??
      (match.candidate.sourceType === "derived_condition" ? match.candidate.charge.clientId : undefined),
    chargeId:
      reminderPreview.chargeId ??
      (match.candidate.sourceType === "derived_condition" ? match.candidate.charge.id : undefined),
    quoteId: reminderPreview.quoteId,
    sourceType: "automation_rule",
    sourceRuleId: match.ruleId,
    sourceFingerprint: fingerprint,
  });

  if (!reminder) {
    return {
      matchId: match.id,
      ruleId: match.ruleId,
      ruleName: match.ruleName,
      actionType: match.actionPreview.actionType,
      candidateSourceType,
      fingerprint,
      status: "creation_failed",
      message: "Falha ao criar lembrete automático.",
    };
  }

  recordAutomationExecution({
    fingerprint,
    ruleId: match.ruleId,
    matchId: match.id,
    candidateSourceType,
    executedAt: new Date().toISOString(),
    reminderId: reminder.id,
  });

  return {
    matchId: match.id,
    ruleId: match.ruleId,
    ruleName: match.ruleName,
    actionType: match.actionPreview.actionType,
    candidateSourceType,
    fingerprint,
    status: "created",
    message: "Lembrete automático criado.",
    reminderId: reminder.id,
  };
}

export function executeAutomationRuleMatches(
  matches: AutomationRuleMatch[],
  rules: AutomationRule[] = listAutomationRules()
): AutomationRuleExecutionResult {
  const ruleMap = toRuleMap(rules);
  const outcomes = matches.map((match) => executeMatch(match, ruleMap));

  return {
    executedAt: new Date().toISOString(),
    totalMatches: matches.length,
    createdCount: outcomes.filter((item) => item.status === "created").length,
    duplicateCount: outcomes.filter((item) => item.status === "duplicate").length,
    nonExecutableCount: outcomes.filter((item) => item.status === "non_executable_action").length,
    outcomes,
  };
}

export function executeAutomationRulesForEvent(
  event: {
    id: string;
    type: string;
    timestamp: number;
    entityId: string;
    entityType: "client" | "service" | "quote" | "charge" | "reminder";
    metadata?: Record<string, unknown>;
  },
  rules: AutomationRule[] = listAutomationRules()
): AutomationRuleExecutionResult {
  const matches = evaluateAutomationRulesForEvent(event, rules);
  return executeAutomationRuleMatches(matches, rules);
}
