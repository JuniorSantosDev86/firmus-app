import type { Metadata } from "next";

import { FinancialOverviewSummary } from "@/components/financial-overview-summary";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Visão financeira",
  description: "Resumo operacional simples dos recebíveis atuais.",
};

export default function FinancialOverviewPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Visão financeira"
        description="Resumo rápido dos recebíveis disponíveis, próximos e em atraso."
      />
      <FinancialOverviewSummary />
    </main>
  );
}
