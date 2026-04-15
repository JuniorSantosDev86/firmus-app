import type {
  AutomationDerivedTriggerType,
  AutomationEventTriggerType,
  AutomationRule,
  AutomationRuleActionConfig,
  AutomationRuleActionType,
  AutomationRuleTriggerConfig,
  AutomationRuleTriggerType,
} from "@/lib/domain/automation-rule";
import {
  AUTOMATION_ACTION_TYPES,
  AUTOMATION_DERIVED_TRIGGER_TYPES,
  AUTOMATION_EVENT_TRIGGER_TYPES,
} from "@/lib/domain/automation-rule";

const STORAGE_KEY = "firmus.automationRules";

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  return fallback;
}

function asIsoString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
}

function asIntegerInRange(
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number
): number {
  if (!Number.isInteger(value)) {
    return fallback;
  }

  const parsed = value as number;
  if (parsed < minimum || parsed > maximum) {
    return fallback;
  }

  return parsed;
}

function asTriggerType(value: unknown): AutomationRuleTriggerType {
  return value === "derived_condition" ? "derived_condition" : "event";
}

function asEventType(value: unknown): AutomationEventTriggerType {
  if (typeof value === "string" && AUTOMATION_EVENT_TRIGGER_TYPES.includes(value as AutomationEventTriggerType)) {
    return value as AutomationEventTriggerType;
  }

  return "quote_approved";
}

function asDerivedConditionType(value: unknown): AutomationDerivedTriggerType {
  if (
    typeof value === "string" &&
    AUTOMATION_DERIVED_TRIGGER_TYPES.includes(value as AutomationDerivedTriggerType)
  ) {
    return value as AutomationDerivedTriggerType;
  }

  return "charge_overdue";
}

function asActionType(value: unknown): AutomationRuleActionType {
  if (typeof value === "string" && AUTOMATION_ACTION_TYPES.includes(value as AutomationRuleActionType)) {
    return value as AutomationRuleActionType;
  }

  return "create_reminder_preview";
}

function normalizeTriggerConfig(
  triggerType: AutomationRuleTriggerType,
  raw: unknown
): AutomationRuleTriggerConfig {
  if (typeof raw !== "object" || raw === null) {
    return triggerType === "event"
      ? { eventType: "quote_approved" }
      : { conditionType: "charge_overdue" };
  }

  const config = raw as Record<string, unknown>;

  if (triggerType === "event") {
    return {
      eventType: asEventType(config.eventType),
    };
  }

  const conditionType = asDerivedConditionType(config.conditionType);
  const triggerConfig: AutomationRuleTriggerConfig = {
    conditionType,
  };

  if (conditionType === "charge_due_soon") {
    triggerConfig.daysAhead = asIntegerInRange(config.daysAhead, 1, 30, 7);
  }

  return triggerConfig;
}

function normalizeActionConfig(raw: unknown): AutomationRuleActionConfig {
  if (typeof raw !== "object" || raw === null) {
    return {};
  }

  const config = raw as Record<string, unknown>;
  const actionConfig: AutomationRuleActionConfig = {};

  const titlePrefix = asNonEmptyString(config.titlePrefix);
  if (titlePrefix !== null) {
    actionConfig.titlePrefix = titlePrefix;
  }

  if (Number.isInteger(config.dueInDays)) {
    actionConfig.dueInDays = asIntegerInRange(config.dueInDays, 0, 60, 0);
  }

  return actionConfig;
}

function generateRuleId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `automation_rule_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

function normalizeRule(raw: unknown): AutomationRule | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const name = asNonEmptyString(data.name);
  if (name === null) {
    return null;
  }

  const now = new Date().toISOString();
  const triggerType = asTriggerType(data.triggerType);

  return {
    id: asNonEmptyString(data.id) ?? generateRuleId(),
    name,
    isActive: asBoolean(data.isActive, true),
    triggerType,
    triggerConfig: normalizeTriggerConfig(triggerType, data.triggerConfig),
    actionType: asActionType(data.actionType),
    actionConfig: normalizeActionConfig(data.actionConfig),
    createdAt: asIsoString(data.createdAt, now),
    updatedAt: asIsoString(data.updatedAt, now),
  };
}

function normalizeRules(raw: unknown): AutomationRule[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeRule(item))
    .filter((rule): rule is AutomationRule => rule !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function saveRules(rules: AutomationRule[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function getAutomationRules(): AutomationRule[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeRules(parsed);
    saveRules(normalized);
    return normalized;
  } catch {
    return [];
  }
}

export function replaceAutomationRules(rules: AutomationRule[]): AutomationRule[] {
  const normalized = normalizeRules(rules);
  saveRules(normalized);
  return normalized;
}
