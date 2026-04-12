import type { Metadata } from "next";
import Link from "next/link";

import { ServicesManager } from "@/components/services-manager";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Gerencie seus serviços com um fluxo simples e confiável.",
};

export default function ServicesPage() {
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
              Serviços
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Defina os serviços que você oferece para reaproveitá-los nos próximos
              orçamentos.
            </p>
          </div>
        </header>

        <ServicesManager />
      </div>
    </main>
  );
}
