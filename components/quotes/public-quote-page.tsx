"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
      <main className="mx-auto w-full max-w-[980px] px-4 py-8">
        <section className="rounded-2xl border border-[#D9E3EE] bg-white p-6">
          <p className="text-sm text-[#64748B]">Carregando orçamento...</p>
        </section>
      </main>
    );
  }

  if (snapshot === null) {
    return (
      <main className="mx-auto w-full max-w-[980px] px-4 py-8" data-testid="public-quote-not-found">
        <section className="rounded-2xl border border-[#D9E3EE] bg-white p-6">
          <h1 className="text-xl font-semibold text-[#0F172A]">Orçamento não encontrado</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Verifique o link público informado e tente novamente.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[980px] space-y-5 px-4 py-8 print:max-w-none print:space-y-0 print:px-0 print:py-0">
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
          <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
            <Link
              href={`/public/quotes/${snapshot.publicId}/pdf`}
              className="inline-flex h-9 items-center rounded-lg border border-[#CBD5E1] px-3 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC]"
            >
              Versão PDF
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center rounded-lg bg-[#0F766E] px-3 text-sm font-medium text-white hover:bg-[#0D6C65]"
            >
              Imprimir
            </button>
          </div>
        </>
      ) : null}

      <PublicQuoteDocument snapshot={snapshot} />
    </main>
  );
}
