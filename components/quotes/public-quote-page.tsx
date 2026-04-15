"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PublicCtaRow } from "@/components/public/public-cta-row";
import { PublicStatusCard } from "@/components/public/public-status-card";
import { PublicSurfaceShell } from "@/components/public/public-surface-shell";
import { PublicQuoteActions } from "@/components/quotes/public-quote-actions";
import { PublicQuoteDocument } from "@/components/quotes/public-quote-document";
import { approveQuoteByPublicId } from "@/lib/services/quote-approval-service";
import {
  getQuoteDocumentSnapshot,
  type QuoteDocumentSnapshot,
} from "@/lib/services/quote-document-presenter";

type PublicQuotePageProps = {
  publicId: string;
  mode: "page" | "pdf";
};

export function PublicQuotePage({ publicId, mode }: PublicQuotePageProps) {
  const [snapshot, setSnapshot] = useState<QuoteDocumentSnapshot | null | undefined>(undefined);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  useEffect(() => {
    const next = getQuoteDocumentSnapshot(publicId);
    queueMicrotask(() => {
      setSnapshot(next);
      setApprovalFeedback(null);
      setIsApproving(false);
    });
  }, [publicId]);

  function handleApprove() {
    if (snapshot === undefined || snapshot === null || isApproving) {
      return;
    }

    setIsApproving(true);

    const result = approveQuoteByPublicId(snapshot.publicId);
    const nextSnapshot = getQuoteDocumentSnapshot(snapshot.publicId);

    if (result.ok && result.outcome === "approved") {
      setApprovalFeedback("Orçamento aprovado com sucesso.");
    } else if (result.ok && result.outcome === "already_approved") {
      setApprovalFeedback("Este orçamento já estava aprovado.");
    } else if (!result.ok && result.outcome === "not_allowed") {
      setApprovalFeedback("Este orçamento não pode ser aprovado no estado atual.");
    } else {
      setApprovalFeedback("Não foi possível concluir a aprovação.");
    }

    setSnapshot(nextSnapshot);
    setIsApproving(false);
  }

  if (snapshot === undefined) {
    return (
      <PublicSurfaceShell width="quote">
        <PublicStatusCard description="Carregando orçamento..." />
      </PublicSurfaceShell>
    );
  }

  if (snapshot === null) {
    return (
      <PublicSurfaceShell width="quote" testId="public-quote-not-found">
        <PublicStatusCard
          title="Orçamento não encontrado"
          description="Verifique o link público informado e tente novamente."
        />
      </PublicSurfaceShell>
    );
  }

  return (
    <PublicSurfaceShell width="quote" className="firmus-public-stack print:space-y-0" printBleed>
      {mode === "page" ? (
        <>
          <PublicQuoteActions
            publicId={snapshot.publicId}
            status={snapshot.quote.status}
            approvedAt={snapshot.quote.approvedAt}
            isSubmitting={isApproving}
            feedbackMessage={approvalFeedback}
            onApprove={handleApprove}
          />
          <PublicCtaRow
            title="Compartilhamento e impressão"
            description="Envie a versão PDF ou imprima este documento com o mesmo padrão visual."
          >
            <Link
              href={`/public/quotes/${snapshot.publicId}/pdf`}
              className="inline-flex h-9 items-center rounded-lg border border-[#CBD5E1] px-3 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC]"
            >
              Versão PDF
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center rounded-lg bg-[#0F766E] px-3 text-sm font-medium text-white transition-colors hover:bg-[#0D6C65]"
            >
              Imprimir
            </button>
          </PublicCtaRow>
        </>
      ) : null}

      <PublicQuoteDocument snapshot={snapshot} />
    </PublicSurfaceShell>
  );
}
