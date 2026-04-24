import type {
  MVPReadinessItem,
  MVPReadinessSnapshot,
  MVPReadinessStatus,
} from "@/lib/domain";
import { getAutomationExecutionLog } from "@/lib/automation-execution-log-storage";
import { getAutomationRules } from "@/lib/automation-rule-storage";
import { readBusinessProfile } from "@/lib/business-profile-storage";
import { getCharges } from "@/lib/charge-storage";
import { readClients } from "@/lib/client-storage";
import { evaluateBusinessProfileNFSeReadiness } from "@/lib/services/nfse/nfse-readiness";
import { readNFSeRecords } from "@/lib/nfse-storage";
import { readOnboardingSnapshot } from "@/lib/services/onboarding";
import {
  getCurrentPlanTier,
  getFeatureAccessState,
  getTemplateCreationAccessState,
} from "@/lib/services/plan-entitlements";
import { getPublicBioSnapshot } from "@/lib/services/public-bio-presenter";
import { readQuoteStore } from "@/lib/quote-storage";
import { readServices } from "@/lib/service-storage";
import { readDASRecords } from "@/lib/storage/das-records";
import { getTemplates } from "@/lib/template-storage";
import { isPrivateRoute } from "@/lib/auth/route-boundary";
import { PLAN_LABELS } from "@/lib/domain/plan";

type MVPHardeningSourceSnapshot = {
  hasBusinessProfile: boolean;
  clientsCount: number;
  servicesCount: number;
  quotesCount: number;
  chargesCount: number;
  templatesCount: number;
  templateCreationBlocked: boolean;
  nfseReady: boolean;
  nfseMissingFieldsCount: number;
  nfseRecordsCount: number;
  dasRecordsCount: number;
  publicBioAvailable: boolean;
  automationRulesCount: number;
  automationExecutionsCount: number;
  onboardingStatus: ReturnType<typeof readOnboardingSnapshot>["status"];
  onboardingHiddenInDashboard: boolean;
  requiredOnboardingPendingCount: number;
  currentPlan: ReturnType<typeof getCurrentPlanTier>;
  nfseFeatureAllowed: boolean;
  dasFeatureAllowed: boolean;
  automationFeatureAllowed: boolean;
  privateRoutesProtected: boolean;
  publicRoutesIsolated: boolean;
  observabilitySurfacesProtected: boolean;
  activityLogsProtected: boolean;
};

function hasMeaningfulBusinessProfile() {
  const profile = readBusinessProfile();
  if (!profile) {
    return false;
  }

  return profile.businessName.trim().length > 0 && profile.professionalName.trim().length > 0;
}

function resolveSourceSnapshot(): MVPHardeningSourceSnapshot {
  const profile = readBusinessProfile();
  const onboarding = readOnboardingSnapshot();
  const currentPlan = getCurrentPlanTier();
  const nfseReadiness = evaluateBusinessProfileNFSeReadiness(profile);
  const nfseFeature = getFeatureAccessState("nfse_access", currentPlan);
  const dasFeature = getFeatureAccessState("das_access", currentPlan);
  const automationFeature = getFeatureAccessState("automation_rules_access", currentPlan);
  const templateLimit = getTemplateCreationAccessState({
    tier: currentPlan,
    usage: {
      templatesCount: getTemplates().length,
    },
  });
  const privateRoutesProtected =
    isPrivateRoute("/") &&
    isPrivateRoute("/quotes") &&
    isPrivateRoute("/mvp-readiness") &&
    isPrivateRoute("/onboarding");
  const publicRoutesIsolated =
    !isPrivateRoute("/public/bio") &&
    !isPrivateRoute("/public/quotes/public-id") &&
    !isPrivateRoute("/login");

  return {
    hasBusinessProfile: hasMeaningfulBusinessProfile(),
    clientsCount: readClients().length,
    servicesCount: readServices().length,
    quotesCount: readQuoteStore().quotes.length,
    chargesCount: getCharges().length,
    templatesCount: getTemplates().length,
    templateCreationBlocked: templateLimit.blocked,
    nfseReady: nfseReadiness.isReady,
    nfseMissingFieldsCount: nfseReadiness.missingFields.length,
    nfseRecordsCount: readNFSeRecords().length,
    dasRecordsCount: readDASRecords().length,
    publicBioAvailable: getPublicBioSnapshot() !== null,
    automationRulesCount: getAutomationRules().length,
    automationExecutionsCount: getAutomationExecutionLog().length,
    onboardingStatus: onboarding.status,
    onboardingHiddenInDashboard: onboarding.isHiddenInDashboard,
    requiredOnboardingPendingCount: onboarding.checklist.filter((step) => !step.optional && !step.completed).length,
    currentPlan,
    nfseFeatureAllowed: nfseFeature.allowed,
    dasFeatureAllowed: dasFeature.allowed,
    automationFeatureAllowed: automationFeature.allowed,
    privateRoutesProtected,
    publicRoutesIsolated,
    observabilitySurfacesProtected:
      isPrivateRoute("/api/internal/observability/health") &&
      isPrivateRoute("/api/internal/observability/backup") &&
      isPrivateRoute("/api/internal/observability/restore"),
    activityLogsProtected: isPrivateRoute("/activity-logs"),
  };
}

