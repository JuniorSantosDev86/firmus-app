"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DASStatusBadge } from "@/components/das/das-status-badge";
import { Button } from "@/components/ui/button";
import type { DASCompanionSnapshot } from "@/lib/services/das/das-companion-service";
import {
  getDASCompanionSnapshot,
  markDASAsGuided,
  markDASAsPaidExternally,
} from "@/lib/services/das/das-companion-service";
import {
  handoffToDASOfficialChannel,
  resolveDASOfficialDestination,
} from "@/lib/services/das/das-handoff-service";

const INITIAL_SNAPSHOT: DASCompanionSnapshot = {
  record: null,
  displayStatus: null,
  displayStatusLabel: null,
  isOverdue: false,
};

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(parsed);
}

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function DASManager() {
  const [snapshot, setSnapshot] = useState<DASCompanionSnapshot>(INITIAL_SNAPSHOT);
  const [feedback, setFeedback] = useState<string>("");
  const [isHandoffRunning, setIsHandoffRunning] = useState(false);

  function refreshSnapshot() {
    setSnapshot(getDASCompanionSnapshot());
  }

  useEffect(() => {
    queueMicrotask(() => {
      refreshSnapshot();
    });
  }, []);

  function handleGuided() {
    if (!snapshot.record) {
      return;
    }

    const result = markDASAsGuided(snapshot.record.id);
    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    refreshSnapshot();
    setFeedback("Orientação registrada para este DAS.");
  }

  function handleMarkPaidExternally() {
    if (!snapshot.record) {
      return;
    }

    const result = markDASAsPaidExternally(snapshot.record.id);
    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    refreshSnapshot();
    setFeedback("Pagamento externo confirmado manualmente.");
  }

  function handleOfficialHandoff() {
    if (!snapshot.record || isHandoffRunning) {
      return;
    }

    setIsHandoffRunning(true);
    setFeedback("Registrando encaminhamento para o canal oficial...");

    const result = handoffToDASOfficialChannel(snapshot.record.id);
    if (!result.ok) {
      setIsHandoffRunning(false);
      setFeedback(result.message);
      return;
    }

    refreshSnapshot();
    setIsHandoffRunning(false);

    if (typeof window !== "undefined") {
      const opened = window.open(result.destinationUrl, "_blank", "noopener,noreferrer");

      if (!opened) {
        setFeedback(
          "Encaminhamento registrado. Não foi possível abrir a aba automaticamente; use o link oficial abaixo."
        );
        return;
      }
    }

    setFeedback("Encaminhamento para canal oficial registrado.");
  }

  if (!snapshot.record) {
    const fallbackOfficialUrl = resolveDASOfficialDestination(null);

    return (
      <section className="firmus-panel space-y-4" data-testid="das-empty-state">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Acompanhamento de DAS</h2>
        <p className="firmus-empty-state">
          Nenhum acompanhamento de DAS disponível ainda. Quando existir um registro operacional do período,
          ele aparecerá aqui com status e vencimento.
        </p>
        <p className="text-sm text-muted-foreground" data-testid="das-official-note">
          O pagamento do DAS acontece no canal oficial. A Firmus atua apenas como camada de acompanhamento.
        </p>
        <Link
          href={fallbackOfficialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center rounded-xl border border-[#B6E9E8] bg-[#E9FAFA] px-4 text-sm font-semibold text-[#0B6D6D] transition-colors hover:bg-[#DDF4F3]"
          data-testid="das-official-link-empty"
        >
          Canal oficial do DAS
          <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  const officialUrl = resolveDASOfficialDestination(snapshot.record);

  return (
    <div className="space-y-6" data-testid="das-manager">
      <section className="firmus-panel" data-testid="das-companion-panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">DAS do período</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe competência, vencimento e status operacional antes de finalizar no canal oficial.
            </p>
          </div>
          {snapshot.displayStatus ? <DASStatusBadge status={snapshot.displayStatus} /> : null}
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Competência</dt>
            <dd className="mt-1 font-medium text-foreground" data-testid="das-competence">
              {snapshot.record.competence}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Vencimento</dt>
            <dd className="mt-1 font-medium text-foreground" data-testid="das-due-date">
              {formatDate(snapshot.record.dueDate)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-1 font-medium text-foreground" data-testid="das-status-label">
              {snapshot.displayStatusLabel ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Valor</dt>
            <dd className="mt-1 font-medium text-foreground" data-testid="das-amount">
              {typeof snapshot.record.amountInCents === "number"
                ? formatMoneyFromCents(snapshot.record.amountInCents)
                : "—"}
            </dd>
          </div>
        </dl>

        {snapshot.isOverdue ? (
          <p className="mt-4 text-sm text-[#C2410C]" data-testid="das-overdue-warning">
            Este DAS está pendente e com vencimento anterior a hoje.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGuided}
            disabled={snapshot.record.status === "paid_externally"}
            data-testid="das-mark-guided-action"
          >
            Registrar orientação
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleOfficialHandoff}
            disabled={isHandoffRunning}
            data-testid="das-official-handoff-action"
          >
            {isHandoffRunning ? "Encaminhando..." : "Ir para canal oficial"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleMarkPaidExternally}
            disabled={snapshot.record.status === "paid_externally"}
            data-testid="das-mark-paid-externally-action"
          >
            Marcar como pago externamente
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground" data-testid="das-official-note">
          O pagamento do DAS acontece no canal oficial. A Firmus não processa transações de pagamento.
        </p>
        <p className="mt-1 text-xs text-[#64748B]" data-testid="das-official-destination">
          Destino oficial: {officialUrl}
        </p>

        {feedback ? (
          <p className="mt-3 text-sm text-[#475569]" data-testid="das-feedback">
            {feedback}
          </p>
        ) : null}
      </section>
    </div>
  );
}
