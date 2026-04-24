import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { MVPReadinessPage } from "@/components/mvp-readiness/mvp-readiness-page";

export const metadata: Metadata = {
  title: "Prontidão do MVP",
  description: "Leitura interna da prontidão operacional do MVP antes de ampliar o uso beta.",
};

export default function MVPReadinessRoute() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Prontidão do MVP"
        description="Revise bloqueios, alertas e pontos já estáveis do MVP a partir do estado real do workspace."
        contextLabel="MVP Hardening"
      />
      <MVPReadinessPage />
    </main>
  );
}
