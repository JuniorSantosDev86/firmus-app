import type { Metadata } from "next";

import { ClientDetailView } from "@/components/client-detail-view";

type ClientDetailPageProps = {
  params: Promise<{ clientId: string }>;
};

export const metadata: Metadata = {
  title: "Detalhe do cliente",
  description: "Visão do cliente com orçamentos, cobranças e linha do tempo relacionadas.",
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = await params;

  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <ClientDetailView clientId={clientId} />
    </main>
  );
}
