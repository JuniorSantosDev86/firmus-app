"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ReactivationRadarCandidate } from "@/lib/domain/reactivation-radar";
import {
  REACTIVATION_KIND_LABELS,
  createReactivationReminderFromCandidate,
  getReactivationRadarCandidates,
} from "@/lib/services/reactivation-radar-service";

type RadarFilter = "all" | "win_back" | "stalled_follow_up";
type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("pt-BR");
}

function formatMoneyFromCents(value?: number): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function ReactivationRadarManager() {
  const [candidates, setCandidates] = useState<ReactivationRadarCandidate[]>([]);
  const [filter, setFilter] = useState<RadarFilter>("all");
  const [busyCandidateId, setBusyCandidateId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  function refreshCandidates() {
    setCandidates(getReactivationRadarCandidates());
  }

  useEffect(() => {
    queueMicrotask(() => {
      refreshCandidates();
    });
  }, []);

  const visibleCandidates = useMemo(() => {
    if (filter === "all") {
      return candidates;
    }

    return candidates.filter((candidate) => candidate.opportunityKind === filter);
  }, [candidates, filter]);

  function handleCreateReminder(candidateId: string) {
    setBusyCandidateId(candidateId);
    const result = createReactivationReminderFromCandidate(candidateId);

    if (!result.ok) {
      setFeedback({ type: "error", message: result.reason });
      setBusyCandidateId(null);
      return;
    }

    setFeedback({
      type: "success",
      message: `Lembrete criado com sucesso (${result.reminderId.slice(0, 8)}).`,
    });
    refreshCandidates();
    setBusyCandidateId(null);
  }

  return (
    <div className="space-y-6">
      <section className="firmus-panel">
        <div className="flex flex-wrap items-center gap-2.5" data-testid="reactivation-radar-filters">
          <Button
            type="button"
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            data-testid="reactivation-filter-all"
          >
            Todos
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "win_back" ? "default" : "outline"}
            onClick={() => setFilter("win_back")}
            data-testid="reactivation-filter-win-back"
          >
            Win-back
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "stalled_follow_up" ? "default" : "outline"}
            onClick={() => setFilter("stalled_follow_up")}
            data-testid="reactivation-filter-follow-up"
          >
            Follow-up
          </Button>
        </div>

        {visibleCandidates.length === 0 ? (
          <p className="mt-4 firmus-empty-state" data-testid="reactivation-radar-empty-state">
            Nenhuma oportunidade de reativação no momento.
          </p>
        ) : (
          <ul className="mt-4 space-y-3" data-testid="reactivation-radar-list">
            {visibleCandidates.map((candidate) => {
              const amountLabel = formatMoneyFromCents(candidate.referenceAmountInCents);

              return (
                <li key={candidate.id} className="firmus-subpanel" data-testid={`reactivation-item-${candidate.id}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2.5">
                      <p className="font-medium text-foreground">{candidate.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {REACTIVATION_KIND_LABELS[candidate.opportunityKind]}
                      </p>
                      <p className="text-sm text-muted-foreground">Motivo: {candidate.reasonLabel}</p>
                      <p className="text-sm text-muted-foreground">
                        Inatividade: {candidate.daysInactive} dias
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Última atividade relevante: {formatDateTime(candidate.lastActivityAt)}
                      </p>
                      {amountLabel ? (
                        <p className="text-sm text-muted-foreground">Referência: {amountLabel}</p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/clients/${candidate.clientId}`}
                        className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium text-foreground hover:bg-muted"
                        data-testid={`reactivation-open-client-${candidate.id}`}
                      >
                        Abrir cliente
                      </Link>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleCreateReminder(candidate.id)}
                        disabled={busyCandidateId === candidate.id}
                        data-testid={`reactivation-create-reminder-${candidate.id}`}
                      >
                        {candidate.suggestedActionLabel}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {feedback ? (
        <p
          className={feedback.type === "success" ? "text-sm text-[#166534]" : "text-sm text-[#B91C1C]"}
          data-testid="reactivation-radar-feedback"
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
