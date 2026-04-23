import { PLAN_TIERS, type PlanTier } from "@/lib/domain/plan";

export const PLAN_STATE_STORAGE_KEY = "firmus.plan-state";
export const PLAN_STATE_UPDATED_EVENT = "firmus:plan-state-updated";

type StoredPlanState = {
  tier: PlanTier;
};

const DEFAULT_PLAN_TIER: PlanTier = "pro";

function isPlanTier(value: unknown): value is PlanTier {
  return typeof value === "string" && PLAN_TIERS.includes(value as PlanTier);
}

function normalizePlanState(raw: unknown): StoredPlanState {
  if (typeof raw !== "object" || raw === null) {
    return { tier: DEFAULT_PLAN_TIER };
  }

  const data = raw as Record<string, unknown>;

  return {
    tier: isPlanTier(data.tier) ? data.tier : DEFAULT_PLAN_TIER,
  };
}

function persistPlanState(state: StoredPlanState): StoredPlanState {
  window.localStorage.setItem(PLAN_STATE_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(PLAN_STATE_UPDATED_EVENT, { detail: state }));
  return state;
}

export function readStoredPlanState(): StoredPlanState {
  if (typeof window === "undefined") {
    return { tier: DEFAULT_PLAN_TIER };
  }

  const raw = window.localStorage.getItem(PLAN_STATE_STORAGE_KEY);
  if (!raw) {
    return { tier: DEFAULT_PLAN_TIER };
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizePlanState(parsed);
    persistPlanState(normalized);
    return normalized;
  } catch {
    return { tier: DEFAULT_PLAN_TIER };
  }
}

export function readCurrentPlanTier(): PlanTier {
  return readStoredPlanState().tier;
}

export function writeCurrentPlanTier(tier: PlanTier): StoredPlanState {
  const normalized = normalizePlanState({ tier });

  if (typeof window === "undefined") {
    return normalized;
  }

  return persistPlanState(normalized);
}
