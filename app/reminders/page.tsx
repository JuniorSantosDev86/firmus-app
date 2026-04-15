import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { RemindersManager } from "@/components/reminders/reminders-manager";

export const metadata: Metadata = {
  title: "Lembretes",
  description: "Acompanhe lembretes operacionais e marque follow-ups como concluídos.",
};

export default function RemindersPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Lembretes"
        description="Registre lembretes manuais e acompanhe ações pendentes do dia a dia."
      />
      <RemindersManager />
    </main>
  );
}
