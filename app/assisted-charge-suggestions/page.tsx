import type { Metadata } from "next";

import { SuggestionsView } from "@/components/assisted-charge-suggestions/suggestions-view";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Sugestões de cobrança",
  description: "Sugestões explicáveis de cobrança e follow-up com confirmação manual.",
};

export default function AssistedChargeSuggestionsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeader
        title="Sugestões de cobrança"
        description="Revise sugestões derivadas dos dados atuais e confirme manualmente cada ação."
      />
      <SuggestionsView />
    </main>
  );
}
