"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

import { DASStatusBadge } from "@/components/das/das-status-badge";
import { Button } from "@/components/ui/button";
import {
  listDASCompanionRecords,
  markDASAsPaid,
  type DASCompanionRecordView,
} from "@/lib/services/das/das-companion-service";
import { handoffToDASOfficialChannel, resolveDASOfficialDestination } from "@/lib/services/das/das-handoff-service";

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(parsed);
}

function formatCompetenceMonth(competenceMonth: string): string {
  const [year, month] = competenceMonth.split("-");
  if (!year || !month) {
    return competenceMonth;
  }

  return `${month}/${year}`;
}

export function DASManager() {
  const [records, setRecords] = useState<DASCompanionRecordView[]>([]);
  const [feedback, setFeedback] = useState<string>("");

  function refresh() {
    setRecords(listDASCompanionRecords());
  }

  useEffect(() => {
    queueMicrotask(refresh);
  }, []);

  function handleOpenOfficialChannel(recordId: string) {
    const result = handoffToDASOfficialChannel(recordId);
    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    setFeedback("Canal oficial aberto em nova aba.");
  }

  function handleMarkAsPaid(recordId: string) {
    const result = markDASAsPaid(recordId);
    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    refresh();
    setFeedback(result.didChange ? "DAS marcado como pago." : "Este DAS já estava marcado como pago.");
  }

  if (records.length === 0) {
    return (
      <section className="firmus-panel space-y-4" data-testid="das-empty-state">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Acompanhamento de DAS</h2>
        <p className="firmus-empty-state">
          Nenhuma competência de DAS disponível no momento. Quando houver registro interno, ele aparecerá aqui.
        </p>
        <p className="text-sm text-muted-foreground" data-testid="das-official-note">
          A emissão e o pagamento oficial acontecem fora do Firmus.
        </p>
        <a
          href={resolveDASOfficialDestination()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center rounded-xl border border-[#B6E9E8] bg-[#E9FAFA] px-4 text-sm font-semibold text-[#0B6D6D] transition-colors hover:bg-[#DDF4F3]"
          data-testid="das-official-link-empty"
        >
          Abrir canal oficial do DAS
          <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
        </a>
      </section>
    );
  }

  return (
    <section className="firmus-panel space-y-5" data-testid="das-manager">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Acompanhamento de DAS</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe suas competências de DAS e acesse o canal oficial para emissão ou pagamento.
        </p>
        <p className="text-sm text-muted-foreground" data-testid="das-official-note">
          O processo oficial acontece fora do Firmus.
        </p>
      </div>

      <ul className="space-y-3" data-testid="das-record-list">
        {records.map((item) => (
          <li
            key={item.record.id}
            className="rounded-xl border border-[#D4EDED] bg-white p-4 shadow-[0_1px_0_0_rgba(15,23,42,0.03)]"
            data-testid={`das-record-${item.record.id}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Competência</p>
                <p className="font-medium text-foreground" data-testid={`das-competence-${item.record.id}`}>
                  {formatCompetenceMonth(item.record.competenceMonth)}
                </p>
              </div>
              <DASStatusBadge status={item.displayStatus} />
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium text-foreground" data-testid={`das-status-label-${item.record.id}`}>
                  {item.displayStatusLabel}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Vencimento estimado</dt>
                <dd className="font-medium text-foreground" data-testid={`das-due-date-${item.record.id}`}>
                  {formatDate(item.dueDate)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{item.record.status === "paid" ? "Pago em" : "Atualizado em"}</dt>
                <dd className="font-medium text-foreground" data-testid={`das-updated-at-${item.record.id}`}>
                  {formatDate(item.record.status === "paid" ? item.record.paidAt : item.record.updatedAt)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={resolveDASOfficialDestination()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleOpenOfficialChannel(item.record.id)}
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                data-testid={`das-official-handoff-action-${item.record.id}`}
              >
                Ir para canal oficial
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleMarkAsPaid(item.record.id)}
                disabled={item.record.status === "paid"}
                data-testid={`das-mark-paid-action-${item.record.id}`}
              >
                Marcar como pago
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {feedback ? (
        <p className="text-sm text-[#475569]" data-testid="das-feedback">
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
