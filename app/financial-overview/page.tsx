import type { Metadata } from "next";
import Link from "next/link";

import { FinancialOverviewSummary } from "@/components/financial-overview-summary";

export const metadata: Metadata = {
  title: "Visão financeira",
  description: "Resumo operacional simples dos recebíveis atuais.",
};

export default function FinancialOverviewPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <div className="space-y-8">
        <header className="space-y-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Voltar para o início
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Visão financeira
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Resumo rápido dos recebíveis disponíveis, próximos e em atraso.
            </p>
          </div>
        </header>

        <FinancialOverviewSummary />
      </div>
    </main>
  );
}