function describeMissingCorePieces(source: MVPHardeningSourceSnapshot): string[] {
  const missing: string[] = [];

  if (source.clientsCount === 0) {
    missing.push("clientes");
  }
  if (source.servicesCount === 0) {
    missing.push("serviços");
  }
  if (source.quotesCount === 0) {
    missing.push("orçamentos");
  }
  if (source.chargesCount === 0) {
    missing.push("cobranças");
  }

  return missing;
}

function buildSummary(status: MVPReadinessStatus, blockingCount: number, warningCount: number): string {
  if (status === "blocked") {
    return `${blockingCount} bloqueio${blockingCount === 1 ? "" : "s"} impede${blockingCount === 1 ? "" : "m"} uma leitura segura de beta neste workspace.`;
  }

  if (status === "warning") {
    return `Sem bloqueios ativos, mas ${warningCount} alerta${warningCount === 1 ? "" : "s"} ainda merece${warningCount === 1 ? "" : "m"} revisão antes de ampliar o uso beta.`;
  }

  return "Os slices validados do MVP aparecem coesos e prontos para uso beta neste workspace.";
}

function getPlanLabel(source: MVPHardeningSourceSnapshot): string {
  return PLAN_LABELS[source.currentPlan];
}

function sortBySeverity(items: MVPReadinessItem[]): MVPReadinessItem[] {
  const order: Record<MVPReadinessStatus, number> = {
    blocked: 0,
    warning: 1,
    ready: 2,
  };

  return items.slice().sort((a, b) => {
    const severityOrder = order[a.status] - order[b.status];
    if (severityOrder !== 0) {
      return severityOrder;
    }

    return a.label.localeCompare(b.label);
  });
}

