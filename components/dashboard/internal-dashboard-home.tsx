"use client";

import { Building2, ClipboardList, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { readBusinessProfile } from "@/lib/business-profile-storage";
import { readClients } from "@/lib/client-storage";
import { type TimelineEvent } from "@/lib/domain/timeline-event";
import { readQuoteStore } from "@/lib/quote-storage";
import { readServices } from "@/lib/service-storage";
import { getTimelineEvents } from "@/lib/storage/timeline-events";

import { ActivitySection } from "@/components/dashboard/activity-section";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { PageContainer } from "@/components/dashboard/page-container";
import { QuickAccessCard } from "@/components/dashboard/quick-access-card";
import { TopNavigation } from "@/components/dashboard/top-navigation";

type DashboardSnapshot = {
  hasBusinessProfile: boolean;
  clientsCount: number;
  servicesCount: number;
  activeServicesCount: number;
  quotesCount: number;
  recentEvents: TimelineEvent[];
};

const INITIAL_DASHBOARD_SNAPSHOT: DashboardSnapshot = {
  hasBusinessProfile: false,
  clientsCount: 0,
  servicesCount: 0,
  activeServicesCount: 0,
  quotesCount: 0,
  recentEvents: [],
};

function readDashboardSnapshot(): DashboardSnapshot {
  const profile = readBusinessProfile();
  const clients = readClients();
  const services = readServices();
  const quotes = readQuoteStore();
  const timeline = getTimelineEvents();

  const hasBusinessProfile =
    profile !== null &&
    (profile.businessName.trim().length > 0 || profile.professionalName.trim().length > 0);

  return {
    hasBusinessProfile,
    clientsCount: clients.length,
    servicesCount: services.length,
    activeServicesCount: services.filter((service) => service.isActive).length,
    quotesCount: quotes.quotes.length,
    recentEvents: timeline.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6),
  };
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

  const servicesMetric = (() => {
    if (snapshot.servicesCount === 0) {
      return "Nenhum";
    }

    return `${snapshot.activeServicesCount} ativos`;
  })();

  return (
    <main className="min-h-screen bg-[#F7FAFC] pb-14 pt-6 sm:pt-8" data-testid="dashboard-home">
      <PageContainer className="space-y-8 sm:space-y-10">
        <TopNavigation />

        <DashboardHero hasBusinessProfile={snapshot.hasBusinessProfile} />

        <section className="space-y-4" aria-label="Acesso rápido">
          <header>
            <h2 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">
              Acesso rápido
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Atalhos para os módulos principais com dados reais do seu workspace.
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
      </PageContainer>
    </main>
  );
}
