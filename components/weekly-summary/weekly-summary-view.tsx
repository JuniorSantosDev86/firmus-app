"use client";

import { useEffect, useState } from "react";

import type { WeeklySummary } from "@/lib/domain/weekly-summary";
import { getWeeklySummary } from "@/lib/services/weekly-summary";

const EMPTY_SUMMARY: WeeklySummary = {
  rangeStart: "",
  rangeEnd: "",
  totals: {
    chargesPaidInPeriodInCents: 0,
    chargesPendingInCents: 0,
    overdueChargesInCents: 0,
    pendingRemindersCount: 0,
    completedRemindersInPeriodCount: 0,
  },
  sections: {
    dueSoonCharges: [],
    overdueCharges: [],
    pendingReminders: [],
    completedRemindersInPeriod: [],
    recentActivity: [],
  },
  highlights: [],
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  client_created: "Cliente criado",
  service_created: "Serviço criado",
  quote_created: "Orçamento criado",
  charge_created: "Cobrança criada",
  charge_paid: "Cobrança marcada como paga",
  reminder_created: "Lembrete criado",
  reminder_completed: "Lembrete concluído",
};

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function formatDate(value: string): string {
  if (!value) {
    return "Sem data";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Sem data";
  }

  return parsed.toLocaleDateString("pt-BR");
}

function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function formatPeriod(start: string, end: string): string {
  if (!start || !end) {
    return "Sem período";
  }

  return `${formatDate(start)} até ${formatDate(end)}`;
}

export function WeeklySummaryView() {
  const [summary, setSummary] = useState<WeeklySummary>(EMPTY_SUMMARY);

  useEffect(() => {
    queueMicrotask(() => {
      setSummary(getWeeklySummary());
    });
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Período</p>
        <p className="mt-1 text-base font-medium text-foreground">
          {formatPeriod(summary.rangeStart, summary.rangeEnd)}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <article className="rounded-xl border border-border bg-background px-4 py-4">
            <p className="text-sm text-muted-foreground">Recebido no período</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatMoneyFromCents(summary.totals.chargesPaidInPeriodInCents)}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-background px-4 py-4">
            <p className="text-sm text-muted-foreground">Em aberto</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatMoneyFromCents(summary.totals.chargesPendingInCents)}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-background px-4 py-4">
            <p className="text-sm text-muted-foreground">Em atraso</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatMoneyFromCents(summary.totals.overdueChargesInCents)}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-background px-4 py-4">
            <p className="text-sm text-muted-foreground">Lembretes pendentes</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {summary.totals.pendingRemindersCount}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-background px-4 py-4">
            <p className="text-sm text-muted-foreground">Lembretes concluídos</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {summary.totals.completedRemindersInPeriodCount}
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Destaques</h2>
        {summary.highlights.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Sem destaques para este período.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {summary.highlights.map((highlight) => (
              <li key={highlight} className="text-sm text-foreground">
                {highlight}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Cobranças vencidas</h2>
        {summary.sections.overdueCharges.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhuma cobrança vencida.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {summary.sections.overdueCharges.map((charge) => (
              <li key={charge.id} className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-medium text-foreground">Cobrança {charge.id.slice(0, 8)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vencimento: {formatDate(charge.dueDate)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Valor: {formatMoneyFromCents(charge.amountInCents)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Cobranças próximas</h2>
        {summary.sections.dueSoonCharges.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhuma cobrança próxima.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {summary.sections.dueSoonCharges.map((charge) => (
              <li key={charge.id} className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-medium text-foreground">Cobrança {charge.id.slice(0, 8)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vencimento: {formatDate(charge.dueDate)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Valor: {formatMoneyFromCents(charge.amountInCents)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Lembretes pendentes</h2>
        {summary.sections.pendingReminders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhum lembrete pendente.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {summary.sections.pendingReminders.map((reminder) => (
              <li key={reminder.id} className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vencimento: {reminder.dueDate ? formatDate(reminder.dueDate) : "Sem data"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Lembretes concluídos no período
        </h2>
        {summary.sections.completedRemindersInPeriod.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhum lembrete concluído no período.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {summary.sections.completedRemindersInPeriod.map((reminder) => (
              <li key={reminder.id} className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Concluído em: {reminder.completedAt ? formatDate(reminder.completedAt) : "Sem data"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Atividade recente</h2>
        {summary.sections.recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhuma atividade recente.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {summary.sections.recentActivity.map((event) => (
              <li key={event.id} className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  {ACTIVITY_TYPE_LABELS[event.type] ?? "Atualização registrada"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Entidade: {event.entityType}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
