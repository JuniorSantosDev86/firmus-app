import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { QuotesManager } from "@/components/quotes-manager";

export const metadata: Metadata = {
  title: "Orçamentos",
  description: "Crie e gerencie orçamentos com clientes vinculados e total por itens.",
};

export default function QuotesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeader
        title="Orçamentos"
        description="Monte orçamentos com clientes, serviços reaproveitáveis e totais claros."
      />
      <QuotesManager />
    </main>
  );
}