export function buildMVPReadinessSnapshot(source: MVPHardeningSourceSnapshot = resolveSourceSnapshot()): MVPReadinessSnapshot {
  const missingCorePieces = describeMissingCorePieces(source);

  const items: MVPReadinessItem[] = [
    {
      id: "private-route-protection",
      group: "auth_and_boundaries",
      label: "Rotas internas continuam protegidas",
      status: source.privateRoutesProtected ? "ready" : "blocked",
      description: source.privateRoutesProtected
        ? "A malha interna segue tratada como privada e redireciona o operador para autenticação quando necessário."
        : "Há uma inconsistência na classificação de rotas privadas críticas.",
      blocking: true,
      href: "/login",
    },
    {
      id: "public-route-isolation",
      group: "auth_and_boundaries",
      label: "Superfícies públicas seguem isoladas da shell interna",
      status: source.publicRoutesIsolated ? "ready" : "blocked",
      description: source.publicRoutesIsolated
        ? "Bio pública, orçamento público e login seguem fora da navegação interna."
        : "Há uma inconsistência na separação entre superfícies públicas e privadas.",
      blocking: true,
      href: "/public/bio",
    },
    {
      id: "onboarding-required-steps",
      group: "onboarding_and_first_use",
      label: "Base inicial do onboarding está concluída",
      status: source.requiredOnboardingPendingCount === 0 ? "ready" : "blocked",
      description:
        source.requiredOnboardingPendingCount === 0
          ? "Os passos obrigatórios de primeiro uso já foram cobertos pelo estado real do workspace."
          : `${source.requiredOnboardingPendingCount} etapa${source.requiredOnboardingPendingCount === 1 ? "" : "s"} obrigatória${source.requiredOnboardingPendingCount === 1 ? "" : "s"} ainda bloqueia${source.requiredOnboardingPendingCount === 1 ? "" : "m"} a prontidão operacional.`,
      blocking: true,
      href: "/onboarding",
    },
    {
      id: "onboarding-visibility",
      group: "onboarding_and_first_use",
      label: "Onboarding continua visível para revisão",
      status: source.onboardingHiddenInDashboard || source.onboardingStatus === "dismissed" ? "warning" : "ready",
      description:
        source.onboardingHiddenInDashboard || source.onboardingStatus === "dismissed"
          ? "O checklist foi ocultado no dashboard. Isso não trava o produto, mas reduz clareza de primeiro uso."
          : "O checklist continua fácil de localizar para revisão rápida.",
      blocking: false,
      href: "/onboarding",
    },
    {
      id: "business-profile-base",
      group: "core_operations",
      label: "Perfil da empresa sustenta os módulos centrais",
      status: source.hasBusinessProfile ? "ready" : "blocked",
      description: source.hasBusinessProfile
        ? "Nome da empresa e identificação profissional já sustentam os fluxos principais."
        : "O perfil da empresa ainda não tem a base mínima para sustentar os próximos módulos.",
      blocking: true,
      href: "/business-profile",
    },
    {
      id: "core-operations-seeded",
      group: "core_operations",
      label: "Fluxo operacional principal já foi exercitado",
      status: missingCorePieces.length === 0 ? "ready" : "blocked",
      description:
        missingCorePieces.length === 0
          ? "Clientes, serviços, orçamentos e cobranças já existem no workspace."
          : `Ainda faltam registros reais em: ${missingCorePieces.join(", ")}.`,
      blocking: true,
      href: missingCorePieces.includes("clientes")
        ? "/clients"
        : missingCorePieces.includes("serviços")
          ? "/services"
          : missingCorePieces.includes("orçamentos")
            ? "/quotes"
            : "/charges",
    },
    {
      id: "nfse-operational-readiness",
      group: "fiscal_flows",
      label: "Prontidão de NFSe está coerente com a operação atual",
      status: !source.nfseFeatureAllowed
        ? "warning"
        : source.chargesCount > 0 && !source.nfseReady && source.nfseRecordsCount === 0
          ? "blocked"
          : source.nfseReady || source.nfseRecordsCount > 0
            ? "ready"
            : "warning",
      description: !source.nfseFeatureAllowed
        ? `O plano ${getPlanLabel(source)} não libera NFSe neste workspace, então a revisão fiscal fica limitada.`
        : source.chargesCount > 0 && !source.nfseReady && source.nfseRecordsCount === 0
          ? `Há cobrança${source.chargesCount === 1 ? "" : "s"} no workspace, mas a base fiscal ainda tem ${source.nfseMissingFieldsCount} pendência${source.nfseMissingFieldsCount === 1 ? "" : "s"} e nenhum preparo de NFSe.`
          : source.nfseReady || source.nfseRecordsCount > 0
            ? "A prontidão fiscal já aparece preenchida ou já houve preparo/uso real de NFSe."
            : "A superfície fiscal existe, mas ainda não há preparo real ou uso de NFSe neste workspace.",
      blocking: source.nfseFeatureAllowed && source.chargesCount > 0,
      href: source.nfseReady ? "/nfse" : "/business-profile",
    },
    {
      id: "das-companion-visibility",
      group: "fiscal_flows",
      label: "Acompanhamento de DAS está acessível",
      status: !source.dasFeatureAllowed ? "warning" : source.dasRecordsCount > 0 ? "ready" : "warning",
      description: !source.dasFeatureAllowed
        ? `O plano ${getPlanLabel(source)} não libera o acompanhamento de DAS neste workspace.`
        : source.dasRecordsCount > 0
          ? "Já existe uso real do acompanhamento de DAS."
          : "A superfície existe e o handoff oficial está validado, mas ainda não há competência registrada no workspace.",
      blocking: false,
      href: "/das",
    },
    {
      id: "public-bio-availability",
      group: "public_surfaces",
      label: "Bio pública pode representar o negócio",
      status: source.publicBioAvailable ? "ready" : "warning",
      description: source.publicBioAvailable
        ? "A bio pública já consegue renderizar dados reais do negócio."
        : "Ainda faltam dados suficientes para a bio pública representar o negócio com segurança.",
      blocking: false,
      href: "/public/bio",
    },
    {
      id: "public-quote-availability",
      group: "public_surfaces",
      label: "Orçamento público já pode ser revisado",
      status: source.quotesCount > 0 ? "ready" : "warning",
      description: source.quotesCount > 0
        ? "Já existe ao menos um orçamento real que sustenta a superfície pública de proposta."
        : "Ainda não existe orçamento no workspace para validar a superfície pública de proposta.",
      blocking: false,
      href: "/quotes",
    },
    {
      id: "observability-surfaces",
      group: "reliability_and_recovery",
      label: "Health, backup e restore seguem protegidos",
      status: source.observabilitySurfacesProtected ? "ready" : "blocked",
      description: source.observabilitySurfacesProtected
        ? "As superfícies internas de saúde e recuperação seguem expostas apenas como rotas privadas."
        : "A fronteira das rotas internas de observabilidade ficou incoerente.",
      blocking: true,
      href: "/activity-logs",
    },
    {
      id: "activity-log-visibility",
      group: "reliability_and_recovery",
      label: "Logs de atividade seguem acessíveis",
      status: source.activityLogsProtected ? "ready" : "blocked",
      description: source.activityLogsProtected
        ? "A trilha mínima de rastreabilidade segue disponível como superfície interna."
        : "A rota interna de logs deixou de ser tratada como privada.",
      blocking: true,
      href: "/activity-logs",
    },
    {
      id: "templates-coverage",
      group: "consistency_and_usability",
      label: "Modelos de mensagem mantêm a base operacional previsível",
      status: source.templateCreationBlocked ? "warning" : source.templatesCount > 0 ? "ready" : "warning",
      description: source.templateCreationBlocked
        ? "O limite atual de modelos já foi atingido, o que reduz margem para padronizar novas mensagens."
        : source.templatesCount > 0
          ? "Já existe ao menos um modelo salvo para reduzir repetição em fluxos operacionais."
          : "Ainda não existe modelo salvo para apoiar os contatos recorrentes do MVP.",
      blocking: false,
      href: "/templates",
    },
    {
      id: "automation-readiness",
      group: "consistency_and_usability",
      label: "Regras de automação estão coerentes com o plano atual",
      status: !source.automationFeatureAllowed
        ? "warning"
        : source.automationRulesCount > 0 || source.automationExecutionsCount > 0
          ? "ready"
          : "warning",
      description: !source.automationFeatureAllowed
        ? `O plano ${getPlanLabel(source)} não libera regras de automação neste workspace.`
        : source.automationRulesCount > 0 || source.automationExecutionsCount > 0
          ? "Já existe uso real ou evidência de execução de automação."
          : "A superfície de automação existe, mas ainda não há regra ativa ou histórico de execução.",
      blocking: false,
      href: "/automation-rules",
    },
  ];

  const blockingCount = items.filter((item) => item.status === "blocked").length;
  const warningCount = items.filter((item) => item.status === "warning").length;
  const readyCount = items.filter((item) => item.status === "ready").length;
  const status: MVPReadinessStatus = blockingCount > 0 ? "blocked" : warningCount > 0 ? "warning" : "ready";

  return {
    status,
    summary: buildSummary(status, blockingCount, warningCount),
    items: sortBySeverity(items),
    blockingCount,
    warningCount,
    readyCount,
    nextActions: sortBySeverity(items).filter((item) => item.status !== "ready" && item.href).slice(0, 4),
  };
}

export function readMVPReadinessSnapshot(): MVPReadinessSnapshot {
  return buildMVPReadinessSnapshot();
}
