import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ServicesManager } from "@/components/services-manager";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Gerencie seus serviços com um fluxo simples e confiável.",
};

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Serviços"
        description="Defina os serviços que você oferece para reaproveitá-los nos próximos orçamentos."
      />
      <ServicesManager />
    </main>
  );
}
