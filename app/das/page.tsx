import type { Metadata } from "next";

import { DASManager } from "@/components/das/das-manager";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "DAS",
  description: "Acompanhe o DAS mensal e faça o encaminhamento para o canal oficial de pagamento.",
};

export default function DASPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="DAS"
        description="Camada de acompanhamento operacional do DAS com encaminhamento para o canal oficial."
      />
      <DASManager />
    </main>
  );
}
