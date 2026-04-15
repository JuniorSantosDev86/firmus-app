"use client";

type PublicQuoteActionsProps = {
  publicId: string;
  status: string;
  approvedAt: string | null;
  isSubmitting: boolean;
  feedbackMessage: string | null;
  onApprove: () => void;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return "agora";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("pt-BR");
}

export function PublicQuoteActions({
  publicId,
  status,
  approvedAt,
  isSubmitting,
  feedbackMessage,
  onApprove,
}: PublicQuoteActionsProps) {
  const isApproved = status === "approved";

  return (
    <section
      className="rounded-2xl border border-[#D9E3EE] bg-white px-4 py-4 shadow-[0_16px_36px_-34px_rgba(15,23,42,0.75)]"
      data-testid="public-quote-actions"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">
            {isApproved ? "Orçamento aprovado" : "Aprovação do orçamento"}
          </p>
          <p className="text-sm text-[#64748B]">
            {isApproved
              ? `Aprovado em ${formatDateTime(approvedAt)}`
              : "Revise os detalhes e confirme a aprovação para registrar este aceite comercial."}
          </p>
        </div>
        <button
          type="button"
          onClick={onApprove}
          disabled={isApproved || isSubmitting}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0D6C65] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
          data-testid={`public-quote-approve-${publicId}`}
        >
          {isApproved ? "Orçamento aprovado" : isSubmitting ? "Aprovando..." : "Aprovar orçamento"}
        </button>
      </div>
      {feedbackMessage ? (
        <p className="mt-2 text-xs text-[#475569]" data-testid="public-quote-approval-feedback">
          {feedbackMessage}
        </p>
      ) : null}
    </section>
  );
}
