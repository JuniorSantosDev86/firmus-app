import type { Metadata } from "next";

import { ChargesManager } from "@/components/charges-manager";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Cobranças",
  description: "Crie e gerencie cobranças vinculadas a clientes e orçamentos opcionais.",
};

export default function ChargesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeader
        title="Cobranças"
        description="Registre valores esperados de clientes com vencimento e status."
      />
      <ChargesManager />
    </main>
  );
}
