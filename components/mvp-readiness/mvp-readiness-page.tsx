"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  MVP_READINESS_GROUP_LABELS,
  type MVPReadinessGroupKey,
  type MVPReadinessItem,
  type MVPReadinessSnapshot,
} from "@/lib/domain";
import { readMVPReadinessSnapshot } from "@/lib/services/mvp-hardening";
import { PLAN_STATE_UPDATED_EVENT } from "@/lib/storage/plan-state";
import { ONBOARDING_STATE_UPDATED_EVENT } from "@/lib/storage/onboarding-state";

import { ReadinessSection } from "@/components/mvp-readiness/readiness-section";

const GROUP_ORDER: MVPReadinessGroupKey[] = [
  "auth_and_boundaries",
  "onboarding_and_first_use",
  "core_operations",
  "fiscal_flows",
  "public_surfaces",
  "reliability_and_recovery",
  "consistency_and_usability",
];

const STATUS_TITLES = {
  ready: "Pronto para beta",
  warning: "Pronto com alertas",
  blocked: "Beta ainda bloqueado",
} as const;

const STATUS_CLASS_NAMES = {
  ready: "border-[#B6E9E8] bg-[#ECFEFF] text-[#0B6D6D]",
  warning: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
  blocked: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
} as const;

function groupItems(items: MVPReadinessItem[]): Array<{ group: MVPReadinessGroupKey; items: MVPReadinessItem[] }> {
  return GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  })).filter((entry) => entry.items.length > 0);
}

export function MVPReadinessPage() {
  const [snapshot, setSnapshot] = useState<MVPReadinessSnapshot | null>(null);

  useEffect(() => {
    function refresh() {
      setSnapshot(readMVPReadinessSnapshot());
    }

    refresh();
    window.addEventListener(PLAN_STATE_UPDATED_EVENT, refresh);
    window.addEventListener(ONBOARDING_STATE_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(PLAN_STATE_UPDATED_EVENT, refresh);
      window.removeEventListener(ONBOARDING_STATE_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (snapshot === null) {
    return (
      <section className="firmus-panel" data-testid="mvp-readiness-loading">
        <p className="text-sm text-muted-foreground">Carregando prontidão do MVP...</p>
      </section>
    );
  }

  const groupedItems = groupItems(snapshot.items);

  return (
    <div className="space-y-6" data-testid="mvp-readiness-page">
      <section className="firmus-panel space-y-5" data-testid="mvp-readiness-summary">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASS_NAMES[snapshot.status]}`}
              data-testid="mvp-readiness-overall-status"
            >
              {STATUS_TITLES[snapshot.status]}
            </span>
            <p className="max-w-3xl text-sm text-muted-foreground" data-testid="mvp-readiness-summary-text">
              {snapshot.summary}
            </p>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center rounded-xl border border-[#D8E3EE] bg-white px-4 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC]"
            data-testid="mvp-readiness-open-onboarding"
          >
            Revisar onboarding
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4">
            <p className="text-sm text-[#7F1D1D]">Bloqueios</p>
            <p className="mt-2 text-2xl font-semibold text-[#B91C1C]" data-testid="mvp-readiness-blocking-count">
              {snapshot.blockingCount}
            </p>
          </article>
          <article className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
            <p className="text-sm text-[#92400E]">Alertas</p>
            <p className="mt-2 text-2xl font-semibold text-[#92400E]" data-testid="mvp-readiness-warning-count">
              {snapshot.warningCount}
            </p>
          </article>
          <article className="rounded-2xl border border-[#B6E9E8] bg-[#ECFEFF] p-4">
            <p className="text-sm text-[#0B6D6D]">Pontos prontos</p>
            <p className="mt-2 text-2xl font-semibold text-[#0B6D6D]" data-testid="mvp-readiness-ready-count">
              {snapshot.readyCount}
            </p>
          </article>
        </div>

        {snapshot.nextActions.length > 0 ? (
          <div className="rounded-2xl border border-[#DCE5EF] bg-[#F8FBFF] p-4" data-testid="mvp-readiness-next-actions">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#64748B] uppercase">
              Próximas revisões sugeridas
            </p>
            <ul className="mt-3 space-y-3">
              {snapshot.nextActions.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="inline-flex h-9 items-center rounded-lg border border-[#B6E9E8] bg-[#E9FAFA] px-3 text-sm font-semibold text-[#0B6D6D] transition-colors hover:bg-[#DDF4F3]"
                      data-testid={`mvp-readiness-next-action-link-${item.id}`}
                    >
                      Abrir módulo
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {groupedItems.map((entry) => (
        <ReadinessSection key={entry.group} group={entry.group} items={entry.items} />
      ))}

      <section className="firmus-panel" data-testid="mvp-readiness-groups-summary">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Cobertura revisada</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {GROUP_ORDER.filter((group) => groupedItems.some((entry) => entry.group === group)).map((group) => (
            <li key={group} className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#475569]">
              {MVP_READINESS_GROUP_LABELS[group]}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
