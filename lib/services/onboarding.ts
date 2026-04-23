import { readBusinessProfile } from "@/lib/business-profile-storage";
import { getCharges } from "@/lib/charge-storage";
import type {
  OnboardingChecklistSnapshot,
  OnboardingProgressSummary,
  OnboardingStepKey,
  OnboardingStepState,
  PlanTier,
} from "@/lib/domain";
import { readNFSeRecords } from "@/lib/nfse-storage";
import { readQuoteStore } from "@/lib/quote-storage";
import { readServices } from "@/lib/service-storage";
import { getTemplates } from "@/lib/template-storage";
import { getAutomationExecutionLog } from "@/lib/automation-execution-log-storage";
import { getAutomationRules } from "@/lib/automation-rule-storage";
import { readClients } from "@/lib/client-storage";
import { getCurrentPlanTier, getFeatureAccessState } from "@/lib/services/plan-entitlements";
import {
  markOnboardingCompleted,
  readStoredOnboardingState,
  type StoredOnboardingState,
} from "@/lib/storage/onboarding-state";
import { readDASRecords } from "@/lib/storage/das-records";
import { PLAN_LABELS } from "@/lib/domain/plan";
import { evaluateBusinessProfileNFSeReadiness } from "@/lib/services/nfse/nfse-readiness";

type OnboardingSourceSnapshot = {
  hasBusinessProfile: boolean;
  clientsCount: number;
  servicesCount: number;
  quotesCount: number;
  chargesCount: number;
  templatesCount: number;
  nfseReady: boolean;
  nfseRecordsCount: number;
  dasRecordsCount: number;
  automationRulesCount: number;
  automationExecutionsCount: number;
  currentPlan: PlanTier;
};

type OnboardingStepDefinition = {
  key: OnboardingStepKey;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  optional?: boolean;
  canSkip?: boolean;
  isRelevant: (input: OnboardingSourceSnapshot) => boolean;
  isCompleted: (input: OnboardingSourceSnapshot) => boolean;
  helperText?: (input: OnboardingSourceSnapshot) => string | undefined;
};

function hasMeaningfulBusinessProfile(): boolean {
  const profile = readBusinessProfile();
  if (!profile) {
    return false;
  }

  return profile.businessName.trim().length > 0 && profile.professionalName.trim().length > 0;
}

function resolveOnboardingSourceSnapshot(): OnboardingSourceSnapshot {
  const profile = readBusinessProfile();
  const nfseReadiness = evaluateBusinessProfileNFSeReadiness(profile);

  return {
    hasBusinessProfile: hasMeaningfulBusinessProfile(),
    clientsCount: readClients().length,
    servicesCount: readServices().length,
    quotesCount: readQuoteStore().quotes.length,
    chargesCount: getCharges().length,
    templatesCount: getTemplates().length,
    nfseReady: nfseReadiness.isReady,
    nfseRecordsCount: readNFSeRecords().length,
    dasRecordsCount: readDASRecords().length,
    automationRulesCount: getAutomationRules().length,
    automationExecutionsCount: getAutomationExecutionLog().length,
    currentPlan: getCurrentPlanTier(),
  };
}

