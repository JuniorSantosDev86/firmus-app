import { ONBOARDING_STEP_KEYS, type OnboardingStepKey } from "@/lib/domain/onboarding";

export const ONBOARDING_STATE_STORAGE_KEY = "firmus.onboarding-state";
export const ONBOARDING_STATE_UPDATED_EVENT = "firmus:onboarding-state-updated";

export type StoredOnboardingState = {
  dismissedAt: string | null;
  hiddenInDashboard: boolean;
  skippedStepKeys: OnboardingStepKey[];
  completedAt: string | null;
};

const DEFAULT_ONBOARDING_STATE: StoredOnboardingState = {
  dismissedAt: null,
  hiddenInDashboard: false,
  skippedStepKeys: [],
  completedAt: null,
};

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function isOnboardingStepKey(value: unknown): value is OnboardingStepKey {
  return typeof value === "string" && ONBOARDING_STEP_KEYS.includes(value as OnboardingStepKey);
}

function normalizeOnboardingState(raw: unknown): StoredOnboardingState {
  if (typeof raw !== "object" || raw === null) {
    return DEFAULT_ONBOARDING_STATE;
  }

  const data = raw as Record<string, unknown>;
  const skippedStepKeys = Array.isArray(data.skippedStepKeys)
    ? Array.from(new Set(data.skippedStepKeys.filter(isOnboardingStepKey)))
    : [];

  return {
    dismissedAt: isIsoDate(data.dismissedAt) ? new Date(data.dismissedAt).toISOString() : null,
    hiddenInDashboard: data.hiddenInDashboard === true,
    skippedStepKeys,
    completedAt: isIsoDate(data.completedAt) ? new Date(data.completedAt).toISOString() : null,
  };
}

function persistOnboardingState(state: StoredOnboardingState): StoredOnboardingState {
  window.localStorage.setItem(ONBOARDING_STATE_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(ONBOARDING_STATE_UPDATED_EVENT, { detail: state }));
  return state;
}

export function readStoredOnboardingState(): StoredOnboardingState {
  if (typeof window === "undefined") {
    return DEFAULT_ONBOARDING_STATE;
  }

  const raw = window.localStorage.getItem(ONBOARDING_STATE_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_ONBOARDING_STATE;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeOnboardingState(parsed);
    persistOnboardingState(normalized);
    return normalized;
  } catch {
    return DEFAULT_ONBOARDING_STATE;
  }
}

export function writeStoredOnboardingState(
  patch: Partial<StoredOnboardingState>
): StoredOnboardingState {
  if (typeof window === "undefined") {
    return normalizeOnboardingState({
      ...DEFAULT_ONBOARDING_STATE,
      ...patch,
    });
  }

  const next = normalizeOnboardingState({
    ...readStoredOnboardingState(),
    ...patch,
  });

  return persistOnboardingState(next);
}

export function dismissOnboarding(): StoredOnboardingState {
  return writeStoredOnboardingState({
    dismissedAt: new Date().toISOString(),
    hiddenInDashboard: true,
  });
}

export function reopenOnboarding(): StoredOnboardingState {
  return writeStoredOnboardingState({
    dismissedAt: null,
    hiddenInDashboard: false,
  });
}

export function skipOnboardingStep(stepKey: OnboardingStepKey): StoredOnboardingState {
  const current = readStoredOnboardingState();

  return writeStoredOnboardingState({
    skippedStepKeys: Array.from(new Set([...current.skippedStepKeys, stepKey])),
  });
}

export function restoreSkippedOnboardingSteps(): StoredOnboardingState {
  return writeStoredOnboardingState({
    skippedStepKeys: [],
  });
}

export function markOnboardingCompleted(): StoredOnboardingState {
  return writeStoredOnboardingState({
    completedAt: new Date().toISOString(),
    hiddenInDashboard: false,
  });
}
