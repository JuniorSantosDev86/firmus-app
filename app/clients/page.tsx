import type { Metadata } from "next";

import { ClientsManager } from "@/components/clients-manager";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Gerencie seus clientes com um fluxo simples e confiável.",
};

export default function ClientsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeader
        title="Clientes"
        description="Mantenha sua base de clientes organizada para os próximos fluxos de serviços e orçamentos."
      />
        <ClientsManager />
    </main>
  );
}
