import Link from "next/link";

export function NFSeEmptyState() {
  return (
    <div className="firmus-empty-state" data-testid="nfse-empty-state">
      Nenhum preparo de NFSe foi criado ainda. Vá em{" "}
      <Link href="/charges" className="underline underline-offset-4 hover:no-underline">
        Cobranças
      </Link>{" "}
      e use a ação &quot;Preparar NFSe&quot; em uma cobrança paga.
    </div>
  );
}
