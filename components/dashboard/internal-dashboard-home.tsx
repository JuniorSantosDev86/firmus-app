"use client";

import { AlertTriangle, BellRing, Building2, ClipboardList, FileText, HandCoins, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { readBusinessProfile } from "@/lib/business-profile-storage";
import { getChargeStatus } from "@/lib/charge-status";
import { getCharges } from "@/lib/charge-storage";
import { readClients } from "@/lib/client-storage";
import { type TimelineEvent } from "@/lib/domain/timeline-event";
import { readQuoteStore } from "@/lib/quote-storage";
import { getReminders } from "@/lib/reminder-storage";
import { readServices } from "@/lib/service-storage";
import { getRecentTimelineEvents } from "@/lib/storage/timeline-events";

import { ActivitySection } from "@/components/dashboard/activity-section";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { QuickAccessCard } from "@/components/dashboard/quick-access-card";

type NextActionItem = {
  id: string;
  title: string;
  dueDate: string;
  href: string;
  badge: string;
  amountInCents?: number;
  isOverdue: boolean;
};

type DashboardSnapshot = {
  hasBusinessProfile: boolean;
  clientsCount: number;
  servicesCount: number;
  activeServicesCount: number;
  quotesCount: number;
  recentQuotesCount: number;
  pendingChargesCount: number;
  pendingChargesAmountInCents: number;
  overdueChargesCount: number;
  pendingRemindersCount: number;
  nextActions: NextActionItem[];
  recentEvents: TimelineEvent[];
};

const INITIAL_DASHBOARD_SNAPSHOT: DashboardSnapshot = {
  hasBusinessProfile: false,
  clientsCount: 0,
  servicesCount: 0,
  activeServicesCount: 0,
  quotesCount: 0,
  recentQuotesCount: 0,
  pendingChargesCount: 0,
  pendingChargesAmountInCents: 0,
  overdueChargesCount: 0,
  pendingRemindersCount: 0,
  nextActions: [],
  recentEvents: [],
};

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function toDateOnlyKey(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function isOverdueDate(isoDate: string): boolean {
  const dueDateKey = toDateOnlyKey(isoDate);
  if (dueDateKey === null) {
    return false;
  }

  return dueDateKey < new Date().toISOString().slice(0, 10);
}

function buildNextActions(): NextActionItem[] {
  const clients = readClients();
  const clientNameById = new Map(clients.map((client) => [client.id, client.name]));

  const chargeItems: NextActionItem[] = getCharges()
    .map((charge) => ({ charge, resolvedStatus: getChargeStatus(charge) }))
    .filter(({ resolvedStatus }) => resolvedStatus === "pending" || resolvedStatus === "overdue")
    .map(({ charge, resolvedStatus }) => ({
      id: `charge-${charge.id}`,
      title: `Cobrança: ${clientNameById.get(charge.clientId) ?? "Cliente não identificado"}`,
      dueDate: charge.dueDate,
      href: "/charges",
      badge: resolvedStatus === "overdue" ? "Em atraso" : "A vencer",
      amountInCents: charge.amountInCents,
      isOverdue: resolvedStatus === "overdue",
    }));

  const reminderItems: NextActionItem[] = getReminders()
    .filter((reminder) => reminder.status === "pending" && typeof reminder.dueDate === "string")
    .map((reminder) => ({
      id: `reminder-${reminder.id}`,
      title: `Lembrete: ${reminder.title}`,
      dueDate: reminder.dueDate as string,
      href: "/reminders",
      badge: isOverdueDate(reminder.dueDate as string) ? "Atrasado" : "Pendente",
      isOverdue: isOverdueDate(reminder.dueDate as string),
    }));

  return [...chargeItems, ...reminderItems]
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) {
        return a.isOverdue ? -1 : 1;
      }

      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 6);
}

function readDashboardSnapshot(): DashboardSnapshot {
  const profile = readBusinessProfile();
  const clients = readClients();
  const services = readServices();
  const quotes = readQuoteStore();
  const recentEvents = getRecentTimelineEvents(8);
  const charges = getCharges();
  const reminders = getReminders();
  const nowMs = Date.now();
  const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;

  const hasBusinessProfile =
    profile !== null &&
    (profile.businessName.trim().length > 0 || profile.professionalName.trim().length > 0);

  const pendingCharges = charges.filter((charge) => {
    const status = getChargeStatus(charge);
    return status === "pending" || status === "overdue";
  });

  const overdueChargesCount = pendingCharges.filter((charge) => getChargeStatus(charge) === "overdue").length;

  const pendingRemindersCount = reminders.filter((reminder) => reminder.status === "pending").length;

  const recentQuotesCount = quotes.quotes.filter((quote) => {
    const createdAtMs = new Date(quote.createdAt).getTime();
    if (Number.isNaN(createdAtMs)) {
      return false;
    }

    return createdAtMs >= sevenDaysAgoMs;
  }).length;

  return {
    hasBusinessProfile,
    clientsCount: clients.length,
    servicesCount: services.length,
    activeServicesCount: services.filter((service) => service.isActive).length,
    quotesCount: quotes.quotes.length,
    recentQuotesCount,
    pendingChargesCount: pendingCharges.length,
    pendingChargesAmountInCents: pendingCharges.reduce((acc, charge) => acc + charge.amountInCents, 0),
    overdueChargesCount,
    pendingRemindersCount,
    nextActions: buildNextActions(),
    recentEvents,
  };
}

function formatDueDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(parsed);
}

