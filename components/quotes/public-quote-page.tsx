"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PublicQuoteDocument } from "@/components/quotes/public-quote-document";
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

  useEffect(() => {
    const next = getQuoteDocumentSnapshot(publicId);
    queueMicrotask(() => {
      setSnapshot(next);
    });
  }, [publicId]);

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
      ) : null}

      <PublicQuoteDocument snapshot={snapshot} />
    </main>
  );
}
