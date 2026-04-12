import type { Metadata } from "next";
import Link from "next/link";

import { ClientsManager } from "@/components/clients-manager";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Gerencie seus clientes com um fluxo simples e confiável.",
};

export default function ClientsPage() {
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
              Clientes
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mantenha sua base de clientes organizada para os próximos fluxos de
              serviços e orçamentos.
            </p>
          </div>
        </header>

        <ClientsManager />
      </div>
    </main>
  );
}
