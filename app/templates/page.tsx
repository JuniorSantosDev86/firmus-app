import type { Metadata } from "next";
import Link from "next/link";

import { TemplatesManager } from "@/components/templates/templates-manager";

export const metadata: Metadata = {
  title: "Modelos",
  description: "Biblioteca interna de mensagens reutilizáveis para comunicação operacional.",
};

export default function TemplatesPage() {
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
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Modelos</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Salve mensagens recorrentes para reduzir repetição no dia a dia operacional.
            </p>
          </div>
        </header>

        <TemplatesManager />
      </div>
    </main>
  );
}
