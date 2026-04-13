import type { Metadata } from "next";
import Link from "next/link";

import { WeeklySummaryView } from "@/components/weekly-summary/weekly-summary-view";

export const metadata: Metadata = {
  title: "Resumo semanal",
  description: "Resumo operacional determinístico com base em cobranças, lembretes e atividade.",
};

export default function WeeklySummaryPage() {
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
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Resumo semanal</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Leitura objetiva da operação com base no que já foi registrado no sistema.
            </p>
          </div>
        </header>

        <WeeklySummaryView />
      </div>
    </main>
  );
}
