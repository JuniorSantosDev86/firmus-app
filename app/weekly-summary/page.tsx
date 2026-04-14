import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { WeeklySummaryView } from "@/components/weekly-summary/weekly-summary-view";

export const metadata: Metadata = {
  title: "Resumo semanal",
  description: "Resumo operacional determinístico com base em cobranças, lembretes e atividade.",
};

export default function WeeklySummaryPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeader
        title="Resumo semanal"
        description="Leitura objetiva da operação com base no que já foi registrado no sistema."
      />
      <WeeklySummaryView />
    </main>
  );
}
