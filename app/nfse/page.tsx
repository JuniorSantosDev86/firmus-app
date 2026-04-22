import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NFSeManager } from "@/components/nfse/nfse-manager";

export const metadata: Metadata = {
  title: "NFSe",
  description: "Prepare, emita e acompanhe os registros internos de NFSe.",
};

export default function NFSePage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="NFSe"
        description="Camada interna fiscal. Aqui você acompanha preparo, emissão e resultado operacional da NFSe."
      />
      <NFSeManager />
    </main>
  );
}
