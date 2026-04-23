"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PLAN_LABELS } from "@/lib/domain/plan";
import type { FeatureAccessState } from "@/lib/services/plan-entitlements";

type PlanBlockedStateProps = {
  access: FeatureAccessState;
  testId?: string;
};

export function PlanBlockedState({ access, testId }: PlanBlockedStateProps) {
  return (
    <section
      className="firmus-panel space-y-4"
      data-testid={testId ?? `plan-feature-blocked-${access.feature}`}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.12em] text-[#9F1239] uppercase">
          Recurso premium
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {access.label} indisponível no plano atual
        </h2>
        <p className="text-sm text-muted-foreground">
          {access.reason ?? "Recurso indisponível no plano atual."}
        </p>
        <p className="text-sm text-muted-foreground">
          Plano atual: {PLAN_LABELS[access.currentPlan]} • Liberação: {PLAN_LABELS[access.requiredPlan]}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/plan" className={buttonVariants({ variant: "default" })}>
          Abrir plano e limites
        </Link>
      </div>
    </section>
  );
}
