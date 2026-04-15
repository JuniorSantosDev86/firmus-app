import type { Metadata } from "next";

import { AutomationRulesManager } from "@/components/automation-rules-manager";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Regras de automação",
  description:
    "Fundação determinística para regras de automação baseadas em eventos e condições operacionais.",
};

export default function AutomationRulesPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Regras de automação"
        description="Crie regras determinísticas, ative ou desative quando necessário e avalie correspondências de forma inspecionável."
      />
      <AutomationRulesManager />
    </main>
  );
}
