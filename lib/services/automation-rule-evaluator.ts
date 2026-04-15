import { getChargeStatus } from "@/lib/charge-status";
import { getCharges } from "@/lib/charge-storage";
import type { Charge } from "@/lib/domain/charge";
import type {
  AutomationDerivedTriggerType,
  AutomationRule,
  AutomationRuleActionPreview,
  AutomationRuleCandidate,
  AutomationRuleEvaluationResult,
  AutomationRuleMatch,
} from "@/lib/domain/automation-rule";
import { getTimelineEvents } from "@/lib/storage/timeline-events";
import { listAutomationRules } from "@/lib/services/automation-rule-service";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toDateKeyFromIso(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function toDateKeyFromDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toIsoDateFromDateKey(dateKey: string): string {
  return `${dateKey}T00:00:00.000Z`;
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const baseMs = new Date(`${dateKey}T00:00:00.000Z`).getTime();
  return new Date(baseMs + days * DAY_IN_MS).toISOString().slice(0, 10);
}

function isChargeDueSoon(chargeDueDate: string, referenceDate: Date, daysAhead: number): boolean {
  const dueDateKey = toDateKeyFromIso(chargeDueDate);
  if (dueDateKey === null) {
    return false;
  }

  const referenceDateKey = toDateKeyFromDate(referenceDate);
  const maxDateKey = addDaysToDateKey(referenceDateKey, daysAhead);

  return dueDateKey >= referenceDateKey && dueDateKey <= maxDateKey;
}

function toRuleMatchId(ruleId: string, candidate: AutomationRuleCandidate): string {
  if (candidate.sourceType === "event") {
    return `${ruleId}:event:${candidate.event.id}`;
  }

  return `${ruleId}:derived:${candidate.conditionType}:${candidate.charge.id}`;
}

function buildActionPreview(
  rule: AutomationRule,
  candidate: AutomationRuleCandidate
): AutomationRuleActionPreview {
  const titlePrefix = rule.actionConfig.titlePrefix ?? "Lembrete automático";

  if (candidate.sourceType === "event") {
    if (candidate.event.type === "quote_approved") {
      return {
        actionType: rule.actionType,
        summary: `Prévia para orçamento aprovado (${candidate.event.entityId}).`,
        reminderPreview: {
          title: `${titlePrefix}: revisar orçamento aprovado`,
          quoteId: candidate.event.entityId,
          sourceType: "quote",
        },
      };
    }

    return {
      actionType: rule.actionType,
      summary: `Prévia para evento ${candidate.event.type}.`,
      reminderPreview: {
        title: `${titlePrefix}: acompanhar cobrança`,
        chargeId: candidate.event.entityId,
        sourceType: "charge",
      },
    };
  }

  const dueInDays = rule.actionConfig.dueInDays ?? 0;
  const dueDateKey = addDaysToDateKey(candidate.referenceDate.slice(0, 10), dueInDays);

  return {
    actionType: rule.actionType,
    summary:
      candidate.conditionType === "charge_overdue"
        ? `Prévia para cobrança em atraso (${candidate.charge.id}).`
        : `Prévia para cobrança a vencer (${candidate.charge.id}).`,
    reminderPreview: {
      title:
        candidate.conditionType === "charge_overdue"
          ? `${titlePrefix}: follow-up de cobrança em atraso`
          : `${titlePrefix}: acompanhar cobrança próxima`,
      dueDate: toIsoDateFromDateKey(dueDateKey),
      clientId: candidate.charge.clientId,
      chargeId: candidate.charge.id,
      sourceType: "charge",
    },
  };
}

function toInspectionText(rule: AutomationRule, candidate: AutomationRuleCandidate): string {
  if (candidate.sourceType === "event") {
    return `Regra '${rule.name}' casou com evento '${candidate.event.type}' (${candidate.event.id}).`;
  }

  return `Regra '${rule.name}' casou com condição '${candidate.conditionType}' na cobrança ${candidate.charge.id}.`;
}

function createMatch(rule: AutomationRule, candidate: AutomationRuleCandidate): AutomationRuleMatch {
  const now = new Date().toISOString();

  return {
    id: toRuleMatchId(rule.id, candidate),
    ruleId: rule.id,
    ruleName: rule.name,
    candidate,
    actionPreview: buildActionPreview(rule, candidate),
    matchedAt: now,
    inspection: toInspectionText(rule, candidate),
  };
}

function evaluateEventRule(rule: AutomationRule): AutomationRuleMatch[] {
  if (rule.triggerType !== "event" || !("eventType" in rule.triggerConfig)) {
    return [];
  }

  const eventType = rule.triggerConfig.eventType;
  const events = getTimelineEvents()
    .filter((event) => event.type === eventType)
    .sort((a, b) => b.timestamp - a.timestamp);

  return events.map((event) =>
    createMatch(rule, {
      sourceType: "event",
      event,
    })
  );
}

export function evaluateAutomationRulesForEvent(
  event: {
    id: string;
    type: string;
    timestamp: number;
    entityId: string;
    entityType: "client" | "service" | "quote" | "charge" | "reminder";
    metadata?: Record<string, unknown>;
  },
  rules: AutomationRule[] = listAutomationRules()
): AutomationRuleMatch[] {
  return rules
    .filter((rule) => rule.isActive && rule.triggerType === "event")
    .filter((rule) => "eventType" in rule.triggerConfig && rule.triggerConfig.eventType === event.type)
    .map((rule) =>
      createMatch(rule, {
        sourceType: "event",
        event,
      })
    );
}

function evaluateDerivedConditionRule(
  rule: AutomationRule,
  referenceDate: Date
): AutomationRuleMatch[] {
  if (rule.triggerType !== "derived_condition" || !("conditionType" in rule.triggerConfig)) {
    return [];
  }

  const charges = getCharges();
  const derivedConfig = rule.triggerConfig;
  const conditionType: AutomationDerivedTriggerType = derivedConfig.conditionType;
  const referenceIso = referenceDate.toISOString();

  return charges
    .filter((charge) => {
      if (charge.status !== "pending") {
        return false;
      }

      if (conditionType === "charge_overdue") {
        return getChargeStatus(charge) === "overdue";
      }

      const daysAhead = derivedConfig.daysAhead ?? 7;
      return isChargeDueSoon(charge.dueDate, referenceDate, daysAhead);
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((charge) =>
      createMatch(rule, {
        sourceType: "derived_condition",
        conditionType,
        charge,
        referenceDate: referenceIso,
      })
    );
}

export function evaluateAutomationRulesForDerivedCondition(
  conditionType: AutomationDerivedTriggerType,
  charge: Charge,
  referenceDate: Date = new Date(),
  rules: AutomationRule[] = listAutomationRules()
): AutomationRuleMatch[] {
  if (charge.status !== "pending") {
    return [];
  }

  const candidateMatchesCondition =
    conditionType === "charge_overdue"
      ? getChargeStatus(charge) === "overdue"
      : isChargeDueSoon(charge.dueDate, referenceDate, 30);

  if (!candidateMatchesCondition) {
    return [];
  }

  return rules
    .filter((rule) => rule.isActive && rule.triggerType === "derived_condition")
    .filter((rule) => {
      if (!("conditionType" in rule.triggerConfig)) {
        return false;
      }

      if (rule.triggerConfig.conditionType !== conditionType) {
        return false;
      }

      if (conditionType === "charge_due_soon") {
        const daysAhead = rule.triggerConfig.daysAhead ?? 7;
        return isChargeDueSoon(charge.dueDate, referenceDate, daysAhead);
      }

      return true;
    })
    .map((rule) =>
      createMatch(rule, {
        sourceType: "derived_condition",
        conditionType,
        charge,
        referenceDate: referenceDate.toISOString(),
      })
    );
}

export function evaluateAutomationRules(
  referenceDate: Date = new Date(),
  rules: AutomationRule[] = listAutomationRules()
): AutomationRuleEvaluationResult {
  const activeRules = rules.filter((rule) => rule.isActive);

  const matches = activeRules
    .flatMap((rule) => {
      if (rule.triggerType === "event") {
        return evaluateEventRule(rule);
      }

      return evaluateDerivedConditionRule(rule, referenceDate);
    })
    .sort((a, b) => a.ruleName.localeCompare(b.ruleName) || a.id.localeCompare(b.id));

  return {
    evaluatedAt: referenceDate.toISOString(),
    activeRulesCount: activeRules.length,
    sourceSnapshot: {
      timelineEventsCount: getTimelineEvents().length,
      chargesCount: getCharges().length,
    },
    matches,
  };
}
