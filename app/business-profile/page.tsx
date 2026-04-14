import type { Metadata } from "next";

import { BusinessProfileForm } from "@/components/business-profile-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Perfil da empresa",
  description: "Gerencie os dados de identidade da sua empresa.",
};

export default function BusinessProfilePage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8">
      <PageHeader
        title="Perfil da empresa"
        description="Mantenha os dados da sua empresa atualizados para os próximos fluxos de clientes e orçamentos."
      />
        <BusinessProfileForm />
    </main>
  );
}