const ONBOARDING_STEP_DEFINITIONS: OnboardingStepDefinition[] = [
  {
    key: "business_profile_completed",
    title: "Preencha o perfil da empresa",
    description: "Defina os dados básicos da operação para sustentar os próximos módulos.",
    href: "/business-profile",
    ctaLabel: "Continuar configuração",
    isRelevant: () => true,
    isCompleted: (input) => input.hasBusinessProfile,
  },
  {
    key: "first_client_created",
    title: "Cadastre o primeiro cliente",
    description: "Clientes alimentam orçamentos, cobranças e histórico operacional.",
    href: "/clients",
    ctaLabel: "Abrir clientes",
    isRelevant: () => true,
    isCompleted: (input) => input.clientsCount > 0,
  },
  {
    key: "first_service_created",
    title: "Cadastre o primeiro serviço",
    description: "Monte uma base reutilizável para acelerar propostas futuras.",
    href: "/services",
    ctaLabel: "Abrir serviços",
    isRelevant: () => true,
    isCompleted: (input) => input.servicesCount > 0,
  },
  {
    key: "first_quote_created",
    title: "Crie o primeiro orçamento",
    description: "Valide o fluxo comercial com um documento real da operação.",
    href: "/quotes",
    ctaLabel: "Abrir orçamentos",
    isRelevant: () => true,
    isCompleted: (input) => input.quotesCount > 0,
  },
  {
    key: "first_charge_created",
    title: "Registre a primeira cobrança",
    description: "Complete o ciclo operacional com um título real para acompanhar recebimento.",
    href: "/charges",
    ctaLabel: "Abrir cobranças",
    isRelevant: () => true,
    isCompleted: (input) => input.chargesCount > 0,
  },
  {
    key: "first_template_created",
    title: "Salve um modelo de mensagem",
    description: "Reduza repetição com uma mensagem pronta para uso recorrente.",
    href: "/templates",
    ctaLabel: "Abrir modelos",
    optional: true,
    canSkip: true,
    isRelevant: (input) => input.quotesCount > 0 || input.chargesCount > 0 || input.templatesCount > 0,
    isCompleted: (input) => input.templatesCount > 0,
  },
  {
    key: "nfse_ready_or_used",
    title: "Prepare a operação fiscal",
    description: "Revise a prontidão de NFSe para não travar a emissão quando precisar.",
    href: "/nfse",
    ctaLabel: "Abrir NFSe",
    optional: true,
    canSkip: true,
    isRelevant: (input) =>
      input.nfseRecordsCount > 0 ||
      (input.chargesCount > 0 &&
        getFeatureAccessState("nfse_access", input.currentPlan).allowed),
    isCompleted: (input) => input.nfseRecordsCount > 0 || input.nfseReady,
    helperText: (input) =>
      input.nfseRecordsCount > 0
        ? "Você já registrou preparação ou uso real de NFSe."
        : "Disponível no seu plano atual.",
  },
  {
    key: "das_accessed_or_used",
    title: "Abra o acompanhamento de DAS",
    description: "Use o painel fiscal quando a rotina tributária entrar no seu fluxo.",
    href: "/das",
    ctaLabel: "Abrir DAS",
    optional: true,
    canSkip: true,
    isRelevant: (input) =>
      input.dasRecordsCount > 0 ||
      (input.chargesCount > 0 &&
        getFeatureAccessState("das_access", input.currentPlan).allowed),
    isCompleted: (input) => input.dasRecordsCount > 0,
    helperText: (input) =>
      input.dasRecordsCount > 0 ? "Há registros fiscais salvos no workspace." : "Disponível no seu plano atual.",
  },
  {
    key: "automation_used",
    title: "Ative uma automação útil",
    description: "Adicione uma regra simples quando a base operacional já estiver rodando.",
    href: "/automation-rules",
    ctaLabel: "Abrir automações",
    optional: true,
    canSkip: true,
    isRelevant: (input) =>
      input.automationRulesCount > 0 ||
      input.automationExecutionsCount > 0 ||
      ((input.quotesCount > 0 || input.chargesCount > 0) &&
        getFeatureAccessState("automation_rules_access", input.currentPlan).allowed),
    isCompleted: (input) => input.automationRulesCount > 0 || input.automationExecutionsCount > 0,
    helperText: (input) =>
      input.automationRulesCount > 0 || input.automationExecutionsCount > 0
        ? "Já existe uso real de automação no workspace."
        : "Disponível no seu plano atual.",
  },
];

function buildCompletionLabel(step: OnboardingStepState): string {
  if (step.completed) {
    return "Etapa concluída";
  }

  if (step.optional) {
    return "Etapa opcional";
  }

  return "Etapa pendente";
}

function buildChecklist(
  source: OnboardingSourceSnapshot,
  onboardingState: StoredOnboardingState
): OnboardingStepState[] {
  return ONBOARDING_STEP_DEFINITIONS.filter((step) => step.isRelevant(source))
    .filter((step) => !(step.canSkip && onboardingState.skippedStepKeys.includes(step.key)))
    .map((step) => {
      const completed = step.isCompleted(source);

      return {
        key: step.key,
        title: step.title,
        description: step.description,
        href: step.href,
        ctaLabel: step.ctaLabel,
        completed,
        optional: step.optional === true,
        skipped: false,
        availableInCurrentPlan: true,
        completionLabel: "",
        helperText: step.helperText?.(source),
      };
    })
    .map((step) => ({
      ...step,
      completionLabel: buildCompletionLabel(step),
    }));
}

function buildProgress(checklist: OnboardingStepState[]): OnboardingProgressSummary {
  const completedCount = checklist.filter((step) => step.completed).length;
  const totalSteps = checklist.length;
  const remainingCount = Math.max(totalSteps - completedCount, 0);

  return {
    completedCount,
    totalSteps,
    remainingCount,
    completionPercentage: totalSteps === 0 ? 100 : Math.round((completedCount / totalSteps) * 100),
  };
}

export function buildOnboardingSnapshot(input: {
  source: OnboardingSourceSnapshot;
  onboardingState?: StoredOnboardingState;
}): OnboardingChecklistSnapshot {
  const onboardingState = input.onboardingState ?? readStoredOnboardingState();
  const checklist = buildChecklist(input.source, onboardingState);
  const progress = buildProgress(checklist);
  const nextRecommendedStep = checklist.find((step) => !step.completed) ?? null;
  const completed = checklist.length > 0 && checklist.every((step) => step.completed);
  const status = completed
    ? "completed"
    : onboardingState.dismissedAt
      ? "dismissed"
      : "active";

  return {
    status,
    progress,
    checklist,
    nextRecommendedStep,
    currentPlanLabel: PLAN_LABELS[input.source.currentPlan],
    isHiddenInDashboard: onboardingState.hiddenInDashboard && !completed,
    skippedOptionalStepsCount: onboardingState.skippedStepKeys.length,
  };
}

export function readOnboardingSnapshot(): OnboardingChecklistSnapshot {
  const onboardingState = readStoredOnboardingState();
  const snapshot = buildOnboardingSnapshot({
    source: resolveOnboardingSourceSnapshot(),
    onboardingState,
  });

  if (snapshot.status === "completed" && onboardingState.completedAt === null) {
    markOnboardingCompleted();
  }

  return snapshot;
}
