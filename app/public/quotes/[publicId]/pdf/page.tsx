import type { Metadata } from "next";

import { PublicQuotePage } from "@/components/quotes/public-quote-page";

type PublicQuotePdfRouteProps = {
  params: Promise<{ publicId: string }>;
};

export const metadata: Metadata = {
  title: "Orçamento PDF",
  description: "Versão para impressão/PDF do orçamento público.",
};

export default async function PublicQuotePdfRoute({ params }: PublicQuotePdfRouteProps) {
  const { publicId } = await params;

  return <PublicQuotePage publicId={publicId} mode="pdf" />;
}
