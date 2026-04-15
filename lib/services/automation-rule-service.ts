import {
  getAutomationRules,
  replaceAutomationRules,
} from "@/lib/automation-rule-storage";
import type {
  AutomationRule,
  AutomationRuleActionConfig,
  AutomationRuleActionType,
  AutomationRuleTriggerConfig,
  AutomationRuleTriggerType,
} from "@/lib/domain/automation-rule";

export type CreateAutomationRuleInput = {
  name: string;
  isActive?: boolean;
  triggerType: AutomationRuleTriggerType;
  triggerConfig: AutomationRuleTriggerConfig;
  actionType: AutomationRuleActionType;
  actionConfig?: AutomationRuleActionConfig;
};

function asNonEmptyString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function generateRuleId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `automation_rule_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

export function listAutomationRules(): AutomationRule[] {
  return getAutomationRules();
}

export function createAutomationRule(input: CreateAutomationRuleInput): AutomationRule | null {
  const name = asNonEmptyString(input.name);
  if (name === null) {
    return null;
  }

  const existing = getAutomationRules();
  const now = new Date().toISOString();

  const rule: AutomationRule = {
    id: generateRuleId(),
    name,
    isActive: input.isActive ?? true,
    triggerType: input.triggerType,
    triggerConfig: input.triggerConfig,
    actionType: input.actionType,
    actionConfig: input.actionConfig ?? {},
    createdAt: now,
    updatedAt: now,
  };

  replaceAutomationRules([rule, ...existing]);
  return rule;
}

export function setAutomationRuleActiveState(
  ruleId: string,
  isActive: boolean
): AutomationRule | null {
  const existing = getAutomationRules();
  const target = existing.find((rule) => rule.id === ruleId);

  if (!target) {
    return null;
  }

  const now = new Date().toISOString();
  const updated: AutomationRule = {
    ...target,
    isActive,
    updatedAt: now,
  };

  const next = existing.map((rule) => (rule.id === ruleId ? updated : rule));
  replaceAutomationRules(next);
  return updated;
}

export function toggleAutomationRule(ruleId: string): AutomationRule | null {
  const target = getAutomationRules().find((rule) => rule.id === ruleId);
  if (!target) {
    return null;
  }

  return setAutomationRuleActiveState(ruleId, !target.isActive);
}
