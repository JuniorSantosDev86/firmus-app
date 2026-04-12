import type { Metadata } from "next";
import Link from "next/link";

import { BusinessProfileForm } from "@/components/business-profile-form";

export const metadata: Metadata = {
  title: "Perfil da empresa",
  description: "Gerencie os dados de identidade da sua empresa.",
};

export default function BusinessProfilePage() {
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
              Perfil da empresa
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mantenha os dados da sua empresa atualizados para os próximos fluxos
              de clientes e orçamentos.
            </p>
          </div>
        </header>

        <BusinessProfileForm />
      </div>
    </main>
  );
}
