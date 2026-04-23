import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PlanManager } from "@/components/plan/plan-manager";

export const metadata: Metadata = {
  title: "Plano e limites",
  description: "Controle interno de plano atual, recursos liberados e limites do MVP.",
};

export default function PlanPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Plano e limites"
        description="Superfície interna para controlar o plano atual, visualizar recursos liberados e acompanhar limites ativos."
      />
      <PlanManager />
    </main>
  );
}
