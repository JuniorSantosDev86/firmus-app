import type { Metadata } from "next";
import Link from "next/link";

import { AssistedInputManager } from "@/components/assisted-input/assisted-input-manager";

export const metadata: Metadata = {
  title: "Entrada assistida",
  description: "Interprete instruções operacionais em texto e confirme ações com segurança.",
};

export default function AssistedInputPage() {
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
              Entrada assistida
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Digite uma instrução curta, revise o que foi entendido e confirme antes de criar.
            </p>
          </div>
        </header>

        <AssistedInputManager />
      </div>
    </main>
  );
}
