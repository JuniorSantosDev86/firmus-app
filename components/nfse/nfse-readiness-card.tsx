import type { NFSeReadinessResult } from "@/lib/domain";
import { NFSE_READINESS_FIELD_LABELS } from "@/lib/services/nfse/nfse-readiness";

type NFSeReadinessCardProps = {
  readiness: NFSeReadinessResult;
  className?: string;
  testId?: string;
};

export function NFSeReadinessCard({
  readiness,
  className,
  testId = "nfse-readiness-card",
}: NFSeReadinessCardProps) {
  const missingLabels = readiness.missingFields.map((field) => NFSE_READINESS_FIELD_LABELS[field]);

  return (
    <section className={`firmus-panel ${className ?? ""}`.trim()} data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Prontidão fiscal (NFSe)
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {readiness.isReady
              ? "Perfil fiscal pronto para preparação de NFSe."
              : "Perfil fiscal incompleto. Você ainda pode preparar rascunhos internos."}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${readiness.isReady ? "firmus-chip-success" : "firmus-chip-warning"}`}
          data-testid="nfse-readiness-state"
        >
          {readiness.isReady ? "Pronto" : "Pendente"}
        </span>
      </div>

      {missingLabels.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#475569]" data-testid="nfse-missing-fields">
          {missingLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : null}

      {readiness.warnings.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#64748B]" data-testid="nfse-readiness-warnings">
          {readiness.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
