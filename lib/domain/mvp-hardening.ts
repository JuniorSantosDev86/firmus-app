export type MVPReadinessStatus = "ready" | "warning" | "blocked";

export type MVPReadinessGroupKey =
  | "auth_and_boundaries"
  | "onboarding_and_first_use"
  | "core_operations"
  | "fiscal_flows"
  | "public_surfaces"
  | "reliability_and_recovery"
  | "consistency_and_usability";

export type MVPReadinessItem = {
  id: string;
  group: MVPReadinessGroupKey;
  label: string;
  status: MVPReadinessStatus;
  description: string;
  blocking: boolean;
  href?: string;
};

export type MVPReadinessSnapshot = {
  status: MVPReadinessStatus;
  summary: string;
  items: MVPReadinessItem[];
  blockingCount: number;
  warningCount: number;
  readyCount: number;
  nextActions: MVPReadinessItem[];
};

export const MVP_READINESS_GROUP_LABELS: Record<MVPReadinessGroupKey, string> = {
  auth_and_boundaries: "Autenticação e fronteiras",
  onboarding_and_first_use: "Onboarding e primeiro uso",
  core_operations: "Operação principal",
  fiscal_flows: "Fluxos fiscais",
  public_surfaces: "Superfícies públicas",
  reliability_and_recovery: "Confiabilidade e recuperação",
  consistency_and_usability: "Consistência e usabilidade",
};
