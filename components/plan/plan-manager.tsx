"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { PLAN_FEATURE_LABELS, PLAN_LABELS, PLAN_TIERS, type PlanTier } from "@/lib/domain/plan";
import {
  getPlanOverview,
  setCurrentPlanTier,
  type FeatureAccessState,
  type LimitAccessState,
} from "@/lib/services/plan-entitlements";
import { PLAN_STATE_UPDATED_EVENT } from "@/lib/storage/plan-state";

type PlanOverviewState = ReturnType<typeof getPlanOverview>;

export function PlanManager() {
  const [overview, setOverview] = useState<PlanOverviewState | null>(null);

  useEffect(() => {
    function refresh() {
      setOverview(getPlanOverview());
    }

    refresh();
    window.addEventListener(PLAN_STATE_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(PLAN_STATE_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function handlePlanChange(tier: PlanTier) {
    setCurrentPlanTier(tier);
    setOverview(getPlanOverview(tier));
  }

  if (overview === null) {
    return (
      <section className="firmus-panel" data-testid="plan-manager-loading">
        <p className="text-sm text-muted-foreground">Carregando plano e limites...</p>
      </section>
    );
  }

  return (
    <div className="space-y-6" data-testid="plan-manager">
      <section className="firmus-panel space-y-4" data-testid="plan-current-panel">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Plano atual: {overview.label}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="plan-current-tier">
            Use esta área para simular entitlements do MVP com persistência local.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {PLAN_TIERS.map((tier) => (
            <Button
              key={tier}
              type="button"
              variant={overview.tier === tier ? "default" : "outline"}
              onClick={() => handlePlanChange(tier)}
              data-testid={`plan-tier-${tier}-button`}
            >
              {PLAN_LABELS[tier]}
            </Button>
          ))}
        </div>
      </section>

      <section className="firmus-panel space-y-4" data-testid="plan-enabled-features-panel">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Recursos liberados</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Recursos disponíveis no plano atual.
          </p>
        </div>

        <ul className="space-y-3" data-testid="plan-enabled-features-list">
          {overview.enabledFeatures.length === 0 ? (
            <li className="firmus-list-card">
              <p className="font-medium text-foreground">Nenhum recurso premium liberado.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Este plano mantém apenas a base operacional aberta.
              </p>
            </li>
          ) : (
            overview.enabledFeatures.map((feature: FeatureAccessState) => (
              <li key={feature.feature} className="firmus-list-card">
                <p className="font-medium text-foreground">{PLAN_FEATURE_LABELS[feature.feature]}</p>
                <p className="mt-1 text-sm text-muted-foreground">Disponível neste plano.</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="firmus-panel space-y-4" data-testid="plan-blocked-features-panel">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Recursos bloqueados</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Recursos com liberação planejada para upgrade futuro.
          </p>
        </div>

        <ul className="space-y-3" data-testid="plan-blocked-features-list">
          {overview.blockedFeatures.length === 0 ? (
            <li className="firmus-list-card">
              <p className="font-medium text-foreground">Nenhum bloqueio premium ativo.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Todos os recursos mapeados neste bloco estão liberados.
              </p>
            </li>
          ) : (
            overview.blockedFeatures.map((feature: FeatureAccessState) => (
              <li key={feature.feature} className="firmus-list-card">
                <p className="font-medium text-foreground">{PLAN_FEATURE_LABELS[feature.feature]}</p>
                <p className="mt-1 text-sm text-muted-foreground">{feature.reason}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="firmus-panel space-y-4" data-testid="plan-limits-panel">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Limites do plano</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Limites quantitativos avaliados pela camada central de entitlement.
          </p>
        </div>

        <ul className="space-y-3">
          {overview.limits.map((limit: LimitAccessState) => (
            <li
              key={limit.key}
              className="firmus-list-card"
              data-testid={`plan-limit-${limit.key}`}
            >
              <p className="font-medium text-foreground">{limit.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Uso atual: {limit.currentUsage} • Limite:{" "}
                {limit.limit === null ? "Sem limite" : limit.limit}
              </p>
              {limit.reason ? (
                <p className="mt-2 text-sm text-[#9F1239]">{limit.reason}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
