import type { Metadata } from "next";
import Link from "next/link";

import { ChargesManager } from "@/components/charges-manager";

export const metadata: Metadata = {
  title: "Cobranças",
  description: "Crie e gerencie cobranças vinculadas a clientes e orçamentos opcionais.",
};

export default function ChargesPage() {
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
              Cobranças
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Registre valores esperados de clientes com vencimento e status.
            </p>
          </div>
        </header>

        <ChargesManager />
      </div>
    </main>
  );
}
