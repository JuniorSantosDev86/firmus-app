import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type DashboardHeroProps = {
  hasBusinessProfile: boolean;
};

export function DashboardHero({ hasBusinessProfile }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#CBD5E1] bg-gradient-to-br from-[#CFFAFE] via-[#F8FAFC] to-[#DBEAFE] px-6 py-10 sm:px-8 lg:px-12 lg:py-12">
      <div
        className="absolute -left-20 top-8 h-80 w-80 rounded-full bg-[#99F6E4]/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-16 -top-10 h-72 w-72 rounded-full bg-[#DBEAFE]/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center rounded-full border border-[#99F6E4] bg-white/80 px-3 py-1 text-xs font-medium text-[#087C7B]">
            Painel interno de operação
          </div>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[#0F172A] lg:text-5xl">
            Bem-vindo ao <span className="text-[#0EA5A4]">Firmus</span>
          </h1>
          <p className="max-w-xl text-xl text-[#334155]">
            O copiloto operacional para prestadores de serviços.
          </p>
          <p className="max-w-xl text-base text-[#475569]">
            Organize perfil da empresa, clientes, serviços e orçamentos com uma visão clara
            das próximas ações.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/quotes"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0EA5A4] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B8E8D]"
              data-testid="hero-primary-action"
            >
              Ir para orçamentos
            </Link>
            <Link
              href="/business-profile"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-5 text-sm font-medium text-[#334155] transition-colors",
                "hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
              )}
              data-testid="hero-secondary-action"
            >
              {hasBusinessProfile ? "Ver perfil da empresa" : "Configurar perfil da empresa"}
            </Link>
          </div>
        </div>

        <div className="relative h-[280px] lg:h-[300px]">
          <div
            className="absolute inset-2 rounded-[28px] bg-gradient-to-br from-[#ECFEFF]/70 via-white/35 to-[#DBEAFE]/65"
            aria-hidden="true"
          />
          <div className="absolute right-4 top-4 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#475569]">
            Workspace
          </div>
          <div
            className="absolute left-2 top-12 h-36 w-36 rounded-full bg-[#99F6E4]/40 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -right-2 bottom-10 h-32 w-32 rounded-full bg-[#BFDBFE]/45 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-4 left-1/2 h-10 w-[72%] -translate-x-1/2 rounded-full bg-[#0EA5A4]/10 blur-2xl"
            aria-hidden="true"
          />
          <Image
            src="/brand/firmus-mascot-hero.png"
            alt="Mascote do Firmus"
            fill
            sizes="(max-width: 1024px) 80vw, 34vw"
            className="relative z-10 object-contain p-3 sm:p-5 lg:p-6"
            priority
          />
        </div>
      </div>
    </section>
  );
}
