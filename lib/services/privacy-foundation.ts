import type { PrivacyDataSurface, PrivacyFoundationStatus } from "@/lib/domain/privacy-foundation";
import {
  readPrivacyFoundationMeta,
  writePrivacyFoundationLastReviewedAt,
} from "@/lib/repositories/security-foundation-repository";
import { recordSecurityAudit } from "@/lib/services/security-audit";

const PRIVACY_SURFACES: PrivacyDataSurface[] = [
  {
    id: "public-bio",
    area: "Página pública de bio",
    level: "public",
    processingPurpose: "Divulgação de informações profissionais do prestador.",
  },
  {
    id: "public-quote",
    area: "Orçamento público",
    level: "public",
    processingPurpose: "Compartilhamento de proposta comercial com cliente.",
  },
  {
    id: "internal-operations",
    area: "Operação interna (clientes, cobranças, lembretes)",
    level: "sensitive",
    processingPurpose: "Execução operacional e financeira do serviço contratado.",
  },
  {
    id: "automation-and-audit",
    area: "Automação e trilha de auditoria",
    level: "internal",
    processingPurpose: "Rastreabilidade mínima de ações de segurança e operação.",
  },
];

export async function getPrivacyFoundationStatus(): Promise<PrivacyFoundationStatus> {
  const privacyMeta = await readPrivacyFoundationMeta();

  return {
    version: "block-24-foundation",
    lastReviewedAt: privacyMeta.lastReviewedAt,
    retentionPolicyDefined: true,
    dsrProcessPrepared: true,
    incidentResponsePrepared: true,
    legalBasisDocumented: true,
    dataSurfaces: PRIVACY_SURFACES,
  };
}

export async function recordPrivacyFoundationReview(actorId: string): Promise<PrivacyFoundationStatus> {
  const reviewedAt = new Date().toISOString();
  await writePrivacyFoundationLastReviewedAt(reviewedAt);

  await recordSecurityAudit({
    action: "privacy_foundation_review_recorded",
    actorType: "owner",
    actorId,
    route: "/api/internal/privacy-foundation/review",
    metadata: {
      reviewedAt,
    },
  });

  return getPrivacyFoundationStatus();
}
