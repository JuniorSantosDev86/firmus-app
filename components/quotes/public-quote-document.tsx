import type { QuoteDocumentSnapshot } from "@/lib/services/quote-document-presenter";

type PublicQuoteDocumentProps = {
  snapshot: QuoteDocumentSnapshot;
  className?: string;
};

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("pt-BR");
}

function formatQuantity(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function getStatusLabel(status: string): string {
  if (status === "draft") return "Rascunho";
  if (status === "sent") return "Enviado";
  if (status === "approved") return "Aprovado";
  if (status === "rejected") return "Rejeitado";
  if (status === "expired") return "Expirado";
  if (status === "canceled") return "Cancelado";
  return status;
}

function quoteCode(quoteId: string): string {
  return `#${quoteId.slice(0, 8).toUpperCase()}`;
}

function displayValue(value: string | null): string {
  return value && value.length > 0 ? value : "—";
}

export function PublicQuoteDocument({ snapshot, className }: PublicQuoteDocumentProps) {
  return (
    <article className={className} data-testid="premium-quote-document">
      <div className="premium-quote-sheet mx-auto max-w-[960px] rounded-2xl border border-[#DDE7F2] bg-white p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] md:p-9 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-[#E2E8F0] pb-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#0F766E] uppercase">
                Proposta comercial
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">Orçamento</h1>
              <p className="text-sm text-[#64748B]">Documento para apresentação e aprovação comercial.</p>
            </div>

            <div className="rounded-xl border border-[#DAE5EF] bg-[#F8FBFF] px-4 py-3 text-sm text-[#334155]">
              <p><span className="font-medium">Número:</span> {quoteCode(snapshot.quote.id)}</p>
              <p><span className="font-medium">Emissão:</span> {formatDate(snapshot.quote.issueDate)}</p>
              <p><span className="font-medium">Validade:</span> {formatDate(snapshot.quote.validUntil)}</p>
              <p><span className="font-medium">Status:</span> {getStatusLabel(snapshot.quote.status)}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 border-b border-[#E2E8F0] py-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#FCFEFF] p-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#64748B] uppercase">Prestador</p>
            <p className="mt-2 text-lg font-semibold text-[#0F172A]">{snapshot.business.businessName}</p>
            {snapshot.business.professionalName ? (
              <p className="text-sm text-[#334155]">Responsável: {snapshot.business.professionalName}</p>
            ) : null}
            <p className="mt-2 text-sm text-[#64748B]">{displayValue(snapshot.business.shortDescription)}</p>
            <p className="mt-2 text-sm text-[#475569]">Cidade: {displayValue(snapshot.business.city)}</p>
            <p className="text-sm text-[#475569]">WhatsApp: {displayValue(snapshot.business.whatsapp)}</p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#FCFEFF] p-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#64748B] uppercase">Cliente</p>
            <p className="mt-2 text-lg font-semibold text-[#0F172A]">{snapshot.client.name}</p>
            <p className="mt-2 text-sm text-[#475569]">Cidade: {displayValue(snapshot.client.city)}</p>
            <p className="text-sm text-[#475569]">WhatsApp: {displayValue(snapshot.client.whatsapp)}</p>
            <p className="text-sm text-[#475569]">Email: {displayValue(snapshot.client.email)}</p>
          </div>
        </section>

        <section className="py-6">
          <h2 className="text-sm font-semibold tracking-[0.12em] text-[#64748B] uppercase">Itens do orçamento</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#DCE6F0]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FBFF] text-left text-xs font-semibold tracking-[0.08em] text-[#64748B] uppercase">
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3 text-right">Qtd.</th>
                  <th className="px-4 py-3 text-right">Valor unitário</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.items.map((item) => (
                  <tr key={item.id} className="border-t border-[#E2E8F0]">
                    <td className="px-4 py-3 text-[#0F172A]">{item.description}</td>
                    <td className="px-4 py-3 text-right text-[#334155]">{formatQuantity(item.quantity)}</td>
                    <td className="px-4 py-3 text-right text-[#334155]">{formatMoneyFromCents(item.unitPriceInCents)}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#0F172A]">{formatMoneyFromCents(item.lineTotalInCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex justify-end border-t border-[#E2E8F0] pt-6">
          <dl className="w-full max-w-[340px] space-y-2 rounded-xl border border-[#DDE7F2] bg-[#F8FBFF] p-4 text-sm">
            <div className="flex items-center justify-between text-[#334155]">
              <dt>Subtotal</dt>
              <dd>{formatMoneyFromCents(snapshot.quote.subtotalInCents)}</dd>
            </div>
            <div className="flex items-center justify-between text-[#334155]">
              <dt>Desconto</dt>
              <dd>- {formatMoneyFromCents(snapshot.quote.discountInCents)}</dd>
            </div>
            <div className="h-px bg-[#DAE5EF]" />
            <div className="flex items-center justify-between text-base font-semibold text-[#0F172A]">
              <dt>Total</dt>
              <dd>{formatMoneyFromCents(snapshot.quote.totalInCents)}</dd>
            </div>
          </dl>
        </section>

        <footer className="mt-8 border-t border-dashed border-[#D7E2ED] pt-4 text-xs text-[#64748B]">
          <p>
            Documento público de orçamento • Referência: {snapshot.publicId} • Itens: {snapshot.quote.itemCount}
          </p>
        </footer>
      </div>
    </article>
  );
}
