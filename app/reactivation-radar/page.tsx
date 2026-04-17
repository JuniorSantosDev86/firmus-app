import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ReactivationRadarManager } from "@/components/reactivation/reactivation-radar-manager";

export const metadata: Metadata = {
  title: "Radar de reativação",
  description: "Identifique clientes com potencial de reativação com base em sinais operacionais reais.",
};

export default function ReactivationRadarPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Radar de reativação"
        description="Revise oportunidades de win-back e follow-up parado com critérios explícitos e ação imediata."
      />
      <ReactivationRadarManager />
    </main>
  );
}
