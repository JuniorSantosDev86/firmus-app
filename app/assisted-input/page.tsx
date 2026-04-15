import type { Metadata } from "next";

import { AssistedInputManager } from "@/components/assisted-input/assisted-input-manager";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Entrada assistida",
  description: "Interprete instruções operacionais em texto e confirme ações com segurança.",
};

export default function AssistedInputPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Entrada assistida"
        description="Digite uma instrução curta, revise o que foi entendido e confirme antes de criar."
      />
      <AssistedInputManager />
    </main>
  );
}