export function InternalDashboardHome() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(INITIAL_DASHBOARD_SNAPSHOT);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      setSnapshot(readDashboardSnapshot());
    });

    return () => {
      active = false;
    };
  }, []);

  const servicesMetric = snapshot.servicesCount === 0 ? "Nenhum" : `${snapshot.activeServicesCount} ativos`;

  return (
    <main className="space-y-9 sm:space-y-11" data-testid="dashboard-home">
      <DashboardHero hasBusinessProfile={snapshot.hasBusinessProfile} />
      <OnboardingCard />

      <section className="space-y-4" aria-label="Resumo operacional" data-testid="dashboard-operational-summary">
        <header>
          <p className="text-xs font-semibold tracking-[0.12em] text-[#64748B] uppercase">Controle da operação</p>
          <h2 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Resumo operacional</h2>
          <p className="mt-1 text-sm text-[#64748B]">Leitura rápida do estado atual da operação.</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.4)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#475569]">Cobranças pendentes</p>
              <HandCoins className="h-4 w-4 text-[#0EA5A4]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#0F172A]">{snapshot.pendingChargesCount}</p>
            <p className="mt-1 text-sm text-[#64748B]">
              Total aberto: {formatMoneyFromCents(snapshot.pendingChargesAmountInCents)}
            </p>
          </article>

          <article className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.4)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#475569]">Itens em atraso</p>
              <AlertTriangle className="h-4 w-4 text-[#F97316]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#0F172A]">{snapshot.overdueChargesCount}</p>
            <p className="mt-1 text-sm text-[#64748B]">Cobranças com vencimento anterior a hoje.</p>
          </article>

          <article className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.4)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#475569]">Lembretes pendentes</p>
              <BellRing className="h-4 w-4 text-[#0EA5A4]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#0F172A]">{snapshot.pendingRemindersCount}</p>
            <p className="mt-1 text-sm text-[#64748B]">Follow-ups e tarefas ainda não concluídos.</p>
          </article>

          <article className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.4)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#475569]">Orçamentos (7 dias)</p>
              <FileText className="h-4 w-4 text-[#0EA5A4]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#0F172A]">{snapshot.recentQuotesCount}</p>
            <p className="mt-1 text-sm text-[#64748B]">Criados na última semana.</p>
          </article>
        </div>
      </section>

      <section className="space-y-4" aria-label="Próximas ações" data-testid="dashboard-next-actions">
        <header>
          <p className="text-xs font-semibold tracking-[0.12em] text-[#64748B] uppercase">Prioridades</p>
          <h2 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Próximas ações</h2>
          <p className="mt-1 text-sm text-[#64748B]">Pendências priorizadas por vencimento para agir agora.</p>
        </header>

        {snapshot.nextActions.length === 0 ? (
          <div className="rounded-[20px] border border-[#E2E8F0] bg-white px-6 py-7 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.45)]">
            <p className="text-sm text-[#64748B]">Nenhuma pendência com vencimento encontrada.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {snapshot.nextActions.map((item) => (
              <li
                key={item.id}
                className="rounded-[16px] border border-[#E2E8F0] bg-white px-5 py-4 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.45)]"
                data-testid={`dashboard-next-action-${item.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#64748B]">Vencimento: {formatDueDate(item.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {typeof item.amountInCents === "number" ? (
                      <p className="text-sm font-medium text-[#334155]">{formatMoneyFromCents(item.amountInCents)}</p>
                    ) : null}
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        item.isOverdue
                          ? "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]"
                          : "border-[#BAE6FD] bg-[#ECFEFF] text-[#0F766E]"
                      }`}
                    >
                      {item.badge}
                    </span>
                    <Link
                      href={item.href}
                      className="inline-flex h-8 items-center rounded-lg border border-[#B6E9E8] bg-[#E9FAFA] px-3 text-sm font-semibold text-[#0B6D6D] transition-colors hover:bg-[#DDF4F3]"
                    >
                      Abrir
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4" aria-label="Acesso rápido">
        <header>
          <p className="text-xs font-semibold tracking-[0.12em] text-[#64748B] uppercase">Atalhos</p>
          <h2 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Acesso rápido</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Atalhos para módulos principais com dados reais do workspace.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <QuickAccessCard
            title="Perfil da Empresa"
            description="Dados institucionais e contato principal para os próximos fluxos."
            metricLabel="Status"
            metricValue={snapshot.hasBusinessProfile ? "Configurado" : "Pendente"}
            href="/business-profile"
            actionLabel="Abrir perfil"
            icon={Building2}
          />
          <QuickAccessCard
            title="Clientes"
            description="Base de clientes utilizada em orçamentos e cobranças."
            metricLabel="Registros"
            metricValue={String(snapshot.clientsCount)}
            href="/clients"
            actionLabel="Abrir clientes"
            icon={Users}
          />
          <QuickAccessCard
            title="Serviços"
            description="Catálogo de ofertas para reutilização nas propostas."
            metricLabel="Situação"
            metricValue={servicesMetric}
            href="/services"
            actionLabel="Abrir serviços"
            icon={ClipboardList}
          />
          <QuickAccessCard
            title="Orçamentos"
            description="Documentos comerciais gerados com itens e totais."
            metricLabel="Total"
            metricValue={String(snapshot.quotesCount)}
            href="/quotes"
            actionLabel="Abrir orçamentos"
            icon={FileText}
          />
        </div>
      </section>

      <ActivitySection events={snapshot.recentEvents} />
    </main>
  );
}
