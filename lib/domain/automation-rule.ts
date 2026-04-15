import type { Charge } from "@/lib/domain/charge";
import type { TimestampedEntity } from "@/lib/domain/common";
import type { TimelineEvent } from "@/lib/domain/timeline-event";

export const AUTOMATION_EVENT_TRIGGER_TYPES = [
  "quote_approved",
  "charge_created",
  "charge_paid",
] as const;

export const AUTOMATION_DERIVED_TRIGGER_TYPES = [
  "charge_overdue",
  "charge_due_soon",
] as const;

export const AUTOMATION_ACTION_TYPES = [
  "create_reminder_candidate",
  "create_reminder_preview",
  "mark_rule_match_for_review",
] as const;

export type AutomationEventTriggerType = (typeof AUTOMATION_EVENT_TRIGGER_TYPES)[number];
export type AutomationDerivedTriggerType = (typeof AUTOMATION_DERIVED_TRIGGER_TYPES)[number];
export type AutomationRuleActionType = (typeof AUTOMATION_ACTION_TYPES)[number];

export type AutomationRuleTriggerType = "event" | "derived_condition";

export type AutomationRuleTriggerConfig =
  | {
      eventType: AutomationEventTriggerType;
    }
  | {
      conditionType: AutomationDerivedTriggerType;
      daysAhead?: number;
    };

export type AutomationRuleActionConfig = {
  titlePrefix?: string;
  dueInDays?: number;
};

export interface AutomationRule extends TimestampedEntity {
  id: string;
  name: string;
  isActive: boolean;
  triggerType: AutomationRuleTriggerType;
  triggerConfig: AutomationRuleTriggerConfig;
  actionType: AutomationRuleActionType;
  actionConfig: AutomationRuleActionConfig;
}

export type AutomationRuleCandidate =
  | {
      sourceType: "event";
      event: TimelineEvent;
    }
  | {
      sourceType: "derived_condition";
      conditionType: AutomationDerivedTriggerType;
      charge: Charge;
      referenceDate: string;
    };

export type AutomationRuleActionPreview = {
  actionType: AutomationRuleActionType;
  summary: string;
  reminderPreview?: {
    title: string;
    dueDate?: string;
    clientId?: string;
    chargeId?: string;
    quoteId?: string;
    sourceType: "charge" | "quote";
  };
};

export type AutomationRuleMatch = {
  id: string;
  ruleId: string;
  ruleName: string;
  candidate: AutomationRuleCandidate;
  actionPreview: AutomationRuleActionPreview;
  matchedAt: string;
  inspection: string;
};

export type AutomationRuleEvaluationResult = {
  evaluatedAt: string;
  activeRulesCount: number;
  sourceSnapshot: {
    timelineEventsCount: number;
    chargesCount: number;
  };
  matches: AutomationRuleMatch[];
};
