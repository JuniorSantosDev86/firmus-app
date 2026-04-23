import {
  PLAN_ENTITLEMENTS,
  PLAN_FEATURE_KEYS,
  PLAN_FEATURE_LABELS,
  PLAN_LABELS,
  PLAN_LIMIT_LABELS,
  type PlanEntitlements,
  type PlanFeatureKey,
  type PlanLimitKey,
  type PlanTier,
} from "@/lib/domain/plan";
import { getTemplates } from "@/lib/template-storage";
import { readCurrentPlanTier, writeCurrentPlanTier } from "@/lib/storage/plan-state";

export type PlanUsageSnapshot = {
  templatesCount: number;
};

export type FeatureAccessState = {
  feature: PlanFeatureKey;
  label: string;
  allowed: boolean;
  blocked: boolean;
  upgradeSuggested: boolean;
  currentPlan: PlanTier;
  requiredPlan: PlanTier;
  reason: string | null;
};

export type LimitAccessState = {
  key: PlanLimitKey;
  label: string;
  allowed: boolean;
  blocked: boolean;
  upgradeSuggested: boolean;
  currentPlan: PlanTier;
  limit: number | null;
  currentUsage: number;
  remaining: number | null;
  reason: string | null;
};

const PLAN_ORDER: Record<PlanTier, number> = {
  free: 0,
  plus: 1,
  pro: 2,
};

const FEATURE_MINIMUM_PLAN: Record<PlanFeatureKey, PlanTier> = {
  nfse_access: "plus",
  das_access: "plus",
  automation_rules_access: "pro",
};

function formatPlanLabel(tier: PlanTier): string {
  return PLAN_LABELS[tier];
}

function resolveRequiredPlan(feature: PlanFeatureKey): PlanTier {
  return FEATURE_MINIMUM_PLAN[feature];
}

export function resolvePlanUsageSnapshot(): PlanUsageSnapshot {
  return {
    templatesCount: getTemplates().length,
  };
}

export function getCurrentPlanTier(): PlanTier {
  return readCurrentPlanTier();
}

export function setCurrentPlanTier(tier: PlanTier): PlanTier {
  return writeCurrentPlanTier(tier).tier;
}

export function getPlanEntitlements(tier: PlanTier = getCurrentPlanTier()): PlanEntitlements {
  return PLAN_ENTITLEMENTS[tier];
}

export function isFeatureEnabled(
  feature: PlanFeatureKey,
  tier: PlanTier = getCurrentPlanTier()
): boolean {
  return getPlanEntitlements(tier).features[feature];
}

export function getFeatureAccessState(
  feature: PlanFeatureKey,
  tier: PlanTier = getCurrentPlanTier()
): FeatureAccessState {
  const allowed = isFeatureEnabled(feature, tier);
  const requiredPlan = resolveRequiredPlan(feature);

  return {
    feature,
    label: PLAN_FEATURE_LABELS[feature],
    allowed,
    blocked: !allowed,
    upgradeSuggested: !allowed,
    currentPlan: tier,
    requiredPlan,
    reason: allowed
      ? null
      : `Recurso disponível a partir do plano ${formatPlanLabel(requiredPlan)}.`,
  };
}

function resolveLimitUsage(key: PlanLimitKey, usage: PlanUsageSnapshot): number {
  if (key === "max_templates") {
    return usage.templatesCount;
  }

  return 0;
}

export function getLimitAccessState(
  key: PlanLimitKey,
  options?: {
    tier?: PlanTier;
    usage?: PlanUsageSnapshot;
  }
): LimitAccessState {
  const tier = options?.tier ?? getCurrentPlanTier();
  const usage = options?.usage ?? resolvePlanUsageSnapshot();
  const limit = getPlanEntitlements(tier).limits[key];
  const currentUsage = resolveLimitUsage(key, usage);
  const allowed = limit === null || currentUsage < limit;

  return {
    key,
    label: PLAN_LIMIT_LABELS[key],
    allowed,
    blocked: !allowed,
    upgradeSuggested: !allowed,
    currentPlan: tier,
    limit,
    currentUsage,
    remaining: limit === null ? null : Math.max(limit - currentUsage, 0),
    reason: allowed ? null : `Você atingiu o limite de ${PLAN_LIMIT_LABELS[key].toLowerCase()} do seu plano atual.`,
  };
}

export function getTemplateCreationAccessState(options?: {
  tier?: PlanTier;
  usage?: PlanUsageSnapshot;
}): LimitAccessState {
  return getLimitAccessState("max_templates", options);
}

export function getPlanOverview(tier: PlanTier = getCurrentPlanTier()) {
  const usage = resolvePlanUsageSnapshot();
  const entitlements = getPlanEntitlements(tier);

  return {
    tier,
    label: formatPlanLabel(tier),
    entitlements,
    usage,
    enabledFeatures: PLAN_FEATURE_KEYS.filter((feature) => entitlements.features[feature]).map(
      (feature) => getFeatureAccessState(feature, tier)
    ),
    blockedFeatures: PLAN_FEATURE_KEYS.filter((feature) => !entitlements.features[feature]).map(
      (feature) => getFeatureAccessState(feature, tier)
    ),
    limits: [
      getLimitAccessState("max_templates", {
        tier,
        usage,
      }),
    ],
  };
}

export function isPlanTierAtLeast(target: PlanTier, current: PlanTier = getCurrentPlanTier()): boolean {
  return PLAN_ORDER[current] >= PLAN_ORDER[target];
}
