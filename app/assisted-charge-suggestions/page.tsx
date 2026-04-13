import type { Metadata } from "next";
import Link from "next/link";

import { SuggestionsView } from "@/components/assisted-charge-suggestions/suggestions-view";

export const metadata: Metadata = {
  title: "Sugestões de cobrança",
  description: "Sugestões explicáveis de cobrança e follow-up com confirmação manual.",
};

export default function AssistedChargeSuggestionsPage() {
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
              Sugestões de cobrança
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Revise sugestões derivadas dos dados atuais e confirme manualmente cada ação.
            </p>
          </div>
        </header>

        <SuggestionsView />
      </div>
    </main>
  );
}
