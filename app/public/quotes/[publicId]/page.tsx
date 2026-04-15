import type { Metadata } from "next";

import { PublicQuotePage } from "@/components/quotes/public-quote-page";

type PublicQuoteRouteProps = {
  params: Promise<{ publicId: string }>;
};

export const metadata: Metadata = {
  title: "Orçamento público",
  description: "Visualização pública de orçamento da Firmus.",
};

export default async function PublicQuoteRoute({ params }: PublicQuoteRouteProps) {
  const { publicId } = await params;

  return <PublicQuotePage publicId={publicId} mode="page" />;
}
