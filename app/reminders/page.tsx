import type { Metadata } from "next";
import Link from "next/link";

import { RemindersManager } from "@/components/reminders/reminders-manager";

export const metadata: Metadata = {
  title: "Lembretes",
  description: "Acompanhe lembretes operacionais e marque follow-ups como concluídos.",
};

export default function RemindersPage() {
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
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lembretes</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Registre lembretes manuais e acompanhe ações pendentes do dia a dia.
            </p>
          </div>
        </header>

        <RemindersManager />
      </div>
    </main>
  );
}
