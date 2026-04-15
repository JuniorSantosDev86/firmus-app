import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { TemplatesManager } from "@/components/templates/templates-manager";

export const metadata: Metadata = {
  title: "Modelos",
  description: "Biblioteca interna de mensagens reutilizáveis para comunicação operacional.",
};

export default function TemplatesPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Modelos"
        description="Salve mensagens recorrentes para reduzir repetição no dia a dia operacional."
      />
      <TemplatesManager />
    </main>
  );
}
