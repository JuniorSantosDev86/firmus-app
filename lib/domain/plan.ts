export const PLAN_TIERS = ["free", "plus", "pro"] as const;

export type PlanTier = (typeof PLAN_TIERS)[number];

export const PLAN_FEATURE_KEYS = [
  "nfse_access",
  "das_access",
  "automation_rules_access",
] as const;

export type PlanFeatureKey = (typeof PLAN_FEATURE_KEYS)[number];

export const PLAN_LIMIT_KEYS = ["max_templates"] as const;

export type PlanLimitKey = (typeof PLAN_LIMIT_KEYS)[number];

export type PlanLimitValue = number | null;

export type PlanEntitlements = {
  tier: PlanTier;
  features: Record<PlanFeatureKey, boolean>;
  limits: Record<PlanLimitKey, PlanLimitValue>;
};

export const PLAN_LABELS: Record<PlanTier, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
};

export const PLAN_FEATURE_LABELS: Record<PlanFeatureKey, string> = {
  nfse_access: "NFSe",
  das_access: "Acompanhamento de DAS",
  automation_rules_access: "Regras de automação",
};

export const PLAN_LIMIT_LABELS: Record<PlanLimitKey, string> = {
  max_templates: "Modelos",
};

export const PLAN_ENTITLEMENTS: Record<PlanTier, PlanEntitlements> = {
  free: {
    tier: "free",
    features: {
      nfse_access: false,
      das_access: false,
      automation_rules_access: false,
    },
    limits: {
      max_templates: 1,
    },
  },
  plus: {
    tier: "plus",
    features: {
      nfse_access: true,
      das_access: true,
      automation_rules_access: false,
    },
    limits: {
      max_templates: 5,
    },
  },
  pro: {
    tier: "pro",
    features: {
      nfse_access: true,
      das_access: true,
      automation_rules_access: true,
    },
    limits: {
      max_templates: null,
    },
  },
};
