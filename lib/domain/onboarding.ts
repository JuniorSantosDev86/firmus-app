export const ONBOARDING_STEP_KEYS = [
  "business_profile_completed",
  "first_client_created",
  "first_service_created",
  "first_quote_created",
  "first_charge_created",
  "first_template_created",
  "nfse_ready_or_used",
  "das_accessed_or_used",
  "automation_used",
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEP_KEYS)[number];

export type OnboardingStatus = "active" | "completed" | "dismissed";

export type OnboardingStepState = {
  key: OnboardingStepKey;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  completed: boolean;
  optional: boolean;
  skipped: boolean;
  availableInCurrentPlan: boolean;
  completionLabel: string;
  helperText?: string;
};

export type OnboardingProgressSummary = {
  completedCount: number;
  totalSteps: number;
  remainingCount: number;
  completionPercentage: number;
};

export type OnboardingChecklistSnapshot = {
  status: OnboardingStatus;
  progress: OnboardingProgressSummary;
  checklist: OnboardingStepState[];
  nextRecommendedStep: OnboardingStepState | null;
  currentPlanLabel: string;
  isHiddenInDashboard: boolean;
  skippedOptionalStepsCount: number;
};
