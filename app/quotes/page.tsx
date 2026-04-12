import type { Metadata } from "next";
import Link from "next/link";

import { QuotesManager } from "@/components/quotes-manager";

export const metadata: Metadata = {
  title: "Orçamentos",
  description: "Crie e gerencie orçamentos com clientes vinculados e total por itens.",
};

export default function QuotesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <div className="space-y-8">
        <header className="space-y-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Voltar para o início
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Orçamentos
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Monte orçamentos com clientes, serviços reaproveitáveis e totais
              claros.
            </p>
          </div>
        </header>

        <QuotesManager />
      </div>
    </main>
  );
}
