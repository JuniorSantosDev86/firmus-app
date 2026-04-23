import type { Metadata } from "next";

import { DASManager } from "@/components/das/das-manager";
import { PageHeader } from "@/components/layout/page-header";
import { PlanFeatureGuard } from "@/components/plan/plan-feature-guard";

export const metadata: Metadata = {
  title: "DAS",
  description: "Acompanhe competências de DAS e faça o encaminhamento seguro ao canal oficial.",
};

export default function DASPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="DAS"
        description="Acompanhe competências mensais de DAS. A emissão e o pagamento oficial acontecem fora do Firmus."
      />
      <PlanFeatureGuard feature="das_access" blockedTestId="das-plan-blocked">
        <DASManager />
      </PlanFeatureGuard>
    </main>
  );
}
